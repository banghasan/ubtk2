import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { topics } from '../db/schema/topics';
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
      .select()
      .from(topics)
      .where(eq(topics.subject_id, parsed.data.subject_id))
      .orderBy(topics.display_order);

    return c.json({ topics: rows });
  });

  return app;
}
