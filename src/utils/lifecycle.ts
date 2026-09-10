import type { Certificate, CourseClass } from '../types';
export function localToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}
export function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
}
export function expiryDate(end: string, years: number): string {
  if (!validDate(end) || !Number.isInteger(years) || years < 1 || years > 20) throw new Error('Informe término e validade entre 1 e 20 anos.');
  const [year,month,day]=end.split('-').map(Number);
  const last = new Date(Date.UTC(year+years,month,0)).getUTCDate();
  return `${year+years}-${String(month).padStart(2,'0')}-${String(Math.min(day,last)).padStart(2,'0')}`;
}
export function certificateState(cert: Pick<Certificate,'status'|'expiresAt'>, today=localToday()) {
  if (cert.status==='cancelled') return 'cancelled';
  if (cert.status==='expired' || (cert.expiresAt && cert.expiresAt<today)) return 'expired';
  if (!cert.expiresAt) return 'unknown';
  const days=(Date.parse(cert.expiresAt)-Date.parse(today))/86400000;
  return days<=60 ? 'soon' : 'active';
}
export const stateLabels={cancelled:'Cancelado',expired:'Vencido',unknown:'Validade não informada',soon:'Vence em até 60 dias',active:'Ativo'};
export function validateClass(value: Omit<CourseClass,'id'|'createdAt'>) {
  if(!value.name.trim() || !value.instructorName.trim()) throw new Error('Informe nome da turma e instrutor.');
  if(!validDate(value.startDate)||!validDate(value.endDate)||value.startDate>value.endDate) throw new Error('Revise o período da turma.');
  if(!Number.isInteger(value.validityYears)||value.validityYears!<1||value.validityYears!>20) throw new Error('Validade deve ser de 1 a 20 anos.');
}
