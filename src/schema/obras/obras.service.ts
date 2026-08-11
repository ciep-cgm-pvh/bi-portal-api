import { getObrasLastUpdate, loadObras, ObraEmpenho } from '../../data/loadObras';
import { Processor } from '../../utils/processor';
import {
  Obra,
  ObrasFilters,
  ObrasKpiData,
  ObrasTableFilters,
  ObraTableRow,
  PaginatedObrasResponse,
} from './utils/types';

/** Campos de ObrasFilters que casam por igualdade exata com um campo do registro. */
const EXACT_MATCH_FIELDS: Array<keyof ObrasFilters & keyof ObraEmpenho> = [
  'departmentCode',
  'program',
  'projectActivity',
  'creditor',
  'processNumber',
];

const isBlank = (v: any) => v === null || v === undefined || v === '';

const contains = (value: any, needle?: string) => {
  if (isBlank(needle)) return true;
  if (isBlank(value)) return false;
  return String(value).toLowerCase().includes(String(needle).toLowerCase());
};

/** Agrupa por uma chave e soma um campo numérico, ordenando do maior para o menor. */
function groupSum(
  rows: ObraEmpenho[],
  keyField: keyof ObraEmpenho,
  valueField: keyof ObraEmpenho
): { name: string; total: number }[] {
  const totals = new Map<string, number>();

  for (const row of rows) {
    const key = (row[keyField] as string) ?? 'N/A';
    totals.set(key, (totals.get(key) ?? 0) + Number(row[valueField] ?? 0));
  }

  return [...totals.entries()]
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
}

export class ObrasService {
  private rawData: ObraEmpenho[];

  constructor(rawData: ObraEmpenho[]) {
    this.rawData = rawData;
  }

  static async create(): Promise<ObrasService> {
    return new ObrasService(loadObras());
  }

  /**
   * Aplica os filtros gerais do dashboard.
   * `skipField` permite ignorar um filtro específico — usado na cascata de
   * opções, para que cada filtro liste opções sem se auto-restringir.
   */
  private applyFilters(filters?: ObrasFilters, skipField?: keyof ObrasFilters): ObraEmpenho[] {
    if (!filters) return this.rawData;

    const from = filters.dateRange?.from ? String(filters.dateRange.from).slice(0, 10) : null;
    const to = filters.dateRange?.to ? String(filters.dateRange.to).slice(0, 10) : null;

    return this.rawData.filter((row) => {
      if (skipField !== 'dateRange') {
        if (from && (!row.empenhoDate || row.empenhoDate < from)) return false;
        if (to && (!row.empenhoDate || row.empenhoDate > to)) return false;
      }

      for (const field of EXACT_MATCH_FIELDS) {
        if (field === skipField) continue;
        const wanted = filters[field];
        if (isBlank(wanted)) continue;
        if (row[field] !== wanted) return false;
      }

      return true;
    });
  }

  private toTableRow(row: ObraEmpenho): ObraTableRow {
    return {
      id: row.id,
      empenhoNumber: row.empenhoNumber,
      empenhoDate: row.empenhoDate,
      departmentCode: row.departmentCode,
      program: row.program,
      projectActivity: row.projectActivity,
      creditor: row.creditor,
      processNumber: row.processNumber,
      subject: row.subject,
      committedAmount: row.committedAmount,
      settledAmount: row.settledAmount,
      paidAmount: row.paidAmount,
    };
  }

  public async getObras(filters?: ObrasFilters): Promise<Obra[]> {
    return this.applyFilters(filters);
  }

  public async getObrasTableData(
    limit?: number,
    offset?: number,
    sortBy?: string,
    sortDirection?: any,
    filters?: ObrasFilters,
    tableFilters?: ObrasTableFilters
  ): Promise<PaginatedObrasResponse> {
    let data = this.applyFilters(filters).map((row) => this.toTableRow(row));

    if (tableFilters) {
      data = data.filter((item) =>
        (Object.keys(tableFilters) as Array<keyof ObrasTableFilters>).every((key) =>
          contains(item[key as keyof ObraTableRow], tableFilters[key])
        )
      );
    }

    data = Processor.sortData(data, sortBy, sortDirection || 'ascending');
    const totalCount = data.length;

    if (typeof offset === 'number' && typeof limit === 'number') {
      data = data.slice(offset, offset + limit);
    }

    return { data, totalCount };
  }

