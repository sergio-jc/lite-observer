import type { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/client.js';
import { spans } from '../../db/schema.js';
import { parseResourceSpans } from '../../parsers/traces.js';
import { exportTraceServiceRequestSchema } from '../../validators/ingest.js';

const tracesIngest: FastifyPluginAsync = async (fastify) => {
  fastify.post('/v1/traces', async (request, reply) => {
    console.log("🚀 ~ tracesIngest ~ request:", request.body)
    const parsed = exportTraceServiceRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.message });
    }

    const rows = parseResourceSpans(parsed.data.resourceSpans);
    console.log("🚀 ~ tracesIngest ~ rows:", rows)
    if (rows.length > 0) {
      await db.insert(spans).values(rows);
    }

    fastify.log.debug(`Ingested ${rows.length} spans`);
    return {};
  });
};

export default tracesIngest;
