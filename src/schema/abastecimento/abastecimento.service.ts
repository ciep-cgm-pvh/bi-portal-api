// AbastecimentoService.ts
import { AbastecimentoProcessed, AbastecimentoFilters, AbastecimentoTableFilters } from './utils/types';
import { loadAbastecimento } from '../../data/loadAbastecimento';
import { mapToProcessed } from './utils/mapToProcessed';
import { AbastecimentoProcessor } from './abastecimentoProcessor';

export class AbastecimentoService {
  private rawData: any[];
  private processedData: AbastecimentoProcessed[];

  constructor() {
    this.rawData = loadAbastecimento();
    this.processedData = mapToProcessed(AbastecimentoProcessor.processAbastecimentoData(this.rawData));
  }

  public getAbastecimentos(filters?: AbastecimentoFilters): AbastecimentoProcessed[] {
    let filtered = this.processedData;

    if (!filters) return filtered;

    // Filtro por data --- NAO REMOVER ---
    if (filters.dateRange) {
      const from = new Date(filters.dateRange.from);
      const to = new Date(filters.dateRange.to);

      filtered = filtered.filter(item => {
        if (!item.datetime) return false;
        const dt = AbastecimentoProcessor.parseDate(item.datetime);
        if (!dt) return false;
        return dt >= from && dt <= to;
      });
    }

    // Filtro por departamento
    if (filters.department && filters.department !== '') {
      filtered = filtered.filter(item => item.department === filters.department);
    }

    // Filtro por placa
    if (filters.vehiclePlate && filters.vehiclePlate !== '') {
      filtered = filtered.filter(item => item.vehicle?.plate === filters.vehiclePlate);
    }

    // Filtro por modelo
    if (filters.vehicleModel && filters.vehicleModel !== '') {
      filtered = filtered.filter(item => item.vehicle?.model === filters.vehicleModel);
    }

    // Filtro por cidade do posto
    if (filters.gasStationCity && filters.gasStationCity !== '') {
      filtered = filtered.filter(item => item.gasStation?.city === filters.gasStationCity);
    }

    // Filtro por nome do posto
    if (filters.gasStationName && filters.gasStationName !== '') {
      filtered = filtered.filter(item => item.gasStation?.name === filters.gasStationName);
    }

    return filtered;
  }

