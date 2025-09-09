// src/utils/AbastecimentoProcessor.ts
import { unificationMap } from '../../data/orgaoDictionary';
import { ProcessedAbastecimentoRow } from './utils/types';

const numericFields = [
  'KM',
  'KM_Anterior',
  'Qtde_Combustivel_Abastecido',
  'Valor_Abastecimento',
  'Capacidade_Tanque',
];

export const AbastecimentoProcessor = {
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

  // Recebe uma data no formato dd/mm/yyyy e retorna um objeto Date
  parseDate(dateInput?: string | null): Date | null {
    if (!dateInput) return null;
    const parts = dateInput.split('/');
    if (parts.length !== 3) return null;

    const [ day, month, year ] = parts.map((p) => parseInt(p, 10));
    if ([ day, month, year ].some((n) => isNaN(n))) return null;

    const date = new Date(Date.UTC(year, month - 1, day));
    return isNaN(date.getTime()) ? null : date;
  },

  // Converte valores numéricos, tratando vírgulas e espaços
  parseNumber(value?: string | number | null): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number' && !isNaN(value)) return value;

    const cleaned = String(value).replace(/\s+/g, '').replace(',', '.');
    const num = parseFloat(cleaned);

    return isNaN(num) ? 0 : num;
  },

  // Extrai o ano de uma string ou número
  parseYear(value?: string | number | null): number | null {
    if (!value) return null;
    const year = Number(String(value).slice(0, 4));
    return Number.isInteger(year) ? year : null;
  },
  // Helper: transforma string ou array em array sempre
  toArray(v: string | string[] | undefined): string[] {
    if (!v) return [];
    return Array.isArray(v) ? v : [ v ];
  },

  // Helper: normaliza string para comparação
  normalize(s: string | undefined) { 
    return (s || '').toLowerCase().trim(); 
  },

  // Processa uma linha individual
  processRow(row: Record<string, string | number>): ProcessedAbastecimentoRow {
    const processed: Record<string, any> = { ...row };

    for (const field of numericFields) {
      processed[ field ] = AbastecimentoProcessor.parseNumber(row[ field ]);
    }

    processed[ 'Ano' ] = AbastecimentoProcessor.parseYear(row[ 'Ano' ]);

    const originalOrgao = String(processed[ 'Sub_Unidade' ]);
    processed[ 'OrgaoUnificado' ] = unificationMap.get(originalOrgao) || originalOrgao;


    processed[ 'parsedDate' ] = AbastecimentoProcessor.parseDate(
      typeof row[ 'Data' ] === 'string' ? row[ 'Data' ] : undefined
    );

    return processed;
  },

  // Processa os dados de abastecimento
  processAbastecimentoData(
    data: Record<string, string | number>[]
  ): ProcessedAbastecimentoRow[] {
    return data.map(this.processRow);
  },
};
