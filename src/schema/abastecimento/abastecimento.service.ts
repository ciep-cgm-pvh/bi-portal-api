import { PrismaClient } from '@prisma/client';
import { AbastecimentoFilters, AbastecimentoTableFilters, AbastecimentoOptionsFilters } from './utils/types';

const prisma = new PrismaClient();

// Função auxiliar para construir a cláusula 'where' do Prisma dinamicamente
const buildWhereClause = (filters?: AbastecimentoFilters, tableFilters?: AbastecimentoTableFilters) => {
  const where: any = {};

  // Filtros Gerais
  if (filters?.dateRange) {
    where.datetime = {
      gte: new Date(filters.dateRange.from),
      lte: new Date(filters.dateRange.to),
    };
  }
  if (filters?.department) where.department = { contains: filters.department };
  if (filters?.fuelType) where.fuelType = {
    contains: filters.fuelType
  };
  if (filters?.vehiclePlate) where.vehiclePlate = { contains: filters.vehiclePlate };
  if (filters?.driverName) where.driverName = {
    contains: filters.driverName
  };

  // Filtros específicos da Tabela (geralmente buscas parciais)
  if (tableFilters?.department) where.department = { in: tableFilters.department };
  if (tableFilters?.vehiclePlate) where.vehiclePlate = { contains: tableFilters.vehiclePlate };
  if (tableFilters?.driverName) where.driverName = { contains: tableFilters.driverName };
  if (tableFilters?.gasStationName) where.gasStationName = { in: tableFilters.gasStationName };
  if (tableFilters?.gasStationCity) where.gasStationCity = { in: tableFilters.gasStationCity };

  return where;
};

// Tipos para os resultados do groupBy
interface GroupByDepartment {
  department: string;
  _sum: {
    cost: number | null;
  };
}

interface GroupByCity {
  gasStationCity: string;
  _sum: {
    cost: number | null;
  };
}

interface GroupByPlate {
  vehiclePlate: string;
  _sum: {
    cost: number | null;
  };
}

export class AbastecimentoService {

  // Retorna dados para a tabela com paginação, ordenação e filtros
  async getAbastecimentosTable(limit?: number, offset?: number, sortBy?: string, sortDirection?: string, filters?: AbastecimentoFilters, tableFilters?: AbastecimentoTableFilters) {
    const where = buildWhereClause(filters, tableFilters);

    const result = await prisma.abastecimento.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: sortBy ? { [ sortBy ]: sortDirection || 'asc' } : undefined,
    });

    return result
  }

  // Conta o total de registros com base nos filtros aplicados
  async getTableCount(filters?: AbastecimentoFilters, tableFilters?: AbastecimentoTableFilters) {
    const where = buildWhereClause(filters, tableFilters);
    return prisma.abastecimento.count({ where });
  }

  // Calcula os KPIs
  async getKpis(filters?: AbastecimentoFilters) {
    const where = buildWhereClause(filters);

    const aggregates = await prisma.abastecimento.aggregate({
      where,
      _sum: {
        cost: true,
        fuelVolume: true,
      },
      _count: {
        id: true,
      },
    });

    const lastUpdate = await prisma.abastecimento.findFirst({
      orderBy: { datetime: 'desc' },
      select: { datetime: true }
    });

    return {
      totalCost: aggregates._sum.cost || 0,
      fuelConsumed: aggregates._sum.fuelVolume || 0,
      suppliesCount: aggregates._count.id || 0,
      lastUpdate: lastUpdate?.datetime || new Date(),
      // KPIs que dependem de mais lógica podem ser adicionados aqui
      kilometersDriven: 0, // Exemplo: requer cálculo com campo 'km'
      vehiclesCount: 0, // Exemplo: requer distinct em 'vehiclePlate'
      dailyAverageCost: 0, // Exemplo: requer cálculo (totalCost / num_dias)
    };
  }

  // Busca opções de filtros (valores distintos)
  async getFilterOptions(filters?: AbastecimentoOptionsFilters) {
    const where = buildWhereClause(filters);

    const distinctDepartments = await prisma.abastecimento.findMany({ where, select: { department: true }, distinct: [ 'department' ] });
    const distinctPlates = await prisma.abastecimento.findMany({ where, select: { vehiclePlate: true }, distinct: [ 'vehiclePlate' ] });
    const distinctModels = await prisma.abastecimento.findMany({ where, select: { vehicleModel: true }, distinct: [ 'vehicleModel' ] });
    const distinctCities = await prisma.abastecimento.findMany({ where, select: { gasStationCity: true }, distinct: [ 'gasStationCity' ] });
    const distinctStations = await prisma.abastecimento.findMany({ where, select: { gasStationName: true }, distinct: [ 'gasStationName' ] });

    const toFilterType = (items: any[], key: string) => items.map(p => ({ value: p[ key ], label: p[ key ] })).filter(i => i.value);

    return {
      departmentOptions: toFilterType(distinctDepartments, 'department'),
      vehiclePlateOptions: toFilterType(distinctPlates, 'vehiclePlate'),
      vehicleModelOptions: toFilterType(distinctModels, 'vehicleModel'),
      gasStationCityOptions: toFilterType(distinctCities, 'gasStationCity'),
      gasStationNameOptions: toFilterType(distinctStations, 'gasStationName'),
    }
  }

  // Gera dados para os gráficos
  async getCharts(vehicleLimit: number = 10, filters?: AbastecimentoFilters) {
    const where = buildWhereClause(filters);

    const costByDepartment = await prisma.abastecimento.groupBy({
      by: [ 'department' ],
      _sum: { cost: true },
      where,
      orderBy: { _sum: { cost: 'desc' } },
    });

    const costByCity = await prisma.abastecimento.groupBy({
      by: [ 'gasStationCity' ],
      _sum: { cost: true },
      where,
      orderBy: { _sum: { cost: 'desc' } },
    });

    const costByPlate = await prisma.abastecimento.groupBy({
      by: [ 'vehiclePlate' ],
      _sum: { cost: true },
      where,
      orderBy: { _sum: { cost: 'desc' } },
      take: vehicleLimit
    });

    return {
      costByDepartment: costByDepartment.map((d: GroupByDepartment) => ({
        department: d.department,
        total: d._sum.cost || 0
      })),
      costByCity: costByCity.map((c: GroupByCity) => ({
        city: c.gasStationCity,
        total: c._sum.cost || 0
      })),
      costByPlate: costByPlate.map((p: GroupByPlate) => ({
        plate: p.vehiclePlate,
        total: p._sum.cost || 0
      })),
      // Outros gráficos podem ser implementados de forma similar
      costByVehicle: [],
      costByGasStation: [],
      costByDate: [],
      costOverTime: [],
      rankingByDate: [],
      rankingByPlate: [],
      rankingByDepartment: [],
    };
  }
}