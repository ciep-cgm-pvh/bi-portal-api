// src/utils/AbastecimentoProcessor.ts
import { unificationMap } from '../../data/orgaoDictionary';
import { Processor } from '../../utils/processor';
import { ProcessedAbastecimentoRow } from './utils/types';

const numericFields = [
  'KM',
  'KM_Anterior',
  'Qtde_Combustivel_Abastecido',
  'Valor_Abastecimento',
  'Capacidade_Tanque',
];

export const AbastecimentoProcessor = {
  // Extrai o ano de uma string ou número
  parseYear(value?: string | number | null): number | null {
    if (!value) return null;
    const year = Number(String(value).slice(0, 4));
    return Number.isInteger(year) ? year : null;
  },
  
  // Filtros
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

  processRow(row: Record<string, string | number>): ProcessedAbastecimentoRow {
    const processed: Record<string, any> = { ...row };

    for (const field of numericFields) {
      processed[ field ] = Processor.normalizeNumber(row[ field ]);
    }

    processed[ 'Ano' ] = AbastecimentoProcessor.parseYear(row[ 'Ano' ]);

    const originalOrgao = String(processed[ 'Sub_Unidade' ]);
    processed[ 'OrgaoUnificado' ] = unificationMap.get(originalOrgao) || originalOrgao;


    processed[ 'parsedDate' ] = Processor.parseDateDMY(
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
