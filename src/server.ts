// src/server.ts
import Fastify from 'fastify';
import mercurius from 'mercurius';
//import prismaPlugin from './plugins/prisma';
import { buildSchema } from './schema/index';
import cors from '@fastify/cors';

export async function buildServer() {
  const app = Fastify();

  // await app.register(prismaPlugin);

  app.register(cors, {
    origin: '*', // ou pode ser um array ou função para controlar quais origens permitir
  });
  
  const schema = await buildSchema(app); // <-- chama a função com `app`

  app.register(mercurius, {
    schema,
    context: () => ({}), // contexto vazio, você pode adicionar o Prisma aqui se necessário
    graphiql: true,
  });

  return app;
}
