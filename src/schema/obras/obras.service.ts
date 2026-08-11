import { getObrasData } from '../../data/loadObras';
import { Processor } from '../../utils/processor';
import { mapObrasFiltersToApiParams } from './utils/mapToProcessed';
import {
  Obra,
  ObrasFilters,
  ObrasKpiData,
  ObrasTableFilters,
  ObraTableRow,
  PaginatedObrasResponse,
} from './utils/types';

const isBlank = (v: any) => v === null || v === undefined || v === '';

const contains = (value: any, needle?: string) => {
  if (isBlank(needle)) return true;
  if (isBlank(value)) return false;
  return String(value).toLowerCase().includes(String(needle).toLowerCase());
};

const toNumber = (v: any) => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

export class ObrasService {
  static async create(): Promise<ObrasService> {
    // A carga fica no bi-portal-data; nada é mantido em memória aqui.
    return new ObrasService();
  }

  public async getObras(filters?: ObrasFilters): Promise<Obra[]> {
    const params = mapObrasFiltersToApiParams(filters);
    return await getObrasData("all", params);
  }

  public async getObrasTableData(
    limit?: number,
    offset?: number,
    sortBy?: string,
    sortDirection?: any,
    filters?: ObrasFilters,
    tableFilters?: ObrasTableFilters
  ): Promise<PaginatedObrasResponse> {
    const params = mapObrasFiltersToApiParams(filters);
    let data: ObraTableRow[] = await getObrasData("table_data", params);

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
    const data = await getObrasData("kpi/last_update");
    return data?.last_update ?? null;
  }

  public async getKpi(filters?: ObrasFilters): Promise<ObrasKpiData> {
    const params = mapObrasFiltersToApiParams(filters);
    const data = await getObrasData("kpis/gerais", params);
    const r = data?.resultados ?? {};

    return {
      totalEmpenhado: toNumber(r.total_empenhado),
      totalLiquidado: toNumber(r.total_liquidado),
      totalPago: toNumber(r.total_pago),
      // Um processo pode ter vários empenhos, por isso a contagem é distinta.
      totalProcessos: toNumber(r.total_processos_unicos),
      totalEmpenhos: toNumber(r.total_empenhos),
    };
  }

  public async getCharts(filters?: ObrasFilters) {
    const params = mapObrasFiltersToApiParams(filters);

    const [orgao, mes, programa, credor] = await Promise.all([
      getObrasData("dashboard/empenhado_por_orgao", params),
      getObrasData("dashboard/empenhado_por_mes", params),
      getObrasData("dashboard/empenhado_por_programa", params),
      getObrasData("dashboard/empenhado_por_credor", params),
    ]);

    const serie = (payload: any) =>
      (payload?.resultados ?? []).map((item: any) => ({
        name: item.name,
        total: toNumber(item.total),
      }));

    // A série mensal chega como YYYY-MM e em ordem cronológica; aqui vira MM/YYYY.
    const EmpenhadoMes = (mes?.resultados ?? []).map((item: any) => ({
      name: Processor.formatYearMonth(item.MesReferencia) ?? item.MesReferencia,
      total: toNumber(item.total),
    }));

    return {
      EmpenhadoOrgao: serie(orgao),
      EmpenhadoMes,
      EmpenhadoPrograma: serie(programa),
      EmpenhadoCredor: serie(credor),
    };
  }

  public async getFilterOptions(filters?: ObrasFilters) {
    // A cascata (cada filtro sem se auto-restringir) é resolvida no bi-portal-data.
    const params = mapObrasFiltersToApiParams(filters);
    const data = await getObrasData("filterOptions", params);

    return {
      departmentCode: data?.secretariaOptions ?? [],
      program: data?.programaOptions ?? [],
      projectActivity: data?.atividadeOptions ?? [],
      creditor: data?.credorOptions ?? [],
      processNumber: data?.nroProcessoOptions ?? [],
    };
  }

  public async getDepartmentSummary(filters?: ObrasFilters) {
    const params = mapObrasFiltersToApiParams(filters);
    const data = await getObrasData("resumo_por_secretaria", params);

    return (data ?? []).map((item: any) => ({
      departmentCode: item.departmentCode,
      totalEmpenhado: toNumber(item.totalEmpenhado),
      totalLiquidado: toNumber(item.totalLiquidado),
      totalPago: toNumber(item.totalPago),
      empenhoCount: toNumber(item.empenhoCount),
    }));
  }
}
