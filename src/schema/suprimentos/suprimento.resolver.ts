// src/schema/suprimentos/suprimento.resolver.ts
import { SuprimentoService } from './suprimento.service';
import { SuprimentoFilters } from './utils/types';

export const suprimentoResolver = () => ({
  Query: {
    getSuprimentos: async (
      _: unknown,
      { filters }: { filters?: SuprimentoFilters },
      context: { suprimentoService: SuprimentoService }
    ) => {
      const service = context.suprimentoService;
      if (!service) throw new Error("getSuprimentos não inicializado");
      return service.getSuprimentos(filters);
    },

    getSuprimentoTable: async (
      _: unknown,
      args: any,
      context: { suprimentoService: SuprimentoService }
    ) => {
      const service = context.suprimentoService;
      if (!service) throw new Error("getSuprimentoTable não inicializado");
      return service.getSuprimentoTableData(
        args.limit,
        args.offset,
        args.sortBy,
        args.sortDirection,
        args.filters,
        args.tableFilters
      );
    },

    getSuprimentoLastUpdate: async (
      _: unknown,
      __: any,
      context: { suprimentoService: SuprimentoService }
    ) => {
      const service = context.suprimentoService;
      if (!service) throw new Error("getSuprimentoLastUpdate não inicializado");
      return service.getLastUpdate();
    },

    SuprimentoKpis: async (
      _: unknown,
      { filters }: { filters?: SuprimentoFilters },
      context: { suprimentoService: SuprimentoService }
    ) => {
      const service = context.suprimentoService;
      if (!service) throw new Error("SuprimentoKpis não inicializado");
      const kpis = await service.getKpi(filters);
      const lastUpdate = await service.getLastUpdate();
      return { ...kpis, lastUpdate };
    },

    SuprimentoCharts: async (
      _: unknown,
      { filters }: { filters?: SuprimentoFilters },
      context: { suprimentoService: SuprimentoService }
    ) => {
      const service = context.suprimentoService;
      if (!service) throw new Error("SuprimentoCharts não inicializado");
      return service.getCharts(filters);
    },

    SuprimentoFilterOptions: async (
      _: unknown,
      { filters }: { filters?: SuprimentoFilters },
      context: { suprimentoService: SuprimentoService }
    ) => {
      const service = context.suprimentoService;
      if (!service) throw new Error("SuprimentoFilterOptions não inicializado");
      return service.getFilterOptions(filters);
    },
  },
});
