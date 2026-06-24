import { mysqlTable, int, varchar } from 'drizzle-orm/mysql-core';

export const subjects = mysqlTable('subjects', {
  id: int('id').autoincrement().primaryKey(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  label: varchar('label', { length: 100 }).notNull(),
  display_order: int('display_order').notNull(),
});
