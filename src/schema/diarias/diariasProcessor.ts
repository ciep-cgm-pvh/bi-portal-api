import { DiariaProcessed, DiariasTableFilters } from './utils/types';

export const DiariasProcessor = {
  applyTableFilters(data: DiariaProcessed[], tableFilters?: DiariasTableFilters) {
    if (tableFilters) {
      data = data.filter((item: any) => {
        const matchesEmployee = !tableFilters.employee || item.employee?.toLowerCase().includes(tableFilters.employee.toLowerCase());
        const matchesDepartment = !tableFilters.departmentCode || item.departmentCode.toLowerCase().includes(tableFilters.departmentCode.toLowerCase());
        const matchesGrantedAmount = !tableFilters.grantedAmount || String(item.grantedAmount)?.includes(tableFilters.grantedAmount.toLowerCase());
        const matchesrequestDate = !tableFilters.requestDate || item.requestDate?.toLowerCase().includes(tableFilters.requestDate.toLowerCase());
        const matchesProcessNumber = !tableFilters.processNumber || item.processNumber?.toLowerCase().includes(tableFilters.processNumber.toLowerCase());
        const matchesStatus = !tableFilters.status || item.status?.toString().includes(tableFilters.status[ 0 ].toLowerCase());
        return matchesEmployee && matchesDepartment && matchesGrantedAmount && matchesrequestDate && matchesProcessNumber && matchesStatus;
      });
    }
  
    return data;
  }

}