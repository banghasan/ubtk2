import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { subjectsRoutes } from './routes/subjects';
import { topicsRoutes } from './routes/topics';
import { questionsRoutes } from './routes/questions';
import type { Pool } from './db/connection';

interface AppConfig {
  pool: Pool;
  frontendPort: number;
}

export function createApp(config: AppConfig) {
  const app = new Hono();

  app.use(
    '/api/*',
    cors({
      origin: `http://localhost:${config.frontendPort}`,
      credentials: true,
    }),
  );

  app.onError((err, c) => {
    console.error('[error]', err);
    return c.json({ error: 'internal_server_error', message: 'Terjadi kesalahan server.' }, 500);
  });

  app.route('/api/subjects', subjectsRoutes(config.pool));
  app.route('/api/topics', topicsRoutes(config.pool));
  app.route('/api/questions', questionsRoutes(config.pool));

  return app;
}
