import * as XLSX from 'xlsx';
import { isValidCpf } from './validation.ts';
export function normalizeSpreadsheetHeader(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
}
/** Only recover a lost leading zero when the resulting CPF passes both check digits. */
export function recoverExcelCpf(value: string): string {
  const text=value.trim().replace(/^'/,'');
  if(/^\d{1,10}$/.test(text)) {
    const padded=text.padStart(11,'0');
    if(isValidCpf(padded)) return padded;
  }
  return text;
}
export function createDriverWorkbook(syllabus: Array<{discipline:string}> = []) {
  const noteHeaders=syllabus.map((item,index)=>`nota_${index+1}_${normalizeSpreadsheetHeader(item.discipline)}`);
  const headers=['nome','cpf','numero_registro','categoria_cnh',...noteHeaders];
  const ws=XLSX.utils.aoa_to_sheet([headers]);
  // Explicit text cells keep zeros when users type into the prepared rows.
  for(let row=1;row<=1000;row++) for(const col of [1,2]) ws[XLSX.utils.encode_cell({r:row,c:col})]={t:'s',v:'',z:'@'};
  ws['!ref']=`A1:${XLSX.utils.encode_col(headers.length-1)}1001`;ws['!cols']=[{wch:38},{wch:18},{wch:20},{wch:18},...noteHeaders.map(()=>({wch:28}))];
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Condutores');
  const help=XLSX.utils.aoa_to_sheet([
    ['Como preencher'],['Digite os participantes e as notas na aba Condutores. Cada disciplina possui uma coluna nota_*. As primeiras 1000 linhas de CPF e registro estão formatadas como Texto.'],
    ['As notas devem estar entre 0 e 10. Deixe a célula vazia para usar a avaliação padrão configurada no curso.'],
    ['CPF e registro devem conter 11 dígitos. Exemplo de formato: 01234567890 (não é um CPF válido).'],
    ['Ao colar, use Colar valores para preservar a formatação de Texto. Para mais linhas, copie uma linha vazia do modelo.'],
    ["Em planilhas antigas, use Texto antes de digitar ou coloque um apóstrofo antes do número, por exemplo '01234567890."],
    ['Se o Excel já removeu um zero, confira o documento original. A importação recupera zeros do CPF apenas se os dígitos verificadores forem válidos.']
  ]);help['!cols']=[{wch:120}];XLSX.utils.book_append_sheet(wb,help,'Instruções');return wb;
}
