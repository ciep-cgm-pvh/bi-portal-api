// src/data/loadSuprimento.ts
import axios from 'axios';

const API_BASE_URL = `${process.env.DATA_API_URL}/api/suprimento`;
const API_KEY = process.env.DATA_API_KEY;

function buildQueryParams(filters?: Record<string, any>): string {
    if (!filters) return '';
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
        }
    }
    return params.toString();
}

export async function getSuprimentoData(path: string, filters?: Record<string, any>) {
    const queryParams = buildQueryParams(filters);
    const url = `${API_BASE_URL}/${path}${queryParams ? `?${queryParams}` : ''}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'X-API-Key': API_KEY,
                'Accept': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        // Em caso de erro, retorna um objeto com uma estrutura esperada para evitar quebrar o serviço
        if (path.includes('kpi') || path.includes('dashboard')) {
            return { resultados: [] };
        }
        return [];
    }
}