// src/server.ts
import cors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import Fastify from 'fastify';
import mercurius from 'mercurius';
import { AbastecimentoService } from './schema/abastecimento/abastecimento.service';
import { buildSchema } from './schema/index';

dotenv.config();

export async function buildServer() {
  const isDev = process.env.NODE_ENV !== 'production';
  const isVercel = process.env.VERCEL === '1';

  const app = Fastify({
    logger: isDev,
    trustProxy: true,
  });

  const allowedOrigins = [
    'https://bi-portal-frontend-developer.vercel.app',
    'https://paineis-cgm.vercel.app',
    'http://localhost:5173'
  ];

  // CORS - Configuração ajustada para Vercel
  await app.register(cors, {
    origin: (origin, cb) => {
      // Permitir requisições sem origin (como Postman) em dev
      if (!origin && isDev) {
        cb(null, true);
        return;
      }

      // Verificar se a origem está na lista permitida
      if (origin && allowedOrigins.includes(origin)) {
        cb(null, true);
        return;
      }

      cb(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: [ 'GET', 'POST', 'OPTIONS' ],
    allowedHeaders: [ 'Content-Type', 'Authorization' ],
    preflight: true,
    strictPreflight: false,
  });

  // Rate Limit só em dev local (não serverless)
  if (isDev && !isVercel) {
    await app.register(fastifyRateLimit, {
      max: 50,
      timeWindow: '1 minute',
      errorResponseBuilder: (req, context) => ({
        code: 'TOO_MANY_REQUESTS',
        message: `Você fez muitas requisições. Tente novamente em ${context.after}`,
      }),
    });
  }

  // Hook para adicionar headers CORS manualmente (garantia extra)
  app.addHook('onRequest', async (request, reply) => {
    const origin = request.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      reply.header('Access-Control-Allow-Origin', origin);
      reply.header('Access-Control-Allow-Credentials', 'true');
      reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    // Responder imediatamente para OPTIONS
    if (request.method === 'OPTIONS') {
      reply.code(200).send();
    }
  });

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

  // Helmet - Desabilitado em serverless para evitar conflitos
  if (!isVercel) {
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
  }

  return app;
}