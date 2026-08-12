/** Contrato de repasse ou convênio, como servido pelo bi-portal-data. */
export interface Contrato {
  id: number | string | null;
  processNumber: string | null;
  year: number | null;
  resourceSource: string | null;
  parliamentarian: string | null;
  departmentCode: string | null;
  description: string | null;
  neighborhood: string | null;
  area: string | null;
  transferAmount: number;
  counterpartAmount: number;
  globalAmount: number;
  status: string | null;
  statusRaw: string | null;
}

/**
 * A origem não tem coluna de data, só o ano do contrato — por isso o
 * período é filtrado por ano, e não por intervalo de datas.
 */
export interface ContratosFilters {
  yearRange?: { from?: number; to?: number };
  processNumber?: string;
  resourceSource?: string;
  parliamentarian?: string;
  departmentCode?: string;
  neighborhood?: string;
  area?: string;
  status?: string;
  description?: string;
}

export interface ContratosTableFilters {
  processNumber?: string;
  year?: string;
  departmentCode?: string;
  parliamentarian?: string;
  resourceSource?: string;
  area?: string;
  neighborhood?: string;
  description?: string;
  status?: string;
}

export interface ContratoTableRow {
  id: number | string | null;
  processNumber: string | null;
  year: number | null;
  departmentCode: string | null;
  parliamentarian: string | null;
  resourceSource: string | null;
  area: string | null;
  neighborhood: string | null;
  description: string | null;
  transferAmount: number;
  counterpartAmount: number;
  globalAmount: number;
  status: string | null;
}

export interface PaginatedContratosResponse {
  data: ContratoTableRow[];
  totalCount: number;
}

export interface ContratosKpiData {
  totalRepasse: number;
  totalContrapartida: number;
  totalGlobal: number;
  totalContratos: number;
  totalProcessos: number;
}
