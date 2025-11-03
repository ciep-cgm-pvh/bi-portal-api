// AbastecimentoService.ts 
import { AbastecimentoProcessed, AbastecimentoFilters, AbastecimentoTableFilters, AbastecimentoOptionsFilters } from './utils/types';
import { mapFiltersToApiParams, mapToProcessed } from './utils/mapToProcessed';
import { AbastecimentoProcessor } from './abastecimentoProcessor';
import { Processor } from '../../utils/processor';
import { getAbastecimentoData } from '../../data/loadAbastecimento';

export class AbastecimentoService {
  private rawData: any[];
  private processedData: AbastecimentoProcessed[];

  constructor(rawData: any[]) {
    this.rawData = rawData;
    this.processedData = mapToProcessed(AbastecimentoProcessor.processAbastecimentoData(this.rawData));
  }

  static async create(): Promise<AbastecimentoService> {
    const rawData = await getAbastecimentoData("all");
    return new AbastecimentoService(rawData);
  }

  public getRawData() {
    return this.rawData;
  }

  public async getAbastecimentos(filters?: AbastecimentoFilters): Promise<AbastecimentoProcessed[]> {
    const params = mapFiltersToApiParams(filters);
    const filteredData = await getAbastecimentoData("all", params);
    return mapToProcessed(AbastecimentoProcessor.processAbastecimentoData(filteredData));
  }
  
  public async getAbastecimentosTable(
    limit?: number,
    offset?: number,
    sortBy?: string,
    sortDirection?: any,
    filters?: AbastecimentoFilters,
    tableFilters?: AbastecimentoTableFilters
  ): Promise<AbastecimentoProcessed[]> {
    const globalParams = mapFiltersToApiParams(filters);
    const response = await getAbastecimentoData("table_data", globalParams);

    let processed = mapToProcessed(AbastecimentoProcessor.processAbastecimentoData(response));

    if (tableFilters) {
      processed = processed.filter(item => {
        const matchesPlate = !tableFilters.vehiclePlate || item.vehicle.plate?.toLocaleLowerCase().includes(tableFilters.vehiclePlate);
        const matchesModel = !tableFilters.vehicleModel || item.vehicle.model?.toLocaleLowerCase().includes(tableFilters.vehicleModel);
        const matchesBrand = !tableFilters.vehicleBrand || item.vehicle.brand?.toLocaleLowerCase().includes(tableFilters.vehicleBrand);
        const matchesDriverName = !tableFilters.driverName || item.driverName?.toLocaleLowerCase().includes(tableFilters.driverName);
        const matchesDepartment = !tableFilters.department || item.department?.toLocaleLowerCase().includes(tableFilters.department);
        const matchesDatetime = !tableFilters.datetime || item.datetime?.toString().includes(tableFilters.datetime);
        const matchesCost = !tableFilters.cost || item.cost?.toString().includes(tableFilters.cost);
        const matchesFuelVolume = !tableFilters.fuelVolume || item.fuelVolume?.toString().includes(tableFilters.fuelVolume);
        const matchesFuelType = !tableFilters.fuelType || item.fuelType?.toLocaleLowerCase().includes(tableFilters.fuelType);
        const matchesGasStationCity = !tableFilters.gasStationCity || item.gasStation.city?.toLocaleLowerCase().includes(tableFilters.gasStationCity);
        const matchesGasStationName = !tableFilters.gasStationName || item.gasStation.name?.toLocaleLowerCase().includes(tableFilters.gasStationName);
        return matchesPlate && matchesGasStationCity && matchesGasStationName && matchesDepartment && matchesModel && matchesBrand && matchesDriverName && matchesDatetime && matchesCost && matchesFuelType && matchesFuelVolume;
      });
    }

    processed = Processor.sortData(processed, sortBy, sortDirection || "ascending");
    if (typeof offset === "number" && typeof limit === "number") {
      processed = processed.slice(offset, offset + limit);
    }
    return processed;
  }
  
