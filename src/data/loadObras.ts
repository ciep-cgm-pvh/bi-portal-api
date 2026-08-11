import path from 'path';
import * as XLSX from 'xlsx';

/**
 * Fonte de dados de Obras.
 *
 * Origem: GPI módulo CPE -> Contabilidade / Listagem / Execução Contábil / Empenho.
 * O relatório é filtrado pelos elementos de despesa 4490.51 (Obras e Instalações),
 * 3390.39-16 (Manutenção e conserv. de bens imóveis) e 3390.39-21 (Manutenção e
 * conserv. de estradas e vias), excluindo a Câmara Municipal.
 *
 * O grão de cada linha é um EMPENHO. Um mesmo processo pode ter vários empenhos.
 *
 * TODO: substituir a leitura do arquivo local por uma rota do bi-portal-data
 * quando o processo de atualização automática estiver definido.
 */

const FILE_PATH = path.resolve(__dirname, '../../public/data/obras-empenhos.xlsx');
const SHEET_NAME = 'Listagem_de_Empenho';

export interface ObraEmpenhoRaw {
  [key: string]: any;
}

/**
 * O XLSX guarda datas como número serial (dias desde 1899-12-30).
 * Converte para ISO (yyyy-mm-dd) usando UTC para não sofrer deslocamento de fuso.
 */
export function excelSerialToISO(serial: any): string | null {
  if (serial === null || serial === undefined || serial === '') return null;

  // Já veio como string de data
  if (typeof serial === 'string') {
    const dmy = serial.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
    const ymd = serial.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (ymd) return `${ymd[1]}-${ymd[2]}-${ymd[3]}`;
    return null;
  }

  const n = Number(serial);
  if (!isFinite(n)) return null;

  // 25569 = dias entre 1899-12-30 e 1970-01-01
  const ms = Math.round((n - 25569) * 86400 * 1000);
  const date = new Date(ms);
  if (isNaN(date.getTime())) return null;

  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const num = (v: any): number => {
  if (v === null || v === undefined || v === '') return 0;
  const parsed = Number(String(v).replace(/\s+/g, '').replace(',', '.'));
  return isNaN(parsed) ? 0 : parsed;
};

const str = (v: any): string | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
};

/**
 * Aplica as regras de valor definidas no PASSO 6 do mapeamento da fonte.
 *
 * Empenhado = Valor Empenho Líquido
 * Liquidado = Valor Empenho Liquidado - Valor Empenho Liquidado Anulado
 * Pago      = Valor Empenho Pago
 *             + Valor Empenho Liquidado Desconto
 *             - Valor Empenho Pago Anulado
 *             - Valor Empenho Liquidado Desconto Anulado
 */
export function computeAmounts(row: ObraEmpenhoRaw) {
  const committedAmount = num(row['Valor Empenho Líquido']);

  const settledAmount =
    num(row['Valor Empenho Liquidado']) - num(row['Valor Empenho Liquidado Anulado']);

  const paidAmount =
    num(row['Valor Empenho Pago']) +
    num(row['Valor Empenho Liquidado Desconto']) -
    num(row['Valor Empenho Pago Anulado']) -
    num(row['Valor Empenho Liquidado Desconto Anulado']);

  return { committedAmount, settledAmount, paidAmount };
}

/**
 * Converte uma linha bruta da planilha no formato usado pela API/frontend.
 */
export function mapObraRow(row: ObraEmpenhoRaw, index: number) {
  const { committedAmount, settledAmount, paidAmount } = computeAmounts(row);
  const empenhoDate = excelSerialToISO(row['Data Empenho']);

  return {
    id: `${str(row['Nº Empenho']) ?? index}-${str(row['Ano Empenho']) ?? ''}-${index}`,
    empenhoNumber: str(row['Nº Empenho']),
    empenhoYear: row['Ano Empenho'] != null ? Number(row['Ano Empenho']) : null,
    empenhoDate,
    empenhoType: str(row['Tipo Empenho']),
    departmentCode: str(row['Órgão']),
    budgetUnit: str(row['Unidade Orçamentaria']),
    program: str(row['Programa']),
    projectActivity: str(row['Atividade Projeto']),
    expenseElement: str(row['Elemento de Despesa']),
    fundingSource: str(row['Fonte de Recurso']),
    subElement: str(row['SubElemento']),
    creditor: str(row['Credor']),
    creditorCode: str(row['Código Credor']),
    creditorDocument: str(row['CPF/CNPJ']),
    processNumber: str(row['N° Processo']),
    subject: str(row['Histórico Empenho']),
    contractNumber: str(row['Nº Contrato']),
    contractYear: row['Ano Contrato'] != null ? Number(row['Ano Contrato']) : null,
    committedAmount,
    settledAmount,
    paidAmount,
  };
}

export type ObraEmpenho = ReturnType<typeof mapObraRow>;

let cache: ObraEmpenho[] | null = null;

export function loadObras(): ObraEmpenho[] {
  if (cache) return cache;

  const workbook = XLSX.readFile(FILE_PATH);
  const sheet = workbook.Sheets[SHEET_NAME] ?? workbook.Sheets[workbook.SheetNames[0]];

  if (!sheet) {
    throw new Error(`Planilha de obras não encontrada em ${FILE_PATH}`);
  }

  const rows = XLSX.utils.sheet_to_json<ObraEmpenhoRaw>(sheet, { defval: null });
  cache = rows.map(mapObraRow);
  return cache;
}

/**
 * Data do empenho mais recente — usada como "última atualização" do painel
 * enquanto a carga é feita a partir do arquivo estático.
 */
export function getObrasLastUpdate(): string | null {
  const data = loadObras();
  const dates = data
    .map((row) => row.empenhoDate)
    .filter((d): d is string => Boolean(d))
    .sort();

  return dates.length ? dates[dates.length - 1] : null;
}
