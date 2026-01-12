import { getDiariasData } from '../../data/loadDiarias';
import { Processor } from '../../utils/processor';
import { mapDiariasFiltersToApiParams, mapToProcessedTable} from './utils/mapToProcessed';
import { Diarias, DiariasFilters, DiariasTableFilters, PaginatedDiariasResponse } from './utils/types';

export class DiariasService {
  private rawData: any[];

  constructor(rawData: any []) {
    this.rawData = rawData;
  }

  static async create(): Promise<DiariasService> {
    const rawData = await getDiariasData("all");
    return new DiariasService(rawData);
  }

  public async getDiarias(filters?: DiariasFilters): Promise<Diarias[]> {
    const params = mapDiariasFiltersToApiParams(filters);
    const data = await getDiariasData("all", params);
    return data;
  }

  public async getDiariasTableData(
    limit?: number,
    offset?: number,
    sortBy?: string,
    sortDirection?: any,
    filters?: DiariasFilters,
    tableFilters?: DiariasTableFilters
  ): Promise<PaginatedDiariasResponse> {
    const params = mapDiariasFiltersToApiParams(filters);
    let data = await getDiariasData("table_data", params);
    
    data = mapToProcessedTable(data);
    let totalCount = data.length;

    if (tableFilters) {
      data = data.filter((item: any) => {
        const matchesEmployee = !tableFilters.employee || item.employee?.toLowerCase().includes(tableFilters.employee.toLowerCase());
        const matchesDepartment = !tableFilters.departmentCode || item.departmentCode.toLowerCase().includes(tableFilters.departmentCode.toLowerCase());
        const matchesGrantedAmount = !tableFilters.grantedAmount || String(item.grantedAmount)?.includes(tableFilters.grantedAmount.toLowerCase());
        const matchesApprovalDate = !tableFilters.approvalDate || item.approvalDate?.toString().toLowerCase().includes(tableFilters.approvalDate.toLowerCase());
        const matchesProcessNumber = !tableFilters.processNumber || item.processNumber?.toLowerCase().includes(tableFilters.processNumber.toLowerCase());
        const matchesStatus = !tableFilters.status || item.status?.toString().toLowerCase().includes(tableFilters.status.toLowerCase());
        return matchesEmployee && matchesDepartment && matchesGrantedAmount && matchesApprovalDate && matchesProcessNumber && matchesStatus;
      });
    }

    data = Processor.sortData(data, sortBy, sortDirection || "ascending");
    totalCount = data.length;

    if (typeof offset === "number" && typeof limit === "number") {
      data = data.slice(offset, offset + limit);
    }

    return {
      data,
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
        return {
          name: item.cnoOrgao,
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

  // public async getFilterOptions(filters?: DiariasFilters) {
  //   const params = mapDiariasFiltersToApiParams(filters);
  //   let data = await getDiariasData("filterOptions", params);
  //   const employee = data.funcionarioOptions
  //   const processNumber = data.nroProcessoOptions
  //   const status = data.statusOptions
  //   const departmentCode = data.secretariaOptions

  //   return {
  //     employee,
  //     processNumber,
  //     status,
  //     departmentCode,
  //   };
  // }
  public async getFilterOptions(filters?: DiariasFilters) {
    // Garante que allParams seja um objeto, mesmo que mapDiariasFiltersToApiParams retorne undefined
    const allParams = mapDiariasFiltersToApiParams(filters) || {};
    
    // Define os filtros que queremos popular e suas chaves de parâmetro
    const filterMap = {
      secretaria: "departmentCode",
      nroProcesso: "processNumber",
      funcionario: "employee",
      status: "status",
    };
    
    const results: any = {};
    
    // Itera sobre cada filtro para buscar suas opções (LÓGICA DE CASCATA)
    for (const [ paramKey, filterKey ] of Object.entries(filterMap)) {
      
      const paramsForCurrentFilter = { ...allParams };
      delete paramsForCurrentFilter[ paramKey ]; // <--- EXCLUSÃO DO FILTRO ATUAL
      
      const data = await getDiariasData("filterOptions", paramsForCurrentFilter);

      const responseKey = `${paramKey}Options`;
      results[ responseKey ] = data[ responseKey ];
    }

    // Mapeia as chaves de resposta para o formato GraphQL
    return {
      employee: results[ "funcionarioOptions" ],
      processNumber: results[ "nroProcessoOptions" ],
      status: results[ "statusOptions" ],
      departmentCode: results[ "secretariaOptions" ],
    };
  }
}