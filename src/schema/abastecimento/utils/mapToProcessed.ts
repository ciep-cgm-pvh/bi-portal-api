// mapToProcessed.ts - Abastecimento
import { AbastecimentoProcessed, ProcessedAbastecimentoRow } from './types';

export function mapToProcessed(data: ProcessedAbastecimentoRow[]): AbastecimentoProcessed[] {
  // Agrupar por placa
  const grouped = data.reduce<Record<string, ProcessedAbastecimentoRow[]>>((acc, row) => {
    const plate = row.Placa;
    acc[ plate ] = acc[ plate ] || [];
    acc[ plate ].push(row);
    return acc;
  }, {});

  // Calcular o KM rodado por placa
  const processed: AbastecimentoProcessed[] = [];

  Object.values(grouped).forEach((rows) => {
    const parseDate = (d: string) => {
      const [ day, month, year ] = d.split('/');
      return new Date(`${year}-${month}-${day}`);
    };
    rows.sort((a, b) => parseDate(a.Data).getTime() - parseDate(b.Data).getTime());

    let lastKm: number | undefined = undefined;

    rows.forEach((row, index) => {
      const currentKm = Number(row[ "KM/Horímetro" ] || 0);
      const kmRodado = lastKm !== undefined ? currentKm - lastKm : 0;

      processed.push({
        id: String(processed.length + 1),
        datetime: (row.Data),
        cost: Number(row[ "Valor Bruto" ] || 0),
        fuelVolume: Number(row[ "Qtde (L)" ] || 0),
        fuelType: row[ "Combustível" ] || '',
        driverName: row.Condutor || '',
        km: currentKm, // novo campo calculado

        vehicle: {
          plate: row.Placa || '',
          model: row[ "Modelo Veículo" ] || '',
          brand: row.Marca || '',
          kmRodado, // novo campo
        },

        gasStation: {
          name: row.Posto || '',
          city: row.Cidade || '',
        },

        department: row.OrgaoUnificado || row.Orgao || row.Subunidade,
      });

      lastKm = currentKm;
    });
  });

  return processed;
}

// src/modules/abastecimento/utils/mapFilters.ts
import { AbastecimentoFilters, AbastecimentoTableFilters } from './types';

/**
 * Converte os filtros recebidos do front (camelCase)
 * para o formato aceito pela API Flask (snake_case).
 */
export function mapFiltersToApiParams(
  filters?: Partial<AbastecimentoFilters & AbastecimentoTableFilters>
): Record<string, string> {
  if (!filters) return {};

  const params: Record<string, string> = {};

  // === 🗓️ Intervalo de data ===
  if (filters.dateRange?.from) {
    params.data_inicial = filters.dateRange.from;
  }
  if (filters.dateRange?.to) {
    params.data_final = filters.dateRange.to;
  }
  if (filters.datetime) {
    params.datetime_val = filters.datetime;
  }

  if (filters.vehiclePlate) params.placa = filters.vehiclePlate;
  if (filters.vehicleModel) params.modelo = filters.vehicleModel;
  if (filters.vehicleBrand) params.marca = filters.vehicleBrand;

  if (filters.gasStationName) params.posto_nome = filters.gasStationName;
  if (filters.gasStationCity) params.posto_cidade = filters.gasStationCity;

  if (filters.department) params.departamento = filters.department;
  if (filters.driverName) params.motorista = filters.driverName;
  if (filters.fuelType) params.tipo_combustivel = filters.fuelType;

  if (filters.cost) params.valor = filters.cost;
  if (filters.fuelVolume) params.litros = filters.fuelVolume;

  if (filters.excludePostoInterno) {
    params.tipo_posto = 'externo';
  }

  for (const key in params) {
    if (!params[ key ]) delete params[ key ];
  }

  return params;
}

