import type { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/client.js';
import { spans } from '../../db/schema.js';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { traceListQuerySchema, statusCodeMap } from '../../validators/query.js';

const rootSpanNameExpr = sql<string>`MIN(CASE WHEN ${spans.parentSpanId} IS NULL THEN ${spans.name} END)`;

const tracesQuery: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/traces', async (request) => {
    const query = traceListQuerySchema.safeParse(request.query);
    if (!query.success) return { error: query.error.message };

    const { search, status, from, to, limit, offset } = query.data;

    const whereConditions = [];
    if (status) whereConditions.push(eq(spans.statusCode, statusCodeMap[status]!));
    if (from) whereConditions.push(gte(spans.startTimeUnixNano, from));
    if (to) whereConditions.push(lte(spans.startTimeUnixNano, to));

    const havingCondition = search
      ? sql`${rootSpanNameExpr} ILIKE ${'%' + search + '%'}`
      : undefined;

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Subquery to count total matching traces for pagination metadata
    const countSubquery = db
      .select({ traceId: spans.traceId })
      .from(spans)
      .where(whereClause)
      .groupBy(spans.traceId)
      .having(havingCondition)
      .as('count_subq');

    const [countResult, traceRows] = await Promise.all([
      db.select({ total: sql<number>`COUNT(*)::int` }).from(countSubquery),
      db
        .select({
          traceId: spans.traceId,
          rootSpanName: rootSpanNameExpr,
          serviceName: sql<string>`MIN(${spans.serviceName})`,
          startTime: sql<string>`MIN(${spans.startTimeUnixNano})`,
          durationMs: sql<number>`MAX(${spans.durationMs})`,
          spanCount: sql<number>`COUNT(*)::int`,
          statusCode: sql<number>`MAX(${spans.statusCode})`,
        })
        .from(spans)
        .where(whereClause)
        .groupBy(spans.traceId)
        .having(havingCondition)
        .orderBy(desc(sql`MIN(${spans.startTimeUnixNano})`))
        .limit(limit)
        .offset(offset),
    ]);

    return {
      data: traceRows,
      total: countResult[0]?.total ?? 0,
    };
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
