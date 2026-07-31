// src/schema/suprimentos/suprimento.service.ts
import { getSuprimentoData } from '../../data/loadSuprimento';
import { Processor } from '../../utils/processor';
import { mapSuprimentoFiltersToApiParams, mapToProcessedAll, mapToProcessedTable } from './utils/mapToProcessed';
import { PaginatedSuprimentoResponse, Suprimento, SuprimentoFilters, SuprimentoTableFilters } from './utils/types';

export class SuprimentoService {
  static async create(): Promise<SuprimentoService> {
    return new SuprimentoService();
  }

  public async getSuprimentos(filters?: SuprimentoFilters): Promise<Suprimento[]> {
    const params = mapSuprimentoFiltersToApiParams(filters);
    const rawData = await getSuprimentoData("all", params);
    return mapToProcessedAll(Array.isArray(rawData) ? rawData : rawData?.resultados || []);
  }

  public async getSuprimentoTableData(
    limit?: number,
    offset?: number,
    sortBy?: string,
    sortDirection?: 'ascending' | 'descending',
    filters?: SuprimentoFilters,
    tableFilters?: SuprimentoTableFilters
  ): Promise<PaginatedSuprimentoResponse> {
    const params = mapSuprimentoFiltersToApiParams(filters);
    const rawData = await getSuprimentoData("table_data", params);

    let data = mapToProcessedTable(Array.isArray(rawData) ? rawData : rawData?.resultados || []);

    if (tableFilters) {
    data = data.filter((item: any) => {
        const matchesCommitmentNumber =
          !tableFilters.commitmentNumber ||
          item.commitmentNumber?.toLowerCase().includes(tableFilters.commitmentNumber.toLowerCase());
        const matchesEmployee =
          !tableFilters.employee ||
          item.employee?.toLowerCase().includes(tableFilters.employee.toLowerCase());
        const matchesDepartment =
          !tableFilters.departmentCode ||
          item.departmentCode?.toLowerCase().includes(tableFilters.departmentCode.toLowerCase());
        const matchesGrantedAmount =
          !tableFilters.grantedAmount ||
          String(item.grantedAmount)?.includes(String(tableFilters.grantedAmount).toLowerCase());
        const matchesApprovalDate =
          !tableFilters.approvalDate ||
          item.approvalDate?.toString().toLowerCase().includes(tableFilters.approvalDate.toLowerCase());
        const matchesProcessNumber =
          !tableFilters.processNumber ||
          item.processNumber?.toLowerCase().includes(tableFilters.processNumber.toLowerCase());
        const matchesStatus =
          !tableFilters.status ||
          item.status?.toString().toLowerCase().includes(tableFilters.status.toLowerCase());

        return (
          matchesCommitmentNumber &&
          matchesEmployee &&
          matchesDepartment &&
          matchesGrantedAmount &&
          matchesApprovalDate &&
          matchesProcessNumber &&
          matchesStatus
        );
      });
    }

    if (sortBy) {
      data = Processor.sortData(data, sortBy, sortDirection || "ascending");
    }

    const totalCount = data.length;

    if (typeof offset === "number" && typeof limit === "number") {
      data = data.slice(offset, offset + limit);
    }

    return {
      data,
      totalCount,
    };
  }

  public async getLastUpdate(): Promise<string> {
    try {
      const lastUpdate = await getSuprimentoData("kpi/last_update");
      return lastUpdate?.last_update || new Date().toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  public async getKpi(filters?: SuprimentoFilters) {
    const params = mapSuprimentoFiltersToApiParams(filters);
    const data = await getSuprimentoData("kpis/gerais", params);

    return {
      totalConcedido: data?.resultados?.total_concedido || data?.resultados?.total_concedidos || 0,
      totalAprovado: data?.resultados?.total_aprovado || data?.resultados?.total_aprovados || 0,
      totalProcessos: data?.resultados?.total_processos_unicos || data?.resultados?.total_processos || 0,
    };
  }

  public async getCharts(filters?: SuprimentoFilters) {
    const params = mapSuprimentoFiltersToApiParams(filters);
    const [data1, data2, data3] = await Promise.all([
      getSuprimentoData("dashboard/gastos_por_entidade", params),
      getSuprimentoData("dashboard/gastos_por_funcionario", params),
      getSuprimentoData("dashboard/gasto_por_mes", params),
    ]);

    const GastoOrgao = (data1?.resultados || []).map((item: any) => ({
      name: item.cnoOrgao || item.secretaria || item.name || "Não informado",
      total: Number(item.TotalGasto || item.total || 0),
    }));

    const GastoFuncionario = (data2?.resultados || []).map((item: any) => ({
      name: item.funcionario || item.employee || item.name || "Não informado",
      total: Number(item.TotalGasto || item.total || 0),
    }));

    const GastoMes = Processor.groupTop9WithOthers(
      (data3?.resultados || []).map((item: any) => ({
        name: Processor.formatYearMonth(item.MesReferencia || item.mes),
        total: Number(item.TotalGasto || item.total || 0),
      }))
    );

    return { GastoOrgao, GastoMes, GastoFuncionario };
  }

  public async getFilterOptions(filters?: SuprimentoFilters) {
    const allParams = mapSuprimentoFiltersToApiParams(filters) || {};

    const filterMap = {
      secretaria: "departmentCode",
      nroProcesso: "processNumber",
      funcionario: "employee",
      status: "status",
    };

    const results: any = {};

    for (const [paramKey] of Object.entries(filterMap)) {
      const paramsForCurrentFilter = { ...allParams };
      delete paramsForCurrentFilter[paramKey as keyof typeof allParams];

      const data = await getSuprimentoData("filterOptions", paramsForCurrentFilter);
      const responseKey = `${paramKey}Options`;
      results[responseKey] = data ? data[responseKey] || [] : [];
    }

    return {
      employee: results["funcionarioOptions"] || [],
      processNumber: results["nroProcessoOptions"] || [],
      status: results["statusOptions"] || [],
      departmentCode: results["secretariaOptions"] || [],
    };
  }
}