// src/server.ts
import cors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import Fastify from 'fastify';
import mercurius from 'mercurius';
import { buildSchema } from './schema/index';
import { AbastecimentoService } from './schema/abastecimento/abastecimento.service';

dotenv.config();

export async function buildServer() {
  const app = Fastify({
    logger: process.env.NODE_ENV === 'production' ? false : true,
    trustProxy: true,
  });

  const allowedOrigins = (process.env.FRONTEND_URLS || '')
    .split(',')
    .filter(Boolean)
    .map(url => url.replace(/\/$/, ''));
  const isDev = process.env.NODE_ENV !== 'production';

  // CORS
  await app.register(cors, {
    origin: isDev
      ? [ "http://localhost:5173", ...allowedOrigins ]
      : allowedOrigins.length > 0
        ? allowedOrigins
        : true,
    credentials: true,
    methods: [ 'GET', 'POST', 'OPTIONS' ],
    allowedHeaders: [ 'Content-Type', 'Authorization' ],
  });

  // Rate Limit
  if (!process.env.VERCEL) {
    await app.register(fastifyRateLimit, {
      max: 50,
      timeWindow: '1 minute',
      errorResponseBuilder: (req, context) => ({
        code: 'TOO_MANY_REQUESTS',
        message: `Você fez muitas requisições. Tente novamente em ${context.after}`,
      }),
    });
  }

  // Rota default
  app.get('/', async () => ({
    message: 'API is running',
    graphql: isDev ? '/graphiql' : '/graphql',
    version: '1.0.0',
  }));

  // Inicializa o serviço de abastecimento
  const abastecimentoService = await AbastecimentoService.create();
  console.log('🚀 AbastecimentoService inicializado!');

  // Schema GraphQL
  const schema = await buildSchema(app);

  // Mercurius (GraphQL)
  await app.register(mercurius, {
    schema,
    context: () => ({ abastecimentoService }),
    graphiql: true,
    path: '/graphql',
  });

  // Helmet
  await app.register(fastifyHelmet, {
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: isDev
      ? false
      : {
        directives: {
          defaultSrc: [ "'self'" ],
          scriptSrc: [ "'self'", "'unsafe-inline'", "'unsafe-eval'" ],
          styleSrc: [ "'self'", "'unsafe-inline'" ],
          imgSrc: [ "'self'", 'data:', 'https:' ],
          fontSrc: [ "'self'" ],
          objectSrc: [ "'none'" ],
          frameAncestors: [ "'self'" ],
          upgradeInsecureRequests: [],
        },
      },
  });

  return app;
}
