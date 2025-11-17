import { getDiariasData } from '../../data/loadDiarias';
import { unificationMap } from '../../data/orgaoDictionary';
import { Processor } from '../../utils/processor';
import { DiariasProcessor } from './diariasProcessor';
import { mapDiariasFiltersToApiParams, mapToProcessedAll, mapToProcessedTable} from './utils/mapToProcessed';
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
    const params = mapDiariasFiltersToApiParams(filters);
    const data = await getDiariasData("all", params);
    return mapToProcessedAll(data);
  }

  public async getDiariasTableData(
    limit?: number,
    offset?: number,
    sortBy?: string,
    sortDirection?: any,
    filters?: DiariasFilters,
    tableFilters?: DiariasTableFilters
  ): Promise<DiariaProcessed[]> {
    if (filters?.departmentCode) {
      for (const [ fullName, sigla ] of unificationMap.entries()) {
        if (sigla === filters.departmentCode) {
          filters.departmentCode = fullName;
          break;
        }
      }
    }

    const params = mapDiariasFiltersToApiParams(filters);
    let data = await getDiariasData("table_data", params);

    if (!Array.isArray(data)) {
      console.error("getDiariasData returned non-array:", data);
      data = [];
    }

    data = mapToProcessedTable(data);
    data = Processor.sortData(data, sortBy, sortDirection || "ascending");

    if (typeof offset === "number" && typeof limit === "number") {
      data = data.slice(offset, offset + limit);
    }

    const unifiedData = data.map((item: any) => {
      const sigla = unificationMap.get(item.departmentCode);
      return {
        ...item,
        departmentCode: sigla || item.departmentCode,
      };
    });

    const processedData = DiariasProcessor.applyTableFilters(unifiedData, tableFilters);

    return processedData;
  }

  public async getDiariasTableCount(filters?: DiariasFilters, tableFilters?: DiariasTableFilters) {
    const params = mapDiariasFiltersToApiParams(filters);
    let data = await getDiariasData("table_data", params);
    data = DiariasProcessor.applyTableFilters(data, tableFilters)
    return data.length;
  }

  public async getDiariasLastUpdate() {
    const lastUpdate = await getDiariasData("kpi/last_update")
    return lastUpdate
  }

  public async getKpi(filters?: DiariasFilters) {
    const params = mapDiariasFiltersToApiParams(filters);
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
    const params = mapDiariasFiltersToApiParams(filters);
    const data1 = await getDiariasData("dashboard/gastos_por_entidade", params);
    const data2 = await getDiariasData("dashboard/gasto_por_mes", params);
    const data3 = await getDiariasData("dashboard/gastos_por_funcionario", params);
    
    const GastoOrgaoDiaria = data1.resultados.map((item: any) => {
      const sigla = unificationMap.get(item.cnoOrgao);
      return {
        name: sigla || item.cnoOrgao, 
        total: item.TotalGasto,
      };
    });
    const GastoMesDiaria = data2.resultados.map((item: any) => ({
      name: item.MesReferencia,
      total: item.TotalGasto,
    }));
    const GastoFuncionarioDiaria = data3.resultados.map((item: any) => ({
      name: item.funcionario,
      total: item.TotalGasto,
    }));

    return {
      GastoOrgaoDiaria,
      GastoMesDiaria,
      GastoFuncionarioDiaria,
    }
  }

  public async getFilterOptions(filters?: DiariasFilters) {
    const params = mapDiariasFiltersToApiParams(filters);
    let data = await getDiariasData("filterOptions", params);

    const employee = data.funcionarioOptions
    const processNumber = data.nroProcessoOptions
    const status = data.statusOptions
    const departmentCode = data.secretariaOptions.map((item: any) => {
      const sigla = unificationMap.get(item.value);
      return {
        ...item,
        value: sigla || item.value,
      }
    });

    return {
      employee,
      processNumber,
      status,
      departmentCode,
    };
  }
}