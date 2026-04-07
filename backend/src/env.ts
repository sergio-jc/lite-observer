import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  MAX_BODY_SIZE: z.coerce.number().default(5_242_880),
  RETENTION_DAYS: z.coerce.number().default(7),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.issues);
  process.exit(1);
}

export const env = parsed.data;
