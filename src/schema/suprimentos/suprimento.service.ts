// src/schema/suprimento/suprimento.service.ts
import { getSuprimentoData } from '../../data/loadSuprimento';
import { Processor } from '../../utils/processor';
import { mapSuprimentoFiltersToApiParams, mapToProcessedTable } from './utils/mapToProcessed';
import { PaginatedSuprimentoResponse, Suprimento, SuprimentoFilters, SuprimentoTableFilters } from './utils/types';

export class SuprimentoService {

    // O método create é estático para encapsular a lógica de inicialização assíncrona
    static async create(): Promise<SuprimentoService> {
        // No futuro, se houver dados para carregar na inicialização, eles viriam aqui.
        return new SuprimentoService();
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
        let data = await getSuprimentoData("table_data", params);

        data = mapToProcessedTable(data);

        if (tableFilters) {
            data = data.filter((item: any) => {
                const matchesEmployee = !tableFilters.employee || item.employee?.toLowerCase().includes(tableFilters.employee.toLowerCase());
                const matchesDepartment = !tableFilters.departmentCode || item.departmentCode?.toLowerCase().includes(tableFilters.departmentCode.toLowerCase());
                const matchesGrantedAmount = !tableFilters.grantedAmount || String(item.grantedAmount)?.includes(String(tableFilters.grantedAmount).toLowerCase());
                const matchesApprovalDate = !tableFilters.approvalDate || item.approvalDate?.toString().toLowerCase().includes(tableFilters.approvalDate.toLowerCase());
                const matchesProcessNumber = !tableFilters.processNumber || item.processNumber?.toLowerCase().includes(tableFilters.processNumber.toLowerCase());
                const matchesStatus = !tableFilters.status || item.status?.toString().toLowerCase().includes(tableFilters.status.toLowerCase());
                return matchesEmployee && matchesDepartment && matchesGrantedAmount && matchesApprovalDate && matchesProcessNumber && matchesStatus;
            });
        }

        data = Processor.sortData(data, sortBy, sortDirection || "ascending");
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
        const lastUpdate = await getSuprimentoData("kpi/last_update");
        return lastUpdate.last_update;
    }

    public async getKpi(filters?: SuprimentoFilters) {
        const params = mapSuprimentoFiltersToApiParams(filters);
        const data = await getSuprimentoData("kpis/gerais", params);

        return {
            totalConcedido: data.resultados?.total_concedido || 0,
            totalAprovado: data.resultados?.total_aprovado || 0,
            totalProcessos: data.resultados?.total_processos_unicos || 0,
        };
    }

    public async getCharts(filters?: SuprimentoFilters) {
        const params = mapSuprimentoFiltersToApiParams(filters);
        const [data1, data2, data3] = await Promise.all([
            getSuprimentoData("dashboard/gastos_por_entidade", params),
            getSuprimentoData("dashboard/gastos_por_funcionario", params),
            getSuprimentoData("dashboard/gasto_por_mes", params)
        ]);

        const GastoOrgao = (data1.resultados || []).map((item: any) => ({
            name: item.cnoOrgao,
            total: Number(item.TotalGasto),
        }));

        const GastoFuncionario = (data2.resultados || []).map((item: any) => ({
            name: item.funcionario,
            total: item.TotalGasto,
        }));

        const GastoMes = Processor.groupTop9WithOthers(
            (data3.resultados || []).map((item: any) => ({
                name: Processor.formatYearMonth(item.MesReferencia),
                total: item.TotalGasto,
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
            results[responseKey] = data[responseKey];
        }

        return {
            employee: results["funcionarioOptions"],
            processNumber: results["nroProcessoOptions"],
            status: results["statusOptions"],
            departmentCode: results["secretariaOptions"],
        };
    }
}