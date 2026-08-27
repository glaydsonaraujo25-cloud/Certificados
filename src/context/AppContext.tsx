import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Course, CourseClass, Student, Certificate, InstitutionSettings, UserSession, AuditLog, UserRole } from '../types';
import { INITIAL_INSTITUTION, INITIAL_COURSES, INITIAL_STUDENTS, INITIAL_CERTIFICATES, INITIAL_AUDIT_LOGS, DEFAULT_AI_SYLLABUS } from '../utils/storage';
import { generateCertificateCode } from '../utils/codeGenerator';
import { generateUUID, calculateCertificateHash, verifyCertificateIntegrity, IntegrityVerificationResult } from '../utils/integrity';

interface AppContextType {
  currentView: string;
  setCurrentView: (view: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: UserSession | null;
  switchUserRole: (role: UserRole) => void;
  logout: () => void;
  institution: InstitutionSettings;
  updateInstitution: (settings: Partial<InstitutionSettings>) => void;
  courses: Course[];
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => Course;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  classes: CourseClass[];
  addClass: (data: Omit<CourseClass, 'id' | 'createdAt'>) => CourseClass;
  updateClass: (id: string, updates: Partial<CourseClass>) => void;
  deleteClass: (id: string) => void;
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  certificates: Certificate[];
  issueCertificate: (certData: Omit<Certificate, 'id' | 'uuid' | 'code' | 'integrityHash' | 'status' | 'createdAt'>) => Certificate;
  cancelCertificate: (id: string, reason: string) => void;
  duplicateCertificate: (id: string) => Certificate | null;
  getCertificateByCode: (code: string) => Certificate | undefined;
  checkCertificateIntegrity: (idOrCode: string) => IntegrityVerificationResult;
  selectedCertificateId: string | null;
  setSelectedCertificateId: (id: string | null) => void;
  validationSearchCode: string;
  setValidationSearchCode: (code: string) => void;
  auditLogs: AuditLog[];
  addAuditLog: (action: AuditLog['action'], details: string, certId?: string, certCode?: string) => void;
  resetToDemoData: () => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  INSTITUTION: 'certifyai_institution',
  COURSES: 'certifyai_courses',
  CLASSES: 'certifyai_classes',
  STUDENTS: 'certifyai_students',
  CERTIFICATES: 'certifyai_certificates',
  AUDIT_LOGS: 'certifyai_audit_logs',
  THEME: 'certifyai_theme',
  DATA_VERSION: 'certifyai_data_version',
};

const DATA_VERSION = 'operador-ia-v2';
const isTrafficText = (value?: string) => /tr[aâ]nsito|condutor|ve[ií]culo|detran|contran|cvte|transporte coletivo/i.test(value || '');
const readLocal = <T,>(key: string, fallback: T): T => {
  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    return saved ? JSON.parse(saved) as T : fallback;
  } catch { return fallback; }
};

const migrateCourses = (saved: Course[]): Course[] => {
  const preserved = saved.filter((course) => !isTrafficText(`${course.name} ${course.description} ${course.courseSubhead || ''}`));
  const hasAiCourse = preserved.some((course) => /operador de computador com ia/i.test(course.name));
  return hasAiCourse ? preserved : [...INITIAL_COURSES, ...preserved];
};

const migrateStudents = (saved: Student[]): Student[] => saved.map((student) => ({
  ...student,
  courseId: student.courseId === 'course-cvte' || student.courseId === 'course-1' ? 'course-operador-ia' : student.courseId,
  registrationNumber: undefined,
  cnhCategory: undefined,
}));

