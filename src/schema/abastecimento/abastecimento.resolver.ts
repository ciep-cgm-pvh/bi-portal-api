// abastecimento.resolver.ts
import { AbastecimentoService } from './abastecimento.service';
import { AbastecimentoFilters, AbastecimentoOptionsFilters, AbastecimentoTableFilters } from './utils/types';


export const abastecimentoResolvers = {
  Query: {
    abastecimentoRawData: async (_: unknown, __: any, context: { abastecimentoService: AbastecimentoService }) => {
      const service = context.abastecimentoService;
      if (!service) throw new Error("AbastecimentoService não inicializado");
      return await service.getRawData();
    },

    // Dados gerais (filtros gerais, incluindo dateRange)
    getAbastecimentos: async (_: unknown, { filters }: { filters?: AbastecimentoFilters }, context: { abastecimentoService: AbastecimentoService }) => {
      const service = context.abastecimentoService;
      if (!service) throw new Error("AbastecimentoService não inicializado");
      return await service.getAbastecimentos(filters);
    },

    getAbastecimentosTable: async (_: unknown, args: { limit?: number, offset?: number, sortBy?: string, sortDirection?: string, filters?: AbastecimentoFilters, tableFilters?: AbastecimentoTableFilters }, context: { abastecimentoService: AbastecimentoService }) => {
      const service = context.abastecimentoService;
      if (!service) throw new Error("AbastecimentoService não inicializado");
      return await service.getAbastecimentosTable(
        args.limit,
        args.offset,
        args.sortBy,
        args.sortDirection,
        args.filters,
        args.tableFilters
      );
    },

    getAbastecimentosTableCount: async (
      _: unknown,
      { filters, tableFilters }: any,
      context: { abastecimentoService: any }
    ) => {
      const service = context.abastecimentoService;
      if (!service) throw new Error("AbastecimentoService não inicializado");
      return await service.getTableCount(filters, tableFilters);
    },

    getAbastecimentoKpi: async (
      _: unknown,
      { filters }: { filters?: AbastecimentoFilters },
      context: { abastecimentoService: AbastecimentoService }
    ) => {
      const service = context.abastecimentoService;
      if (!service) throw new Error("AbastecimentoService não inicializado");
      return await service.getKpis(filters);
    },

    getAbastecimentoVehicleSummary: async (
      _: unknown,
      __: any,
      context: { abastecimentoService: AbastecimentoService }
    ) => {
      const service = context.abastecimentoService;
      if (!service) throw new Error("AbastecimentoService não inicializado");
      return await service.getVehicleSummary();
    },

    AbastecimentoFilterOptions: async (
      _: unknown,
      { filters }: { filters?: AbastecimentoOptionsFilters },
      context: { abastecimentoService: AbastecimentoService }
    ) => {
      const service = context.abastecimentoService;
      if (!service) throw new Error("AbastecimentoService não inicializado");
      return await service.getFilterOptions(filters);
    },

    getAbastecimentoCharts: async (
      _: unknown,
      args: { vehicleLimit?: number; filters?: AbastecimentoFilters },
      context: { abastecimentoService: AbastecimentoService }
    ) => {
      const service = context.abastecimentoService;
      if (!service) throw new Error("AbastecimentoService não inicializado");
      return await service.getCharts(args.vehicleLimit, args.filters);
    },

    getAbastecimentosColumns: async (
      _: unknown,
      __: any,
      context: { abastecimentoService: AbastecimentoService }
    ) => {
      const service = context.abastecimentoService;
      if (!service) throw new Error("AbastecimentoService não inicializado");
      return await service.getColumns();
    },
  },
}

export default abastecimentoResolvers;