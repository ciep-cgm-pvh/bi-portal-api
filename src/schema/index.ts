import { FastifyInstance } from 'fastify';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { loadFilesSync } from '@graphql-tools/load-files';
import path from 'path';

import { diariasResolvers } from './diarias/diarias.resolver';
import { abastecimentoResolvers } from './abastecimento/abastecimento.resolver';
import osResolvers from './os/os.resolver';
import { manutencaoResolvers } from './manutenção/manutencao.resolver';

export const buildSchema = async (app: FastifyInstance) => {
  const typesArray = loadFilesSync(path.join(__dirname, '/**/*.schema.graphql'));
  const typeDefs = mergeTypeDefs(typesArray);

  const resolvers = mergeResolvers([
    diariasResolvers(),
    abastecimentoResolvers,
    manutencaoResolvers(),
    osResolvers(),
  ]);

  return makeExecutableSchema({ typeDefs, resolvers });
};
