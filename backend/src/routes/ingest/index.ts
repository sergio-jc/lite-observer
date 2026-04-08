import type { FastifyPluginAsync } from 'fastify';
import tracesIngest from './traces.js';
// import metricsIngest from './metrics.js';
// import logsIngest from './logs.js';

const ingestRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(tracesIngest);
  // await fastify.register(metricsIngest);
  // await fastify.register(logsIngest);
};

export default ingestRoutes;
