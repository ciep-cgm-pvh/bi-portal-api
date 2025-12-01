export interface Diarias {
  tipoDespesa: string;
  ndaPagamento: string;
  dtPagamento: string;
  ndaLiquidacao: string;
  nomDocFiscal: string;
  ndaEmpenho: string;
  funcionario: string;
  docFuncionario: string;
  dataLimiteEntrega: string;
  dataLimiteGasto: string;
  dtConcedidosAprovar: string;
  historico: string;
  vlrConcedidosAprovar: number;
  dtAprovar: string;
  vlrAprovar: number;
  dtImpugnado: string;
  vlrImpugnado: number;
  dtInadimplencia: string;
  vlrInadimplencia: number;
  dtAprovado: string;
  vlrAprovado: number;
  dtCancelado: string;
  vlrCancelado: number;
  vlrConcedido: number;
  saldo: number;
  nomEntidade: string;
  cnoOrgao: string;
  cnoUnidadeOrcamentaria: string;
  cnoFuncao: string;
  cnoSubfuncao: string;
  cnoPrograma: string;
  cnoAcao: string;
  cnoPlanoDespesa: string;
  cnoSubelemento: string;
  cnoFonteRecurso: string;
  dataBaseContagem: string;
  dataFinalPrestarConta: string;
  diasAtraso: string | number;
  nroProcesso: string;
  nmrAdiantamento: string;
  id: string;
}

export interface DiariaProcessed {
  expenseType: string;
  paymentNumber: string;
  paymentDate: string;
  settlementNumber: string;
  fiscalDoc: string;
  commitmentNumber: string;
  employee: string;
  employeeDoc: string;
  limitDeliveryDate: string;
  limitSpendDate: string;
  requestDate: string;
  history: string;
  amountRequested: number | string;
  approvalDate: string;
  amountApproved: number | string;
  disallowedDate: string;
  disallowedValue: number | string;
  defaultDate: string;
  defaultValue: number | string;
  grantedDate: string;
  grantedValue: number | string;
  canceledDate: string;
  canceledValue: number | string;
  grantedAmount: number | string;
  balance: number | string;
  entityName: string;
  departmentCode: string;
  budgetUnitCode: string;
  functionCode: string;
  subFunctionCode: string;
  programCode: string;
  actionCode: string;
  expensePlanCode: string;
  subElementCode: string;
  resourceSourceCode: string;
  baseDate: string;
  finalAccountDate: string;
  delayDays: string | number;
  processNumber: string;
  advanceNumber: string;
  id: string;
  status: string;
}

export interface PaginatedDiariasResponse {
  data: DiariaProcessed[];
  totalCount: number;
}

export interface DiariasFilters {
  dateRange: { from: string; to: string; }
  departmentCode: string
  status: string
  processNumber: string
  employee: string
}

export interface DiariasTableFilters {
  processNumber: string
  departmentCode: string
  grantedDate: string
  employee: string
  grantedAmount: string
  status: string
}