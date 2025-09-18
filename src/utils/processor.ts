import { unificationMap } from '../data/orgaoDictionary';

// Processor.ts
export interface ProcessedRow {
  [ key: string ]: any;
}

export const Processor = {
  // ----------- Helpers Genéricos -----------

  normalizeField(value: any): string {
    if (value === undefined || value === null || value === '') {
      return 'N/A';
    }
    return String(value).trim().toLowerCase();
  },

  normalizeNumber(val: any): number | string {
    if (val === null || val === undefined || val === '') return 'N/A';
    const cleaned = String(val).replace(/\s+/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 'N/A' : num;
  },

  // Helper: transforma string ou array em array sempre
  toArray(v: string | string[] | undefined): string[] {
    if (!v) return [];
    return Array.isArray(v) ? v : [ v ];
  },

  // Helper: normaliza string para comparação
  normalize(s: string | undefined): string {
    return (s || '').toLowerCase().trim();
  },

  // Ordenação genérica
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

  extractYearMonth(datetime: any): string | null {
      if (!datetime && datetime !== 0) return null;
      const s = String(datetime).trim();
  
      // 1) YYYY-MM-DD ou YYYY-MM-DDTHH:MM:SS... -> pega YYYY-MM direto
      const ymdMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (ymdMatch) return `${ymdMatch[ 1 ]}-${ymdMatch[ 2 ]}`;
  
      // 2) DD/MM/YYYY ou DD/MM/YYYY HH:MM:SS -> transforma para YYYY-MM
      const dmyMatch = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
      if (dmyMatch) {
        const [ , dd, mm, yyyy ] = dmyMatch;
        return `${yyyy}-${mm}`;
      }
  
      // 3) Fallback: tenta criar Date e extrair componentes LOCAIS (para evitar shift do toISOString)
      const dateObj = new Date(s);
      if (!isNaN(dateObj.getTime())) {
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0'); // getMonth é local
        return `${yyyy}-${mm}`;
      }
  
      // Não foi possível extrair
      return null;
    },

  // ----------- Datas -----------

  // yyyy/mm/dd(T)hh:mm:ss => dd/mm/yyyy hh:mm:ss
  parseDate(dateInput?: string | null): Date | null {
    if (!dateInput) return null;

    const date = new Date(dateInput);
    if (!isNaN(date.getTime())) return date;

    const normalized = dateInput.replace(' ', 'T');
    const fallback = new Date(normalized);
    return isNaN(fallback.getTime()) ? null : fallback;
  },

  // dd/mm/yyyy => dd/mm/yyyy hh:mm:ss
  parseDateDMY(dateInput?: string | null): Date | null {
    if (!dateInput) return null;
    const parts = dateInput.split('/');
    if (parts.length !== 3) return null;

    const [ day, month, year ] = parts.map((p) => parseInt(p, 10));
    if ([ day, month, year ].some((n) => isNaN(n))) return null;

    const date = new Date(Date.UTC(year, month - 1, day));
    return isNaN(date.getTime()) ? null : date;
  },

  // yyyy/mm/dd(T)hh:mm:ss ou yyyy/mm/dd => yyyy/mm/dd
  formatDateISO(dateInput?: string | null): string | null {
    if (!dateInput) return null;
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return null;

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  },

  // yyyy/mm/dd hh:mm:ss ou yyyy/mm/dd => dd/mm/yyyy
  formatDatePTBR(dateInput?: string | null): string | null {
    if (!dateInput) return null;
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return null;

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy}`;
  },

  // ----------- Filtros -----------

  applyFilters(
    data: any[],
    filters?: any,
    tableFilters?: any
  ) {
    let filtered = [ ...data ];

    if (filters) {
      if (filters.dateRange) {
        const from = new Date(filters.dateRange.from);
        const to = new Date(filters.dateRange.to);

        if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
          filtered = filtered.filter((item) => {
            if (!item.datetime) return false;
            const dt = Processor.parseDate(item.datetime);
            if (!dt) return false;
            return dt >= from && dt <= to;
          });
        }
      }

      if (filters.department) {
        const val = filters.department.toLowerCase();
        filtered = filtered.filter((item) =>
          item.department?.toLowerCase().includes(val)
        );
      }

      if (filters.plate) {
        const val = filters.plate.toLowerCase();
        filtered = filtered.filter((item) =>
          item.plate?.toLowerCase().includes(val)
        );
      }

      if (filters.categoryOs) {
        const val = filters.categoryOs.toLowerCase();
        filtered = filtered.filter((item) =>
          item.categoryOs?.toLowerCase().includes(val)
        );
      }
    }

    if (tableFilters) {
      if (tableFilters.datetime) {
        const search = String(tableFilters.datetime).toLowerCase();
        filtered = filtered.filter((item) =>
          String(item.datetime).toLowerCase().includes(search)
        );
      }

      if (tableFilters.os !== undefined && tableFilters.os !== null && String(tableFilters.os) !== '') {
        const searchOs = String(tableFilters.os);
        filtered = filtered.filter((item) => String(item.os ?? '').includes(searchOs));
      }

      if (tableFilters.totalCost !== undefined && tableFilters.totalCost !== null && String(tableFilters.totalCost) !== '') {
        const searchCost = String(tableFilters.totalCost).replace(',', '.').trim();
        filtered = filtered.filter((item) => String(item.totalCost ?? '').includes(searchCost));
      }

      [ 'department', 'plate', 'categoryOs' ].forEach((key) => {
        const val = (tableFilters as any)[ key ];
        if (val) {
          const normalized = String(val).toLowerCase();
          filtered = filtered.filter((item) =>
            (item as any)[ key ]?.toLowerCase().includes(normalized)
          );
        }
      });
    }

    return filtered;
  },

  // ----------- Processamento Genérico -----------

  // Processa uma linha individual
  processRow(row: Record<string, string | number | null>): ProcessedRow {
    const processed: any = {};

    for (const key in row) {
      const value = row[ key ];

      if (key === 'Data' && value) {
        processed[ key ] = Processor.formatDateISO(String(value));
        continue;
      }

      if (value === null || value === undefined || value === '') {
        if (!isNaN(Number(value))) {
          processed[ key ] = null;
        } else {
          processed[ key ] = 'N/A';
        }
      } else {
        processed[ key ] = value;
      }
    }

    return processed as ProcessedRow;
  },

  processData(data: Record<string, string | number | null>[]): ProcessedRow[] {
    return data.map(this.processRow);
  },

  // ----------- Abastecimento -----------

  parseNumber(value?: string | number | null): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number' && !isNaN(value)) return value;

    const cleaned = String(value).replace(/\s+/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  },

  parseYear(value?: string | number | null): number | null {
    if (!value) return null;
    const year = Number(String(value).slice(0, 4));
    return Number.isInteger(year) ? year : null;
  },

  processAbastecimentoRow(row: Record<string, string | number>): ProcessedRow {
    const numericFields = [
      'KM',
      'KM_Anterior',
      'Qtde_Combustivel_Abastecido',
      'Valor_Abastecimento',
      'Capacidade_Tanque',
    ];

    const processed: Record<string, any> = { ...row };

    for (const field of numericFields) {
      processed[ field ] = Processor.parseNumber(row[ field ]);
    }

    processed[ 'Ano' ] = Processor.parseYear(row[ 'Ano' ]);

    const originalOrgao = String(processed[ 'Sub_Unidade' ]);
    processed[ 'OrgaoUnificado' ] =
      unificationMap.get(originalOrgao) || originalOrgao;

    processed[ 'parsedDate' ] = Processor.parseDateDMY(
      typeof row[ 'Data' ] === 'string' ? row[ 'Data' ] : undefined
    );

    return processed as ProcessedRow;
  },

  processAbastecimentoData(
    data: Record<string, string | number>[]
  ): ProcessedRow[] {
    return data.map(this.processAbastecimentoRow);
  },

  // ----------- Manutenção -----------

  processManutencaoRow(row: Record<string, string | number | null>): ProcessedRow {
    const processed: any = {};

    for (const key in row) {
      const value = row[ key ];

      if (key === 'Data' && value) {
        processed[ key ] = Processor.formatDatePTBR(String(value));
        continue;
      }

      if (value === null || value === undefined || value === '') {
        if (!isNaN(Number(value))) {
          processed[ key ] = null;
        } else {
          processed[ key ] = 'N/A';
        }
      } else {
        processed[ key ] = value;
      }
    }

    return processed as ProcessedRow;
  },

  processManutencaoData(
    data: Record<string, string | number | null>[]
  ): ProcessedRow[] {
    return data.map(this.processManutencaoRow);
  },
};
