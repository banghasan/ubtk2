import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/mysql2';
import { eq, count } from 'drizzle-orm';
import { topics } from '../db/schema/topics';
import { questions } from '../db/schema/questions';
import * as schema from '../db/schema/index';
import type { Pool } from '../db/connection';
import { z } from 'zod';

const querySchema = z.object({
  subject_id: z.coerce.number().int().positive(),
});

export function topicsRoutes(pool: Pool) {
  const db = drizzle(pool, { schema, mode: 'default' });
  const app = new Hono();

  app.get('/', async (c) => {
    const raw = c.req.query();
    const parsed = querySchema.safeParse(raw);

    if (!parsed.success) {
      return c.json({ error: 'invalid_query', message: 'subject_id harus berupa angka positif.' }, 400);
    }

    const rows = await db
      .select({
        id: topics.id,
        subject_id: topics.subject_id,
        slug: topics.slug,
        label: topics.label,
        display_order: topics.display_order,
        question_count: count(questions.id),
      })
      .from(topics)
      .leftJoin(questions, eq(questions.topic_id, topics.id))
      .where(eq(topics.subject_id, parsed.data.subject_id))
      .groupBy(topics.id)
      .orderBy(topics.display_order);

    return c.json({ topics: rows });
  });

  app.get('/:id', async (c) => {
    const id = Number(c.req.param('id'));

    if (!Number.isFinite(id) || id < 1) {
      return c.json({ error: 'invalid_param', message: 'ID topik tidak valid.' }, 400);
    }

    const [topic] = await db
      .select({
        id: topics.id,
        subject_id: topics.subject_id,
        slug: topics.slug,
        label: topics.label,
        display_order: topics.display_order,
        question_count: count(questions.id),
      })
      .from(topics)
      .leftJoin(questions, eq(questions.topic_id, topics.id))
      .where(eq(topics.id, id))
      .groupBy(topics.id)
      .limit(1);

    if (!topic) {
      return c.json({ error: 'not_found', message: 'Topik tidak ditemukan.' }, 404);
    }

    return c.json({ topic });
  });

  return app;
}
