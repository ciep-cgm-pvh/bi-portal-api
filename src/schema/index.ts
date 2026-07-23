// src/schema/index.ts
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { FastifyInstance } from 'fastify';
import path from 'path';
import { diariasResolvers } from './diarias/diarias.resolver';
import abastecimentoResolver from './abastecimento/abastecimento.resolver';
import osResolvers from './os/os.resolver';
import { manutencaoResolvers } from './manutenção/manutencao.resolver';
import { suprimentoResolver } from './suprimentos/suprimento.resolver';

export const buildSchema = async (app: FastifyInstance) => {
  // Carrega todos os .typeDefs.ts e .resolver.ts dentro da pasta schema
  const typesArray = loadFilesSync(path.join(__dirname, '/**/*.schema.graphql'));

  const typeDefs = mergeTypeDefs(typesArray);
  // const resolvers = mergeResolvers(loadedResolvers);

  // Registra os resolvers
  const resolvers = mergeResolvers([
    diariasResolvers(),
    abastecimentoResolver,
    manutencaoResolvers(),
    osResolvers(),
    suprimentoResolver(),
  ]);

  return makeExecutableSchema({ typeDefs, resolvers });
};
