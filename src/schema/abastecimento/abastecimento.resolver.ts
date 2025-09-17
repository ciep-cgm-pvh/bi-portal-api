// abastecimento.resolver.ts
import  { AbastecimentoService }  from './abastecimento.service';
import { AbastecimentoFilters, AbastecimentoOptionsFilters } from './utils/types';

const abastecimentoService = new AbastecimentoService();

const abastecimentoResolvers = () => ({
  Query: {
    // Dados gerais (filtros gerais, incluindo dateRange)
    getAbastecimentos: (_: unknown, { filters }: { filters?: AbastecimentoFilters }) => {
      return abastecimentoService.getAbastecimentos(filters);
    },

    getAbastecimentosTable: (_: unknown, args: any) => {
      return abastecimentoService.getAbastecimentosTable(args.limit, args.offset, args.sortBy, args.sortDirection, args.filters, args.tableFilters);
    },

    // count baseado no mesmo conjunto filtrado da tabela
    getAbastecimentosTableCount: (_: unknown, { filters, tableFilters }: any) => {
      const data = abastecimentoService.getAbastecimentosTable(filters, tableFilters);
      return data.length;
    },

    // KPIs
    getAbastecimentoKpi: (_: unknown, { filters }: { filters?: AbastecimentoFilters }) => {
      return abastecimentoService.getKpis(filters);
    },

    getAbastecimentoVehicleSummary: () => {
      return abastecimentoService.getVehicleSummary();
    },

    AbastecimentoFilterOptions: (_: unknown, { filters }: { filters?: AbastecimentoOptionsFilters }) => {
      return abastecimentoService.getFilterOptions(filters);
    },

    getAbastecimentoCharts: (_: unknown, args: { vehicleLimit?: number, filters?: AbastecimentoFilters }) => {
      return abastecimentoService.getCharts(args.vehicleLimit, args.filters);
    },

    getAbastecimentosColumns: () => {
      return abastecimentoService.getColumns();
    }
  }
});

export default abastecimentoResolvers;