  public async getObrasLastUpdate(): Promise<string | null> {
    return getObrasLastUpdate();
  }

  public async getKpi(filters?: ObrasFilters): Promise<ObrasKpiData> {
    const data = this.applyFilters(filters);

    const totalEmpenhado = data.reduce((acc, row) => acc + row.committedAmount, 0);
    const totalLiquidado = data.reduce((acc, row) => acc + row.settledAmount, 0);
    const totalPago = data.reduce((acc, row) => acc + row.paidAmount, 0);

    // Um processo pode ter vários empenhos, por isso a contagem é distinta.
    const totalProcessos = new Set(
      data.map((row) => row.processNumber).filter((p): p is string => Boolean(p))
    ).size;

    return {
      totalEmpenhado,
      totalLiquidado,
      totalPago,
      totalProcessos,
      totalEmpenhos: data.length,
    };
  }

  public async getCharts(filters?: ObrasFilters) {
    const data = this.applyFilters(filters);

    const EmpenhadoOrgao = groupSum(data, 'departmentCode', 'committedAmount');
    const EmpenhadoPrograma = groupSum(data, 'program', 'committedAmount');
    const EmpenhadoCredor = groupSum(data, 'creditor', 'committedAmount');

    // Série mensal em ordem cronológica, formatada como MM/YYYY.
    const monthTotals = new Map<string, number>();
    for (const row of data) {
      if (!row.empenhoDate) continue;
      const yearMonth = row.empenhoDate.slice(0, 7);
      monthTotals.set(yearMonth, (monthTotals.get(yearMonth) ?? 0) + row.committedAmount);
    }

    const EmpenhadoMes = [...monthTotals.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([yearMonth, total]) => ({
        name: Processor.formatYearMonth(yearMonth) ?? yearMonth,
        total,
      }));

    return {
      EmpenhadoOrgao,
      EmpenhadoMes,
      EmpenhadoPrograma,
      EmpenhadoCredor,
    };
  }

  public async getFilterOptions(filters?: ObrasFilters) {
    const buildOptions = (field: keyof ObrasFilters & keyof ObraEmpenho) => {
      // Cascata: cada filtro enxerga as opções sem se auto-restringir.
      const scoped = this.applyFilters(filters, field);
      const values = new Set(
        scoped.map((row) => row[field] as string).filter((v): v is string => Boolean(v))
      );

      return [...values]
        .sort((a, b) => a.localeCompare(b, 'pt-BR'))
        .map((value) => ({ value, label: value }));
    };

    return {
      departmentCode: buildOptions('departmentCode'),
      program: buildOptions('program'),
      projectActivity: buildOptions('projectActivity'),
      creditor: buildOptions('creditor'),
      processNumber: buildOptions('processNumber'),
    };
  }

  public async getDepartmentSummary(filters?: ObrasFilters) {
    const data = this.applyFilters(filters);
    const summary = new Map<
      string,
      { totalEmpenhado: number; totalLiquidado: number; totalPago: number; empenhoCount: number }
    >();

    for (const row of data) {
      const key = row.departmentCode ?? 'N/A';
      const current =
        summary.get(key) ??
        { totalEmpenhado: 0, totalLiquidado: 0, totalPago: 0, empenhoCount: 0 };

      current.totalEmpenhado += row.committedAmount;
      current.totalLiquidado += row.settledAmount;
      current.totalPago += row.paidAmount;
      current.empenhoCount += 1;

      summary.set(key, current);
    }

    return [...summary.entries()]
      .map(([departmentCode, values]) => ({ departmentCode, ...values }))
      .sort((a, b) => b.totalEmpenhado - a.totalEmpenhado);
  }
}
