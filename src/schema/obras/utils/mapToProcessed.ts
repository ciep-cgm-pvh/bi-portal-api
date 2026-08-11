import { ObrasFilters } from './types';

/**
 * Traduz os filtros do painel para os parâmetros da rota de Obras
 * no bi-portal-data.
 */
export function mapObrasFiltersToApiParams(
  filters?: Partial<ObrasFilters>,
): Record<string, string> {
  const params: Record<string, string> = {};

  // Intervalo de datas incide sobre a data do empenho.
  if (filters?.dateRange?.from) params.data_inicial = filters.dateRange.from;
  if (filters?.dateRange?.to) params.data_final = filters.dateRange.to;

  const addParam = (key: string, value: any) => {
    if (value !== undefined && value !== null && value !== "") {
      params[key] = String(value);
    }
  };

  addParam("secretaria", filters?.departmentCode);
  addParam("programa", filters?.program);
  addParam("atividade", filters?.projectActivity);
  addParam("credor", filters?.creditor);
  addParam("nro_processo", filters?.processNumber);

  return params;
}
