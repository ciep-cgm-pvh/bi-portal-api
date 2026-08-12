import { ContratosService } from './contratos.service';
import { ContratosFilters } from './utils/types';

type ContratosContext = { contratosService: ContratosService };

const requireService = (context: ContratosContext, queryName: string) => {
  const service = context.contratosService;
  if (!service) throw new Error(`${queryName} não inicializado`);
  return service;
};

export const contratosResolvers = () => ({
  Query: {
    getContratos: async (
      _: unknown,
      { filters }: { filters?: ContratosFilters },
      context: ContratosContext
    ) => {
      return await requireService(context, 'getContratos').getContratos(filters);
    },

    getContratosSecretariaSummary: async (
      _: unknown,
      { filters }: { filters?: ContratosFilters },
      context: ContratosContext
    ) => {
      return await requireService(context, 'getContratosSecretariaSummary').getSecretariaSummary(filters);
    },

    getContratosTable: async (_: unknown, args: any, context: ContratosContext) => {
      return await requireService(context, 'getContratosTable').getContratosTableData(
        args.limit,
        args.offset,
        args.sortBy,
        args.sortDirection,
        args.filters,
        args.tableFilters
      );
    },

    getContratosKpi: async (
      _: unknown,
      { filters }: { filters?: ContratosFilters },
      context: ContratosContext
    ) => {
      return await requireService(context, 'getContratosKpi').getKpi(filters);
    },

    getContratosCharts: async (
      _: unknown,
      { filters }: { filters?: ContratosFilters },
      context: ContratosContext
    ) => {
      return await requireService(context, 'getContratosCharts').getCharts(filters);
    },

    getContratosFiltersOptions: async (
      _: unknown,
      { filters }: { filters?: ContratosFilters },
      context: ContratosContext
    ) => {
      return await requireService(context, 'getContratosFiltersOptions').getFilterOptions(filters);
    },

    getContratosLastUpdate: async (_: unknown, __: any, context: ContratosContext) => {
      return await requireService(context, 'getContratosLastUpdate').getContratosLastUpdate();
    },
  },
});
