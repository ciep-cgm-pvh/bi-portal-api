// import { parse } from 'csv-parse/sync';
// import fs from 'fs';
// import path from 'path';
// import { Abastecimento } from '../schema/abastecimento/utils/types';

// export function loadAbastecimento(): Abastecimento[] {
//   const filePath = path.resolve(__dirname, '../../public/data/relatorio_consolidado_abastecimento.csv');
//   const fileContent = fs.readFileSync(filePath, 'utf8');

//   const data = parse(fileContent, {
//     columns: true, // usa a primeira linha como nomes das colunas
//     skip_empty_lines: true,
//     trim: true, // remove espaços em branco no início e no final de cada campo
//   })

//   return data as Abastecimento[];
// }


import axios from "axios";

const BASE_URL = "https://bi-portal-data.vercel.app/api/abastecimento";

export async function getAbastecimentoData(path: string, filters?: Record<string, any>) {
  try {
    const query = buildQueryParams(filters || {});
    const url = `${BASE_URL}/${path}${query}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`❌ Erro ao buscar ${path}:`, error);
    throw new Error(`Erro ao acessar ${path}`);
  }
}

function buildQueryParams(params: Record<string, any>) {
  const query = Object.entries(params)
    .filter(([ _, value ]) => value !== undefined && value !== null && value !== "")
    .map(([ key, value ]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  return query ? `?${query}` : "";
}


