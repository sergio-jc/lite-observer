import type { FastifyPluginAsync } from 'fastify';
import tracesQuery from './traces.js';
import metricsQuery from './metrics.js';
import logsQuery from './logs.js';
import servicesQuery from './services.js';
import summaryQuery from './summary.js';
import healthQuery from './health.js';

const queryRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(tracesQuery);
  // await fastify.register(metricsQuery);
  // await fastify.register(logsQuery);
  await fastify.register(servicesQuery);
  await fastify.register(summaryQuery);
  await fastify.register(healthQuery);
};

export default queryRoutes;
