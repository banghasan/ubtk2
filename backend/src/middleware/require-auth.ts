import type { Context, Next } from 'hono';
import { isValidToken } from '../lib/auth-store';

export async function requireAuth(c: Context, next: Next) {
  const token = c.req.header('x-auth-token');

  if (!isValidToken(token)) {
    return c.json({ error: 'unauthorized', message: 'Akses ditolak. Silakan login.' }, 401);
  }

  await next();
}
