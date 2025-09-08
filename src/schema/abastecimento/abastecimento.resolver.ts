import { AbastecimentoService } from './abastecimento.service';
import { AbastecimentoProcessor } from './abastecimentoProcessor';
import { AbastecimentoFilters, AbastecimentoOptionsFilters } from './utils/types';

const abastecimentoService = new AbastecimentoService();

const abastecimentoResolvers = () => ({
  Query: {
    // Dados gerais (filtros gerais, incluindo dateRange)
    getAbastecimentos: (_: unknown, { filters }: { filters?: AbastecimentoFilters }) => {
      return abastecimentoService.getAbastecimentos(filters);
    },

      // Dados da tabela (aplica filtros da tabela + ordenação + paginação)
    getAbastecimentosTable: (
      _: unknown,
      { limit, offset, sortBy, sortDirection, filters, tableFilters }: any
    ) => {
      let data = abastecimentoService.getAbastecimentosTable(filters, tableFilters);
      data = AbastecimentoProcessor.sortData(data, sortBy, (sortDirection || 'ascending'));

      if (typeof offset === 'number' && typeof limit === 'number') {
        data = data.slice(offset, offset + limit);
      }
      return data;
    },

    // ✅ count baseado no mesmo conjunto filtrado da tabela
    abastecimentosCount: (_: unknown, { filters, tableFilters }: any) => {
      const data = abastecimentoService.getAbastecimentosTable(filters, tableFilters);
      return data.length;
    },

    // KPIs
    abastecimentoKpis: (_: unknown, { filters }: { filters?: AbastecimentoFilters }) => {
      const {
        totalGasto,
        totalLitros,
        totalAbastecimentos,
        vehiclesCount,
        kilometersDriven,
      } = abastecimentoService.getKpis(filters);

      return {
        totalCost: totalGasto,
        fuelConsumed: totalLitros,
        suppliesCount: totalAbastecimentos,
        dailyAverageCost: totalGasto / (totalAbastecimentos || 1),
        vehiclesCount,
        kilometersDriven,
        lastUpdate: abastecimentoService.getLastUpdate(),
      };
    },

    vehicleSummary: () => {
      return abastecimentoService.getVehicleSummary();
    },

    // opções de filtro
    vehiclePlateOptions: (_: unknown, args: { filters: AbastecimentoOptionsFilters }) => {
      const placas = abastecimentoService.getFilterOptions(args.filters).placa;
      return placas.sort().map((p) => ({ value: p, label: p }));
    },

    departmentOptions: (_: unknown, args: { filters: AbastecimentoOptionsFilters }) => {
      const departments = abastecimentoService.getFilterOptions(args.filters).orgao;
      return departments.sort().map((d) => ({ value: d, label: d }));
    },

    vehicleModelOptions: (_: unknown, args: { filters: AbastecimentoOptionsFilters }) => {
      const models = abastecimentoService.getFilterOptions(args.filters).modelo;
      return models.sort().map((m) => ({ value: m, label: m }));
    },

    gasStationCityOptions: (_: unknown, args: { filters: AbastecimentoOptionsFilters }) => {
      const cities = abastecimentoService.getFilterOptions(args.filters).cidadePosto;
      return cities.sort().map((c) => ({ value: c, label: c }));
    },

    gasStationNameOptions: (_: unknown, args: { filters: AbastecimentoOptionsFilters }) => {
      const names = abastecimentoService.getFilterOptions(args.filters).nomePosto;
      return names.sort().map(n => ({ value: n, label: n }));
    },

    // gráficos
    costByVehicle: (_: unknown, { filters }: { filters?: AbastecimentoFilters }) => {
      const data = abastecimentoService.getAbastecimentos(filters);
      const totals = data.reduce<Record<string, number>>((acc, item) => {
        const vehicle = item.vehicle?.plate || "N/A";
        acc[ vehicle ] = (acc[ vehicle ] || 0) + (item.cost || 0);
        return acc;
      }, {});
      return Object.entries(totals).map(([ vehicle, total ]) => ({ vehicle, total }));
    },

    costByDepartment: (_: unknown, { filters }: { filters?: any }) => {
      const data = abastecimentoService.getAbastecimentos(filters);
      const totals = data.reduce<Record<string, number>>((acc, item) => {
        const department = item.department || "N/A";
        acc[ department ] = (acc[ department ] || 0) + (item.cost || 0);
        return acc;
      }, {});
      return Object.entries(totals).map(([ department, total ]) => ({ department, total }));
    },

    costByCity: (_: unknown, { filters }: { filters?: any }) => {
      const data = abastecimentoService.getAbastecimentos(filters);
      const totals = data.reduce<Record<string, number>>((acc, item) => {
        const city = item.gasStation?.city || "N/A";
        acc[ city ] = (acc[ city ] || 0) + (item.cost || 0);
        return acc;
      }, {});
      return Object.entries(totals).map(([ city, total ]) => ({ city, total }));
    },

    costByGasStation: (_: unknown, { filters }: { filters?: any }) => {
      const data = abastecimentoService.getAbastecimentos(filters);
      const totals = data.reduce<Record<string, number>>((acc, item) => {
        const name = item.gasStation?.name || "N/A";
        acc[ name ] = (acc[ name ] || 0) + (item.cost || 0);
        return acc;
      }, {});
      return Object.entries(totals).map(([ name, total ]) => ({ name, total }));
    },

    costByPlate: (_: unknown, { filters }: { filters?: any }) => {
      const data = abastecimentoService.getAbastecimentos(filters);
      const totals = data.reduce<Record<string, number>>((acc, item) => {
        const plate = item.vehicle?.plate || "N/A";
        acc[ plate ] = (acc[ plate ] || 0) + (item.cost || 0);
        return acc;
      }, {});
      return Object.entries(totals).map(([ plate, total ]) => ({ plate, total }));
    },

    costByDate: (_: unknown, { filters }: { filters?: any }) => {
      const data = abastecimentoService.getAbastecimentos(filters);
      const totals = data.reduce<Record<string, number>>((acc, item) => {
        let dateStr = "N/A";
        if (item.datetime) {
          const dateObj = new Date(item.datetime);
          if (!isNaN(dateObj.getTime())) {
            dateStr = dateObj.toISOString().substring(0, 10);
          }
        }
        acc[ dateStr ] = (acc[ dateStr ] || 0) + (item.cost || 0);
        return acc;
      }, {});
      return Object.entries(totals).map(([ date, total ]) => ({ date, total }));
    },
    
    costOverTime: async (_: unknown, { filters }: { filters?: any }) => {
      return abastecimentoService.getCostOverTimeGroupedByMonth(filters);
    },

    // rankings
    rankingByDate: async (_: unknown, { filters }: { filters?: any }) => {
      const data = await abastecimentoService.getAbastecimentos(filters);

      // Se houver dateRange, filtra os dados antes de agrupar
      let filteredData = data;
      if (filters?.dateRange?.from && filters?.dateRange?.to) {
        const from = new Date(filters.dateRange.from);
        const to = new Date(filters.dateRange.to);

        filteredData = data.filter(item => {
          if (!item.datetime) return false;
          const dateObj = new Date(item.datetime);
          return !isNaN(dateObj.getTime()) && dateObj >= from && dateObj <= to;
        });
      }

      // Agrupa custo por data
      const totals = filteredData.reduce<Record<string, number>>((acc, item) => {
        const dateObj = new Date(item.datetime);
        const dateStr = dateObj.toISOString().substring(0, 10);
        acc[ dateStr ] = (acc[ dateStr ] || 0) + (item.cost || 0);
        return acc;
      }, {});

      // Transforma em array e ordena do maior para o menor total
      return Object.entries(totals)
        .map(([ date, total ]) => ({ date, total }))
        .sort((a, b) => b.total - a.total); // ordem decrescente pelo total

      // // Converte para array e ordena por data
      // return Object.entries(totals)
      //   .map(([ date, total ]) => ({ date, total }))
      //   .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },

    rankingByPlate: async (_: unknown, { filters }: { filters?: any }) => {
      const data = await abastecimentoService.getAbastecimentos(filters);

      // Agrupa por placa somando total e contando quantidade
      const map = new Map<string, { total: number; quantity: number }>();

      data.forEach(({ vehicle, cost }) => {
        if (!vehicle?.plate) return;
        const plate = vehicle.plate;
        if (!map.has(plate)) {
          map.set(plate, { total: 0, quantity: 0 });
        }
        const entry = map.get(plate)!;
        entry.total += cost;
        entry.quantity += 1;
      });

      return Array.from(map, ([ plate, { total, quantity } ]) => ({
        plate,
        total,
        quantity,
      })).sort((a, b) => {
        // Ordena primeiro pelo total decrescente, depois pela quantidade decrescente
        if (b.total !== a.total) return b.total - a.total;
        return b.quantity - a.quantity;
      });;
    },

    rankingByDepartment: async (_: unknown, { filters }: { filters?: any }) => {
      const data = await abastecimentoService.getAbastecimentos(filters);

      // Agrupa por departamento somando total
      const map = new Map<string, number>();
      data.forEach(({ department, cost }) => {
        if (!department) return;
        map.set(department, (map.get(department) || 0) + cost);
      });

      return Array.from(map, ([ department, total ]) => ({ department, total })).sort((a, b) => b.total - a.total);
    },

    abastecimentosColumns: () => {
      return [
        { headerLabel: "Data", accessor: "datetime", isSortable: true, dataType: "date", isFilterable: true, filterKey: "datetime" },
        { headerLabel: "Custo", accessor: "cost", isSortable: true, dataType: "currency", isFilterable: true, filterKey: "cost" },
        { headerLabel: "Litros", accessor: "fuelVolume", isSortable: true, dataType: "number", isFilterable: true, filterKey: "fuelVolume" },
        { headerLabel: "Tipo Combustível", accessor: "fuelType", isSortable: true, dataType: "string", isFilterable: true, filterKey: "fuelType" },
        { headerLabel: "Motorista", accessor: "driverName", isSortable: true, dataType: "string", isFilterable: true, filterKey: "driverName" },
        { headerLabel: "Placa", accessor: "vehicle.plate", isSortable: true, dataType: "string", isFilterable: true, filterKey: "vehiclePlate" },
        { headerLabel: "Modelo", accessor: "vehicle.model", isSortable: true, dataType: "string", isFilterable: true, filterKey: "vehicleModel" },
        { headerLabel: "Marca", accessor: "vehicle.brand", isSortable: true, dataType: "string", isFilterable: true, filterKey: "vehicleBrand" },
        { headerLabel: "Posto", accessor: "gasStation.name", isSortable: true, dataType: "string", isFilterable: true, filterKey: "gasStationName" },
        { headerLabel: "Cidade", accessor: "gasStation.city", isSortable: true, dataType: "string", isFilterable: true, filterKey: "gasStationCity" },
        { headerLabel: "Órgão/Departamento", accessor: "department", isSortable: true, dataType: "string", isFilterable: true, filterKey: "department" },
        // { headerLabel: "Centro de Custo", accessor: "costCenter", isSortable: true, dataType: "string", isFilterable: true, filterKey: "costCenter" },
      ];
    }
  }
});


export default abastecimentoResolvers;