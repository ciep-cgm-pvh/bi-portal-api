import { Processor } from '../../../utils/processor';
import { DiariaProcessed } from './types';

export function mapToProcessed(rows: Record<string, any>[]): DiariaProcessed[] {
  return rows.map(row => {
    return {
      department: (row[ "Órgão" ]),
      budgetUnit: (row[ "Unidade Orçamentária" ]),
      action: (row[ "Ação" ]),
      expensePlan: (row[ "Plano Despesa" ]),
      resourceSource: (row[ "Fonte Recurso" ]),
      expenseType: (row[ "Tipo Despesa" ]),
      payment: (row[ "Pagamento" ]),
      paymentDate: (row[ "Data Pagamento" ]),
      settlement: (row[ "Liquidação" ]),
      commitment: (row[ "Empenho" ]),
      employee: (row[ "Funcionário" ]),
      history: (row[ "Histórico" ]),
      processNumber: (row[ "Nº Processo" ]),
      defaultDate: (row[ "Data Inadimplencia" ]),
      delayDays: (row[ "Dias Atraso" ]),
      approvedDate: (row[ "Data Aprovado" ]),
      canceledDate: (row[ "Data Cancelado" ]),
      amountToApprove: (row[ "Valor a Aprovar" ]),
      amountApproved: (row[ "Valor Aprovado" ]),
      amountCanceled: (row[ "Valor Cancelado" ]),
      amountGranted: (row[ "Valor Concedido" ]),
      balance: (row[ "Saldo" ]),
    };
  });
}
