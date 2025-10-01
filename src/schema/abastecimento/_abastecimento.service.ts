// // AbastecimentoService.ts
// import { AbastecimentoProcessed, AbastecimentoFilters, AbastecimentoTableFilters, AbastecimentoOptionsFilters } from './utils/types';
// import { loadAbastecimento } from '../../data/loadAbastecimento';
// import { mapToProcessed } from './utils/mapToProcessed';
// import { AbastecimentoProcessor } from './abastecimentoProcessor';
// import { Processor } from '../../utils/processor';

// export class AbastecimentoService {
//   private rawData: any[];
//   private processedData: AbastecimentoProcessed[];

//   constructor() {
//     this.rawData = loadAbastecimento();
//     this.processedData = mapToProcessed(AbastecimentoProcessor.processAbastecimentoData(this.rawData));
//   }

//   public getAbastecimentos(filters?: AbastecimentoFilters): AbastecimentoProcessed[] {
//     let filtered = this.processedData;

//     if (!filters) return filtered;

//     // Filtro por data --- NAO REMOVER ---
//     if (filters.dateRange) {
//       const from = new Date(filters.dateRange.from);
//       const to = new Date(filters.dateRange.to);

//       filtered = filtered.filter(item => {
//         if (!item.datetime) return false;
//         const dt = Processor.parseDateDMY(item.datetime);
//         if (!dt) return false;
//         return dt >= from && dt <= to;
//       });
//     }

//     // Filtro por departamento
//     if (filters.department) {
//       const val = filters.department.toLowerCase();
//       filtered = filtered.filter(item => item.department?.toLowerCase().includes(val));
//     }

//     // Filtro por placa
//     if (filters.vehiclePlate) {
//       const val = filters.vehiclePlate.toLowerCase();
//       filtered = filtered.filter(item => item.vehicle?.plate.toLowerCase().includes(val));
//     }

//     // Filtro por modelo
//     if (filters.vehicleModel) {
//       const val = filters.vehicleModel.toLowerCase();
//       filtered = filtered.filter(item => item.vehicle?.model.toLowerCase().includes(val));
//     }

//     // Filtro por cidade do posto
//     if (filters.gasStationCity) {
//       const val = filters.gasStationCity.toLowerCase();
//       filtered = filtered.filter(item => item.gasStation?.city.toLowerCase().includes(val));
//     }

//     // Filtro por nome do posto
//     if (filters.gasStationName) {
//       const val = filters.gasStationName.toLowerCase();
//       filtered = filtered.filter(item => item.gasStation?.name.toLowerCase().includes(val));
//     }

//     // Filtro opcional para excluir veículos com "posto interno" no modelo
//     if (filters.excludePostoInterno) {
//       filtered = filtered.filter(item => {
//         const model = (item.vehicle?.model ?? '').toLowerCase();
//         return !model.includes('posto interno');
//       });
//     }

//     return filtered;
//   }

//   public getAbastecimentosTable(limit?: number, offset?: number, sortBy?: string, sortDirection?: any, filters?: AbastecimentoFilters, tableFilters?: AbastecimentoTableFilters): AbastecimentoProcessed[] {
//     let filtered = this.getAbastecimentos(filters);
//     if (!tableFilters) return filtered;

    
//     if (tableFilters.datetime) {
//       const search = tableFilters.datetime.toLowerCase();
//       filtered = filtered.filter(item => item.datetime?.toLowerCase().includes(search));
//     }
  
//     // --- Numeric Filters (busca parcial) ---
//     if (tableFilters.cost) {
//       const searchCost = String(tableFilters.cost).replace(',', '.').trim();
//       filtered = filtered.filter(item =>
//         item.cost?.toString().toLowerCase().includes(searchCost)
//       );
//     }

//     if (tableFilters.fuelVolume) {
//       const searchFuel = String(tableFilters.fuelVolume).replace(',', '.').trim();
//       filtered = filtered.filter(item =>
//         item.fuelVolume?.toString().toLowerCase().includes(searchFuel)
//       );
//     }

