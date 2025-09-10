import { ManutencaoProcessor } from './manutencaoProcessor';
// manutencao.service.ts - Manutenção
import { loadManutencao } from '../../data/loadManutencao';
import { mapToProcessed } from './utils/mapToProcessed';
import { ManutencaoFilters, ManutencaoProcessed, ManutencaoTableFilters } from './utils/types';

export class ManutencaoService {
  private rawData: any;
  private processedData: ManutencaoProcessed[];

  constructor() {
    this.rawData = loadManutencao();
    this.processedData = mapToProcessed(ManutencaoProcessor.processManutencaoData(this.rawData));
  }

  public getManutencao(filters?: ManutencaoFilters): ManutencaoProcessed[] {
    let filtered = ManutencaoProcessor.applyFilters(this.processedData, filters);

    if (!filters) return filtered;
    return filtered;
  }

  public getManutencaoTable(
    limit?: any,
    offset?: any,
    sortBy?: any,
    sortDirection?: any,
    filters?: ManutencaoFilters,
    tableFilters?: ManutencaoTableFilters
  ) {
    // pega dados já filtrados pelo getManutencao (dateRange + filtros gerais)
    let filtered = ManutencaoProcessor.applyFilters(this.getManutencao(filters), filters, tableFilters);

    // Normaliza sortBy e sortDirection
    const finalSortBy = sortBy?.toString().trim() || "datetime";
    const finalSortDirection = (sortDirection || "ascending").toString();

    // Ordena
    filtered = ManutencaoProcessor.sortData(filtered, finalSortBy, finalSortDirection as any);

    // Converte limit/offset para números válidos
    const l = Number(limit);
    const o = Number(offset);

    // Aplica paginação de forma simples
    const start = !isNaN(o) && o >= 0 ? o : 0;
    const end = !isNaN(l) && l > 0 ? start + l : undefined;

    filtered = filtered.slice(start, end);

    return filtered;
  }


  public getTableCount(filters?: ManutencaoFilters, tableFilters?: ManutencaoTableFilters) {
    return ManutencaoProcessor.applyFilters(this.processedData, filters, tableFilters).length;
  }

  public ManutencaoKpis(filters?: ManutencaoFilters) {
    const data = ManutencaoProcessor.applyFilters(this.processedData, filters);

    //Custo total
    const totalCost = data.map(r => Number(r.totalCost) || 0).reduce((acc, val) => acc + val, 0);

    // Ordens de serviço (OS) - Contagem
    const serviceOrderCount = data.length;

    // Custo médio por OS
    const averageCostPerOs = serviceOrderCount > 0 ? totalCost / serviceOrderCount : 0;

    return {
      totalCost,
      serviceOrderCount,
      averageCostPerOs,
      lastUpdate: this.getLastUpdate()
    };
  }

  public getLastUpdate() {
    // Pega todas as datas válidas
    const dates = this.getManutencao()
      .map(item => item.datetime)
      .filter(Boolean)
      .map((dateStr: string) => {
        // Substitui espaço por 'T' para garantir que o JS interprete corretamente
        const isoStr = dateStr.replace(' ', 'T');
        return new Date(isoStr);
      })
      .filter((date: Date) => !isNaN(date.getTime()));

    // Se não houver datas válidas, retorna a data atual como fallback
    const latestDate = dates.length > 0
      ? new Date(Math.max(...dates.map(d => d.getTime())))
      : new Date();

    const yyyy = latestDate.getFullYear();
    const mm = String(latestDate.getMonth() + 1).padStart(2, '0');
    const dd = String(latestDate.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
  }

  public getManutencaoCharts(filters?: ManutencaoFilters) {
    const data = ManutencaoProcessor.applyFilters(this.processedData, filters);

    // Agrupa custo por departamento
    const costByDepartmentMap: Record<string, number> = {};
    data.forEach(row => {
      const dept = row.department || 'N/A';
      const cost = Number(row.totalCost) || 0;
      costByDepartmentMap[ dept ] = (costByDepartmentMap[ dept ] || 0) + cost;
    });

    const costByDepartment = Object.entries(costByDepartmentMap).map(([ department, total ]) => ({
      department,
      total
    }));

    // Agrupa custo por tipo de manutenção (categoriaOs)
    const costByTipoManutencaoMap: Record<string, number> = {};
    data.forEach(row => {
      const tipo = row.categoryOs || 'N/A';
      const cost = Number(row.totalCost) || 0;
      costByTipoManutencaoMap[ tipo ] = (costByTipoManutencaoMap[ tipo ] || 0) + cost;
    });

    const costByTypeOfManutencao = Object.entries(costByTipoManutencaoMap).map(([ categoryOs, total ]) => ({
      categoryOs,
      total
    }));

    return {
      costByDepartment,
      costByTypeOfManutencao
    };
  }

  public getFilterOptions(filters?: ManutencaoFilters) {
    const allData = this.getManutencao();

    const mapToFilterType = (arr: (string | undefined | null)[]) =>
      Array.from(new Set(arr.filter(Boolean))).sort()
        .map(value => ({ value: value!, label: value! }));

    // 1. Filtra dados com base em TODOS os filtros ativos
    let filtered = allData;
    if (filters?.department) {
      filtered = filtered.filter(item => item.department.toLowerCase() === filters.department.toLowerCase());
    }
    if (filters?.categoryOs) {
      filtered = filtered.filter(item => item.categoryOs.toLowerCase() === filters.categoryOs.toLowerCase());
    }
    if (filters?.plate) {
      filtered = filtered.filter(item => item.plate.toLowerCase() === filters.plate.toLowerCase());
    }

    // 2. Gera as opções dinamicamente a partir do dataset já filtrado
    const departmentOptions = mapToFilterType(filtered.map(item => item.department));
    const categoryOptions = mapToFilterType(filtered.map(item => item.categoryOs));
    const plateOptions = mapToFilterType(filtered.map(item => item.plate));

    return {
      department: departmentOptions,
      categoryOs: categoryOptions,
      plate: plateOptions,
    };
  }
}