import { FastifyInstance } from 'fastify'

const osResolvers = () => ({
  Query: {
    // ordensServico: async () => {
    //   return app.prisma.ordem_servico.findMany({
    //     include: { veiculo: true, fornecedor: true, cliente: true },
    //     orderBy: { data: 'desc' }
    //   })
    // },
    // ordemServico: async (_: any, { id }: { id: number }) => {
    //   return app.prisma.ordem_servico.findUnique({
    //     where: { id },
    //     include: { veiculo: true, fornecedor: true, cliente: true }
    //   })
    // }
  }
})

export default osResolvers;
