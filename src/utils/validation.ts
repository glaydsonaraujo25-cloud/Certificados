import type { Student } from '../types';
export const documentDigits = (value: string) => value.replace(/\D/g, '');
export function isValidCpf(value: string): boolean {
  const digits = documentDigits(value);
  if (!/^\d{11}$/.test(digits) || /^(\d)\1{10}$/.test(digits)) return false;
  return [9, 10].every(length => {
    let sum = 0;
    for (let i = 0; i < length; i++) sum += Number(digits[i]) * (length + 1 - i);
    const remainder = (sum * 10) % 11;
    return Number(digits[length]) === (remainder === 10 ? 0 : remainder);
  });
}
export function matchesStudent(student: Student, query: string): boolean {
  const text = query.trim().toLocaleLowerCase('pt-BR');
  const digits = documentDigits(text);
  return !text || student.fullName.toLocaleLowerCase('pt-BR').includes(text)
    || (student.email || '').toLowerCase().includes(text)
    || Boolean(digits && (documentDigits(student.documentNumber || '').includes(digits)
      || documentDigits(student.registrationNumber || '').includes(digits)));
}