  public getAbastecimentosTable( filters?: AbastecimentoFilters, tableFilters?: AbastecimentoTableFilters): AbastecimentoProcessed[] {
    let filtered = this.getAbastecimentos(filters);
    if (!tableFilters) return filtered;

    // Helper: transforma string ou array em array sempre
    const toArray = (v: string | string[] | undefined): string[] => {
      if (!v) return [];
      return Array.isArray(v) ? v : [ v ];
    };

    // Helper: normaliza string para comparação
    const normalize = (s: string | undefined) => (s || '').toLowerCase().trim();

    if (tableFilters.datetime) {
      const search = normalize(String(tableFilters.datetime));
      filtered = filtered.filter(item => {
        const dt = item.datetime ? normalize(item.datetime) : '';
        return dt.includes(search);
      });
    }
  
    // --- Numeric Filters (busca parcial) ---
    if (tableFilters.cost) {
      const searchCost = String(tableFilters.cost).replace(',', '.').trim();
      filtered = filtered.filter(item =>
        item.cost != null &&
        String(item.cost).includes(searchCost)
      );
    }

    if (tableFilters.fuelVolume) {
      const searchFuel = String(tableFilters.fuelVolume).replace(',', '.').trim();
      filtered = filtered.filter(item =>
        item.fuelVolume != null &&
        String(item.fuelVolume).includes(searchFuel)
      );
    }

    // Filtros de texto (case-insensitive)
    const textFilters: { key: string; values: string[] }[] = [
      { key: 'department', values: toArray(tableFilters.department).map(normalize) },
      { key: 'datetime', values: toArray(tableFilters.datetime).map(normalize) },
      { key: 'fuelType', values: toArray(tableFilters.fuelType).map(normalize) },
      { key: 'driverName', values: toArray(tableFilters.driverName).map(normalize) },
      { key: 'vehiclePlate', values: toArray(tableFilters.vehiclePlate).map(normalize) },
      { key: 'vehicleModel', values: toArray(tableFilters.vehicleModel).map(normalize) },
      { key: 'vehicleBrand', values: toArray(tableFilters.vehicleBrand).map(normalize) },
      { key: 'gasStationCity', values: toArray(tableFilters.gasStationCity).map(normalize) },
      { key: 'gasStationName', values: toArray(tableFilters.gasStationName).map(normalize) },
    ];

    for (const { key, values } of textFilters) {
      if (values.length > 0) {
        filtered = filtered.filter(item => {
          let fieldValue: string = '';

          if (key.startsWith('vehicle')) {
            const prop = key.replace('vehicle', '').toLowerCase(); // plate, model, brand, km
            const vehicleField = (item.vehicle as any)?.[ prop ];
            fieldValue = vehicleField != null ? String(vehicleField) : '';
          } else if (key.startsWith('gasStation')) {
            const prop = key.replace('gasStation', '').toLowerCase(); // name, city
            const gasField = (item.gasStation as any)?.[ prop ];
            fieldValue = gasField != null ? String(gasField) : '';
          } else {
            const val = item[ key as keyof AbastecimentoProcessed ];
            fieldValue = val != null ? String(val) : '';
          }
          fieldValue = normalize(fieldValue); // agora sempre é string

          return values.some(term => fieldValue.includes(term));
        });
      }
    }

    return filtered;
  }

