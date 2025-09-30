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
  const app = Fastify();

  const allowedOrigins = (process.env.FRONTEND_URLS || '').split(',');
  const isDev = process.env.NODE_ENV !== 'production';

  app.register(cors, {
    origin: isDev ? ["http://localhost:5173", allowedOrigins] : allowedOrigins,
  });

  await app.register(fastifyRateLimit, {
    max: 50,       // Máx. requisições
    timeWindow: "1 minute", // Janela de tempo
    errorResponseBuilder: (req, context) => {
      return {
        code: "TOO_MANY_REQUESTS",
        message: `Você fez muitas requisições. Tente novamente em ${context.after}`,
      };
    },
  })
  
  const schema = await buildSchema(app); // <-- chama a função com `app`

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: isDev
      ? false
      : {
        directives: {
          defaultSrc: [ "'self'" ],
          scriptSrc: [ "'self'" ],
          styleSrc: [ "'self'" ],
          imgSrc: [ "'self'" ],
          fontSrc: [ "'self'" ],
          objectSrc: [ "'none'" ],
          frameAncestors: [ "'self'" ],
          upgradeInsecureRequests: [],
        },
      },
  });

  app.register(mercurius, {
    schema,
    context: () => ({}), // contexto vazio, você pode adicionar o Prisma aqui se necessário
    graphiql: isDev, // habilita o GraphiQL apenas em desenvolvimento
  });

  return app;
}
