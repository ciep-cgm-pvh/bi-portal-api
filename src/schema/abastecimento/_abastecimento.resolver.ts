// // abastecimento.resolver.ts
// import { AbastecimentoService } from './_abastecimento.service';
// import { AbastecimentoFilters, AbastecimentoOptionsFilters } from './utils/types';


// let abastecimentoService: AbastecimentoService | null = null;

// // inicialização assíncrona logo na carga do módulo
// (async () => {
//   abastecimentoService = await AbastecimentoService.create();
//   console.log("🚀 AbastecimentoService inicializado!");
// })();

// export const abastecimentoResolvers = {
//   Query: {
//     abastecimentoRawData: async () => {
//       try {
//         if (!abastecimentoService) {
//           console.error("❌ AbastecimentoService ainda não inicializado!");
//           throw new Error("AbastecimentoService ainda não inicializado");
//         }
//         const data = await abastecimentoService.getRawData();
//         return data;
//       } catch (error) {
//         console.error("❌ Erro em abastecimentoRawData:", error);
//         throw new Error("Erro ao carregar dados brutos de abastecimento.");
//       }
//     },

//     // Dados gerais (filtros gerais, incluindo dateRange)
//     getAbastecimentos: async (_: unknown, { filters }: { filters?: AbastecimentoFilters }) => {
//       try {
//         if (!abastecimentoService) throw new Error("AbastecimentoService ainda não inicializado");
//         return await abastecimentoService.getAbastecimentos(filters);
//       } catch (error) {
//         console.error("❌ Erro em getAbastecimentos:", error);
//         throw new Error("Erro ao buscar abastecimentos.");
//       }
//     },

//     getAbastecimentosTable: async (_: unknown, args: any) => {
//       try {
//         if (!abastecimentoService) throw new Error("AbastecimentoService ainda não inicializado");
//         return await abastecimentoService.getAbastecimentosTable(
//           args.limit,
//           args.offset,
//           args.sortBy,
//           args.sortDirection,
//           args.filters,
//           args.tableFilters
//         );
//       } catch (error) {
//         console.error("❌ Erro em getAbastecimentosTable:", error);
//         throw new Error("Erro ao buscar dados da tabela de abastecimentos.");
//       }
//     },

//     getAbastecimentosTableCount: async (_: unknown, { filters, tableFilters }: any) => {
//       try {
//         if (!abastecimentoService) throw new Error("AbastecimentoService ainda não inicializado");
//         return await abastecimentoService.getTableCount(filters, tableFilters);
//       } catch (error) {
//         console.error("❌ Erro em getAbastecimentosTableCount:", error);
//         throw new Error("Erro ao buscar contagem de registros da tabela de abastecimentos.");
//       }
//     },

//     getAbastecimentoKpi: async (_: unknown, { filters }: { filters?: AbastecimentoFilters }) => {
//       try {
//         if (!abastecimentoService) throw new Error("AbastecimentoService ainda não inicializado");
//         return await abastecimentoService.getKpis(filters);
//       } catch (error) {
//         console.error("❌ Erro em getAbastecimentoKpi:", error);
//         throw new Error("Erro ao calcular KPIs de abastecimento.");
//       }
//     },

//     getAbastecimentoVehicleSummary: async () => {
//       try {
//         if (!abastecimentoService) throw new Error("AbastecimentoService ainda não inicializado");
//         return await abastecimentoService.getVehicleSummary();
//       } catch (error) {
//         console.error("❌ Erro em getAbastecimentoVehicleSummary:", error);
//         throw new Error("Erro ao gerar resumo de veículos.");
//       }
//     },

//     AbastecimentoFilterOptions: async (_: unknown, { filters }: { filters?: AbastecimentoOptionsFilters }) => {
//       try {
//         if (!abastecimentoService) throw new Error("AbastecimentoService ainda não inicializado");
//         return await abastecimentoService.getFilterOptions(filters);
//       } catch (error) {
//         console.error("❌ Erro em AbastecimentoFilterOptions:", error);
//         throw new Error("Erro ao buscar opções de filtro.");
//       }
//     },

//     getAbastecimentoCharts: async (_: unknown, args: { vehicleLimit?: number; filters?: AbastecimentoFilters }) => {
//       try {
//         if (!abastecimentoService) throw new Error("AbastecimentoService ainda não inicializado");
//         return await abastecimentoService.getCharts(args.vehicleLimit, args.filters);
//       } catch (error) {
//         console.error("❌ Erro em getAbastecimentoCharts:", error);
//         throw new Error("Erro ao gerar gráficos de abastecimento.");
//       }
//     },

//     getAbastecimentosColumns: async () => {
//       try {
//         if (!abastecimentoService) throw new Error("AbastecimentoService ainda não inicializado");
//         return await abastecimentoService.getColumns();
//       } catch (error) {
//         console.error("❌ Erro em getAbastecimentosColumns:", error);
//         throw new Error("Erro ao buscar colunas da tabela de abastecimentos.");
//       }
//     },
//   },
// }

// export default abastecimentoResolvers;