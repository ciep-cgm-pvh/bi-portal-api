import { ContratosFilters } from './types';

/**
 * Traduz os filtros do painel para os parâmetros da rota de Contratos
 * no bi-portal-data.
 */
export function mapContratosFiltersToApiParams(
  filters?: Partial<ContratosFilters>,
): Record<string, string> {
  const params: Record<string, string> = {};

  // O período é por ano: a origem não tem data.
  if (filters?.yearRange?.from) params.ano_inicial = String(filters.yearRange.from);
  if (filters?.yearRange?.to) params.ano_final = String(filters.yearRange.to);

  const addParam = (key: string, value: any) => {
    if (value !== undefined && value !== null && value !== "") {
      params[key] = String(value);
    }
  };

  addParam("processo", filters?.processNumber);
  addParam("fonte", filters?.resourceSource);
  addParam("parlamentar", filters?.parliamentarian);
  addParam("secretaria", filters?.departmentCode);
  addParam("bairro", filters?.neighborhood);
  addParam("area", filters?.area);
  addParam("status", filters?.status);
  addParam("descricao", filters?.description);

  return params;
}
