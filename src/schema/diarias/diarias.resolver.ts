import { FastifyInstance } from 'fastify';
import { loadDiarias } from '../../data/loadDiarias';

const diariasResolvers = () => ({
  Query: {
    diarias: async () => {
      const data = await loadDiarias();
      return data;
      // return context.prisma.diaria.findMany(); // exemplo com Prisma
    },
  },
});

export default diariasResolvers;