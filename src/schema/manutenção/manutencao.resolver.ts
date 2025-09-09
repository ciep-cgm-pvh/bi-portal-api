// manutencao.resolver.ts - Manutenção
import { ManutencaoService } from './manutencao.service';
import { ManutencaoFilters } from './utils/types';

const manutencaoService = new ManutencaoService();

export const manutencaoResolvers = () => ({
  Query: {
    // Lista de dados completa
    getManutencao: (_: unknown, { filters }: { filters?: ManutencaoFilters }) => {
      return manutencaoService.getManutencao(filters);
    },

    // Tabela com filtros, paginação e ordenação
    getManutencaoTable: (_: unknown, args: any) => {
      const data = manutencaoService.getManutencaoTable(
        args.limit,
        args.offset,
        args.sortBy,
        args.sortDirection,
        args.filters,
        args.tableFilters);
      return data;
    },

    getManutencaoVehicleSummary: () => {
      return manutencaoService.getManutencao()
    },

    // Contagem total de registros da tabela
    TableCount: (_: unknown, args: any) => {
      return manutencaoService.getTableCount(args.filters, args.tableFilters);
    },

    // KPIs
    ManutencaoKpis: (_: unknown, { filters }: { filters?: ManutencaoFilters }) => {
      return manutencaoService.ManutencaoKpis(filters);
    },

    // Gráficos
    ManutencaoCharts: (_: unknown, { filters }: { filters?: ManutencaoFilters }) => {
      return manutencaoService.getManutencaoCharts(filters)
    },

    //Filtros
    FilterOptions: (_: unknown, { filters }: { filters?: ManutencaoFilters }) => {
      return manutencaoService.getFilterOptions(filters)
    },
  }
})