//     // Filtros de texto (case-insensitive)
//     const textFilters: { key: string; values: string[] }[] = [
//       { key: 'department', values: Processor.toArray(tableFilters.department).map(Processor.normalize) },
//       { key: 'datetime', values: Processor.toArray(tableFilters.datetime).map(Processor.normalize) },
//       { key: 'fuelType', values: Processor.toArray(tableFilters.fuelType).map(Processor.normalize) },
//       { key: 'driverName', values: Processor.toArray(tableFilters.driverName).map(Processor.normalize) },
//       { key: 'vehiclePlate', values: Processor.toArray(tableFilters.vehiclePlate).map(Processor.normalize) },
//       { key: 'vehicleModel', values: Processor.toArray(tableFilters.vehicleModel).map(Processor.normalize) },
//       { key: 'vehicleBrand', values: Processor.toArray(tableFilters.vehicleBrand).map(Processor.normalize) },
//       { key: 'gasStationCity', values: Processor.toArray(tableFilters.gasStationCity).map(Processor.normalize) },
//       { key: 'gasStationName', values: Processor.toArray(tableFilters.gasStationName).map(Processor.normalize) },
//     ];

//     for (const { key, values } of textFilters) {
//       if (values.length > 0) {
//         filtered = filtered.filter(item => {
//           let fieldValue: string = '';

//           if (key.startsWith('vehicle')) {
//             const prop = key.replace('vehicle', '').toLowerCase(); // plate, model, brand, km
//             const vehicleField = (item.vehicle as any)?.[ prop ];
//             fieldValue = vehicleField != null ? String(vehicleField) : '';
//           } else if (key.startsWith('gasStation')) {
//             const prop = key.replace('gasStation', '').toLowerCase(); // name, city
//             const gasField = (item.gasStation as any)?.[ prop ];
//             fieldValue = gasField != null ? String(gasField) : '';
//           } else {
//             const val = item[ key as keyof AbastecimentoProcessed ];
//             fieldValue = val != null ? String(val) : '';
//           }
//           fieldValue = Processor.normalize(fieldValue); // agora sempre é string

//           return values.some(term => fieldValue.toLowerCase().includes(term));
//         });
//       }
//     }

//     filtered = Processor.sortData(filtered, sortBy, (sortDirection || "ascending"))

//     if (typeof offset === 'number' && typeof limit === 'number') {
//       filtered = filtered.slice(offset, offset + limit);
//     }

//     return filtered;
//   }

//   public getTableCount(filters?: AbastecimentoFilters, tableFilters?: AbastecimentoTableFilters): number {
//     const data = this.getAbastecimentosTable(undefined, undefined, undefined, undefined, filters, tableFilters);
//     return data.length;
//   }

//   public getLastUpdate() {
//     const dates = this.getAbastecimentos()
//       .map(item => item.datetime)
//       .filter(Boolean)
//       .map((dateStr: string) => {
//         // Pega apenas a parte da data antes do espaço
//         const [ datePart ] = dateStr.split(" "); // "31/07/2025"
//         const [ day, month, year ] = datePart.split("/").map(Number);
//         return new Date(year, month - 1, day);
//       })
//       .filter((date: Date) => !isNaN(date.getTime()));

//     if (dates.length === 0) return null;

//     const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));

//     // Retorna só no formato DD/MM/YYYY
//     const day = String(latestDate.getDate()).padStart(2, "0");
//     const month = String(latestDate.getMonth() + 1).padStart(2, "0");
//     const year = latestDate.getFullYear();

//     return `${year}-${month}-${day}`;
//   }

//   public getKpis(filters?: AbastecimentoFilters) {
//     const data = this.getAbastecimentos(filters);
//     const totalCost = data.reduce((acc, item) => acc + (item.cost || 0), 0);
//     const fuelConsumed = data.reduce((acc, item) => acc + (item.fuelVolume || 0), 0);
//     const suppliesCount = data.length;

//     // Vamos calcular veículos únicos aqui
//     const uniqueVehicles = new Set(data.map(item => item.vehicle?.plate).filter(Boolean));

//     // Se tiver campo para quilômetros rodados, soma aqui (exemplo: item.kilometers)
//     const totalKilometers = data.reduce((acc, item) => acc + (item.vehicle.km || 0), 0);

//     return {
//       totalCost,
//       fuelConsumed,
//       suppliesCount,
//       dailyAverageCost: totalCost / (suppliesCount || 1),
//       vehiclesCount: uniqueVehicles.size,
//       kilometersDriven: totalKilometers,
//       lastUpdate: this.getLastUpdate(),
//     };
//   }

//   async getCharts(vehicleLimit: number = 10, filters?: AbastecimentoFilters) {
//     const data = await this.getAbastecimentos(filters);

//     const totalsByVehicle: Record<string, number> = {};
//     const totalsByDepartment: Record<string, number> = {};
//     const totalsByCity: Record<string, number> = {};
//     const totalsByGasStation: Record<string, number> = {};
//     const totalsByPlate: Record<string, number> = {};
//     const totalsByDate: Record<string, number> = {};

