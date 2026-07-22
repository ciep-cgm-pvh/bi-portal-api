// src/schema/suprimento/utils/types.ts

/**
 * Representa um único registro de Suprimento de Fundos, com todos os campos.
 */
export interface Suprimento {
    id: string;
    expenseType?: string;
    paymentNumber?: string;
    paymentDate?: string;
    settlementNumber?: string;
    fiscalDoc?: string;
    commitmentNumber?: string;
    employee?: string;
    employeeDoc?: string;
    limitDeliveryDate?: string;
    limitSpendDate?: string;
    requestDate?: string;
    history?: string;
    amountRequested?: number;
    approvalDate?: string;
    amountApproved?: number;
    disallowedDate?: string;
    disallowedValue?: number;
    defaultDate?: string;
    defaultValue?: number;
    grantedDate?: string;
    grantedValue?: number;
    canceledDate?: string;
    canceledValue?: number;
    grantedAmount?: number;
    balance?: number;
    entityName?: string;
    departmentCode?: string;
    budgetUnitCode?: string;
    functionCode?: string;
    subFunctionCode?: string;
    programCode?: string;
    actionCode?: string;
    expensePlanCode?: string;
    subElementCode?: string;
    resourceSourceCode?: string;
    baseDate?: string;
    finalAccountDate?: string;
    delayDays?: number;
    processNumber?: string;
    advanceNumber?: string;
    status?: string;
}

export interface PaginatedSuprimentoResponse {
    data: Suprimento[];
    totalCount: number;
}

export type SuprimentoFilters = import('../../diarias/utils/types').DiariasFilters;
export type SuprimentoTableFilters = import('../../diarias/utils/types').DiariasTableFilters;