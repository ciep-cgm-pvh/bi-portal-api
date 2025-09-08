// src/data/loadAbastecimento.ts
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { Abastecimento } from '../schema/abastecimento/utils/types';

export function loadAbastecimento(): Abastecimento[] {
  try {
    // For Vercel, files should be in the root or accessible path
    const filePath = path.join(process.cwd(), 'public', 'data', 'Abastecimentos31_07_2025 - prefeitura - geral.csv');

    // Check if file exists before reading
    if (!fs.existsSync(filePath)) {
      console.error('Abastecimento file not found:', filePath);
      return [];
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');

    const data = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    return data as Abastecimento[];
  } catch (error) {
    console.error('Error loading abastecimento data:', error);
    return [];
  }
}