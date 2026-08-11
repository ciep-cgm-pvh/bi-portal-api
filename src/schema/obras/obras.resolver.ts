import { ObrasService } from './obras.service';
import { ObrasFilters } from './utils/types';

type ObrasContext = { obrasService: ObrasService };

const requireService = (context: ObrasContext, queryName: string) => {
  const service = context.obrasService;
  if (!service) throw new Error(`${queryName} não inicializado`);
  return service;
};

export const obrasResolvers = () => ({
  Query: {
    getObras: async (_: unknown, { filters }: { filters?: ObrasFilters }, context: ObrasContext) => {
      return await requireService(context, 'getObras').getObras(filters);
    },

    getObrasDepartmentSummary: async (
      _: unknown,
      { filters }: { filters?: ObrasFilters },
      context: ObrasContext
    ) => {
      return await requireService(context, 'getObrasDepartmentSummary').getDepartmentSummary(filters);
    },

    getObrasTable: async (_: unknown, args: any, context: ObrasContext) => {
      return await requireService(context, 'getObrasTable').getObrasTableData(
        args.limit,
        args.offset,
        args.sortBy,
        args.sortDirection,
        args.filters,
        args.tableFilters
      );
    },

    getObrasKpi: async (_: unknown, { filters }: { filters?: ObrasFilters }, context: ObrasContext) => {
      return await requireService(context, 'getObrasKpi').getKpi(filters);
    },

    getObrasCharts: async (_: unknown, { filters }: { filters?: ObrasFilters }, context: ObrasContext) => {
      return await requireService(context, 'getObrasCharts').getCharts(filters);
    },

    getObrasFiltersOptions: async (
      _: unknown,
      { filters }: { filters?: ObrasFilters },
      context: ObrasContext
    ) => {
      return await requireService(context, 'getObrasFiltersOptions').getFilterOptions(filters);
    },

    getObrasLastUpdate: async (_: unknown, __: any, context: ObrasContext) => {
      return await requireService(context, 'getObrasLastUpdate').getObrasLastUpdate();
    },
  },
});
