// mapToProcessed.ts - Abastecimento
import { Processor } from '../../../utils/processor';
import { AbastecimentoProcessed, ProcessedAbastecimentoRow } from './types';
import { AbastecimentoFilters, AbastecimentoTableFilters } from './types';

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
    let lastKm: number | undefined = undefined;

    rows.forEach((row, index) => {
      const currentKm = Number(row[ "KM/Horímetro" ] || 0);
      const kmRodado = lastKm !== undefined ? currentKm - lastKm : 0;
      processed.push({
        id: String(processed.length + 1),
        datetime: Processor.formatDatePTBR(row.Data),
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

        department: row.Subunidade,
      })
    });
  });

  return processed;
}

/**
 * Converte os filtros recebidos do front (camelCase)
 * para o formato aceito pela API Flask (snake_case).
 */
export function mapFiltersToApiParams(
  filters?: Partial<AbastecimentoFilters>,
  tableFilters?: Partial<AbastecimentoTableFilters>
): Record<string, string> {
  const params: Record<string, string> = {};

  // === 🗓️ Intervalo de data (vem sempre do filtro global) ===
  if (filters?.dateRange?.from) params.data_inicial = filters.dateRange.from;
  if (filters?.dateRange?.to) params.data_final = filters.dateRange.to;

  // === Filtro de posto inteno (global) ===
  if (filters?.excludePostoInterno) params.tipo_posto = "externo";

  // === Combina os filtros (global tem prioridade) ===
  const mergeFilters = { ...filters, ...tableFilters };

  // Mapeia cada filtro apenas se tiver valor válido
  const addParam = (key: string, value: any) => {
    if (value !== undefined && value !== null && value !== "") {
      params[ key ] = String(value);
    }
  };

  addParam("datetime_val", mergeFilters.datetime);
  addParam("placa", mergeFilters.vehiclePlate);
  addParam("modelo", mergeFilters.vehicleModel);
  addParam("marca", mergeFilters.vehicleBrand);
  addParam("posto_nome", mergeFilters.gasStationName);
  addParam("posto_cidade", mergeFilters.gasStationCity);
  addParam("departamento", mergeFilters.department);
  addParam("motorista", mergeFilters.driverName);
  addParam("tipo_combustivel", mergeFilters.fuelType);
  addParam("valor", mergeFilters.cost);
  addParam("litros", mergeFilters.fuelVolume);

  return params;
}
