/** Registro completo de um empenho de obra, como servido pelo bi-portal-data. */
export interface Obra {
  id: number | string | null;
  empenhoNumber: string | null;
  empenhoYear: number | null;
  empenhoDate: string | null;
  empenhoType: string | null;
  departmentCode: string | null;
  budgetUnit: string | null;
  program: string | null;
  projectActivity: string | null;
  expenseElement: string | null;
  fundingSource: string | null;
  subElement: string | null;
  creditor: string | null;
  creditorCode: string | null;
  creditorDocument: string | null;
  processNumber: string | null;
  subject: string | null;
  contractNumber: string | null;
  contractYear: number | null;
  committedAmount: number;
  settledAmount: number;
  paidAmount: number;
}

export interface ObrasFilters {
  dateRange?: { from?: string; to?: string };
  departmentCode?: string;
  program?: string;
  projectActivity?: string;
  creditor?: string;
  processNumber?: string;
}

export interface ObrasTableFilters {
  empenhoNumber?: string;
  empenhoDate?: string;
  departmentCode?: string;
  program?: string;
  projectActivity?: string;
  creditor?: string;
  processNumber?: string;
  subject?: string;
  committedAmount?: string;
  settledAmount?: string;
  paidAmount?: string;
}

export interface ObraTableRow {
  id: number | string | null;
  empenhoNumber: string | null;
  empenhoDate: string | null;
  departmentCode: string | null;
  program: string | null;
  projectActivity: string | null;
  creditor: string | null;
  processNumber: string | null;
  subject: string | null;
  committedAmount: number;
  settledAmount: number;
  paidAmount: number;
}

export interface PaginatedObrasResponse {
  data: ObraTableRow[];
  totalCount: number;
}

export interface ObrasKpiData {
  totalEmpenhado: number;
  totalLiquidado: number;
  totalPago: number;
  totalProcessos: number;
  totalEmpenhos: number;
}
