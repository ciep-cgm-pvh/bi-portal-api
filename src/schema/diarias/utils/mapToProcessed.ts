import { DiariaProcessed, DiariasFilters, DiariasTableFilters } from './types';

function getDiariaStatus(row: any): string {
  return "Indefinido"
}

export function mapToProcessedAll(rows: Record<string, any>[]): DiariaProcessed[] {
  return rows.map(row => ({
    expenseType: row[ "tipoDespesa" ],
    paymentNumber: row[ "ndaPagamento" ],
    paymentDate: row[ "dtPagamento" ],
    settlementNumber: row[ "ndaLiquidacao" ],
    fiscalDoc: row[ "nomDocFiscal" ],
    commitmentNumber: row[ "ndaEmpenho" ],
    employee: row[ "funcionario" ],
    employeeDoc: row[ "docFuncionario" ],
    limitDeliveryDate: row[ "dataLimiteEntrega" ],
    limitSpendDate: row[ "dataLimiteGasto" ],
    requestDate: row[ "dtConcedidosAprovar" ],
    history: row[ "historico" ],
    amountRequested: row[ "vlrConcedidosAprovar" ],
    approvalDate: row[ "dtAprovar" ],
    amountApproved: row[ "vlrAprovar" ],
    disallowedDate: row[ "dtImpugnado" ],
    disallowedValue: row[ "vlrImpugnado" ],
    defaultDate: row[ "dtInadimplencia" ],
    defaultValue: row[ "vlrInadimplencia" ],
    grantedDate: row[ "dtAprovado" ],
    grantedValue: row[ "vlrAprovado" ],
    canceledDate: row[ "dtCancelado" ],
    canceledValue: row[ "vlrCancelado" ],
    grantedAmount: row[ "vlrConcedido" ],
    balance: row[ "saldo" ],
    entityName: row[ "nomEntidade" ],
    departmentCode: row[ "cnoOrgao" ],
    budgetUnitCode: row[ "cnoUnidadeOrcamentaria" ],
    functionCode: row[ "cnoFuncao" ],
    subFunctionCode: row[ "cnoSubfuncao" ],
    programCode: row[ "cnoPrograma" ],
    actionCode: row[ "cnoAcao" ],
    expensePlanCode: row[ "cnoPlanoDespesa" ],
    subElementCode: row[ "cnoSubelemento" ],
    resourceSourceCode: row[ "cnoFonteRecurso" ],
    baseDate: row[ "dataBaseContagem" ],
    finalAccountDate: row[ "dataFinalPrestarConta" ],
    delayDays: row[ "diasAtraso" ],
    processNumber: row[ "nroProcesso" ],
    advanceNumber: row[ "nmrAdiantamento" ],
    id: row[ "id" ],
    status: getDiariaStatus(row), // mantém a lógica existente
  }));
}

export function mapToProcessedTable(rows: Record<string, any>[]): Partial<DiariaProcessed>[] {
  return rows.map(row => ({
    departmentCode: row[ "cnoOrgao" ],
    processNumber: row[ "nroProcesso" ],
    employee: row[ "funcionario" ],
    grantedAmount: row[ "vlrConcedido" ],
    grantedDate: row[ "dtAprovado" ],
    status: row["Status"],
  }));
}

export function mapDiariasFiltersToApiParams(
  filters?: Partial<DiariasFilters>,
  tableFilters?: Partial<DiariasTableFilters>
): Record<string, string> {
  const params: Record<string, string> = {};

  // === Intervalo de data (vem sempre do filtro global) ===
  if (filters?.dateRange?.from) params.data_inicial = filters.dateRange.from;
  if (filters?.dateRange?.to) params.data_final = filters.dateRange.to;

  // === Combina os filtros ===
  const mergeFilters = { ...filters };

  // Adiciona apenas se o valor for válido
  const addParam = (key: string, value: any) => {
    if (value !== undefined && value !== null && value !== "") {
      params[ key ] = String(value);
    }
  };

  // trocar nome do param depois que o filipe adicionar os filtros
  addParam("cnoOrgao", mergeFilters.departmentCode);
  addParam("status", mergeFilters.status);
  addParam("nroProcesso", mergeFilters.processNumber);

  return params;
}
