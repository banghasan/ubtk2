import { mysqlTable, int, varchar } from 'drizzle-orm/mysql-core';
import { subjects } from './subjects';

export const topics = mysqlTable('topics', {
  id: int('id').autoincrement().primaryKey(),
  subject_id: int('subject_id').notNull().references(() => subjects.id),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  label: varchar('label', { length: 100 }).notNull(),
  display_order: int('display_order').notNull(),
});
