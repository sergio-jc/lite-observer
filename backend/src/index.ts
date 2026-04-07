import Fastify from 'fastify';
import { env } from './env.js';
import corsPlugin from './plugins/cors.js';
import rateLimitPlugin from './plugins/rateLimiter.js';
import ingestRoutes from './routes/ingest/index.js';
import queryRoutes from './routes/query/index.js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, queryClient } from './db/client.js';
import { spans, metricDataPoints, logs } from './db/schema.js';
import { lt, sql } from 'drizzle-orm';

async function main() {
  const fastify = Fastify({
    logger: { level: env.LOG_LEVEL },
    bodyLimit: env.MAX_BODY_SIZE,
  });

  await fastify.register(corsPlugin);
  await fastify.register(rateLimitPlugin);
  await fastify.register(ingestRoutes);
  await fastify.register(queryRoutes);

  await migrate(db, { migrationsFolder: './drizzle' });

  async function cleanExpiredData() {
    const cutoff = sql`NOW() - INTERVAL '${sql.raw(String(env.RETENTION_DAYS))} days'`;
    try {
      await db.delete(spans).where(lt(spans.createdAt, cutoff));
      await db.delete(metricDataPoints).where(lt(metricDataPoints.createdAt, cutoff));
      await db.delete(logs).where(lt(logs.createdAt, cutoff));
      fastify.log.info('Retention cleanup completed');
    } catch (err) {
      fastify.log.error(err, 'Retention cleanup failed');
    }
  }

  const retentionInterval = setInterval(cleanExpiredData, 3_600_000);

  const shutdown = async (signal: string) => {
    fastify.log.info(`Received ${signal}, shutting down...`);
    clearInterval(retentionInterval);
    await fastify.close();
    await queryClient.end();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
}

main();
