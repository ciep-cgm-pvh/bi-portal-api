import { getDiariasData } from '../../data/loadDiarias';
import { Processor } from '../../utils/processor';
import { mapFiltersToApiParams } from '../abastecimento/utils/mapToProcessed';
import { DiariasProcessor } from './diariasProcessor';
import { mapToProcessedAll, mapToProcessedTable} from './utils/mapToProcessed';
import { DiariaProcessed, DiariasFilters, DiariasTableFilters } from './utils/types';

export class DiariasService {
  private rawData: any[];

  constructor(rawData: any []) {
    this.rawData = rawData;
  }

  static async create(): Promise<DiariasService> {
    const rawData = await getDiariasData("all");
    return new DiariasService(rawData);
  }

  public async getDiarias(filters?: DiariasFilters): Promise<DiariaProcessed[]> {
    const params = mapFiltersToApiParams(filters);
    const data = await getDiariasData("all", params);
    // console.log("diarias: ", data[1])
    return mapToProcessedAll(data);
  }

  public async getDiariasTableData(
      limit?: number,
      offset?: number,
      sortBy?: string,
      sortDirection?: any,
      filters?: DiariasFilters,
    tableFilters?: DiariasTableFilters): Promise<Partial<DiariaProcessed>[]>  {
    const params = mapFiltersToApiParams(filters);
    let data = await getDiariasData("table_data", params);
    
    data = DiariasProcessor.applyTableFilters(data, tableFilters)
    
    data = Processor.sortData(data, sortBy, (sortDirection || "ascending"))
    if (typeof offset === 'number' && typeof limit === 'number') {
      data = data.slice(offset, offset + limit);
    }
    data = mapToProcessedTable(data)
    // console.log("diariasTable: ", mapToProcessedTable(data)[1])
    return data;
  }

  public async getDiariasTableCount(filters?: DiariasFilters, tableFilters?: DiariasTableFilters) {
    // ajustar no bi-portal-data, pois só esta mandando os 1000 primeiros dados
    const params = mapFiltersToApiParams(filters);
    let data = await getDiariasData("table_data", params);
    data = DiariasProcessor.applyTableFilters(data, tableFilters)
    return data.length;
  }

  public async getDiariasLastUpdate() {
    const lastUpdate = await getDiariasData("kpi/last_update")
    return lastUpdate
  }

  public async getKpi(filters?: DiariasFilters) {
    const params = mapFiltersToApiParams(filters);
    const data = await getDiariasData("kpis/gerais", params);

    const totalConcedido = data.resultados.total_concedido
    const totalAprovado = data.resultados.total_aprovado
    const totalDiarias = data.resultados.total_processos_unicos
    return {
      totalConcedido,
      totalAprovado,
      totalDiarias
    };
  }

  public async getCharts(filters?: DiariasFilters) {
    const params = mapFiltersToApiParams(filters);
    const data1 = await getDiariasData("dashboard/gastos_por_entidade", params);
    const data2 = await getDiariasData("dashboard/gastos_por_plano_despesa", params);
    const data3 = await getDiariasData("dashboard/gastos_por_funcionario", params);

    const GastoOrgaoDiaria = data1.resultados.map((item: any) => ({
      name: item.nomEntidade,
      total: item.TotalGasto,
    }));
    const GastoPlanoDespesaDiaria = data2.resultados.map((item: any) => ({
      name: item.nomEntidade,
      total: item.TotalGasto,
    }));
    const GastoFuncionarioDiaria = data3.resultados.map((item: any) => ({
      name: item.funcionario,
      total: item.TotalGasto,
    }));
    console.log(data3)

    return {
      GastoPlanoDespesaDiaria,
      GastoFuncionarioDiaria,
      GastoOrgaoDiaria
    }
  }

  // public getFilterOptions(filters?: DiariasFilters) {
  //   const allData = this.getDiariasData();

  //   const mapToFilterType = (arr: (string | undefined | null)[]) =>
  //     Array.from(new Set(arr.filter(Boolean))).sort()
  //       .map(value => ({ value: value!, label: value! }));

  //   // 1. Filtra dados com base em TODOS os filtros ativos
  //   let filtered = allData;

  //   if (filters?.dateRange?.from) {
  //     const fromDate = new Date(filters.dateRange.from);
  //     filtered = filtered.filter(item => {
  //       const itemDate = new Date(item.paymentDate);
  //       return itemDate !== null && itemDate >= fromDate;
  //     });
  //   }
  //   if (filters?.dateRange?.to) {
  //     const toDate = new Date(filters.dateRange.to);
  //     filtered = filtered.filter(item => {
  //       const itemDate = new Date(item.paymentDate);
  //       return itemDate !== null && itemDate <= toDate;
  //     });
  //   }

  //   if (filters?.department) {
  //     const departments = Array.isArray(filters.department)
  //       ? filters.department.map(d => String(d).toLowerCase())
  //       : [ String(filters.department).toLowerCase() ];

  //     filtered = filtered.filter(item =>
  //       departments.includes(String(item.department ?? '').toLowerCase())
  //     );
  //   }

  //   if (filters?.status) {
  //     filtered = filtered.filter(item => item.processNumber.toLowerCase() === filters.status.toLowerCase());
  //   }

  //   // 2. Gera as opções dinamicamente a partir do dataset já filtrado
  //   const departmentOptions = mapToFilterType(filtered.map(item => item.department));
  //   const processNumberOptions = mapToFilterType(filtered.map(item => item.processNumber));
  //   const statusOptions = mapToFilterType(filtered.map(item => item.status));

  //   return {
  //     department: departmentOptions,
  //     processNumber: processNumberOptions,
  //     status: statusOptions,
  //   };
  // }
}