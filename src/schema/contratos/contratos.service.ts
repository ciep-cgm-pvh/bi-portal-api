import { getContratosData } from '../../data/loadContratos';
import { Processor } from '../../utils/processor';
import { mapContratosFiltersToApiParams } from './utils/mapToProcessed';
import {
  Contrato,
  ContratosFilters,
  ContratosKpiData,
  ContratosTableFilters,
  ContratoTableRow,
  PaginatedContratosResponse,
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

export class ContratosService {
  static async create(): Promise<ContratosService> {
    // A carga fica no bi-portal-data; nada é mantido em memória aqui.
    return new ContratosService();
  }

  public async getContratos(filters?: ContratosFilters): Promise<Contrato[]> {
    const params = mapContratosFiltersToApiParams(filters);
    return await getContratosData("all", params);
  }

  public async getContratosTableData(
    limit?: number,
    offset?: number,
    sortBy?: string,
    sortDirection?: any,
    filters?: ContratosFilters,
    tableFilters?: ContratosTableFilters
  ): Promise<PaginatedContratosResponse> {
    const params = mapContratosFiltersToApiParams(filters);
    let data: ContratoTableRow[] = await getContratosData("table_data", params);

    if (tableFilters) {
      data = data.filter((item) =>
        (Object.keys(tableFilters) as Array<keyof ContratosTableFilters>).every((key) =>
          contains(item[key as keyof ContratoTableRow], tableFilters[key])
        )
      );
    }

    data = Processor.sortData(data, sortBy, sortDirection || 'ascending');
    const totalCount = data.length;

    // O offset é opcional: pedir só o limit deve devolver a primeira página,
    // e não a lista inteira.
    if (typeof limit === 'number') {
      const inicio = typeof offset === 'number' ? offset : 0;
      data = data.slice(inicio, inicio + limit);
    }

    return { data, totalCount };
  }

  public async getContratosLastUpdate(): Promise<string | null> {
    const data = await getContratosData("kpi/last_update");
    return data?.last_update ?? null;
  }

  public async getKpi(filters?: ContratosFilters): Promise<ContratosKpiData> {
    const params = mapContratosFiltersToApiParams(filters);
    const data = await getContratosData("kpis/gerais", params);
    const r = data?.resultados ?? {};

    return {
      totalRepasse: toNumber(r.total_repasse),
      totalContrapartida: toNumber(r.total_contrapartida),
      totalGlobal: toNumber(r.total_global),
      totalContratos: toNumber(r.total_contratos),
      // O mesmo processo pode ter mais de um registro, por isso a contagem
      // distinta fica separada do total de linhas.
      totalProcessos: toNumber(r.total_processos_unicos),
    };
  }

  public async getCharts(filters?: ContratosFilters) {
    const params = mapContratosFiltersToApiParams(filters);

    const [ano, secretaria, parlamentar, area, fonte, status] = await Promise.all([
      getContratosData("dashboard/por_ano", params),
      getContratosData("dashboard/por_secretaria", params),
      getContratosData("dashboard/por_parlamentar", params),
      getContratosData("dashboard/por_area", params),
      getContratosData("dashboard/por_fonte", params),
      getContratosData("dashboard/por_status", params),
    ]);

    const serie = (payload: any) =>
      (payload?.resultados ?? []).map((item: any) => ({
        name: item.name,
        total: toNumber(item.total),
      }));

    return {
      ValorPorAno: serie(ano),
      ValorPorSecretaria: serie(secretaria),
      ValorPorParlamentar: serie(parlamentar),
      ValorPorArea: serie(area),
      ValorPorFonte: serie(fonte),
      ContratosPorStatus: serie(status),
    };
  }

  public async getFilterOptions(filters?: ContratosFilters) {
    // A cascata (cada filtro sem se auto-restringir) é resolvida no bi-portal-data.
    const params = mapContratosFiltersToApiParams(filters);
    const data = await getContratosData("filterOptions", params);

    return {
      year: data?.anoOptions ?? [],
      processNumber: data?.processoOptions ?? [],
      resourceSource: data?.fonteOptions ?? [],
      parliamentarian: data?.parlamentarOptions ?? [],
      departmentCode: data?.secretariaOptions ?? [],
      neighborhood: data?.bairroOptions ?? [],
      area: data?.areaOptions ?? [],
      status: data?.statusOptions ?? [],
    };
  }

  public async getSecretariaSummary(filters?: ContratosFilters) {
    const params = mapContratosFiltersToApiParams(filters);
    const data = await getContratosData("resumo_por_secretaria", params);

    return (data ?? []).map((item: any) => ({
      departmentCode: item.departmentCode,
      totalRepasse: toNumber(item.totalRepasse),
      totalContrapartida: toNumber(item.totalContrapartida),
      totalGlobal: toNumber(item.totalGlobal),
      contratoCount: toNumber(item.contratoCount),
    }));
  }
}
