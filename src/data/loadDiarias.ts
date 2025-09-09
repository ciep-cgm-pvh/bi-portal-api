import path from 'path';
import * as XLSX from 'xlsx';

export function loadDiarias() {
  const filePath = path.resolve(__dirname, '../../public/data/DIÁRIAS - 01.012023 A 30.06.2025.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[ workbook.SheetNames[ 0 ] ];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: null });
  return data;
}
