// src/server.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import mercurius from 'mercurius';
import dotenv from 'dotenv';
import { buildSchema } from './schema/index';
import { AbastecimentoService } from './schema/abastecimento/abastecimento.service';

dotenv.config();

export async function buildServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  const app = Fastify({
    logger: isDev,
    trustProxy: true,
  });

  const allowedOrigins = (process.env.FRONTEND_URLS || '')
    .split(',')
    .filter(Boolean)
    .map(url => url.replace(/\/$/, ''));

  // CORS
  await app.register(cors, {
    origin: isDev
      ? [ 'http://localhost:5173', ...allowedOrigins ]
      : allowedOrigins.length > 0
        ? allowedOrigins
        : true,
    credentials: true,
    methods: [ 'GET', 'POST', 'OPTIONS' ],
    allowedHeaders: [ 'Content-Type', 'Authorization' ],
  });

  // Rate Limit só em dev (não serverless)
  if (isDev) {
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

  // Inicializa serviço
  const abastecimentoService = await AbastecimentoService.create();
  console.log('🚀 AbastecimentoService inicializado!');

  // Schema GraphQL
  const schema = await buildSchema(app);

  // Mercurius
  await app.register(mercurius, {
    schema,
    context: () => ({ abastecimentoService }),
    graphiql: isDev,
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
