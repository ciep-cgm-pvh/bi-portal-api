import axios from "axios";

/**
 * Acesso aos dados de Contratos de Repasses / Convênios, servidos pelo
 * bi-portal-data.
 *
 * Origem: aba PRATA da planilha "TOP - OBRAS BI", a mesma que alimenta o
 * painel no Looker Studio. O grão de cada registro é um contrato/convênio.
 */

const BASE_URL = `${process.env.DATA_API_URL}/api/contratos`;

export async function getContratosData(path: string, filters?: Record<string, any>) {
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
    console.error(`❌ Erro ao buscar rota de Contratos - ${path}:`, error);
    throw new Error(`Erro ao acessar rota de Contratos - ${path}`);
  }
}

function buildQueryParams(params: Record<string, any>) {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  return query ? `?${query}` : "";
}
