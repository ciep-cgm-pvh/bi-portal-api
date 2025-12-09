export const orgaoList = [
  { id: "02", nome_orgao: "02 - SECRETARIA DE GOVERNO (SGOV)", sigla: "SGOV" },
  { id: "02", nome_orgao: "02 - SECRETARIA GERAL DE GOVERNO - SGG", sigla: "SGOV" },
  { id: "03", nome_orgao: "03 - CONTROLADORIA GERAL DO MUNICÍPIO - CGM", sigla: "CGM" },
  { id: "04", nome_orgao: "04 - PROCURADORIA GERAL DO MUNICÍPIO - PGM", sigla: "PGM" },
  { id: "05", nome_orgao: "05 - SECR. MUN. PLANEJ. ORC. E GESTAO- SEMPOG", sigla: "SEMEC" },
  { id: "06", nome_orgao: "06 - SECRETARIA DE ECONOMIA (SEMEC)", sigla: "SEMEC" },
  { id: "06", nome_orgao: "06 - SECRETARIA MUNICIPAL DE FAZENDA - SEMFAZ", sigla: "SEMEC" },
  { id: "07", nome_orgao: "07 - SECRETARIA MUN. DE ADMINISTRAÇÃO - SEMAD", sigla: "SEMAD" },
  { id: "07", nome_orgao: "07 - SECRETARIA MUNICIPAL DE ADMINISTRAÇÃO (SEMAD)", sigla: "SEMAD" },
  { id: "08", nome_orgao: "08 - SECRETARIA MUNICIPAL DE SAÚDE - SEMUSA", sigla: "SEMUSA" },
  { id: "08", nome_orgao: "08 - SECRETARIA MUNICIPAL DE SAÚDE (SEMUSA)", sigla: "SEMUSA" },
  { id: "09", nome_orgao: "09 - SECRETARIA MUNICIPAL DE EDUCAÇÃO - SEMED", sigla: "SEMED" },
  { id: "09", nome_orgao: "09 - SECRETARIA MUNICIPAL DE EDUCAÇÃO (SEMED)", sigla: "SEMED" },
  { id: "10", nome_orgao: "10 - SECR.MUN.DE SERVIÇOS BÁSICOS - SEMUSB", sigla: "SEINFRA" },
  { id: "11", nome_orgao: "11 - SECR. MUN. DE OBRAS E PAVIMENTAÇÃO", sigla: "SEINFRA" },
  { id: "11", nome_orgao: "11 - SECRETARIA MUNICIPAL DE INFRAESTRUTURA (SEINFRA)", sigla: "SEINFRA" },
  { id: "12", nome_orgao: "12 - SECR.MUN.ASS.SOCIAL E DA FAMILIA-SEMASF", sigla: "SEMIAS" },
  { id: "12", nome_orgao: "12 - SECRETARIA MUNICIPAL DE INCLUSÃO E ASSISTÊNCIA SOCIAL (SEMIAS)", sigla: "SEMIAS" },
  { id: "13", nome_orgao: "13 - SECRETARIA MUNICIPAL DE ESPORTES E LAZER", sigla: "SEMTEL" },
  { id: "13", nome_orgao: "13 - SECRETARIA MUNICIPAL DE TURISMO, ESPORTE E LAZER (SEMTEL)", sigla: "SEMTEL" },
  { id: "14", nome_orgao: "14 - SECR.MUN.DE TRANSITO, MOB e TRANSPORTES", sigla: "SEMTRAN" },
  { id: "14", nome_orgao: "14 - SECRETARIA MUNICIPAL DE SEGURANÇA, TRÂNSITO E MOBILIDADE (SEMTRAN)", sigla: "SEMTRAN" },
  { id: "15", nome_orgao: "15 - SECR. MUN. DE AGRIC. E ABASTEC.-SEMAGRIC", sigla: "SEMAGRIC" },
  { id: "15", nome_orgao: "15 - SECRETARIA MUNICIPAL DE AGRICULTURA, PECUÁRIA E ABASTECIMENTO (SEMAGRIC)", sigla: "SEMAGRIC" },
  { id: "16", nome_orgao: "16 - SECR.MUN.DE MEIO AMBIENTE E DESENV.SUST.", sigla: "SEMA" },
  { id: "16", nome_orgao: "16 - SECRETARIA MUNICIPAL DE MEIO AMBIENTE E DESENVOLVIMENTO SUSTENTÁVEL (SEMA)", sigla: "SEMA" },
  { id: "17", nome_orgao: "17 - SECR. MUN.DE IND. COM.TURISMO E TRABALH0", sigla: "SEMTEL" },
  { id: "17", nome_orgao: "17 - SECR. MUN.DE IND. COM.TURISMO E TRABALHO", sigla: "SEMTEL" },
  { id: "18", nome_orgao: "18 - SECR.MUN.DE REGULAR.FUNDIÁRIA HAB.E URB.", sigla: "SEMDEC" },
  { id: "18", nome_orgao: "18 - SECRETARIA MUNICIPAL DE DESENVOLVIMENTO DA CIDADE (SEMDEC)", sigla: "SEMDEC" },
  { id: "23", nome_orgao: "23 - SECR MUN DE RESOL  ESTRAT CONV E CONTRAT", sigla: "SMCL" },
  { id: "23", nome_orgao: "23 - SECRETARIA MUNICIPAL DE CONTRATOS, CONVÊNIOS E LICITAÇÕES (SMCL)", sigla: "SMCL" },
  { id: "24", nome_orgao: "24 - Secretaria Municipal de Comunicação - SECOM", sigla: "SECOM" }
];


export const idToOfficialSigla: Record<string, string> = {
  "02": "SGOV",
  "03": "CGM",
  "04": "PGM",
  "05": "SEMEC",
  "06": "SEMEC",
  "07": "SEMAD",
  "08": "SEMUSA",
  "09": "SEMED",
  "10": "SEINFRA",
  "11": "SEINFRA",
  "12": "SEMIAS",
  "13": "SEMTEL",
  "14": "SEMTRAN",
  "15": "SEMAGRIC",
  "16": "SEMA",
  "17": "SEMTEL",
  "18": "SEMDEC",
  "23": "SMCL",
  "24": "SECOM"
};

export const unificationMap = new Map<string, string>();
orgaoList.forEach(item => {
  if (item.id && idToOfficialSigla[ item.id ]) {
    unificationMap.set(item.nome_orgao, idToOfficialSigla[ item.id ]);
  } else {
    unificationMap.set(item.nome_orgao, item.sigla || item.nome_orgao);
  }
});
