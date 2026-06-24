import { migrate } from 'drizzle-orm/mysql2/migrator';
import { drizzle } from 'drizzle-orm/mysql2';
import { createPool, type Pool } from './connection';
import * as schema from './schema/index';
import path from 'node:path';

export async function applyMigrations(pool: Pool) {
  const db = drizzle(pool, { schema, mode: 'default' });
  const migrationsFolder = path.join(process.cwd(), 'drizzle');

  console.log('[migrate] Running migrations from:', migrationsFolder);
  await migrate(db, { migrationsFolder });
  console.log('[migrate] Migrations complete.');
}

if (import.meta.main) {
  const pool = createPool();

  applyMigrations(pool)
    .then(() => pool.end())
    .catch((err) => {
      console.error('[migrate] Migration failed:', err);
      process.exit(1);
    });
}
