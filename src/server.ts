// // src/server.ts
// import Fastify from 'fastify';
// import mercurius from 'mercurius';
// import { buildSchema } from './schema/index';
// import cors from '@fastify/cors';
// import fastifyHelmet from '@fastify/helmet';
// import dotenv from 'dotenv';
// import fastifyRateLimit from '@fastify/rate-limit';

// dotenv.config();

// export async function buildServer() {
//   const app = Fastify();

//   const allowedOrigins = (process.env.FRONTEND_URLS || '').split(',');
//   const isDev = process.env.NODE_ENV !== 'production';

//   app.register(cors, {
//     origin: isDev ? ["http://localhost:5173", allowedOrigins] : allowedOrigins,
//   });

//   await app.register(fastifyRateLimit, {
//     max: 50,       // Máx. requisições
//     timeWindow: "1 minute", // Janela de tempo
//     errorResponseBuilder: (req, context) => {
//       return {
//         code: "TOO_MANY_REQUESTS",
//         message: `Você fez muitas requisições. Tente novamente em ${context.after}`,
//       };
//     },
//   })
  
//   const schema = await buildSchema(app); // <-- chama a função com `app`

//   await app.register(fastifyHelmet, {
//     contentSecurityPolicy: isDev
//       ? false
//       : {
//         directives: {
//           defaultSrc: [ "'self'" ],
//           scriptSrc: [ "'self'" ],
//           styleSrc: [ "'self'" ],
//           imgSrc: [ "'self'" ],
//           fontSrc: [ "'self'" ],
//           objectSrc: [ "'none'" ],
//           frameAncestors: [ "'self'" ],
//           upgradeInsecureRequests: [],
//         },
//       },
//   });

//   app.register(mercurius, {
//     schema,
//     context: () => ({}), // contexto vazio, você pode adicionar o Prisma aqui se necessário
//     graphiql: isDev, // habilita o GraphiQL apenas em desenvolvimento
//   });

//   return app;
// }


// src/server.ts
import Fastify from 'fastify';
import mercurius from 'mercurius';
import { buildSchema } from './schema/index';
import cors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import dotenv from 'dotenv';
import fastifyRateLimit from '@fastify/rate-limit';

dotenv.config();

export async function buildServer() {
  const app = Fastify({
    // Logger é útil para debugar, especialmente na Vercel
    logger: true,
  });

  const allowedOrigins = (process.env.FRONTEND_URLS || '').split(',');
  const isDev = process.env.NODE_ENV !== 'production';

  // Configuração do CORS
  app.register(cors, {
    origin: (origin, callback) => {
      // Permite requisições sem 'origin' (ex: Postman, mobile apps) ou de domínios na lista
      if (!origin || allowedOrigins.includes(origin) || isDev) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
  });

  // Limite de Requisições
  await app.register(fastifyRateLimit, {
    max: 100, // Aumentei um pouco o limite, ajuste conforme necessário
    timeWindow: '1 minute',
    errorResponseBuilder: (req, context) => {
      return {
        code: 'TOO_MANY_REQUESTS',
        message: `Você fez muitas requisições. Tente novamente em ${context.after}`,
      };
    },
  });

  // Construção do Schema do GraphQL
  const schema = await buildSchema(app); // Não precisa mais passar 'app'

  // Configuração de Segurança com Helmet
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: isDev ? false : undefined, // Simplificado para desabilitar em dev
  });

  // Registro do Mercurius (GraphQL)
  app.register(mercurius, {
    schema,
    context: (req, reply) => {
      // Aqui você pode adicionar dados ao contexto, como o usuário autenticado
      return {};
    },
    graphiql: isDev, // Habilita o GraphiQL apenas em desenvolvimento
  });

  return app;
}