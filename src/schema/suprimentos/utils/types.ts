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
  amountRequested?: number | string;
  approvalDate?: string;
  amountApproved?: number | string;
  disallowedDate?: string;
  disallowedValue?: number | string;
  defaultDate?: string;
  defaultValue?: number | string;
  grantedDate?: string;
  grantedValue?: number | string;
  canceledDate?: string;
  canceledValue?: number | string;
  grantedAmount?: number | string;
  balance?: number | string;
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
  delayDays?: number | string;
  processNumber?: string;
  advanceNumber?: string;
  status?: string;
}

export interface PaginatedSuprimentoResponse {
  data: Partial<Suprimento>[];
  totalCount: number;
}

export interface SuprimentoFilters {
  dateRange?: { from: string; to: string };
  departmentCode?: string;
  status?: string;
  processNumber?: string;
  employee?: string;
}

export interface SuprimentoTableFilters {
  processNumber?: string;
  departmentCode?: string;
  approvalDate?: string;
  employee?: string;
  grantedAmount?: string;
  status?: string;
}
