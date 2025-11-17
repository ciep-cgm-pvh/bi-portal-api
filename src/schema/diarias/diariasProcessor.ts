import { DiariaProcessed, DiariasTableFilters } from './utils/types';

export const DiariasProcessor = {
  applyTableFilters(data: DiariaProcessed[], tableFilters?: DiariasTableFilters) {
    let filtered = [ ...data ];
      
    if(!tableFilters) return filtered;

    filtered = filtered.filter(item => {
      const matchesProcessNumber = !tableFilters.processNumber || item.processNumber?.toLowerCase().includes(tableFilters.processNumber.toLowerCase());

      const matchesDepartmentCode = !tableFilters.departmentCode || item.departmentCode?.toLowerCase().includes(tableFilters.departmentCode.toLowerCase());

      const matchesEmployee = !tableFilters.employee || item.employee?.toLowerCase().includes(tableFilters.employee.toLowerCase());

      const matchesGrantedAmount = !tableFilters.grantedAmount || item.grantedAmount?.toString().toLowerCase().includes(tableFilters.grantedAmount.toLowerCase());

      const matchesGrantedDate = !tableFilters.grantedDate || item.grantedDate?.toLowerCase().includes(tableFilters.grantedDate.toLowerCase());

      const matchesStatus = !tableFilters.status || item.status?.toLowerCase().includes(tableFilters.status.toLowerCase());

      return matchesProcessNumber && matchesDepartmentCode && matchesEmployee && matchesGrantedAmount && matchesGrantedDate && matchesStatus
    })
  
    return filtered;
  }

}