  public async getTableCount(
    filters?: AbastecimentoFilters,
    tableFilters?: AbastecimentoTableFilters,
    sortBy?: string,
    sortDirection?: any
  ): Promise<number> {
    const globalParams = mapFiltersToApiParams(filters);
    const response = await getAbastecimentoData("table_data", globalParams);
    let processed = mapToProcessed(AbastecimentoProcessor.processAbastecimentoData(response));

    if (tableFilters) {
      processed = processed.filter(item => {
        const matchesPlate = !tableFilters.vehiclePlate || item.vehicle.plate?.toLocaleLowerCase().includes(tableFilters.vehiclePlate);
        const matchesModel = !tableFilters.vehicleModel || item.vehicle.model?.toLocaleLowerCase().includes(tableFilters.vehicleModel);
        const matchesBrand = !tableFilters.vehicleBrand || item.vehicle.brand?.toLocaleLowerCase().includes(tableFilters.vehicleBrand);
        const matchesDriverName = !tableFilters.driverName || item.driverName?.toLocaleLowerCase().includes(tableFilters.driverName);
        const matchesDepartment = !tableFilters.department || item.department?.toLocaleLowerCase().includes(tableFilters.department);
        const matchesDatetime = !tableFilters.datetime || item.datetime?.toString().includes(tableFilters.datetime);
        const matchesCost = !tableFilters.cost || item.cost?.toString().includes(tableFilters.cost);
        const matchesFuelVolume = !tableFilters.fuelVolume || item.fuelVolume?.toString().includes(tableFilters.fuelVolume);
        const matchesFuelType = !tableFilters.fuelType || item.fuelType?.toLocaleLowerCase().includes(tableFilters.fuelType);
        const matchesGasStationCity = !tableFilters.gasStationCity || item.gasStation.city?.toLocaleLowerCase().includes(tableFilters.gasStationCity);
        const matchesGasStationName = !tableFilters.gasStationName || item.gasStation.name?.toLocaleLowerCase().includes(tableFilters.gasStationName);
        return matchesPlate && matchesGasStationCity && matchesGasStationName && matchesDepartment && matchesModel && matchesBrand && matchesDriverName && matchesDatetime && matchesCost && matchesFuelType && matchesFuelVolume;
      });
    }

    processed = Processor.sortData(processed, sortBy, sortDirection || "ascending");
    return processed.length;
  }

  public async getKpis(filters?: AbastecimentoFilters) {
    const params = mapFiltersToApiParams(filters);
    const totalCost = await getAbastecimentoData("kpi/gastos_totais", params);

    const fuelConsumed = await getAbastecimentoData("kpi/consumo_total", params);

    // Vamos calcular veículos únicos aqui
    const uniqueVehicles = await getAbastecimentoData("kpi/veiculos_unicos", params);

    const lastUpdateResponse = await getAbastecimentoData("kpi/last_update");
    const lastUpdate = Processor.safeFormatDate(lastUpdateResponse.last_update)

    return {
      totalCost: Number(totalCost.total_gasto),
      fuelConsumed: Number(fuelConsumed.total_consumo_litros),
      vehiclesCount: Number(uniqueVehicles.total_veiculos_unicos),
      lastUpdate
    };
  }

  async getCharts(vehicleLimit: number = 10, filters?: AbastecimentoFilters) {
    const params = mapFiltersToApiParams(filters);

    // --- Custo por departamento ---
    const totalByDepartment = await getAbastecimentoData("dashboard/gastos_por_secretaria", params);
    const resultadosByDepartment = totalByDepartment?.resultados || [];
    const rankingByDepartment = resultadosByDepartment.map((item: any) => ({
      department: item.Subunidade || "N/A",
      total: Number(item.TotalGasto) || 0,
    })).sort((a: any, b: any) => b.total - a.total)
      .slice(0, 50);

    const rankingSorted = [ ...rankingByDepartment ].sort((a, b) => b.total - a.total);
    const costByDepartment =
      rankingSorted.length > 10
        ? [
          ...rankingSorted.slice(0, 9),
          {
            department: "Outros",
            total: rankingSorted.slice(9).reduce((acc, cur) => acc + cur.total, 0),
          },
        ]
        : rankingSorted;

    // --- Gasto por veículo ---
    const totalByPlate = await getAbastecimentoData("dashboard/gasto_por_veiculo", params);
    const resultadosByPlate = totalByPlate?.resultados || [];
    const costByPlate = resultadosByPlate
      .map((item: any) => ({
        plate: item.Placa || "N/A",
        total: Number(item.TotalGasto) || 0,
      }))
      .sort((a: any, b: any ) => b.total - a.total)
      .slice(0, vehicleLimit);

    // --- Gasto por mês ---
    const totalByMonth = await getAbastecimentoData("dashboard/gasto_por_mes", params);
    const resultadosByMonth = totalByMonth?.resultados || [];
    const costOverTime = resultadosByMonth.map((item: any) => ({
      date: item.MesReferencia || "N/A",
      total: Number(item.TotalGasto) || 0,
    }));
    
    // --- Ranking por data ---
    const totalByDate = await getAbastecimentoData("dashboard/gasto_por_data", params);
    const resultadosByDate = totalByDate?.resultados || [];
    const rankingByDate = resultadosByDate.map((item: any) => ({
      date: Processor.formatDatePTBR(item.DataAbastecimento) || "N/A",
      total: Number(item.TotalGasto) || 0,
    })).sort((a: any, b: any) => b.total - a.total)
      .slice(0, 50);

    // --- Ranking por veículo ---
    const totalByRankingPlate = await getAbastecimentoData("dashboard/ranking_por_veiculo", params);
    const resultadosByRankingPlate = totalByRankingPlate?.resultados || [];
    const rankingByPlate = resultadosByRankingPlate.map((item: any) => ({
      plate: item.Placa || "N/A",
      total: Number(item.TotalGasto) || 0,
      quantity: Number(item.QuantidadeAbastecimentos) || 0,
    })).sort((a: any, b: any) => b.total - a.total)
      .slice(0, 50);

    return {
      costByDepartment,
      costOverTime,
      costByPlate,
      rankingByDepartment,
      rankingByDate,
      rankingByPlate,
    };
  }

