// src/server.ts
import Fastify from 'fastify';
import mercurius from 'mercurius';
import { buildSchema } from './schema/index';
import cors from '@fastify/cors';

export async function buildServer() {
  const app = Fastify({
    logger: process.env.NODE_ENV === 'development',
    // Reduce timeout for serverless
    connectionTimeout: 30000,
    keepAliveTimeout: 30000,
  });

  try {
    // Register CORS plugin
    await app.register(cors, {
      origin: true, // Allow all origins for development
      methods: [ 'GET', 'POST', 'OPTIONS' ],
      allowedHeaders: [ 'Content-Type', 'Authorization' ],
    });

    // Build GraphQL schema with error handling
    const schema = await buildSchema(app);

    // Register Mercurius with error handling
    await app.register(mercurius, {
      schema,
      context: () => ({}),
      graphiql: process.env.NODE_ENV !== 'production', // Only enable in dev
      errorHandler: (error, request, reply) => {
        console.error('GraphQL Error:', error);
        reply.code(500).send({
          error: 'GraphQL execution error',
          message: error.message
        });
      },
      queryDepth: 10, // Limit query depth to prevent abuse
    });

    // Health check endpoint
    app.get('/health', async (request, reply) => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Catch-all error handler
    app.setErrorHandler((error, request, reply) => {
      console.error('Server Error:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: error.message
      });
    });

    console.log('Fastify server configured successfully');
    return app;
  } catch (error) {
    console.error('Error building server:', error);
    throw error;
  }
}