// src/schema/suprimento/suprimento.resolver.ts

export const suprimentoResolver = {
  Query: {
    getSuprimentoTable: async (_: any, args: any, ctx: any) => {
      return ctx.suprimentoService.getSuprimentoTableData(
        args.limit,
        args.offset,
        args.sortBy,
        args.sortDirection,
        args.filters,
        args.tableFilters
      );
    },
    SuprimentoKpis: async (_: any, { filters }: any, ctx: any) => {
      const kpis = await ctx.suprimentoService.getKpi(filters);
      const lastUpdate = await ctx.suprimentoService.getLastUpdate();
      return { ...kpis, lastUpdate };
    },
    SuprimentoCharts: async (_: any, { filters }: any, ctx: any) => {
      return ctx.suprimentoService.getCharts(filters);
    },
    SuprimentoFilterOptions: async (_: any, { filters }: any, ctx: any) => {
      return ctx.suprimentoService.getFilterOptions(filters);
    },
  },
};
