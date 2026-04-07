import type { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/client.js';
import { spans, metricDataPoints, logs } from '../../db/schema.js';
import { sql } from 'drizzle-orm';

const servicesQuery: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/services', async () => {
    const result = await db.execute(sql`
      SELECT DISTINCT service_name FROM (
        SELECT ${spans.serviceName} AS service_name FROM ${spans}
        UNION
        SELECT ${metricDataPoints.serviceName} AS service_name FROM ${metricDataPoints}
        UNION
        SELECT ${logs.serviceName} AS service_name FROM ${logs}
      ) AS all_services
      WHERE service_name != 'unknown'
      ORDER BY service_name
    `);

    return result.map((row: Record<string, unknown>) => row.service_name);
  });
};

export default servicesQuery;
