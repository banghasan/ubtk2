import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'rahaSi4Hasan',
    database: 'utbk_belajar',
  },
} satisfies Config;
