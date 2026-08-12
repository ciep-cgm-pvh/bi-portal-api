// src/server.ts
import dotenv from 'dotenv';
dotenv.config();

import cors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';
import mercurius from 'mercurius';
import { AbastecimentoService } from './schema/abastecimento/abastecimento.service';
import { buildSchema } from './schema/index';
import { SuprimentoService } from './schema/suprimentos/suprimento.service';
import { DiariasService } from './schema/diarias/diarias.service';
import { ObrasService } from './schema/obras/obras.service';
import { ContratosService } from './schema/contratos/contratos.service';

export async function buildServer() {
  const isDev = process.env.NODE_ENV !== 'PRODUCTION';
  const isVercel = process.env.VERCEL === '1';

  const app = Fastify({
    logger: isDev,
    trustProxy: true,
  });

  const allowedOrigins = [
    'https://bi-portal-frontend-developer.vercel.app',
    'https://paineis-cgm.vercel.app',
    'http://localhost:5173',
    // O Vite incrementa a porta quando a 5173 já está ocupada.
    'http://localhost:5174',
    /^https:\/\/bi-portal-frontend-.*\.vercel\.app$/, // Permite links temporários de preview do Vercel
    /^https:\/\/.*-cgm-pvhs-projects\.vercel\.app$/  // Permite links com o nome do projeto
  ];

  // CORS - Como o vercel.json já adiciona os headers, simplificamos aqui
  await app.register(cors, {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
  });

  if (!isDev && isVercel) {
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
  const [abastecimento, diarias, obras, suprimento, contratos] = await Promise.allSettled([
    AbastecimentoService.create(),
    DiariasService.create(),
    ObrasService.create(),
    SuprimentoService.create(),
    ContratosService.create()
  ]);

  if (abastecimento.status === 'fulfilled')
    console.log('🚀 AbastecimentoService inicializado!');
  else
    console.error('Erro ao inicializar AbastecimentoService:', abastecimento.reason);

  if (diarias.status === 'fulfilled')
    console.log('🚀 DiariasService inicializado!');
  else
    console.error('Erro ao inicializar DiariasService:', diarias.reason);

  if (obras.status === 'fulfilled')
    console.log('🚀 ObrasService inicializado!');
  else
    console.error('Erro ao inicializar ObrasService:', obras.reason);

  if (suprimento.status === 'fulfilled')
    console.log('🚀 SuprimentoService inicializado!');
  else
    console.error('Erro ao inicializar SuprimentoService:', suprimento.reason);

  if (contratos.status === 'fulfilled')
    console.log('🚀 ContratosService inicializado!');
  else
    console.error('Erro ao inicializar ContratosService:', contratos.reason);

  const abastecimentoService =
    abastecimento.status === 'fulfilled' ? abastecimento.value : null;
  const diariasService =
    diarias.status === 'fulfilled' ? diarias.value : null;
  const obrasService =
    obras.status === 'fulfilled' ? obras.value : null;
  const suprimentoService =
    suprimento.status === 'fulfilled' ? suprimento.value : null;
  const contratosService =
    contratos.status === 'fulfilled' ? contratos.value : null;

  // Schema GraphQL
  const schema = await buildSchema(app);

  // Mercurius
  await app.register(mercurius, {
    schema,
    context: () => ({ abastecimentoService, diariasService, obrasService, suprimentoService, contratosService }),
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
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'self'"],
            upgradeInsecureRequests: [],
          },
        },
    });
  }

  return app;
}