import { validDate } from './lifecycle.ts';
export const APP_KEYS = ['certifyai_audit_logs', 'certifyai_institution', 'certifyai_courses', 'certifyai_classes', 'certifyai_students', 'certifyai_certificates', 'certifyai_theme', 'certifyai_data_version'];
export const RECOVERY_KEY = 'certifyai_backup_before_restore';
export function writeTransaction(storage: Storage, updates: Record<string, string | null>) {
  const previous = Object.fromEntries(Object.keys(updates).map(key => [key, storage.getItem(key)]));
  try {
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) storage.removeItem(key); else storage.setItem(key, value);
    }
  } catch {
    let restored = true;
    for (const [key, value] of Object.entries(previous)) {
      try { if (value === null) storage.removeItem(key); else storage.setItem(key, value); } catch { restored = false; }
    }
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('certifyai-storage-error'));
    throw new Error(restored ? 'Não foi possível salvar. Os dados anteriores foram preservados. Verifique o espaço disponível no navegador.' : 'Falha ao salvar e recuperar os dados. Preserve seu backup antes de continuar.');
  }
}
const record = (v: unknown): v is Record<string, any> => Boolean(v && typeof v === 'object' && !Array.isArray(v));
export function validateBackup(input: unknown): Record<string, unknown> {
  if (!record(input) || input.format !== 'certificados-cvte-backup' || input.version !== 1 || !record(input.data)) throw new Error('Arquivo de backup CVTE incompatível.');
  const data = input.data;
  if (!record(data.certifyai_institution) || typeof data.certifyai_institution.name !== 'string') throw new Error('Configuração institucional inválida.');
  if (data.certifyai_classes !== undefined) {
    const classes=data.certifyai_classes;
    if(!Array.isArray(classes)||!classes.every(c=>record(c)&&['id','name','courseId','startDate','endDate','instructorName','createdAt'].every(k=>typeof c[k]==='string')&&validDate(c.startDate)&&validDate(c.endDate)&&c.startDate<=c.endDate&&Array.isArray(c.studentIds)&&c.studentIds.every(id=>typeof id==='string')&&Number.isInteger(c.validityYears)&&c.validityYears>=1&&c.validityYears<=20)) throw new Error('Turmas inválidas no backup.');
    if(new Set(classes.map(c=>c.id)).size!==classes.length)throw new Error('Turmas duplicadas no backup.');
  }
  const schemas: Record<string, string[]> = {
    certifyai_audit_logs: ['id', 'action', 'userId', 'userName', 'timestamp', 'details'],
    certifyai_students: ['id', 'fullName', 'email', 'createdAt'],
    certifyai_courses: ['id', 'name', 'startDate', 'endDate', 'createdAt'],
    certifyai_certificates: ['id', 'uuid', 'code', 'studentId', 'studentName', 'courseId', 'courseName', 'issueDate', 'status', 'integrityHash', 'createdAt'],
  };
  for (const [key, fields] of Object.entries(schemas)) {
    const rows = data[key];
    if (key === 'certifyai_audit_logs' && rows === undefined) continue;
    if (!Array.isArray(rows) || !rows.every(row => record(row) && fields.every(field => typeof row[field] === 'string'))) throw new Error(`Dados inválidos em ${key}. Nenhum dado foi substituído.`);
    if (!rows.every(row => Object.entries(row).every(([field,value]) => ['workloadHours','syllabus','themeSettings'].includes(field) || value === undefined || value === null || typeof value === 'string'))) throw new Error('Tipos de campos inválidos no backup.');
    if (!rows.every(row => row.syllabus === undefined || (Array.isArray(row.syllabus) && row.syllabus.every(item => record(item) && ['discipline','workload','grade','instructor'].every(field=>typeof item[field]==='string'))))) throw new Error('Conteúdo programático inválido.');
    if (new Set(rows.map(row => row.id)).size !== rows.length) throw new Error('O backup contém identificadores duplicados.');
    if (key === 'certifyai_certificates' && (!rows.every(row => ['active', 'cancelled', 'expired'].includes(row.status) && Number.isFinite(row.workloadHours) && (!row.expiresAt || /^\d{4}-\d{2}-\d{2}$/.test(row.expiresAt))) || new Set(rows.map(row=>row.code.toUpperCase())).size!==rows.length)) throw new Error('Certificados inválidos no backup.');
  }
  if (data.certifyai_theme !== undefined && !['light', 'dark'].includes(data.certifyai_theme)) throw new Error('Tema inválido no backup.');
  return Object.fromEntries(APP_KEYS.filter(key => key in data).map(key => [key, data[key]]));
}
export function restoreBackup(storage: Storage, input: unknown) {
  const data = validateBackup(input);
  const previous = Object.fromEntries(APP_KEYS.map(key => [key, storage.getItem(key)]));
  // Keep a durable raw snapshot before any replacement. If this fails, abort.
  storage.setItem(RECOVERY_KEY, JSON.stringify(previous));
  writeTransaction(storage, Object.fromEntries(APP_KEYS.map(key => [key, key in data ? JSON.stringify(data[key]) : null])));
}

export function hasRecoverySnapshot(storage: Storage) {
  return Boolean(storage.getItem(RECOVERY_KEY));
}
export function restoreRecoverySnapshot(storage: Storage) {
  const raw = storage.getItem(RECOVERY_KEY);
  if (!raw) throw new Error('Nenhuma cópia de recuperação disponível.');
  let snapshot: unknown;
  try { snapshot = JSON.parse(raw); } catch { throw new Error('A cópia de recuperação está corrompida.'); }
  if (!record(snapshot)) throw new Error('A cópia de recuperação é inválida.');
  const updates: Record<string, string | null> = {};
  for (const key of APP_KEYS) {
    const value = snapshot[key];
    if (value !== null && value !== undefined && typeof value !== 'string') throw new Error('A cópia de recuperação contém dados inválidos.');
    updates[key] = typeof value === 'string' ? value : null;
  }
  const current = Object.fromEntries(APP_KEYS.map(key => [key, storage.getItem(key)]));
  writeTransaction(storage, updates);
  storage.setItem(RECOVERY_KEY, JSON.stringify(current));
}
