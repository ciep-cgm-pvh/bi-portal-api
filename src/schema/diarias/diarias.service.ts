import { getDiariasData } from '../../data/loadDiarias';
import { unificationMap } from '../../data/orgaoDictionary';
import { Processor } from '../../utils/processor';
import { mapDiariasFiltersToApiParams, mapToProcessedAll, mapToProcessedTable} from './utils/mapToProcessed';
import { DiariaProcessed, DiariasFilters, DiariasTableFilters, PaginatedDiariasResponse } from './utils/types';

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
  ): Promise<PaginatedDiariasResponse> {
    if (filters?.departmentCode) {
      for (const [ sigla, codigos ] of unificationMap.entries()) {
        if (codigos.includes(filters.departmentCode)) {
          filters.departmentCode = sigla;
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
    let totalCount = data.length;

    let processedData = data.map((item: any) => {
      const sigla = unificationMap.get(item.departmentCode);
      return {
        ...item,
        departmentCode: sigla || item.departmentCode,
      };
    });

    if (tableFilters) {
      processedData = processedData.filter((item: any) => {
        const matchesEmployee = !tableFilters.employee || item.employee?.toLowerCase().includes(tableFilters.employee.toLowerCase());
        const matchesDepartment = !tableFilters.departmentCode || item.departmentCode.toLowerCase().includes(tableFilters.departmentCode.toLowerCase());
        const matchesGrantedAmount = !tableFilters.grantedAmount || String(item.grantedAmount)?.includes(tableFilters.grantedAmount.toLowerCase());
        const matchesGrantedDate = !tableFilters.grantedDate || item.grantedDate?.toLowerCase().includes(tableFilters.grantedDate.toLowerCase());
        const matchesProcessNumber = !tableFilters.processNumber || item.processNumber?.toLowerCase().includes(tableFilters.processNumber.toLowerCase());
        const matchesStatus = !tableFilters.status || item.status?.toString().includes(tableFilters.status[0].toLowerCase());
        return matchesEmployee && matchesDepartment && matchesGrantedAmount && matchesGrantedDate && matchesProcessNumber && matchesStatus;
      });
    }

    processedData = Processor.sortData(processedData, sortBy, sortDirection || "ascending");
    totalCount = processedData.length;

    if (typeof offset === "number" && typeof limit === "number") {
      processedData = processedData.slice(offset, offset + limit);
    }

    return {
      data: processedData,
      totalCount,
    };
  }

  public async getDiariasLastUpdate() {
    const lastUpdate = await getDiariasData("kpi/last_update")
    return lastUpdate.last_update;
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
    const data2 = await getDiariasData("dashboard/gastos_por_funcionario", params);
    const data3 = await getDiariasData("dashboard/gasto_por_mes", params);
    
    const GastoOrgaoDiaria = (
      data1.resultados.map((item: any) => {
        const sigla = unificationMap.get(item.cnoOrgao);
        return {
          name: sigla || item.cnoOrgao,
          total: Number(item.TotalGasto),
        };
      })
    );

    const GastoFuncionarioDiaria = 
      data2.resultados.map((item: any) => ({
        name: item.funcionario,
        total: item.TotalGasto,
      })
    );

    const GastoMesDiaria = Processor.groupTop9WithOthers(
      data3.resultados
        .map((item: any) => ({
          name: Processor.formatYearMonth(item.MesReferencia),
          total: item.TotalGasto,
        }))
    );


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
    const departmentCode = data.secretariaOptions
    // const departmentCode = data.secretariaOptions.map((item: any) => {
    //   const sigla = unificationMap.get(item.value);
    //   console.log(sigla, ": ", item.value)
    //   return {
    //     ...item,
    //     label: sigla || item.value,
    //   }
    // });

    return {
      employee,
      processNumber,
      status,
      departmentCode,
    };
  }
}