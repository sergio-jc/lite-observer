import type { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/client.js';
import { logs } from '../../db/schema.js';
import { eq, desc, and, gte, lte, ilike } from 'drizzle-orm';
import { logListQuerySchema } from '../../validators/query.js';

const logsQuery: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/logs', async (request) => {
    const query = logListQuerySchema.safeParse(request.query);
    if (!query.success) return { error: query.error.message };

    const { service, severity, traceId, from, to, search, limit } = query.data;
    const conditions = [];

    if (service) conditions.push(eq(logs.serviceName, service));
    if (severity !== undefined) conditions.push(eq(logs.severityNumber, severity));
    if (traceId) conditions.push(eq(logs.traceId, traceId));
    if (from) conditions.push(gte(logs.timeUnixNano, from));
    if (to) conditions.push(lte(logs.timeUnixNano, to));
    if (search) conditions.push(ilike(logs.body, `%${search}%`));

    const logRows = await db
      .select()
      .from(logs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(logs.timeUnixNano))
      .limit(limit);

    return logRows;
  });
};

export default logsQuery;
