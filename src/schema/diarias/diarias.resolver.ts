import { DiariasService } from './diarias.service';
import { DiariasFilters } from './utils/types';

export const diariasResolvers = () => ({
  Query: {
    getDiarias: async (_: unknown, { filters }: { filters?: DiariasFilters }, context: {diariasService: DiariasService}) => {
      const service = context.diariasService
      if(!service) throw new Error("getDiarias não inicializado");
      return await service.getDiarias(filters)
    },

    getDiariasTable: async (_: unknown, args: any, context: { diariasService: DiariasService }) => {
      const service = context.diariasService
      if (!service) throw new Error("getDiariasTable não inicializado");
      return await service.getDiariasTableData(
        args.limit,
        args.offset,
        args.sortBy,
        args.sortDirection,
        args.filters,
        args.tableFilters)
    },

    getDiariasKpi(_: unknown, { filters }: { filters?: DiariasFilters }, context: { diariasService: DiariasService }) {
      const service = context.diariasService
      if (!service) throw new Error("getDiariasKpi não inicializado");
      return service.getKpi(filters)
    },

    getDiariasCharts(_: unknown, { filters }: { filters?: DiariasFilters }, context: { diariasService: DiariasService }) {
      const service = context.diariasService
      if (!service) throw new Error("getDiariasCharts não inicializado");
      return service.getCharts(filters)
    },

    getDiariasFiltersOptions(_: unknown, { filters }: { filters?: DiariasFilters }, context: { diariasService: DiariasService }) {
      const service = context.diariasService
      if (!service) throw new Error("getDiariasFiltersOptions não inicializado");
      return service.getFilterOptions(filters)
    },

    getDiariasLastUpdate(_:unknown, args: any, context: { diariasService: DiariasService }) {
      const service = context.diariasService
      if (!service) throw new Error("getDiariasLastUpdate não inicializado");
      return service.getDiariasLastUpdate()
    }
  },
});