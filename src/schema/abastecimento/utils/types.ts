// types.ts - Abastecimento
export interface Abastecimento {
  Data: string;
  Hora: string;
  KM: number;
  KM_Anterior: number;
  Numero_Cartao: string;
  Combustivel: string;
  Qtde_Combustivel_Abastecido: number;
  Valor_Abastecimento: number;
  Cidade_Posto: string;
  Nome_Posto: string;
  Endereco_Posto: string;
  Matricula_Condutor: string;
  Nome_Condutor: string;
  Orgao: string;
  OrgaoUnificado?: string;
  Sub_Unidade: string;
  Modelo: string;
  Placa: string;
  Prefixo: string;
  Marca: string;
  Renavam: string;
  Ano: number;
  Capacidade_Tanque: number;
  Chassi: string;
  Cor: string;
  Motorizacao: string;
  Cidade_Veiculo: string;
  Centro_Custo: string;
}

export interface AbastecimentoProcessed {
  id: string;
  datetime: string;
  cost: number;
  fuelVolume: number;
  fuelType: string;
  driverName: string;

  vehicle: {
    plate: string;
    model: string;
    brand: string;
    km: number;
  };

  gasStation: {
    name: string;
    city: string;
  };

  department: string;
  costCenter: string;
}

export interface AbastecimentoFilters {
  dateRange: { from: string; to: string; };
  vehiclePlate: string;
  vehicleModel:  string;
  gasStationName: string;
  gasStationCity: string;
  department: string;
  excludePostoInterno: boolean
}
export interface AbastecimentoOptionsFilters {
  dateRange: { from: string; to: string; };
  vehiclePlate: string;
  vehicleModel:  string;
  gasStationName: string;
  gasStationCity: string;
  department: string;
  excludePostoInterno: boolean
}

export interface AbastecimentoTableFilters {
  datetime: string;
  cost: string;
  fuelVolume: string;
  fuelType: string;
  driverName: string;
  vehiclePlate: string;
  vehicleModel: string ;
  vehicleBrand: string;
  gasStationName: string ;
  gasStationCity: string ;
  department: string;
}

export interface ProcessedAbastecimentoRow {
  [ key: string ]: any;
}