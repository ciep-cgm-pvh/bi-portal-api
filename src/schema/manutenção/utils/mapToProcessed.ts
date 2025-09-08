// MapToProcessed.ts - Maps raw data to processed format for manutenção
import { ManutencaoProcessed } from './types';

function cleanKeys(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).map(([ key, value ]) => [
      key.trim().replace(/\uFEFF/g, ''), // remove BOM e espaços
      value
    ])
  );
}

export function mapToProcessed(rawData: any[]): ManutencaoProcessed[] {
  return rawData.map((originalItem, index) => {
    const item = cleanKeys(originalItem); 
    return {
    id:  String(index + 1),
    os: item.OS,
    datetime: item.Data,
    plate: item.Placa,
    numCard: item[ "Núm Cartão" ],
    prefixo: item.Prefixo ?? "N/A",
    typeFrota: item[ "Tipo Frota" ],
    brand: item.Marca,
    model: item.Modelo,
    year: item.Ano,
    patrimony: item.Patrimônio ?? "N/A",
    kmHorimetro: item[ "Km/Horímetro" ],
    estabelecimento: item.Estabelecimento,
    city: item.Cidade,
    uf: item.UF,
    cnpj: item.CNPJ,
    department: item.Subunidade,
    typeOs: item[ "Tipo OS" ],
    categoryOs: item[ "Categoria OS" ],
    nomeAprovador: item[ "Nome Aprovador" ],
    cpfAprovador: item[ "CPF Aprovador" ],
    nfPecas: item[ "NF Peças" ],
    nfMdo: item[ "NF MDO" ],
    nfConjugada: item[ "NF Conjugada" ],
    declaracao: item.Declaração,
    correcao: item.Correção,
    condutorEntregou: item[ "Condutor que entregou" ],
    condutorRetirou: item[ "Condutor que retirou" ],
    responsavelTecnico: item[ "Responsável Técnico" ],
    totalMdo: item[ "Total MDO" ],
    discountTaxaMdo: item[ "Taxa desconto MDO" ],
    mdoDiscount: item[ "MDO com desconto" ],
    totalPecas: item[ "Total Peças" ],
    discountTaxaPecas: item[ "Taxa desconto Peças" ],
    pecasWithDiscount: item[ "Peças com desconto" ],
    totalWithoutDiscount: item[ "Total s/ desc." ],
    totalCost: item.Total,
    client: item.Cliente,
    secretaria: item.Secretaria,
    period: item.Periodo ?? "N/A",
    archive: item.Arquivo
    }
  });
}
