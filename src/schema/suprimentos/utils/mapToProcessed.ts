import { Suprimento, SuprimentoFilters } from './types';

export function mapToProcessedAll(rows: Record<string, any>[]): Suprimento[] {
  return rows.map((row) => ({
    id: row["id"] || row["ID"] || "",
    expenseType: row["tipoDespesa"],
    paymentNumber: row["ndaPagamento"],
    paymentDate: row["dtPagamento"],
    settlementNumber: row["ndaLiquidacao"],
    fiscalDoc: row["nomDocFiscal"],
    commitmentNumber: row["ndaEmpenho"],
    employee: row["funcionario"],
    employeeDoc: row["docFuncionario"],
    limitDeliveryDate: row["dataLimiteEntrega"],
    limitSpendDate: row["dataLimiteGasto"],
    requestDate: row["dtConcedidosAprovar"],
    history: row["historico"],
    amountRequested: row["vlrConcedidosAprovar"],
    approvalDate: row["dtAprovar"],
    amountApproved: row["vlrAprovar"],
    disallowedDate: row["dtImpugnado"],
    disallowedValue: row["vlrImpugnado"],
    defaultDate: row["dtInadimplencia"],
    defaultValue: row["vlrInadimplencia"],
    grantedDate: row["dtAprovado"],
    grantedValue: row["vlrAprovado"],
    canceledDate: row["dtCancelado"],
    canceledValue: row["vlrCancelado"],
    grantedAmount: row["vlrConcedido"],
    balance: row["saldo"],
    entityName: row["nomEntidade"],
    departmentCode: row["cnoOrgao"],
    budgetUnitCode: row["cnoUnidadeOrcamentaria"],
    functionCode: row["cnoFuncao"],
    subFunctionCode: row["cnoSubfuncao"],
    programCode: row["cnoPrograma"],
    actionCode: row["cnoAcao"],
    expensePlanCode: row["cnoPlanoDespesa"],
    subElementCode: row["cnoSubelemento"],
    resourceSourceCode: row["cnoFonteRecurso"],
    baseDate: row["dataBaseContagem"],
    finalAccountDate: row["dataFinalPrestarConta"],
    delayDays: row["diasAtraso"],
    processNumber: row["nroProcesso"],
    advanceNumber: row["nmrAdiantamento"],
    status: row["Status"] || row["status"] || "Pendente",
  }));
}

export function mapToProcessedTable(rows: Record<string, any>[]): Partial<Suprimento>[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    id: row["id"] || row["ID"] || "",
    departmentCode: row["cnoOrgao"] || row["departmentCode"] || "",
    processNumber: row["nroProcesso"] || row["processNumber"] || "",
    employee: row["funcionario"] || row["employee"] || "",
    grantedAmount: row["vlrConcedido"] ?? row["grantedAmount"] ?? 0,
    approvalDate: row["dtAprovar"] || row["approvalDate"] || "",
    status: row["Status"] || row["status"] || "Pendente",
    grantedValue: row["vlrAprovado"] ?? row["grantedValue"] ?? 0,
    entityName: row["nomEntidade"] || row["entityName"] || "",
    expenseType: row["tipoDespesa"] || row["expenseType"] || "",
  }));
}

export function mapSuprimentoFiltersToApiParams(
  filters?: Partial<SuprimentoFilters>
): Record<string, string> {
  const params: Record<string, string> = {};
  if (!filters) return params;

  if (filters.dateRange?.from) params.data_inicial = filters.dateRange.from;
  if (filters.dateRange?.to) params.data_final = filters.dateRange.to;

  const addParam = (key: string, value: any) => {
    if (value !== undefined && value !== null && value !== "") {
      params[key] = String(value);
    }
  };

  addParam("secretaria", filters.departmentCode);
  addParam("funcionario", filters.employee);
  addParam("status", filters.status);
  addParam("nro_processo", filters.processNumber);

  return params;
}
