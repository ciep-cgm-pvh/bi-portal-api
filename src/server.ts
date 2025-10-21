// src/server.ts
import cors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import Fastify from 'fastify';
import mercurius from 'mercurius';
import { buildSchema } from './schema/index';

dotenv.config();

export async function buildServer() {
  const app = Fastify({
    logger: process.env.NODE_ENV === 'production' ? false : true,
    trustProxy: true, // Importante para Vercel
  });

  const allowedOrigins = (process.env.FRONTEND_URLS || '').split(',').filter(Boolean);
  const isDev = process.env.NODE_ENV !== 'production';

  // CORS
  await app.register(cors, {
    origin: isDev
      ? [ "http://localhost:5173", ...allowedOrigins ]
      : allowedOrigins.length > 0
        ? allowedOrigins
        : true, // Aceita qualquer origem se não houver FRONTEND_URLS configurado
    credentials: true,
    methods: [ 'GET', 'POST', 'OPTIONS' ],
    allowedHeaders: [ 'Content-Type', 'Authorization' ],
  });

  // Rate Limit (pode dar problema no serverless, considere desabilitar)
  if (!process.env.VERCEL) {
    await app.register(fastifyRateLimit, {
      max: 50,
      timeWindow: "1 minute",
      errorResponseBuilder: (req, context) => {
        return {
          code: "TOO_MANY_REQUESTS",
          message: `Você fez muitas requisições. Tente novamente em ${context.after}`,
        };
      },
    });
  }

  // ROTA DEFAULT
  app.get('/', async (request, reply) => {
    return {
      message: 'API is running',
      graphql: isDev ? '/graphiql' : '/graphql',
      version: '1.0.0'
    };
  });

  const schema = await buildSchema(app);
  // Mercurius (GraphQL)
  await app.register(mercurius, {
    schema,
    context: () => ({}),
    graphiql: true, // Habilita sempre (ou use isDev se preferir)
    path: '/graphql', // Define o path explicitamente
  });

  // Helmet
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: isDev
      ? false
      : {
        directives: {
          defaultSrc: [ "'self'" ],
          scriptSrc: [ "'self'", "'unsafe-inline'", "'unsafe-eval'" ], // GraphiQL precisa disso
          styleSrc: [ "'self'", "'unsafe-inline'" ],
          imgSrc: [ "'self'", "data:", "https:" ],
          fontSrc: [ "'self'" ],
          objectSrc: [ "'none'" ],
          frameAncestors: [ "'self'" ],
          upgradeInsecureRequests: [],
        },
      },
  });


  return app;
}