// src/data/loadManutencao.ts
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

export function loadManutencao(): any {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'manutencao_unificada.csv');

    if (!fs.existsSync(filePath)) {
      console.error('Manutencao file not found:', filePath);
      return [];
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');

    const data = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      
    });
    return data;
  } catch (error) {
    console.error('Error loading manutencao data:', error);
    return [];
  }
}