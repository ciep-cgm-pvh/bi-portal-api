// mapToProcessed.ts - Abastecimento
import { AbastecimentoProcessed, ProcessedAbastecimentoRow } from './types';

export function mapToProcessed(data: ProcessedAbastecimentoRow[]): AbastecimentoProcessed[] {
  return data.map((row, index) => ({
    id: String(index + 1),
    datetime: row.Data && row.Hora ? `${row.Data} ${row.Hora}` : row.Data || '',

    cost: Number(row.Valor_Abastecimento || 0),
    fuelVolume: Number(row.Qtde_Combustivel_Abastecido || 0),
    fuelType: row.Combustivel || '',
    driverName: row.Nome_Condutor || '',

    vehicle: {
      plate: row.Placa || '',
      model: row.Modelo || '',
      brand: row.Marca || '',
      km: row.KM - row.KM_Anterior,
    },

    gasStation: {
      name: row.Nome_Posto || '',
      city: row.Cidade_Posto || '',
    },

    department: row.OrgaoUnificado || row.Orgao || '',
    costCenter: row.Centro_Custo || '',
  }));
}
