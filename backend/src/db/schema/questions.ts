import { mysqlTable, mysqlEnum, int, text, timestamp } from 'drizzle-orm/mysql-core';
import { topics } from './topics';

export const questions = mysqlTable('questions', {
  id: int('id').autoincrement().primaryKey(),
  topic_id: int('topic_id').notNull().references(() => topics.id),
  type: mysqlEnum('type', ['single_choice', 'multiple_response', 'true_false']).notNull(),
  difficulty: mysqlEnum('difficulty', ['easy', 'medium', 'hard']).notNull(),
  question_text: text('question_text').notNull(),
  explanation_text: text('explanation_text').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});
