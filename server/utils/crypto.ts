import crypto from 'crypto';

export function calculateCertificateHash(payload: {
  uuid: string;
  code: string;
  studentName: string;
  studentDocument?: string;
  courseName: string;
  workloadHours: number;
  modality: string;
  issueDate: string;
  institutionName: string;
  signatoryName: string;
}): string {
  const normalized = [
    payload.uuid,
    payload.code,
    payload.studentName.trim().toUpperCase(),
    (payload.studentDocument || '').trim().replace(/\D/g, ''),
    payload.courseName.trim().toUpperCase(),
    payload.workloadHours.toString(),
    payload.modality.toLowerCase(),
    payload.issueDate,
    payload.institutionName.trim().toUpperCase(),
    payload.signatoryName.trim().toUpperCase(),
  ].join('|');

  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}

export function generateUUID(): string {
  return crypto.randomUUID();
}

export function generateApiKey(environment: 'live' | 'test' = 'live'): { key: string; maskedKey: string } {
  const randomBytes = crypto.randomBytes(18).toString('hex');
  const key = `cert_${environment}_${randomBytes}`;
  const maskedKey = `cert_${environment}_...${randomBytes.slice(-6)}`;
  return { key, maskedKey };
}

export function maskDocumentNumber(doc?: string): string {
  if (!doc) return '';
  const digits = doc.replace(/\D/g, '');
  if (digits.length === 11) {
    return `***.${digits.substring(3, 6)}.${digits.substring(6, 9)}-**`;
  }
  if (digits.length === 14) {
    return `**.***.${digits.substring(5, 8)}/0001-**`;
  }
  if (doc.length > 5) {
    return `${doc.substring(0, 2)}***${doc.substring(doc.length - 2)}`;
  }
  return '***';
}
