import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

export function loadManutencao(): any {
  const filePath = path.resolve(__dirname, '../../public/data/manutencao_unificada.csv');
  const fileContent = fs.readFileSync(filePath, 'utf8');

  const data = parse(fileContent, {
    columns: true, // usa a primeira linha como nomes das colunas
    skip_empty_lines: true,
    trim: true, // remove espaços em branco no início e no final de cada campo
  })
  return data;
}
