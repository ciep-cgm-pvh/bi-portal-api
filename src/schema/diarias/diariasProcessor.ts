import { Processor } from '../../utils/processor';
import { DiariaProcessed, DiariasFilters, DiariasTableFilters } from './utils/types';

export const DiariasProcessor = {
  applyFilters(data: DiariaProcessed[], filters?: DiariasFilters, tableFilters?: DiariasTableFilters) {
    let filtered = [ ...data ];

    if (!filters) return filtered;

    if (filters) {
      if (filters.dateRange) {
        const from = new Date(filters.dateRange.from);
        const to = new Date(filters.dateRange.to);

        filtered = filtered.filter(item => {
          if (!item.paymentDate) return false;
          const dt = Processor.parseDateDMY(item.paymentDate);
          if (!dt) return false;
          return dt >= from && dt <= to;
        });
      }

      if (filters.department) {
        const val = String(filters.department).toLowerCase();
        filtered = filtered.filter((item) =>
          String(item.department ?? '').toLowerCase().includes(val)
        );
      }
      
      if (filters.status) {
        const val = filters.status.toLowerCase();
        filtered = filtered.filter((item) =>
          item.department?.toLowerCase().includes(val)
        );
      }
    }
      
    if(!tableFilters) return filtered;

    if (tableFilters) {
      if (tableFilters.paymentDate) {
        const searchPaymentDate = String(tableFilters.paymentDate).toLowerCase();
        filtered = filtered.filter((item) => {
          return String(item.paymentDate).toLowerCase().includes(searchPaymentDate);
        });
      }

      if (tableFilters.department !== undefined && tableFilters.department !== null && String(tableFilters.department) !== '') {
        const searchDepartment = String(tableFilters.department).toLowerCase();
        filtered = filtered.filter((item) => 
          String(item.department).toLowerCase().includes(searchDepartment)
        )
      }

      if (tableFilters.employee !== undefined && tableFilters.employee !== null && String(tableFilters.employee) !== '') {
        const employee = String(tableFilters.employee).toLowerCase();
        filtered = filtered.filter((item) => String(item.employee).toLowerCase().includes(employee));
      }

      if (tableFilters.processNumber !== undefined && tableFilters.processNumber !== null && String(tableFilters.processNumber) !== '') {
        const searchCost = String(tableFilters.processNumber).replace(',', '.').trim();
        filtered = filtered.filter((item) => String(item.processNumber ?? '').includes(searchCost));
      }
      
      if (tableFilters.amountGranted !== undefined && tableFilters.amountGranted !== null && String(tableFilters.amountGranted) !== '') {
        const searchCost = String(tableFilters.amountGranted).replace(',', '.').trim();
        filtered = filtered.filter((item) => String(item.amountGranted ?? '').includes(searchCost));
      }

      if (tableFilters.status !== undefined && tableFilters.status !== null && String(tableFilters.status) !== '') {
        const searchStatus = String(tableFilters.status).toLowerCase()
        filtered = filtered.filter((item) => String(item.status ?? '').toLowerCase().includes(searchStatus));
      }
    }
  
    return filtered;
  }

}