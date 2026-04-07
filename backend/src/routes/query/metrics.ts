import type { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/client.js';
import { metricDataPoints } from '../../db/schema.js';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { metricListQuerySchema, metricTimeSeriesQuerySchema } from '../../validators/query.js';

const metricsQuery: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/metrics', async (request) => {
    const query = metricListQuerySchema.safeParse(request.query);
    if (!query.success) return { error: query.error.message };

    const { service, limit } = query.data;
    const conditions = [];

    if (service) conditions.push(eq(metricDataPoints.serviceName, service));

    const metrics = await db
      .select({
        name: metricDataPoints.name,
        type: metricDataPoints.type,
        description: sql<string>`MAX(${metricDataPoints.description})`,
        unit: sql<string>`MAX(${metricDataPoints.unit})`,
        lastValue: sql<number>`(ARRAY_AGG(${metricDataPoints.value} ORDER BY ${metricDataPoints.timeUnixNano} DESC))[1]`,
        lastTime: sql<string>`MAX(${metricDataPoints.timeUnixNano})`,
        serviceName: sql<string>`MAX(${metricDataPoints.serviceName})`,
        dataPointCount: sql<number>`COUNT(*)::int`,
      })
      .from(metricDataPoints)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(metricDataPoints.name, metricDataPoints.type)
      .orderBy(metricDataPoints.name)
      .limit(limit);

    return metrics;
  });

  fastify.get<{ Params: { name: string } }>(
    '/api/metrics/:name',
    async (request) => {
      const { name } = request.params;
      const query = metricTimeSeriesQuerySchema.safeParse(request.query);
      if (!query.success) return { error: query.error.message };

      const { from, to, limit } = query.data;
      const conditions = [eq(metricDataPoints.name, name)];

      if (from) conditions.push(gte(metricDataPoints.timeUnixNano, from));
      if (to) conditions.push(lte(metricDataPoints.timeUnixNano, to));

      const dataPoints = await db
        .select()
        .from(metricDataPoints)
        .where(and(...conditions))
        .orderBy(desc(metricDataPoints.timeUnixNano))
        .limit(limit);

      return dataPoints;
    },
  );
};

export default metricsQuery;
