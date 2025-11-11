import { DiariaProcessed, DiariasTableFilters } from './utils/types';

export const DiariasProcessor = {
  applyTableFilters(data: DiariaProcessed[], tableFilters?: DiariasTableFilters) {
    let filtered = [ ...data ];
      
    if(!tableFilters) return filtered;

    if (tableFilters) {
      if (tableFilters.paymentDate) {
        const searchPaymentDate = String(tableFilters.paymentDate).toLowerCase();
        filtered = filtered.filter((item) => {
          return String(item.paymentDate).toLowerCase().includes(searchPaymentDate);
        });
      }

      if (tableFilters.departmentCode !== undefined && tableFilters.departmentCode !== null && String(tableFilters.departmentCode) !== '') {
        const searchDepartmentCode = String(tableFilters.departmentCode).toLowerCase();
        filtered = filtered.filter((item) => 
          String(item.departmentCode).toLowerCase().includes(searchDepartmentCode)
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
      
      if (tableFilters.grantedValue !== undefined && tableFilters.grantedValue !== null && String(tableFilters.grantedValue) !== '') {
        const searchCost = String(tableFilters.grantedValue).replace(',', '.').trim();
        filtered = filtered.filter((item) => String(item.grantedValue ?? '').includes(searchCost));
      }

      if (tableFilters.status !== undefined && tableFilters.status !== null && String(tableFilters.status) !== '') {
        const searchStatus = String(tableFilters.status).toLowerCase()
        filtered = filtered.filter((item) => String(item.status ?? '').toLowerCase().includes(searchStatus));
      }
    }
  
    return filtered;
  }

}