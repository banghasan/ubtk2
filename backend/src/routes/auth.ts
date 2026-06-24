import { Hono } from 'hono';
import { z } from 'zod';
import { createToken } from '../lib/auth-store';

const authBodySchema = z.object({
  password: z.string().min(1),
});

export function authRoutes(validPassword: string) {
  const app = new Hono();

  app.get('/', (c) => {
    return c.json({ auth_enabled: Boolean(validPassword) });
  });

  app.post('/', async (c) => {
    if (!validPassword) {
      return c.json({ error: 'auth_disabled', message: 'Autentikasi tidak aktif.' }, 400);
    }

    const body = await c.req.json();
    const parsed = authBodySchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: 'invalid_body', message: 'Password wajib diisi.' }, 400);
    }

    if (validPassword && parsed.data.password !== validPassword) {
      return c.json({ error: 'unauthorized', message: 'Password salah.' }, 401);
    }

    const token = createToken();
    return c.json({ token });
  });

  return app;
}
