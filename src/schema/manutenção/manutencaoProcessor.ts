// manutencaoProcessor.ts
import { ManutencaoFilters, ManutencaoProcessed, ManutencaoTableFilters, ProcessedManutencaoRow } from './utils/types';

export const ManutencaoProcessor = {
  // Função utilitária para normalizar valores vazios
  normalizeField(value: any): string {
    if (value === undefined || value === null || value === "") {
      return "N/A";
    }
    return String(value).trim().toLowerCase();
  },

  parseDate(dateInput?: string | null): Date | null {
    if (!dateInput) return null;

    // tenta criar um Date direto
    const date = new Date(dateInput);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // caso venha no formato "YYYY-MM-DD HH:mm:ss.SSS"
    const normalized = dateInput.replace(" ", "T"); // vira "YYYY-MM-DDTHH:mm:ss.SSS"
    const fallback = new Date(normalized);
    if (!isNaN(fallback.getTime())) {
      return fallback;
    }

    return null;
  },

  //Recebe uma data com milissegundos e retorna no formato yyyy-mm-dd hh:mm:ss
  formatDateISO(dateInput?: string | null): string | null {
    if (!dateInput) return null;
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return null;

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
  },

  formatDatePTBR(dateInput?: string | null): string | null {
    if (!dateInput) return null;
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return null;

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    return `${dd}/${mm}/${yyyy}`;
  },

  // Converte uma string ou array de strings em array de strings
  toArray(v: string | string[] | undefined): string[] {
    if (!v) return [];
    return Array.isArray(v) ? v : [ v ];
  },

  // Função de ordenação genérica
  sortData<T extends Record<string, any>>(
    data: T[],
    sortBy?: string,
    sortDirection: 'ascending' | 'descending' = 'ascending'
  ): T[] {
    if (!sortBy) return data;

    const direction = sortDirection.toLowerCase() === 'descending' ? -1 : 1;

    return [ ...data ].sort((a, b) => {
      let av: any = a[ sortBy ];
      let bv: any = b[ sortBy ];

      // converte strings numéricas em números para ordenação correta
      const aNum = av != null && !isNaN(Number(av)) ? Number(av) : av;
      const bNum = bv != null && !isNaN(Number(bv)) ? Number(bv) : bv;

      av = aNum;
      bv = bNum;

      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;

      if (av < bv) return -1 * direction;
      if (av > bv) return 1 * direction;
      return 0;
    });
  },

  applyFilters(
    data: ManutencaoProcessed[],
    filters?: ManutencaoFilters,
    tableFilters?: ManutencaoTableFilters
  ) {
    let filtered = [ ...data ];

    // filtros gerais
    if (filters) {
      if (filters.dateRange) {
        const from = new Date(filters.dateRange.from);
        const to = new Date(filters.dateRange.to);

        if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
          filtered = filtered.filter(item => {
            if (!item.datetime) return false;
            const dt = ManutencaoProcessor.parseDate(item.datetime);
            if (!dt) return false;
            return dt >= from && dt <= to;
          });
        }
      }

      if (filters.department) {
        const val = filters.department.toLowerCase();
        filtered = filtered.filter(item => item.department?.toLowerCase().includes(val));
      }

      if (filters.plate) {
        const val = filters.plate.toLowerCase();
        filtered = filtered.filter(item => item.plate?.toLowerCase().includes(val));
      }

      if (filters.categoryOs) {
        const val = filters.categoryOs.toLowerCase();
        filtered = filtered.filter(item => item.categoryOs?.toLowerCase().includes(val));
      }
    }

    // filtros da tabela (busca parcial)
    if (tableFilters) {
      if (tableFilters.datetime) {
        const search = String(tableFilters.datetime.toLowerCase());
        filtered = filtered.filter(item => String(item.datetime).toLowerCase().includes(search));
      }

      if (tableFilters.os !== undefined && tableFilters.os !== null && String(tableFilters.os) !== '') {
        const searchOs = String(tableFilters.os);
        filtered = filtered.filter(item => String(item.os ?? '').includes(searchOs));
      }

      if (tableFilters.totalCost !== undefined && tableFilters.totalCost !== null && String(tableFilters.totalCost) !== '') {
        const searchCost = String(tableFilters.totalCost).replace(',', '.').trim();
        filtered = filtered.filter(item => String(item.totalCost ?? '').includes(searchCost));
      }

      [ 'department', 'plate', 'categoryOs' ].forEach(key => {
        const val = (tableFilters as any)[ key ];
        if (val) {
          const normalized = String(val).toLowerCase();
          filtered = filtered.filter(item => (item as any)[ key ]?.toLowerCase().includes(normalized));
        }
      });
    }

    return filtered;
  },

  // Processa uma linha individual
  processRow(row: Record<string, string | number | null>): ProcessedManutencaoRow {
    const processed: any = {};
    
    for (const key in row) {
      const value = row[ key ];

      if (key === 'Data' && value) {
        processed[ key ] = ManutencaoProcessor.formatDatePTBR(String(value));
        continue;
      }

      if (value === null || value === undefined || value === '') {
        // se for número → devolve null
        if (!isNaN(Number(value))) {
          processed[ key ] = null;
        } else {
          // se for texto → devolve "N/A"
          processed[ key ] = "N/A";
        }
      } else {
        processed[ key ] = value;
      }
    }

    return processed as ProcessedManutencaoRow;
  },

  // Processa os dados de manutenção
  processManutencaoData(
    data: Record<string, string | number | null>[]
  ): ProcessedManutencaoRow[] {
    return data.map(this.processRow);
  },
};