  public getLastUpdate() {
    // Supondo que rawData tenha um campo 'Data' no formato 'DD/MM/YYYY'
    const dates = this.rawData
      .map(item => item.Data)
      .filter(Boolean)
      .map((dateStr: string) => {
        const [ day, month, year ] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
      })
      .filter((date: Date) => !isNaN(date.getTime()));

    if (dates.length === 0) return null;

    const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));
    return latestDate;
  }

  public getKpis(filters?: AbastecimentoFilters) {
    const data = this.getAbastecimentos(filters);
    const totalGasto = data.reduce((acc, item) => acc + (item.cost || 0), 0);
    const totalLitros = data.reduce((acc, item) => acc + (item.fuelVolume || 0), 0);
    const totalAbastecimentos = data.length;

    // Vamos calcular veículos únicos aqui
    const uniqueVehicles = new Set(data.map(item => item.vehicle?.plate).filter(Boolean));

    // Se tiver campo para quilômetros rodados, soma aqui (exemplo: item.kilometers)
    const totalKilometers = data.reduce((acc, item) => acc + (item.vehicle.km || 0), 0);

    return {
      totalGasto,
      totalLitros,
      totalAbastecimentos,
      vehiclesCount: uniqueVehicles.size,
      kilometersDriven: totalKilometers,
    };
  }

  public getVehicleSummary() {
    const data = this.processedData;

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

  public getGastoPorOrgao(filters?: AbastecimentoFilters) {
    const data = this.getAbastecimentos(filters);
    const gastosPorOrgao = data.reduce<Record<string, number>>((acc, item) => {
      const orgao = item.department || 'N/A';
      acc[ orgao ] = (acc[ orgao ] || 0) + (item.cost || 0);
      return acc;
    }, {});

    return Object.entries(gastosPorOrgao)
      .map(([ name, total ]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }

  public getGastoMensal(filters?: AbastecimentoFilters) {
    const data = this.getAbastecimentos(filters);
    const gastosPorMes = data.reduce<Record<string, number>>((acc, item) => {
      if (!item.datetime) return acc;
      const date = new Date(item.datetime);
      const mesAno = `${String(date.getUTCMonth() + 1).padStart(2, '0')}/${date.getUTCFullYear()}`;
      acc[ mesAno ] = (acc[ mesAno ] || 0) + (item.cost || 0);
      return acc;
    }, {});

    return Object.entries(gastosPorMes)
      .map(([ month, total ]) => ({ month, total }))
      .sort((a, b) => {
        const [ m1, y1 ] = a.month.split('/');
        const [ m2, y2 ] = b.month.split('/');
        return new Date(`${y1}-${m1}-01`).getTime() - new Date(`${y2}-${m2}-01`).getTime();
      });
  }

  private extractYearMonth(datetime: any): string | null {
    if (!datetime && datetime !== 0) return null;
    const s = String(datetime).trim();

    // 1) YYYY-MM-DD ou YYYY-MM-DDTHH:MM:SS... -> pega YYYY-MM direto
    const ymdMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (ymdMatch) return `${ymdMatch[ 1 ]}-${ymdMatch[ 2 ]}`;

    // 2) DD/MM/YYYY ou DD/MM/YYYY HH:MM:SS -> transforma para YYYY-MM
    const dmyMatch = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (dmyMatch) {
      const [ , dd, mm, yyyy ] = dmyMatch;
      return `${yyyy}-${mm}`;
    }

    // 3) Fallback: tenta criar Date e extrair componentes LOCAIS (para evitar shift do toISOString)
    const dateObj = new Date(s);
    if (!isNaN(dateObj.getTime())) {
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0'); // getMonth é local
      return `${yyyy}-${mm}`;
    }

    // Não foi possível extrair
    return null;
  }

  async getCostOverTimeGroupedByMonth(filters?: any) {
    const data: AbastecimentoProcessed[] = await this.getAbastecimentos(filters);

    const totals: Record<string, number> = {};

    for (const item of data) {
      const ym = this.extractYearMonth(item.datetime);
      if (!ym) {
        continue;
      }
      totals[ ym ] = (totals[ ym ] || 0) + (Number(item.cost) || 0);
    }
    const monthsFound = Array.from(new Set(data.map(d => this.extractYearMonth(d.datetime)).filter(Boolean))).sort();

    // ordena por YYYY-MM crescente e retorna array no formato { date: 'YYYY-MM', total }
    return Object.entries(totals)
      .sort(([ a ], [ b ]) => a.localeCompare(b))
      .map(([ date, total ]) => ({ date, total }));
  }

  public getFilterOptions(filters: any) {
    // 1. Filtra os dados com base no que já foi selecionado
    let filtered = this.processedData;

    if (filters.department) {
      filtered = filtered.filter(item => item.department === filters.department);
    }

    if (filters.vehiclePlate) {
      filtered = filtered.filter(item => item.vehicle.plate === filters.vehiclePlate);
    }

    if (filters.vehicleModel) {
      filtered = filtered.filter(item => item.vehicle.model === filters.vehicleModel);
    }

    if (filters.gasStationCity) {
      filtered = filtered.filter(item => item.gasStation.city === filters.gasStationCity);
    }

    if (filters.gasStationName) {
      filtered = filtered.filter(item => item.gasStation.name === filters.gasStationName);
    }

    // 2. Extrai os valores possíveis desse conjunto filtrado
    const orgaoOptions = Array.from(new Set(filtered.map(item => item.department).filter(Boolean))).sort();
    const placaOptions = Array.from(new Set(filtered.map(item => item.vehicle.plate).filter(Boolean))).sort();
    const modelOptions = Array.from(new Set(filtered.map(item => item.vehicle.model).filter(Boolean))).sort();
    const gasStationCityOptions = Array.from(new Set(filtered.map(item => item.gasStation.city).filter(Boolean))).sort();
    const gasStationNameOptions = Array.from(new Set(filtered.map(item => item.gasStation.name).filter(Boolean))).sort();

    return {
      orgao: orgaoOptions,
      placa: placaOptions,
      modelo: modelOptions,
      cidadePosto: gasStationCityOptions,
      nomePosto: gasStationNameOptions
    };
  }
}
