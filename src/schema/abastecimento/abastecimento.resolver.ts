import { AbastecimentoService } from './abastecimento.service';
import { AbastecimentoFilters, AbastecimentoOptionsFilters } from './utils/types';

const abastecimentoService = new AbastecimentoService();

// Mapeia o resultado do Prisma para o formato aninhado do GraphQL
const mapPrismaToGraphQL = (item: any) => ({
  id: item.id,
  datetime: item.datetime,
  cost: item.cost,
  fuelVolume: item.fuelVolume,
  fuelType: item.fuelType,
  driverName: item.driverName,
  department: item.department,
  costCenter: item.costCenter,
  vehicle: {
    plate: item.vehiclePlate,
    model: item.vehicleModel,
    brand: item.vehicleBrand,
  },
  gasStation: {
    name: item.gasStationName,
    city: item.gasStationCity,
  },
});

const abastecimentoResolver = {
  Query: {
    getAbastecimentosTable: async (_: unknown, args: any) => {
      console.time('Execution Time: getAbastecimentosTable');
      const data = await abastecimentoService.getAbastecimentosTable(args.limit, args.offset, args.sortBy, args.sortDirection, args.filters, args.tableFilters);
      console.timeEnd('Execution Time: getAbastecimentosTable');
      return data.map(mapPrismaToGraphQL);
    },

    getAbastecimentosTableCount: (_: unknown, { filters, tableFilters }: any) => {
      console.time('Execution Time: getAbastecimentosTableCount');
      const count = abastecimentoService.getTableCount(filters, tableFilters);
      console.timeEnd('Execution Time: getAbastecimentosTableCount');
      return count;
    },

    getAbastecimentoKpi: (_: unknown, { filters }: { filters?: AbastecimentoFilters }) => {
      console.time('Execution Time: getAbastecimentoKpi');
      const kpis = abastecimentoService.getKpis(filters);
      console.timeEnd('Execution Time: getAbastecimentoKpi');
      return kpis;
    },

    AbastecimentoFilterOptions: (_: unknown, { filters }: { filters?: AbastecimentoOptionsFilters }) => {
      console.time('Execution Time: AbastecimentoFilterOptions');
      const options = abastecimentoService.getFilterOptions(filters);
      console.timeEnd('Execution Time: AbastecimentoFilterOptions');
      return options;
    },

    getAbastecimentoCharts: (_: unknown, args: { vehicleLimit?: number, filters?: AbastecimentoFilters }) => {
      console.time('Execution Time: getAbastecimentoCharts');
      const charts = abastecimentoService.getCharts(args.vehicleLimit, args.filters);
      console.timeEnd('Execution Time: getAbastecimentoCharts');
      return charts;
    },

    getAbastecimentosColumns: () => {
      // Esta função é estática e muito rápida, não precisa de log de tempo.
      return [
        { header: 'Data/Hora', accessor: 'datetime', sortable: true, dataType: 'datetime', isFilterable: false },
        { header: 'Custo Total', accessor: 'cost', sortable: true, dataType: 'currency', isFilterable: true, filterKey: 'cost' },
        { header: 'Litros', accessor: 'fuelVolume', sortable: true, dataType: 'number', isFilterable: true, filterKey: 'fuelVolume' },
        { header: 'Combustível', accessor: 'fuelType', sortable: true, dataType: 'string', isFilterable: true, filterKey: 'fuelType' },
        { header: 'Motorista', accessor: 'driverName', sortable: true, dataType: 'string', isFilterable: true, filterKey: 'driverName' },
        { header: 'Placa', accessor: 'vehicle.plate', sortable: true, dataType: 'string', isFilterable: true, filterKey: 'vehiclePlate' },
        { header: 'Modelo', accessor: 'vehicle.model', sortable: true, dataType: 'string', isFilterable: true, filterKey: 'vehicleModel' },
        { header: 'Posto', accessor: 'gasStation.name', sortable: true, dataType: 'string', isFilterable: true, filterKey: 'gasStationName' },
        { header: 'Cidade', accessor: 'gasStation.city', sortable: true, dataType: 'string', isFilterable: true, filterKey: 'gasStationCity' },
        { header: 'Departamento', accessor: 'department', sortable: true, dataType: 'string', isFilterable: true, filterKey: 'department' },
      ];
    },
  },
};

export default abastecimentoResolver;