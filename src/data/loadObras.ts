import axios from "axios";

/**
 * Acesso aos dados de Obras, servidos pelo bi-portal-data.
 *
 * Origem: Listagem de Empenho do GPI módulo CPE, filtrada pelos elementos de
 * despesa 4490.51, 3390.39-16 e 3390.39-21. O grão de cada registro é um
 * EMPENHO — um mesmo processo pode reunir vários.
 *
 * As regras de valor (empenhado / liquidado / pago) são aplicadas no ETL do
 * bi-portal-data, em scripts/obras/gerar_banco.py.
 */

const BASE_URL = `${process.env.DATA_API_URL}/api/obras`;

export async function getObrasData(path: string, filters?: Record<string, any>) {
  try {
    const query = buildQueryParams(filters || {});
    const url = `${BASE_URL}/${path}${query}`;

    const response = await axios.get(url, {
      headers: {
        'X-API-Key': process.env.API_SECRET_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Erro ao buscar rota de Obras - ${path}:`, error);
    throw new Error(`Erro ao acessar rota de Obras - ${path}`);
  }
}

function buildQueryParams(params: Record<string, any>) {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  return query ? `?${query}` : "";
}
