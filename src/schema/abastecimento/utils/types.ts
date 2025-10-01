// src/schema/abastecimento/utils/types.ts

// Interface para o filtro de intervalo de datas
interface DateRange {
  from: string | Date;
  to: string | Date;
}

// Filtros principais, usados nos KPIs e Gráficos
export interface AbastecimentoFilters {
  dateRange?: DateRange;
  fuelType?: string;
  vehiclePlate?: string;
  vehicleBrand?: string;
  driverName?: string;
  department?: string;
  vehicleModel?: string;
  gasStationCity?: string;
  gasStationName?: string;
  excludePostoInterno?: boolean;
}

// Filtros específicos da tabela, que geralmente permitem busca por arrays
export interface AbastecimentoTableFilters {
  datetime?: string;
  cost?: string;
  fuelVolume?: string;
  fuelType?: string[];
  driverName?: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  vehicleBrand?: string;
  gasStationName?: string[];
  gasStationCity?: string[];
  department?: string[];
}

// Filtros para a query que busca as opções de filtro
export interface AbastecimentoOptionsFilters {
  dateRange?: DateRange;
  fuelType?: string;
  vehiclePlate?: string;
  department?: string;
  vehicleModel?: string;
  gasStationCity?: string;
  gasStationName?: string;
  excludePostoInterno?: boolean;
}