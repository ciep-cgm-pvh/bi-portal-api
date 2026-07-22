import axios from "axios";

const BASE_URL = `${process.env.DATA_API_URL}/api/abastecimento`;

export async function getAbastecimentoData(path: string, filters?: Record<string, any>) {
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
    console.error(`❌ Erro ao buscar rota de Abastecimento - ${path}:`, error);
    throw new Error(`Erro ao acessar rota de Abastecimento - ${path}`);
  }
}

function buildQueryParams(params: Record<string, any>) {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  return query ? `?${query}` : "";
}
