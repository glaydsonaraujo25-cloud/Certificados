/**
 * Generates unique authenticity codes like 006/CVTE/2026, CERT-2026-000001 or CERT-2026-A8F42X
 */
export function generateCertificateCode(
  existingCodes: string[] = [],
  format: 'sequential' | 'alphanumeric' | 'cvte' = 'cvte'
): string {
  const year = new Date().getFullYear();

  if (format === 'cvte') {
    let nextNumber = 1;
    const yearSuffix = `/CVTE/${year}`;
    const cvteCodes = existingCodes.filter((c) => c.endsWith(yearSuffix));

    cvteCodes.forEach((c) => {
      const parts = c.split('/');
      const numPart = parseInt(parts[0], 10);
      if (!isNaN(numPart) && numPart >= nextNumber) {
        nextNumber = numPart + 1;
      }
    });

    let code = `${String(nextNumber).padStart(3, '0')}${yearSuffix}`;
    while (existingCodes.includes(code)) {
      nextNumber++;
      code = `${String(nextNumber).padStart(3, '0')}${yearSuffix}`;
    }
    return code;
  }

  if (format === 'sequential') {
    // Count existing certificates for this year
    let nextNumber = 1;
    const yearPrefix = `CERT-${year}-`;
    const yearCodes = existingCodes.filter((c) => c.startsWith(yearPrefix));
    
    // Find highest sequential number
    yearCodes.forEach((c) => {
      const numPart = parseInt(c.replace(yearPrefix, ''), 10);
      if (!isNaN(numPart) && numPart >= nextNumber) {
        nextNumber = numPart + 1;
      }
    });

    let seqCode = `${yearPrefix}${String(nextNumber).padStart(6, '0')}`;
    while (existingCodes.includes(seqCode)) {
      nextNumber++;
      seqCode = `${yearPrefix}${String(nextNumber).padStart(6, '0')}`;
    }
    return seqCode;
  }

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // excluding ambiguous chars I, O, 0, 1
  let code = '';
  let attempts = 0;

  do {
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code = `CERT-${year}-${randomPart}`;
    attempts++;
  } while (existingCodes.includes(code) && attempts < 100);

  return code;
}

export function formatVerificationUrl(code: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/verificar/${encodeURIComponent(code)}`;
  }
  return `https://certify.academy/verificar/${encodeURIComponent(code)}`;
}

