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
  parseDate(dateInput?: string): Date | string {
    if (!dateInput) return "N/A";

    const date = new Date(dateInput);
    if (!isNaN(date.getTime())) return date;

    const normalized = dateInput.replace(' ', 'T');
    const fallback = new Date(normalized);
    return isNaN(fallback.getTime()) ? "N/A" : fallback;
  },

  // dd/mm/yyyy => dd/mm/yyyy hh:mm:ss
  parseDateDMY(dateInput?: string): Date | string {
    if (!dateInput) return "N/A";
    const parts = dateInput.split('/');
    if (parts.length !== 3) return "N/A";

    const [ day, month, year ] = parts.map((p) => parseInt(p, 10));
    if ([ day, month, year ].some((n) => isNaN(n))) return "N/A";

    const date = new Date(Date.UTC(year, month - 1, day));
    return isNaN(date.getTime()) ? "N/A" : date;
  },

  // yyyy/mm/dd(T)hh:mm:ss ou yyyy/mm/dd => yyyy-mm-dd
  formatDateISO(dateInput?: string): string {
    if (!dateInput) return "N/A";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "N/A";

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  },

  // yyyy/mm/dd hh:mm:ss ou yyyy/mm/dd => dd/mm/yyyy
  formatDatePTBR(dateInput?: string): string {
    if (!dateInput) return "N/A";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "N/A";

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy}`;
  },

  safeFormatDate(input ?: any) {
    if (!input) return "N/A";

    // Extrai apenas a primeira data válida (yyyy-mm-dd ou yyyy/mm/dd) e o primeiro horário, se existir
    const match = input.match(/\d{4}[-/]\d{2}[-/]\d{2}/);
    if (!match) return "N/A";

    const datePart = match[ 0 ];
    const date = new Date(datePart);
    if (isNaN(date.getTime())) return "N/A";

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate() + 1).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
  },

  formatYearMonth(value?: string): string | undefined  {
    if (!value) return undefined;
    const [ year, month ] = value.split("-");
    if (!year || !month) return undefined;
    return `${month}/${year}`;
  },

  // ----------- Processamento Genérico -----------

  groupTop9WithOthers(arr: { name: string; total: number }[]) {
    if (!Array.isArray(arr) || arr.length === 0) return [];
    if (arr.length <= 10) return arr;

    const cutoff = arr.length - 9; 
    const rest = arr.slice(0, cutoff);
    const top9 = arr.slice(cutoff);

    return [
      {
        name: "Outros",
        total: rest.reduce((acc, item) => acc + item.total, 0),
      },
      ...top9,
    ];
  },

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
};