const migrateCertificates = (saved: Certificate[]): Certificate[] => saved.map((cert) => {
  if (!isTrafficText(`${cert.courseName} ${cert.courseSubhead || ''} ${cert.customText || ''}`)) return cert;
  const migrated = {
    ...cert,
    code: cert.code.includes('/CVTE/') ? `CERT-${new Date().getFullYear()}-${String(Math.max(1, saved.indexOf(cert) + 1)).padStart(6, '0')}` : cert.code,
    registrationNumber: undefined,
    cnhCategory: undefined,
    courseId: 'course-operador-ia',
    courseName: 'Operador de Computador com IA',
    courseSubhead: 'Operador de Computador com Inteligência Artificial',
    courseDescription: 'Formação em informática, produtividade digital e Inteligência Artificial aplicada.',
    workloadHours: 230,
    legalInstruction: '',
    contranResolution: '',
    validityText: 'certificação referente à conclusão e ao aproveitamento no curso',
    syllabus: DEFAULT_AI_SYLLABUS,
    customText: `A Base Administrativa do Quartel-General do Exército – Forte Caxias certifica que ${cert.studentName}, inscrito no CPF nº ${cert.studentDocument || ''}, concluiu com aproveitamento o curso Operador de Computador com IA, com carga horária total de 230 horas, desenvolvendo competências em informática, produtividade digital e uso responsável de ferramentas de Inteligência Artificial.`,
  };
  return { ...migrated, integrityHash: calculateCertificateHash(migrated) } as Certificate;
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const previousVersion = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.DATA_VERSION) : DATA_VERSION;
  const needsMigration = previousVersion !== DATA_VERSION;

  const [theme, setTheme] = useState<'light' | 'dark'>(() => readLocal(STORAGE_KEYS.THEME, 'light') === 'dark' ? 'dark' : 'light');
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCertificateId, setSelectedCertificateId] = useState<string | null>(null);
  const [validationSearchCode, setValidationSearchCode] = useState('');
  const [user, setUser] = useState<UserSession | null>({ id: 'local-admin', name: 'Administrador Local', email: 'admin@instituicao.local', role: 'admin' });

  const [institution, setInstitution] = useState<InstitutionSettings>(() => {
    const parsed = readLocal<InstitutionSettings>(STORAGE_KEYS.INSTITUTION, INITIAL_INSTITUTION);
    return needsMigration && (isTrafficText(parsed.name) || isTrafficText(parsed.defaultCertificateText)) ? INITIAL_INSTITUTION : parsed;
  });
  const [courses, setCourses] = useState<Course[]>(() => {
    const parsed = readLocal<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
    return needsMigration ? migrateCourses(parsed) : parsed;
  });
  const [classes, setClasses] = useState<CourseClass[]>(() => readLocal<CourseClass[]>(STORAGE_KEYS.CLASSES, []));
  const [students, setStudents] = useState<Student[]>(() => {
    const parsed = readLocal<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    return needsMigration ? migrateStudents(parsed) : parsed;
  });
  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const parsed = readLocal<Certificate[]>(STORAGE_KEYS.CERTIFICATES, INITIAL_CERTIFICATES);
    return needsMigration ? migrateCertificates(parsed) : parsed;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => readLocal<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS));
  const certificateCodesRef = useRef<string[]>(certificates.map((certificate) => certificate.code));

  useEffect(() => { certificateCodesRef.current = certificates.map((certificate) => certificate.code); }, [certificates]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.DATA_VERSION, DATA_VERSION);
    const params = new URLSearchParams(window.location.search);
    const pathMatch = window.location.pathname.match(/^\/verificar\/([^/]+)$/i);
    const verifyCode = params.get('verify') || params.get('code') || (pathMatch ? decodeURIComponent(pathMatch[1]) : null);
    if (verifyCode) { setValidationSearchCode(verifyCode); setCurrentView('validate'); }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.INSTITUTION, JSON.stringify(institution)), [institution]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses)), [courses]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes)), [classes]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students)), [students]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certificates)), [certificates]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs)), [auditLogs]);

  const toggleTheme = () => setTheme((prev) => prev === 'light' ? 'dark' : 'light');
  const switchUserRole = (newRole: UserRole) => { if (user) setUser({ ...user, role: newRole, name: newRole === 'admin' ? 'Administrador Local' : 'Operador Local' }); };
  const logout = () => setUser(null);
  const addAuditLog = (action: AuditLog['action'], details: string, certificateId?: string, certificateCode?: string) => {
    setAuditLogs((prev) => [{ id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, action, certificateId, certificateCode, userId: user?.id || 'anon', userName: user?.name || 'Sistema', timestamp: new Date().toISOString(), details }, ...prev]);
  };

  const updateInstitution = (settings: Partial<InstitutionSettings>) => { setInstitution((prev) => ({ ...prev, ...settings })); addAuditLog('updated', 'Configurações da instituição e do modelo oficial foram atualizadas.'); };
  const addCourse = (courseData: Omit<Course, 'id' | 'createdAt'>): Course => { const newCourse = { ...courseData, id: `course-${Date.now()}`, createdAt: new Date().toISOString() }; setCourses((prev) => [newCourse, ...prev]); addAuditLog('updated', `Novo curso cadastrado: "${newCourse.name}"`); return newCourse; };
  const updateCourse = (id: string, updates: Partial<Course>) => { setCourses((prev) => prev.map((c) => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)); addAuditLog('updated', `Curso atualizado: "${updates.name || id}"`); };
  const deleteCourse = (id: string) => { const course = courses.find((c) => c.id === id); setCourses((prev) => prev.filter((c) => c.id !== id)); addAuditLog('updated', `Curso removido: "${course?.name || id}"`); };

  const syncClassMembership = (classId: string, studentIds: string[], previousIds: string[] = []) => {
    setStudents((prev) => prev.map((student) => {
      if (studentIds.includes(student.id)) return { ...student, classId };
      if (previousIds.includes(student.id) && student.classId === classId) return { ...student, classId: undefined };
      return student;
    }));
  };
  const addClass = (data: Omit<CourseClass, 'id' | 'createdAt'>): CourseClass => {
    const created: CourseClass = { ...data, id: `class-${Date.now()}`, createdAt: new Date().toISOString() };
    setClasses((prev) => [created, ...prev]);
    syncClassMembership(created.id, created.studentIds);
    addAuditLog('updated', `Turma criada: "${created.name}" com ${created.studentIds.length} aluno(s).`);
    return created;
  };
  const updateClass = (id: string, updates: Partial<CourseClass>) => {
    const current = classes.find((item) => item.id === id);
    const nextIds = updates.studentIds || current?.studentIds || [];
    setClasses((prev) => prev.map((item) => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item));
    syncClassMembership(id, nextIds, current?.studentIds || []);
    addAuditLog('updated', `Turma atualizada: "${updates.name || current?.name || id}".`);
  };
  const deleteClass = (id: string) => {
    const current = classes.find((item) => item.id === id);
    setClasses((prev) => prev.filter((item) => item.id !== id));
    setStudents((prev) => prev.map((student) => student.classId === id ? { ...student, classId: undefined } : student));
    addAuditLog('updated', `Turma removida: "${current?.name || id}".`);
  };

  const addStudent = (studentData: Omit<Student, 'id' | 'createdAt'>): Student => { const newStudent = { ...studentData, id: `student-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: new Date().toISOString() }; setStudents((prev) => [newStudent, ...prev]); if (newStudent.classId) setClasses((prev) => prev.map((item) => item.id === newStudent.classId && !item.studentIds.includes(newStudent.id) ? { ...item, studentIds: [...item.studentIds, newStudent.id] } : item)); addAuditLog('updated', `Novo aluno cadastrado: "${newStudent.fullName}"`); return newStudent; };
  const updateStudent = (id: string, updates: Partial<Student>) => { const old = students.find((student) => student.id === id); setStudents((prev) => prev.map((s) => s.id === id ? { ...s, ...updates } : s)); if (updates.classId !== undefined && updates.classId !== old?.classId) setClasses((prev) => prev.map((item) => ({ ...item, studentIds: item.id === updates.classId ? Array.from(new Set([...item.studentIds, id])) : item.studentIds.filter((studentId) => studentId !== id) }))); addAuditLog('updated', `Dados do aluno atualizados: "${updates.fullName || id}"`); };
  const deleteStudent = (id: string) => { const student = students.find((s) => s.id === id); setStudents((prev) => prev.filter((s) => s.id !== id)); setClasses((prev) => prev.map((item) => ({ ...item, studentIds: item.studentIds.filter((studentId) => studentId !== id) }))); addAuditLog('updated', `Aluno removido: "${student?.fullName || id}"`); };

  const issueCertificate = (certData: Omit<Certificate, 'id' | 'uuid' | 'code' | 'integrityHash' | 'status' | 'createdAt'>): Certificate => {
    const code = generateCertificateCode(certificateCodesRef.current, institution.codeFormat || 'sequential');
    certificateCodesRef.current = [...certificateCodesRef.current, code];
    const partialCert = { ...certData, id: `cert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, uuid: generateUUID(), code, templateId: 'official' as const, status: 'active' as const, createdAt: new Date().toISOString() };
    const newCert: Certificate = { ...partialCert, integrityHash: calculateCertificateHash(partialCert) };
    setCertificates((prev) => [newCert, ...prev]);
    addAuditLog('issued', `Certificado emitido para ${newCert.studentName} no curso ${newCert.courseName}. Código ${newCert.code}.`, newCert.id, newCert.code);
    return newCert;
  };
  const cancelCertificate = (id: string, reason: string) => { const cert = certificates.find((c) => c.id === id); setCertificates((prev) => prev.map((c) => c.id === id ? { ...c, status: 'cancelled' as const, cancelledAt: new Date().toISOString(), cancelledBy: user?.name || 'Administrador', cancellationReason: reason } : c)); addAuditLog('cancelled', `Certificado ${cert?.code || id} cancelado. Motivo: "${reason}".`, id, cert?.code); };
  const duplicateCertificate = (sourceId: string): Certificate | null => { const source = certificates.find((c) => c.id === sourceId); if (!source) return null; const code = generateCertificateCode(certificateCodesRef.current, institution.codeFormat || 'sequential'); certificateCodesRef.current = [...certificateCodesRef.current, code]; const partialCert = { ...source, id: `cert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, uuid: generateUUID(), code, status: 'active' as const, cancelledAt: undefined, cancelledBy: undefined, cancellationReason: undefined, createdAt: new Date().toISOString() }; const duplicated: Certificate = { ...partialCert, integrityHash: calculateCertificateHash(partialCert) }; setCertificates((prev) => [duplicated, ...prev]); addAuditLog('duplicated', `Certificado duplicado. Novo código: ${duplicated.code}.`, duplicated.id, duplicated.code); return duplicated; };
  const getCertificateByCode = (code: string) => certificates.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
  const checkCertificateIntegrity = (idOrCode: string) => { const clean = idOrCode.trim().toUpperCase(); return verifyCertificateIntegrity(certificates.find((c) => c.id === idOrCode || c.code.toUpperCase() === clean || c.uuid.toUpperCase() === clean)); };

  const resetToDemoData = () => { setInstitution(INITIAL_INSTITUTION); setCourses(INITIAL_COURSES); setClasses([]); setStudents(INITIAL_STUDENTS); setCertificates(INITIAL_CERTIFICATES); setAuditLogs(INITIAL_AUDIT_LOGS); certificateCodesRef.current = INITIAL_CERTIFICATES.map((item) => item.code); localStorage.setItem(STORAGE_KEYS.DATA_VERSION, DATA_VERSION); };
  const clearAllData = () => { setCourses([]); setClasses([]); setStudents([]); setCertificates([]); setAuditLogs([]); certificateCodesRef.current = []; Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key)); };

  return <AppContext.Provider value={{ currentView, setCurrentView, theme, toggleTheme, user, switchUserRole, logout, institution, updateInstitution, courses, addCourse, updateCourse, deleteCourse, classes, addClass, updateClass, deleteClass, students, addStudent, updateStudent, deleteStudent, certificates, issueCertificate, cancelCertificate, duplicateCertificate, getCertificateByCode, checkCertificateIntegrity, selectedCertificateId, setSelectedCertificateId, validationSearchCode, setValidationSearchCode, auditLogs, addAuditLog, resetToDemoData, clearAllData }}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
