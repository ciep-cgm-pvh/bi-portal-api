// src/schema/diarias/diarias.resolver.ts
import { loadDiarias } from '../../data/loadDiarias';

// Supondo que você tenha uma definição de tipo para DiariaFilters em algum lugar.
// Se não, você pode usar 'any' por enquanto.
interface DiariaFilters {
  startDate?: string;
  endDate?: string;
  organ?: string[];
  situation?: string[];
}

const diariasResolvers = () => ({
  Query: {
    // Corrigido para aceitar o argumento 'filters'
    diarias: async (_: any, { filters }: { filters?: DiariaFilters }) => {
      console.log('Filtros recebidos:', filters); // Para depuração
      const data = await loadDiarias();
      // TODO: Aplicar a lógica de filtragem aqui com base nos 'filters'
      return data;
    },

    // Adicionados placeholders para os resolvers que estavam faltando
    kpis: async (_: any, { filters }: { filters?: DiariaFilters }) => {
      // TODO: Implementar a lógica para os KPIs
      console.log('Filtros para KPIs:', filters);
      return { totalGasto: "0", totalDiarias: 0 };
    },
    topOrgaos: async (_: any, { filters }: { filters?: DiariaFilters }) => {
      // TODO: Implementar a lógica para o Top Órgãos
      console.log('Filtros para Top Orgaos:', filters);
      return [];
    },
    gastoMensal: async (_: any, { filters }: { filters?: DiariaFilters }) => {
      // TODO: Implementar a lógica para o Gasto Mensal
      console.log('Filtros para Gasto Mensal:', filters);
      return [];
    },
    filterOptions: async () => {
      // TODO: Implementar a lógica para as opções de filtro
      return { organ: [], situation: [] };
    },
  },
});

export default diariasResolvers;
