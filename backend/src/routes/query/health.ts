import type { FastifyPluginAsync } from 'fastify';
import { sql } from 'drizzle-orm';
import { db } from '../../db/client.js';

const startedAt = Date.now();

const healthQuery: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async (_request, reply) => {
    let dbStatus = 'ok';
    try {
      await db.execute(sql`SELECT 1`);
    } catch {
      dbStatus = 'error';
    }

    const status = dbStatus === 'ok' ? 'healthy' : 'degraded';
    const statusCode = dbStatus === 'ok' ? 200 : 503;

    return reply.code(statusCode).send({
      status,
      db: dbStatus,
      uptime: Math.floor((Date.now() - startedAt) / 1000),
    });
  });
};

export default healthQuery;
