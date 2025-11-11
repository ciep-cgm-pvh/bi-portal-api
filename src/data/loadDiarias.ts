import path from 'path';
import * as XLSX from 'xlsx';

// export function loadDiarias() {
//   const filePath = path.resolve(__dirname, '../../public/data/DIÁRIAS - 01.012023 A 30.06.2025.xlsx');
//   const workbook = XLSX.readFile(filePath);
//   const sheet = workbook.Sheets[ workbook.SheetNames[ 0 ] ];
//   const data = XLSX.utils.sheet_to_json(sheet, { defval: null });
//   return data;
// }

import axios from "axios";

const BASE_URL = "https://bi-portal-data.vercel.app/api/diarias";

export async function getDiariasData(path: string, filters?: Record<string, any>) {
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
    console.error(`❌ Erro ao buscar rota de Diarias - ${path}:`, error);
    throw new Error(`Erro ao acessar rota de Diarias - ${path}`);
  }
}

function buildQueryParams(params: Record<string, any>) {
  const query = Object.entries(params)
    .filter(([ _, value ]) => value !== undefined && value !== null && value !== "")
    .map(([ key, value ]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  return query ? `?${query}` : "";
}


