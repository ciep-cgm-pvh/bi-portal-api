import { DiariasService } from './diarias.service';
import { DiariasFilters } from './utils/types';

const diariasService = new DiariasService()

export const diariasResolvers = () => ({
  Query: {
    getDiarias: (_: unknown, { filters }: { filters?: DiariasFilters }) => {
      return diariasService.getDiariasData(filters)
    },

    getDiariasTable(_: unknown, args: any) {
      return diariasService.getDiariasTableData(
        args.limit,
        args.offset,
        args.sortBy,
        args.sortDirection,
        args.filters,
        args.tableFilters)
    },

    getDiariasTableCount(_: unknown, args: any) {
      return diariasService.getTableCount(args.filters, args.tableFilters)
    },

    getDiariasKpi(_: unknown, { filters }: { filters?: DiariasFilters }) {
      return diariasService.getKpi(filters)
    },

    getDiariasCharts(_: unknown, { filters }: { filters?: DiariasFilters }) {
      return diariasService.getCharts(filters)
    },
    getDiariasFiltersOptions(_: unknown, { filters }: { filters?: DiariasFilters }) {
      return diariasService.getFilterOptions(filters)
    },

    getDiariasLastUpdate() {
      return diariasService.getLastUpdate()
    }
  },
});