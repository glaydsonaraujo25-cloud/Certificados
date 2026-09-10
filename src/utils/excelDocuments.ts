import * as XLSX from 'xlsx';
import { isValidCpf } from './validation.ts';
/** Only recover a lost leading zero when the resulting CPF passes both check digits. */
export function recoverExcelCpf(value: string): string {
  const text=value.trim().replace(/^'/,'');
  if(/^\d{1,10}$/.test(text)) {
    const padded=text.padStart(11,'0');
    if(isValidCpf(padded)) return padded;
  }
  return text;
}
export function createDriverWorkbook() {
  const ws=XLSX.utils.aoa_to_sheet([['nome','cpf','numero_registro','categoria_cnh']]);
  // Explicit text cells keep zeros when users type into the prepared rows.
  for(let row=1;row<=1000;row++) for(const col of [1,2]) ws[XLSX.utils.encode_cell({r:row,c:col})]={t:'s',v:'',z:'@'};
  ws['!ref']='A1:D1001';ws['!cols']=[{wch:38},{wch:18},{wch:20},{wch:18}];
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Condutores');
  const help=XLSX.utils.aoa_to_sheet([
    ['Como preencher'],['Digite os participantes na aba Condutores. As primeiras 1000 linhas de CPF e registro estão formatadas como Texto.'],
    ['CPF e registro devem conter 11 dígitos. Exemplo de formato: 01234567890 (não é um CPF válido).'],
    ['Ao colar, use Colar valores para preservar a formatação de Texto. Para mais linhas, copie uma linha vazia do modelo.'],
    ["Em planilhas antigas, use Texto antes de digitar ou coloque um apóstrofo antes do número, por exemplo '01234567890."],
    ['Se o Excel já removeu um zero, confira o documento original. A importação recupera zeros do CPF apenas se os dígitos verificadores forem válidos.']
  ]);help['!cols']=[{wch:120}];XLSX.utils.book_append_sheet(wb,help,'Instruções');return wb;
}