  public async getVehicleSummary() {
    const data = await this.getAbastecimentos();

    // Agrupar por veículo + departamento
    const summaryMap: Record<string, { vehicle: any; department: string; totalCost: number; supplyCount: number }> = {};

    data.forEach(item => {
      if (!item.vehicle?.plate) return;

      const key = `${item.vehicle.plate}-${item.department}`;
      if (!summaryMap[ key ]) {
        summaryMap[ key ] = {
          vehicle: {
            plate: item.vehicle.plate,
            model: item.vehicle.model,
            brand: item.vehicle.brand
          },
          department: item.department,
          totalCost: 0,
          supplyCount: 0,
        };
      }

      summaryMap[ key ].totalCost += item.cost || 0;
      summaryMap[ key ].supplyCount += 1;
    });

    return Object.values(summaryMap);

  }

  public async getFilterOptions(filters?: AbastecimentoOptionsFilters) {
    const options = await this.FilterOptions(filters);

    return {
      departmentOptions: options.orgao.map((d) => ({ value: d, label: d })),
      vehiclePlateOptions: options.placa.map((p) => ({ value: p, label: p })),
      vehicleModelOptions: options.modelo.map((m) => ({ value: m, label: m })),
      gasStationCityOptions: options.cidadePosto.map((c) => ({ value: c, label: c })),
      gasStationNameOptions: options.nomePosto.map((n) => ({ value: n, label: n })),
    };
  }

  public async FilterOptions(filters?: AbastecimentoFilters) {
    let filtered = await this.getAbastecimentos(filters);

    if (filters?.dateRange?.from) {
      const fromDate = new Date(filters.dateRange.from);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.datetime);
        return itemDate !== null && itemDate >= fromDate;
      });
    }
    if (filters?.dateRange?.to) {
      const toDate = new Date(filters.dateRange.to);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.datetime);
        return itemDate !== null && itemDate <= toDate;
      });
    }

    if (filters?.department) {
      filtered = filtered.filter(item => item.department === filters.department);
    }

    if (filters?.vehiclePlate) {
      filtered = filtered.filter(item => item.vehicle?.plate === filters.vehiclePlate);
    }

    if (filters?.vehicleModel) {
      filtered = filtered.filter(item => item.vehicle?.model === filters.vehicleModel);
    }

    if (filters?.gasStationCity) {
      filtered = filtered.filter(item => item.gasStation?.city === filters.gasStationCity);
    }

    if (filters?.gasStationName) {
      filtered = filtered.filter(item => item.gasStation?.name === filters.gasStationName);
    }

    return {
      orgao: [ ...new Set(filtered.map(item => item.department).filter(Boolean)) ].sort(),
      placa: [ ...new Set(filtered.map(item => item.vehicle?.plate).filter(Boolean)) ].sort(),
      modelo: [ ...new Set(filtered.map(item => item.vehicle?.model).filter(Boolean)) ].sort(),
      cidadePosto: [ ...new Set(filtered.map(item => item.gasStation?.city).filter(Boolean)) ].sort(),
      nomePosto: [ ...new Set(filtered.map(item => item.gasStation?.name).filter(Boolean)) ].sort(),
    };
  }

  getColumns() {
    return [
      { header: "Data", accessor: "datetime", sortable: true, dataType: "date", isFilterable: true, filterKey: "datetime" },
      { header: "Custo", accessor: "cost", sortable: true, dataType: "currency", isFilterable: true, filterKey: "cost" },
      { header: "Litros", accessor: "fuelVolume", sortable: true, dataType: "number", isFilterable: true, filterKey: "fuelVolume" },
      { header: "Tipo Combustível", accessor: "fuelType", sortable: true, dataType: "string", isFilterable: true, filterKey: "fuelType" },
      { header: "Motorista", accessor: "driverName", sortable: true, dataType: "string", isFilterable: true, filterKey: "driverName" },
      { header: "Placa", accessor: "vehicle.plate", sortable: true, dataType: "string", isFilterable: true, filterKey: "vehiclePlate" },
      { header: "Modelo", accessor: "vehicle.model", sortable: true, dataType: "string", isFilterable: true, filterKey: "vehicleModel" },
      { header: "Marca", accessor: "vehicle.brand", sortable: true, dataType: "string", isFilterable: true, filterKey: "vehicleBrand" },
      { header: "Posto", accessor: "gasStation.name", sortable: true, dataType: "string", isFilterable: true, filterKey: "gasStationName" },
      { header: "Cidade", accessor: "gasStation.city", sortable: true, dataType: "string", isFilterable: true, filterKey: "gasStationCity" },
      { header: "Órgão/Departamento", accessor: "department", sortable: true, dataType: "string", isFilterable: true, filterKey: "department" },
    ];
  }
}
