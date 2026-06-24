import { createApp } from './app';
import { createPool } from './db/connection';
import { applyMigrations } from './db/migrate';

const pool = createPool();

await applyMigrations(pool);

const app = createApp({ pool });

const port = 3000;

console.log(`[server] Starting on http://localhost:${port}`);

Bun.serve({
  fetch: app.fetch,
  port,
});

console.log(`[server] Ready on http://localhost:${port}`);
