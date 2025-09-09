import { loadDiarias } from '../../data/loadDiarias';
import { Processor } from '../../utils/processor';
import { mapToProcessed } from './utils/mapToProcessed';
import { DiariaProcessed, DiariasFilters, DiariasTableFilters } from './utils/types';

export class DiariasService {
  private rawData: any;
  private processedData: DiariaProcessed[];

  constructor() {
    this.rawData = loadDiarias();
    this.processedData = mapToProcessed(Processor.processData(this.rawData));
  }

  public getDiariasData(filters?: DiariasFilters): DiariaProcessed[] {
    let filtered = Processor.applyFilters(this.processedData, filters)
    return filtered
  }

  public getDiariasTableData(
      limit?: any,
      offset?: any,
      sortBy?: any,
      sortDirection?: any,
      filters?: DiariasFilters,
      tableFilters?: DiariasTableFilters) {
      // pega dados já filtrados pelo getManutencao (dateRange + filtros gerais)
      let filtered = Processor.applyFilters(this.getDiariasData(filters), filters, tableFilters);
    
      // Normaliza sortBy e sortDirection
      const finalSortBy = sortBy?.toString().trim() || "datetime";
      const finalSortDirection = (sortDirection || "ascending").toString();
    
      // Ordena
      filtered = Processor.sortData(filtered, finalSortBy, finalSortDirection as any);
    
      // Converte limit/offset para números válidos
      const l = Number(limit);
      const o = Number(offset);
    
      // Aplica paginação de forma simples
      const start = !isNaN(o) && o >= 0 ? o : 0;
      const end = !isNaN(l) && l > 0 ? start + l : undefined;
    
      filtered = filtered.slice(start, end);
    
    return filtered;
  }

  public getTableCount(filters?: DiariasFilters, tableFilters?: DiariasTableFilters) {
      return Processor.applyFilters(this.processedData, filters, tableFilters).length;
  }

  public getKpi(filters?: DiariasFilters) {
    const data = this.getDiariasData(filters)

    //Custo total
    const totalGasto = data.map(r => Number(r.amountGranted) || 0).reduce((acc, val) => acc + val, 0)

    const totalDiarias = data.filter(d => d.approvedDate && d.approvedDate !== "N/A").length;

    return {
      totalGasto,
      totalDiarias
    }
  }

  public getCharts(filters?: DiariasFilters) {
    const data = this.getDiariasData(filters);

    // --- Gasto por mês ---
    const GastoMesDiaria = data.reduce<Record<string, number>>((acc, item) => {
      if (!item.paymentDate) return acc;

      const [ day, month, year ] = item.paymentDate.split('/').map(Number);
      if (!day || !month || !year) return acc;

      const mesAno = `${String(month).padStart(2, '0')}/${year}`;
      acc[ mesAno ] = (acc[ mesAno ] || 0) + (Number(item.amountGranted) || 0);

      return acc;
    }, {})

    const gastoMesArray = Object.entries(GastoMesDiaria)
      .map(([ month, total ]) => ({ month, total }))
      .sort((a, b) => {
        const [ m1, y1 ] = a.month.split('/');
        const [ m2, y2 ] = b.month.split('/');
        return new Date(Number(y1), Number(m1) - 1, 1).getTime() -
          new Date(Number(y2), Number(m2) - 1, 1).getTime();
      });

    // --- Gasto por órgão ---
    const OrgaoGastoDiaria = data.reduce<Record<string, number>>((acc, item) => {
      const orgao = item.department || 'N/A';
      acc[ orgao ] = (acc[ orgao ] || 0) + (Number(item.amountGranted) || 0);
      return acc;
    }, {});

    const orgaoArray = Object.entries(OrgaoGastoDiaria)
      .map(([ name, total ]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

    // --- Retorno final ---
    return {
      GastoMesDiaria: gastoMesArray,
      OrgaoGastoDiaria: orgaoArray
    };
  }

  public getFilterOptions(filters?: DiariasFilters) {
    const allData = this.getDiariasData();

    const mapToFilterType = (arr: (string | undefined | null)[]) =>
      Array.from(new Set(arr.filter(Boolean))).sort()
        .map(value => ({ value: value!, label: value! }));

    // 1. Filtra dados com base em TODOS os filtros ativos
    let filtered = allData;
    if (filters?.department) {
      filtered = filtered.filter(item => item.department.toLowerCase() === filters.department.toLowerCase());
    }
    if (filters?.processNumber) {
      filtered = filtered.filter(item => item.processNumber.toLowerCase() === filters.processNumber.toLowerCase());
    }
    if (filters?.paymentDate) {
      filtered = filtered.filter(item => item.paymentDate.toLowerCase() === filters.paymentDate.toLowerCase());
    }

    // 2. Gera as opções dinamicamente a partir do dataset já filtrado
    const departmentOptions = mapToFilterType(filtered.map(item => item.department));
    const processNumberOptions = mapToFilterType(filtered.map(item => item.processNumber));
    const paymentDateOptions = mapToFilterType(filtered.map(item => item.paymentDate));

    return {
      department: departmentOptions,
      processNumber: processNumberOptions,
      paymentDate: paymentDateOptions,
    };
  }

  public getLastUpdate() {
    const dates = this.getDiariasData()
      .map(item => item.paymentDate)
      .filter(Boolean)
      .map((dateStr: string) => {
        // Pega apenas a parte da data antes do espaço
        const [ datePart ] = dateStr.split(" "); // "31/07/2025"
        const [ day, month, year ] = datePart.split("/").map(Number);
        return new Date(year, month - 1, day);
      })
      .filter((date: Date) => !isNaN(date.getTime()));

    if (dates.length === 0) return null;

    const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));

    // Retorna só no formato DD/MM/YYYY
    const day = String(latestDate.getDate()).padStart(2, "0");
    const month = String(latestDate.getMonth() + 1).padStart(2, "0");
    const year = latestDate.getFullYear();

    return `${year}-${month}-${day}`;
  }
}