import { ObraEmpenho } from '../../../data/loadObras';

export type Obra = ObraEmpenho;

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
  id: string;
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
