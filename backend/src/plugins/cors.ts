import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import { env } from '../env.js';

export default fp(async (fastify) => {
  await fastify.register(cors, {
    origin: env.CORS_ORIGIN,
  });
});
