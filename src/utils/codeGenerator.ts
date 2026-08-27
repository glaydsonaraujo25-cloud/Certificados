/** Gera códigos públicos únicos para os certificados. */
export function generateCertificateCode(
  existingCodes: string[] = [],
  format: 'sequential' | 'alphanumeric' | 'cvte' = 'cvte'
): string {
  const year = new Date().getFullYear();

  if (format === 'cvte') {
    let nextNumber = 1;
    const yearSuffix = `/CVTE/${year}`;
    existingCodes.filter((code) => code.endsWith(yearSuffix)).forEach((code) => {
      const numPart = parseInt(code.split('/')[0], 10);
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
    existingCodes.filter((code) => code.startsWith(yearPrefix)).forEach((code) => {
      const numPart = parseInt(code.replace(yearPrefix, ''), 10);
      if (!Number.isNaN(numPart) && numPart >= nextNumber) nextNumber = numPart + 1;
    });
    let code = `${yearPrefix}${String(nextNumber).padStart(6, '0')}`;
    while (existingCodes.includes(code)) {
      nextNumber += 1;
      code = `${yearPrefix}${String(nextNumber).padStart(6, '0')}`;
    }
    return code;
  }

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  do {
    let randomPart = '';
    for (let i = 0; i < 6; i += 1) randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    code = `CERT-${year}-${randomPart}`;
  } while (existingCodes.includes(code));
  return code;
}
