import type { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/client.js';
import { metricDataPoints } from '../../db/schema.js';
import { parseResourceMetrics } from '../../parsers/metrics.js';
import { exportMetricsServiceRequestSchema } from '../../validators/ingest.js';

const metricsIngest: FastifyPluginAsync = async (fastify) => {
  fastify.post('/v1/metrics', async (request, reply) => {
    const parsed = exportMetricsServiceRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.message });
    }

    const rows = parseResourceMetrics(parsed.data.resourceMetrics);
    if (rows.length > 0) {
      await db.insert(metricDataPoints).values(rows);
    }

    fastify.log.debug(`Ingested ${rows.length} metric data points`);
    return {};
  });
};

export default metricsIngest;
