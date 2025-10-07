export interface Diarias {
  orgao: string;
  unidadeOrcamentaria: string;
  acao: string;
  planoDespesa: string;
  fonteRecurso: string;
  tipoDespesa: string;
  pagamento: string;
  dataPagamento: string;
  liquidacao: string;
  empenho: string;
  funcionario: string;
  historico: string;
  numeroProcesso: string;
  dataInadimplencia: string;
  diasAtraso: number | string;
  dataAprovado: string;
  dataCancelado: string;
  valorAAprovar: number | string;
  valorAprovado: number | string;
  valorCancelado: number | string;
  valorConcedido: number | string;
  saldo: number | string;
}

export interface DiariaProcessed {
  department: string
  budgetUnit: string
  action: string
  expensePlan: string
  resourceSource: string
  expenseType: string
  payment: string
  paymentDate: string
  settlement: string
  commitment: string
  employee: string
  history: string
  processNumber: string
  defaultDate: string
  delayDays: string | number;
  approvedDate: string
  canceledDate: string
  amountToApprove: string | number;
  amountApproved: string | number;
  amountCanceled: string | number;
  amountGranted: string | number;
  balance: string | number;
  status: string
}

export interface DiariasFilters {
  dateRange: { from: string; to: string; }
  department: string
  status: string
  processNumber: string
}

export interface DiariasTableFilters {
  processNumber: string
  department: string
  paymentDate: string
  employee: string
  amountGranted: string
  status: string
}