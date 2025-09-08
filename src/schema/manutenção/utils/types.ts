// type.ts - Manutenção 
export interface Manutencao {
  id: string
  os: string
  data: string
  placa: string
  numCartao: string
  prefixo: string
  tipoFrota: string
  marca: string
  modelo: string
  ano: string
  patrimonio: string
  kmHorimetro: number
  estabelecimento: string
  cidade: string
  uf: string
  cnpj: string
  unidade: string
  subunidade: string
  tipoOs: string
  categoriaOs: string
  nomeAprovador: string
  cpfAprovador: string
  nfPecas: string
  nfMdo: string
  nfConjugada: string
  declaracao: string
  correcao: string
  condutorEntregou: string
  condutorRetirou: string
  responsavelTecnico: string
  totalMdo: number
  taxaDescontoMdo: number
  mdoComDesconto: number
  totalPecas: number
  taxaDescontoPecas: number
  pecasComDesconto: number
  totalSemDesconto: number
  total: number
  cliente: string
  secretaria: string
  periodo: string
  arquivo: string
}

// type.ts - Manutenção 
export interface ManutencaoProcessed {
  id: string
  os: number
  datetime: string
  plate: string
  numCard: string
  prefixo: string
  typeFrota: string
  brand: string
  model: string
  year: string
  patrimony: string
  kmHorimetro: number
  estabelecimento: string
  city: string
  uf: string
  cnpj: string
  department: string
  typeOs: string
  categoryOs: string
  nomeAprovador: string
  cpfAprovador: string
  nfPecas: string
  nfMdo: string
  nfConjugada: string
  declaracao: string
  correcao: string
  condutorEntregou: string
  condutorRetirou: string
  responsavelTecnico: string
  totalMdo: number
  discountTaxaMdo: number
  mdoDiscount: number
  totalPecas: number
  discountTaxaPecas: number
  pecasWithDiscount: number
  totalWithoutDiscount: number
  totalCost: number
  client: string
  secretaria: string
  period: string
  archive: string
}

export interface ManutencaoFilters {
  dateRange: { from: string; to: string; };
  department: string
  plate: string
  categoryOs: string
 }
export interface ManutencaoTableFilters {
  datetime: string
  os: number
  department: string
  plate: string
  categoryOs: string
  totalCost: number
 }

export interface ProcessedManutencaoRow {
  [ key: string ]: any;
}