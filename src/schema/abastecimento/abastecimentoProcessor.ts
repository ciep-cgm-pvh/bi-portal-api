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
