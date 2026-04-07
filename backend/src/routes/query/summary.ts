import type { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/client.js';
import { spans, metricDataPoints, logs } from '../../db/schema.js';
import { sql, eq, count } from 'drizzle-orm';

const summaryQuery: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/summary', async () => {
    const [spanStats] = await db
      .select({
        total: count(),
        errorCount: sql<number>`COUNT(CASE WHEN ${spans.statusCode} = 2 THEN 1 END)::int`,
        p95DurationMs: sql<number>`PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY ${spans.durationMs})`,
        avgDurationMs: sql<number>`AVG(${spans.durationMs})`,
      })
      .from(spans);

    const [metricStats] = await db
      .select({ total: count() })
      .from(metricDataPoints);

    const [logStats] = await db
      .select({
        total: count(),
        errorCount: sql<number>`COUNT(CASE WHEN ${logs.severityNumber} >= 17 THEN 1 END)::int`,
      })
      .from(logs);

    const topServices = await db
      .select({
        serviceName: spans.serviceName,
        spanCount: sql<number>`COUNT(*)::int`,
        errorCount: sql<number>`COUNT(CASE WHEN ${spans.statusCode} = 2 THEN 1 END)::int`,
        avgDurationMs: sql<number>`AVG(${spans.durationMs})`,
      })
      .from(spans)
      .groupBy(spans.serviceName)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(10);

    return {
      spans: {
        total: spanStats?.total ?? 0,
        errorCount: spanStats?.errorCount ?? 0,
        errorRate:
          spanStats?.total
            ? (spanStats.errorCount ?? 0) / spanStats.total
            : 0,
        p95DurationMs: spanStats?.p95DurationMs ?? 0,
        avgDurationMs: spanStats?.avgDurationMs ?? 0,
      },
      metrics: {
        total: metricStats?.total ?? 0,
      },
      logs: {
        total: logStats?.total ?? 0,
        errorCount: logStats?.errorCount ?? 0,
      },
      topServices,
    };
  });
};

export default summaryQuery;