//     const rankingByPlateMap = new Map<string, { total: number; quantity: number }>();

//     for (const item of data) {
//       const vehiclePlate = item.vehicle?.plate || "N/A";
//       const department = item.department || "N/A";
//       const city = item.gasStation?.city || "N/A";
//       const gasStationName = item.gasStation?.name || "N/A";
//       const plate = item.vehicle?.plate || "N/A";
//       let dateStr = item.datetime
//       if (item.datetime) {
//         const dateObj = new Date(item.datetime);
//         if (!isNaN(dateObj.getTime())) {
//           dateStr = Processor.formatDatePTBR(item.datetime);
//         }
//       }
//       const cost = item.cost || 0;

//       // Totais
//       totalsByVehicle[ vehiclePlate ] = (totalsByVehicle[ vehiclePlate ] || 0) + cost;
//       totalsByDepartment[ department ] = (totalsByDepartment[ department ] || 0) + cost;
//       totalsByCity[ city ] = (totalsByCity[ city ] || 0) + cost;
//       totalsByGasStation[ gasStationName ] = (totalsByGasStation[ gasStationName ] || 0) + cost;
//       totalsByPlate[ plate ] = (totalsByPlate[ plate ] || 0) + cost;
//       totalsByDate[ dateStr ] = (totalsByDate[ dateStr ] || 0) + cost;

//       if (plate !== "N/A") {
//         if (!rankingByPlateMap.has(plate)) rankingByPlateMap.set(plate, { total: 0, quantity: 0 });
//         const entry = rankingByPlateMap.get(plate)!;
//         entry.total += cost;
//         entry.quantity += 1;
//       }
//     }

//     return {
//       // Gráficos de custo
//       costByVehicle: Object.entries(totalsByVehicle)
//         .map(([ vehicle, total ]) => ({ vehicle, total }))
//         .sort((a, b) => b.total - a.total)
//         .slice(0, vehicleLimit),

//       costByDepartment: Object.entries(totalsByDepartment).map(([ department, total ]) => ({ department, total })),
//       costByCity: Object.entries(totalsByCity).map(([ city, total ]) => ({ city, total })),
//       costByGasStation: Object.entries(totalsByGasStation).map(([ name, total ]) => ({ name, total })),
//       costByPlate: Object.entries(totalsByPlate).map(([ plate, total ]) => ({ plate, total })),
//       costByDate: Object.entries(totalsByDate).map(([ date, total ]) => ({ date, total })),
//       costOverTime: await this.getCostOverTimeGroupedByMonth(filters),

//       // Rankings
//       rankingByDate: Object.entries(totalsByDate)
//         .map(([ date, total ]) => ({ date, total }))
//         .sort((a, b) => b.total - a.total),

//       rankingByPlate: Array.from(rankingByPlateMap, ([ plate, { total, quantity } ]) => ({ plate, total, quantity }))
//         .sort((a, b) => b.total - a.total || b.quantity - a.quantity),

//       rankingByDepartment: Object.entries(totalsByDepartment)
//         .map(([ department, total ]) => ({ department, total }))
//         .sort((a, b) => b.total - a.total),
//     };
//   }

//   public getVehicleSummary() {
//     const data = this.getAbastecimentos();

//     // Agrupar por veículo + departamento
//     const summaryMap: Record<string, { vehicle: any; department: string; totalCost: number; supplyCount: number }> = {};

//     data.forEach(item => {
//       if (!item.vehicle?.plate) return;

//       const key = `${item.vehicle.plate}-${item.department}`;
//       if (!summaryMap[ key ]) {
//         summaryMap[ key ] = {
//           vehicle: {
//             plate: item.vehicle.plate,
//             model: item.vehicle.model,
//             brand: item.vehicle.brand
//           },
//           department: item.department,
//           totalCost: 0,
//           supplyCount: 0,
//         };
//       }

//       summaryMap[ key ].totalCost += item.cost || 0;
//       summaryMap[ key ].supplyCount += 1;
//     });

//     return Object.values(summaryMap);
  
//   }

//   public getFilterOptions(filters?: AbastecimentoOptionsFilters) {
//     const options = this.FilterOptions(filters ?? {});

//     return {
//       departmentOptions: options.orgao.map((d) => ({ value: d, label: d })),
//       vehiclePlateOptions: options.placa.map((p) => ({ value: p, label: p })),
//       vehicleModelOptions: options.modelo.map((m) => ({ value: m, label: m })),
//       gasStationCityOptions: options.cidadePosto.map((c) => ({ value: c, label: c })),
//       gasStationNameOptions: options.nomePosto.map((n) => ({ value: n, label: n })),
//     };
//   }

