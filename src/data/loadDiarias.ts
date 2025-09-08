// src/data/loadDiarias.ts
import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';

export function loadDiarias() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'DIÁRIAS - 01.012023 A 30.06.2025.xlsx');

    if (!fs.existsSync(filePath)) {
      console.error('Diarias file not found:', filePath);
      return [];
    }

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[ workbook.SheetNames[ 0 ] ];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: null });
    return data;
  } catch (error) {
    console.error('Error loading diarias data:', error);
    return [];
  }
}
