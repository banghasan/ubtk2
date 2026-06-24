import fs from 'node:fs';
import path from 'node:path';
import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { createPool } from '../db/connection';
import { subjects } from '../db/schema/subjects';
import { topics } from '../db/schema/topics';
import { questions } from '../db/schema/questions';
import { questionOptions } from '../db/schema/question-options';
import * as schema from '../db/schema/index';

const optionSchema = z.object({
  key: z.string().min(1),
  text: z.string().min(1),
  is_correct: z.boolean(),
});

const questionSchema = z.object({
  topic_slug: z.string().min(1),
  type: z.enum(['single_choice', 'multiple_response', 'true_false']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  question_text: z.string().min(1),
  explanation_text: z.string().min(1),
  options: z.array(optionSchema),
});

const topicSchema = z.object({
  slug: z.string().min(1),
  subject_slug: z.string().min(1),
  label: z.string().min(1),
  display_order: z.number().int().positive(),
});

const subjectSchema = z.object({
  slug: z.string().min(1),
  label: z.string().min(1),
  display_order: z.number().int().positive(),
});

const seedSchema = z.object({
  subjects: z.array(subjectSchema),
  topics: z.array(topicSchema),
  questions: z.array(questionSchema),
});

async function seed() {
  const seedPath = path.join(import.meta.dirname, '..', '..', '..', 'seed.json');
  const raw = fs.readFileSync(seedPath, 'utf8');
  const data = seedSchema.parse(JSON.parse(raw));

  const pool = createPool();
  const db = drizzle(pool, { schema, mode: 'default' });

  let subjectCount = 0;
  let topicCount = 0;
  let questionCount = 0;

  for (const subj of data.subjects) {
    const [existing] = await db.select().from(subjects).where(eq(subjects.slug, subj.slug)).limit(1);
    if (!existing) {
      await db.insert(subjects).values(subj);
      subjectCount++;
    }
  }

  for (const t of data.topics) {
    const [subject] = await db.select({ id: subjects.id }).from(subjects).where(eq(subjects.slug, t.subject_slug)).limit(1);
    if (!subject) {
      console.error(`[seed] Subject "${t.subject_slug}" not found for topic "${t.slug}"`);
      continue;
    }

    const [existing] = await db.select().from(topics).where(eq(topics.slug, t.slug)).limit(1);
    if (!existing) {
      await db.insert(topics).values({
        subject_id: subject.id,
        slug: t.slug,
        label: t.label,
        display_order: t.display_order,
      });
      topicCount++;
    }
  }

  for (const q of data.questions) {
    const [topic] = await db.select({ id: topics.id }).from(topics).where(eq(topics.slug, q.topic_slug)).limit(1);
    if (!topic) {
      console.error(`[seed] Topic "${q.topic_slug}" not found for question, skipping.`);
      continue;
    }

    const [existing] = await db.select({ id: questions.id })
      .from(questions)
      .where(eq(questions.question_text, q.question_text))
      .limit(1);

    if (existing) continue;

    const [inserted] = await db.insert(questions).values({
      topic_id: topic.id,
      type: q.type,
      difficulty: q.difficulty,
      question_text: q.question_text,
      explanation_text: q.explanation_text,
    });

    const questionId = Number(inserted.insertId);

    for (let i = 0; i < q.options.length; i++) {
      const opt = q.options[i];
      await db.insert(questionOptions).values({
        question_id: questionId,
        option_key: opt.key,
        option_text: opt.text,
        is_correct: opt.is_correct,
        display_order: i + 1,
      });
    }

    questionCount++;
  }

  console.log(`[seed] Done. Subjects: ${subjectCount}, Topics: ${topicCount}, Questions: ${questionCount}`);

  await pool.end();
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