//   public FilterOptions(filters: Partial<AbastecimentoOptionsFilters> = {}) {
//     let filtered = this.getAbastecimentos();

//     if (filters.dateRange?.from) {
//       const fromDate = new Date(filters.dateRange.from);
//       filtered = filtered.filter(item => {
//         const itemDate = new Date(item.datetime);
//         return itemDate !== null && itemDate >= fromDate;
//       });
//     }
//     if (filters.dateRange?.to) {
//       const toDate = new Date(filters.dateRange.to);
//       filtered = filtered.filter(item => {
//         const itemDate = new Date(item.datetime);
//         return itemDate !== null && itemDate <= toDate;
//       });
//     }
    
//     if (filters.department) {
//       filtered = filtered.filter(item => item.department === filters.department);
//     }

//     if (filters.vehiclePlate) {
//       filtered = filtered.filter(item => item.vehicle?.plate === filters.vehiclePlate);
//     }

//     if (filters.vehicleModel) {
//       filtered = filtered.filter(item => item.vehicle?.model === filters.vehicleModel);
//     }

//     if (filters.gasStationCity) {
//       filtered = filtered.filter(item => item.gasStation?.city === filters.gasStationCity);
//     }

//     if (filters.gasStationName) {
//       filtered = filtered.filter(item => item.gasStation?.name === filters.gasStationName);
//     }

//     return {
//       orgao: [ ...new Set(filtered.map(item => item.department).filter(Boolean)) ].sort(),
//       placa: [ ...new Set(filtered.map(item => item.vehicle?.plate).filter(Boolean)) ].sort(),
//       modelo: [ ...new Set(filtered.map(item => item.vehicle?.model).filter(Boolean)) ].sort(),
//       cidadePosto: [ ...new Set(filtered.map(item => item.gasStation?.city).filter(Boolean)) ].sort(),
//       nomePosto: [ ...new Set(filtered.map(item => item.gasStation?.name).filter(Boolean)) ].sort(),
//     };
//   }

//   async getCostOverTimeGroupedByMonth(filters?: any) {
//     const data: AbastecimentoProcessed[] = await this.getAbastecimentos(filters);

//     const totals: Record<string, number> = {};

//     for (const item of data) {
//       const ym = Processor.extractYearMonth(item.datetime);
//       if (!ym) {
//         continue;
//       }
//       totals[ ym ] = (totals[ ym ] || 0) + (Number(item.cost) || 0);
//     }

//     // ordena por YYYY-MM crescente e retorna array no formato { date: 'YYYY-MM', total }
//     return Object.entries(totals)
//       .sort(([ a ], [ b ]) => a.localeCompare(b))
//       .map(([ date, total ]) => ({ date, total }));
//   }

//   getColumns() {
//     return [
//       { header: "Data", accessor: "datetime", sortable: true, dataType: "date", isFilterable: true, filterKey: "datetime" },
//       { header: "Custo", accessor: "cost", sortable: true, dataType: "currency", isFilterable: true, filterKey: "cost" },
//       { header: "Litros", accessor: "fuelVolume", sortable: true, dataType: "number", isFilterable: true, filterKey: "fuelVolume" },
//       { header: "Tipo Combustível", accessor: "fuelType", sortable: true, dataType: "string", isFilterable: true, filterKey: "fuelType" },
//       { header: "Motorista", accessor: "driverName", sortable: true, dataType: "string", isFilterable: true, filterKey: "driverName" },
//       { header: "Placa", accessor: "vehicle.plate", sortable: true, dataType: "string", isFilterable: true, filterKey: "vehiclePlate" },
//       { header: "Modelo", accessor: "vehicle.model", sortable: true, dataType: "string", isFilterable: true, filterKey: "vehicleModel" },
//       { header: "Marca", accessor: "vehicle.brand", sortable: true, dataType: "string", isFilterable: true, filterKey: "vehicleBrand" },
//       { header: "Posto", accessor: "gasStation.name", sortable: true, dataType: "string", isFilterable: true, filterKey: "gasStationName" },
//       { header: "Cidade", accessor: "gasStation.city", sortable: true, dataType: "string", isFilterable: true, filterKey: "gasStationCity" },
//       { header: "Órgão/Departamento", accessor: "department", sortable: true, dataType: "string", isFilterable: true, filterKey: "department" },
//       // { header: "Centro de Custo", accessor: "costCenter", sortable: true, dataType: "string", isFilterable: true, filterKey: "costCenter" },
//     ];
//   }

// }
