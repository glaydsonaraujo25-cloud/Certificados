export const APP_KEYS = ['certifyai_institution', 'certifyai_courses', 'certifyai_students', 'certifyai_certificates', 'certifyai_theme', 'certifyai_data_version'];
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
  const schemas: Record<string, string[]> = {
    certifyai_students: ['id', 'fullName', 'email', 'createdAt'],
    certifyai_courses: ['id', 'name', 'startDate', 'endDate', 'createdAt'],
    certifyai_certificates: ['id', 'uuid', 'code', 'studentId', 'studentName', 'courseId', 'courseName', 'issueDate', 'status', 'integrityHash', 'createdAt'],
  };
  for (const [key, fields] of Object.entries(schemas)) {
    const rows = data[key];
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
