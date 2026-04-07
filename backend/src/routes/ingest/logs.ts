import type { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/client.js';
import { logs } from '../../db/schema.js';
import { parseResourceLogs } from '../../parsers/logs.js';
import { exportLogsServiceRequestSchema } from '../../validators/ingest.js';

const logsIngest: FastifyPluginAsync = async (fastify) => {
  fastify.post('/v1/logs', async (request, reply) => {
    const parsed = exportLogsServiceRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.message });
    }

    const rows = parseResourceLogs(parsed.data.resourceLogs);
    if (rows.length > 0) {
      await db.insert(logs).values(rows);
    }

    fastify.log.debug(`Ingested ${rows.length} log records`);
    return {};
  });
};

export default logsIngest;
