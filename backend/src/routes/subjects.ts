import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/mysql2';
import { subjects } from '../db/schema/subjects';
import * as schema from '../db/schema/index';
import type { Pool } from '../db/connection';

export function subjectsRoutes(pool: Pool) {
  const db = drizzle(pool, { schema, mode: 'default' });
  const app = new Hono();

  app.get('/', async (c) => {
    const rows = await db.select().from(subjects).orderBy(subjects.display_order);
    return c.json({ subjects: rows });
  });

  return app;
}
