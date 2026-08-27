/**
 * Gera códigos públicos únicos de autenticidade, como 006/OCIA/2026,
 * CERT-2026-000001 ou CERT-2026-A8F42X.
 *
 * O identificador interno `cvte` é mantido temporariamente por compatibilidade
 * com configurações antigas já salvas no navegador, mas agora gera o padrão
 * OCIA (Operador de Computador com IA).
 */
export function generateCertificateCode(
  existingCodes: string[] = [],
  format: 'sequential' | 'alphanumeric' | 'cvte' = 'cvte'
): string {
  const year = new Date().getFullYear();

  if (format === 'cvte') {
    let nextNumber = 1;
    const yearSuffix = `/OCIA/${year}`;
    const courseCodes = existingCodes.filter((code) => code.endsWith(yearSuffix));

    courseCodes.forEach((code) => {
      const parts = code.split('/');
      const numPart = parseInt(parts[0], 10);
      if (!Number.isNaN(numPart) && numPart >= nextNumber) nextNumber = numPart + 1;
    });

    let code = `${String(nextNumber).padStart(3, '0')}${yearSuffix}`;
    while (existingCodes.includes(code)) {
      nextNumber += 1;
      code = `${String(nextNumber).padStart(3, '0')}${yearSuffix}`;
    }
    return code;
  }

  if (format === 'sequential') {
    let nextNumber = 1;
    const yearPrefix = `CERT-${year}-`;
    const yearCodes = existingCodes.filter((code) => code.startsWith(yearPrefix));

    yearCodes.forEach((code) => {
      const numPart = parseInt(code.replace(yearPrefix, ''), 10);
      if (!Number.isNaN(numPart) && numPart >= nextNumber) nextNumber = numPart + 1;
    });

    let seqCode = `${yearPrefix}${String(nextNumber).padStart(6, '0')}`;
    while (existingCodes.includes(seqCode)) {
      nextNumber += 1;
      seqCode = `${yearPrefix}${String(nextNumber).padStart(6, '0')}`;
    }
    return seqCode;
  }

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  let attempts = 0;
  do {
    let randomPart = '';
    for (let i = 0; i < 6; i += 1) randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    code = `CERT-${year}-${randomPart}`;
    attempts += 1;
  } while (existingCodes.includes(code) && attempts < 100);

  return code;
}
