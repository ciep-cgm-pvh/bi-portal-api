// src/schema/suprimento/utils/mapToProcessed.ts
import { SuprimentoFilters } from '../suprimento/utils/types';

/**
 * Converte os filtros recebidos do front (camelCase)
 * para o formato aceito pela API de dados (snake_case).
 */
export function mapSuprimentoFiltersToApiParams(
    filters?: SuprimentoFilters
): Record<string, string> {
    const params: Record<string, string> = {};
    if (!filters) return params;

    if (filters.dateRange?.from) params.data_inicial = filters.dateRange.from;
    if (filters.dateRange?.to) params.data_final = filters.dateRange.to;
    if (filters.departmentCode) params.secretaria = filters.departmentCode;
    if (filters.employee) params.funcionario = filters.employee;
    if (filters.processNumber) params.nro_processo = filters.processNumber;
    if (filters.status) params.status = filters.status;

    return params;
}

export const mapToProcessedTable = (data: any[]) => data; // Simple pass-through for now