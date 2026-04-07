import type { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/client.js';
import { spans } from '../../db/schema.js';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { traceListQuerySchema, statusCodeMap } from '../../validators/query.js';

const tracesQuery: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/traces', async (request) => {
    const query = traceListQuerySchema.safeParse(request.query);
    if (!query.success) return { error: query.error.message };

    const { service, status, from, to, limit } = query.data;
    const conditions = [];

    if (service) conditions.push(eq(spans.serviceName, service));
    if (status) conditions.push(eq(spans.statusCode, statusCodeMap[status]!));
    if (from) conditions.push(gte(spans.startTimeUnixNano, from));
    if (to) conditions.push(lte(spans.startTimeUnixNano, to));

    const traceRows = await db
      .select({
        traceId: spans.traceId,
        rootSpanName: sql<string>`MIN(CASE WHEN ${spans.parentSpanId} IS NULL THEN ${spans.name} END)`,
        serviceName: sql<string>`MIN(${spans.serviceName})`,
        startTime: sql<string>`MIN(${spans.startTimeUnixNano})`,
        durationMs: sql<number>`MAX(${spans.durationMs})`,
        spanCount: sql<number>`COUNT(*)::int`,
        statusCode: sql<number>`MAX(${spans.statusCode})`,
      })
      .from(spans)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(spans.traceId)
      .orderBy(desc(sql`MIN(${spans.startTimeUnixNano})`))
      .limit(limit);

    return traceRows;
  });

  fastify.get<{ Params: { traceId: string } }>(
    '/api/traces/:traceId',
    async (request) => {
      const { traceId } = request.params;

      const traceSpans = await db
        .select()
        .from(spans)
        .where(eq(spans.traceId, traceId))
        .orderBy(spans.startTimeUnixNano);

      return traceSpans;
    },
  );
};

export default tracesQuery;
