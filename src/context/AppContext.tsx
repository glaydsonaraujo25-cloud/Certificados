import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Course,
  Student,
  Certificate,
  InstitutionSettings,
  UserSession,
  AuditLog,
  UserRole,
} from '../types';
import {
  INITIAL_INSTITUTION,
  INITIAL_COURSES,
  INITIAL_STUDENTS,
  INITIAL_CERTIFICATES,
  INITIAL_AUDIT_LOGS,
} from '../utils/storage';
import { generateCertificateCode } from '../utils/codeGenerator';
import {
  generateUUID,
  calculateCertificateHash,
  verifyCertificateIntegrity,
  IntegrityVerificationResult,
} from '../utils/integrity';

interface AppContextType {
  // Navigation & Theme
  currentView: string;
  setCurrentView: (view: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Session & Role
  user: UserSession | null;
  switchUserRole: (role: UserRole) => void;
  logout: () => void;

  // Institution
  institution: InstitutionSettings;
  updateInstitution: (settings: Partial<InstitutionSettings>) => void;

  // Courses CRUD
  courses: Course[];
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => Course;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  // Students CRUD
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  // Certificates Management
  certificates: Certificate[];
  issueCertificate: (
    certData: Omit<Certificate, 'id' | 'uuid' | 'code' | 'integrityHash' | 'status' | 'createdAt'>
  ) => Certificate;
  cancelCertificate: (id: string, reason: string) => void;
  duplicateCertificate: (id: string) => Certificate | null;
  getCertificateByCode: (code: string) => Certificate | undefined;
  checkCertificateIntegrity: (idOrCode: string) => IntegrityVerificationResult;

  // Selection and Validation Router State
  selectedCertificateId: string | null;
  setSelectedCertificateId: (id: string | null) => void;
  validationSearchCode: string;
  setValidationSearchCode: (code: string) => void;

  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (action: AuditLog['action'], details: string, certId?: string, certCode?: string) => void;

  // Storage Reset
  resetToDemoData: () => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  INSTITUTION: 'certifyai_institution',
  COURSES: 'certifyai_courses',
  STUDENTS: 'certifyai_students',
  CERTIFICATES: 'certifyai_certificates',
  AUDIT_LOGS: 'certifyai_audit_logs',
  THEME: 'certifyai_theme',
  USER: 'certifyai_user',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme State - Default to 'light' as primary theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  });

  // Current Active View Router
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedCertificateId, setSelectedCertificateId] = useState<string | null>(null);
  const [validationSearchCode, setValidationSearchCode] = useState<string>('');

  // User Session
  const [user, setUser] = useState<UserSession | null>(() => {
    return {
      id: 'user-admin',
      name: 'Carlos Silva (Admin)',
      email: 'carlos.admin@techacademy.com.br',
      role: 'admin',
    };
  });

  // Institution Settings
  const [institution, setInstitution] = useState<InstitutionSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INSTITUTION);
      return saved ? JSON.parse(saved) : INITIAL_INSTITUTION;
    } catch {
      return INITIAL_INSTITUTION;
    }
  });

  // Courses
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
      return saved ? JSON.parse(saved) : INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  });

  // Students
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  // Certificates
  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
      return saved ? JSON.parse(saved) : INITIAL_CERTIFICATES;
    } catch {
      return INITIAL_CERTIFICATES;
    }
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  // Check URL param ?verify=CODE on boot to route directly to validation view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const verifyCode = params.get('verify') || params.get('code');
      if (verifyCode) {
        setValidationSearchCode(verifyCode);
        setCurrentView('validate');
      }
    }
  }, []);

  // Sync theme class to HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Sync persistence changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INSTITUTION, JSON.stringify(institution));
  }, [institution]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const switchUserRole = (newRole: UserRole) => {
    if (user) {
      setUser({
        ...user,
        role: newRole,
        name:
          newRole === 'admin'
            ? 'Carlos Silva (Administrador)'
            : 'Carlos Silva (Operador)',
      });
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateInstitution = (settings: Partial<InstitutionSettings>) => {
    setInstitution((prev) => ({ ...prev, ...settings }));
    addAuditLog('updated', 'Configurações da instituição e modelo oficial atualizadas.');
  };

  const addAuditLog = (
    action: AuditLog['action'],
    details: string,
    certificateId?: string,
    certificateCode?: string
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action,
      certificateId,
      certificateCode,
      userId: user?.id || 'anon',
      userName: user?.name || 'Sistema',
      timestamp: new Date().toISOString(),
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Course actions
  const addCourse = (courseData: Omit<Course, 'id' | 'createdAt'>): Course => {
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCourses((prev) => [newCourse, ...prev]);
    addAuditLog('updated', `Novo curso cadastrado: "${newCourse.name}"`);
    return newCourse;
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
    addAuditLog('updated', `Curso atualizado: "${updates.name || id}"`);
  };

  const deleteCourse = (id: string) => {
    const course = courses.find((c) => c.id === id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
    addAuditLog('updated', `Curso removido: "${course?.name || id}"`);
  };

  // Student actions
  const addStudent = (studentData: Omit<Student, 'id' | 'createdAt'>): Student => {
    const newStudent: Student = {
      ...studentData,
      id: `student-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setStudents((prev) => [newStudent, ...prev]);
    addAuditLog('updated', `Novo aluno cadastrado: "${newStudent.fullName}"`);
    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    addAuditLog('updated', `Dados do aluno atualizados: "${updates.fullName || id}"`);
  };

  const deleteStudent = (id: string) => {
    const student = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    addAuditLog('updated', `Aluno removido: "${student?.fullName || id}"`);
  };

  // Certificate actions
  const issueCertificate = (
    certData: Omit<Certificate, 'id' | 'uuid' | 'code' | 'integrityHash' | 'status' | 'createdAt'>
  ): Certificate => {
    const existingCodes = certificates.map((c) => c.code);
    const code = generateCertificateCode(existingCodes, institution.codeFormat || 'sequential');
    const uuid = generateUUID();
    const id = `cert-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const partialCert = {
      ...certData,
      id,
      uuid,
      code,
      status: 'active' as const,
      createdAt,
    };

    const integrityHash = calculateCertificateHash(partialCert);

    const newCert: Certificate = {
      ...partialCert,
      integrityHash,
    };

    setCertificates((prev) => [newCert, ...prev]);
    addAuditLog(
      'issued',
      `Certificado emitido para ${newCert.studentName} no curso ${newCert.courseName} (Código: ${newCert.code}, UUID: ${newCert.uuid}). Hash criptográfico de integridade registrado.`,
      newCert.id,
      newCert.code
    );

    return newCert;
  };

  const cancelCertificate = (id: string, reason: string) => {
    setCertificates((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'cancelled' as const,
              cancelledAt: new Date().toISOString(),
              cancelledBy: user?.name || 'Administrador',
              cancellationReason: reason,
            }
          : c
      )
    );

    const cert = certificates.find((c) => c.id === id);
    addAuditLog(
      'cancelled',
      `Certificado ${cert?.code || id} cancelado. Motivo: "${reason}".`,
      id,
      cert?.code
    );
  };

  const duplicateCertificate = (sourceId: string): Certificate | null => {
    const source = certificates.find((c) => c.id === sourceId);
    if (!source) return null;

    const existingCodes = certificates.map((c) => c.code);
    const code = generateCertificateCode(existingCodes, institution.codeFormat || 'sequential');
    const uuid = generateUUID();
    const newId = `cert-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const partialCert = {
      ...source,
      id: newId,
      uuid,
      code,
      status: 'active' as const,
      cancelledAt: undefined,
      cancelledBy: undefined,
      cancellationReason: undefined,
      createdAt,
    };

    const integrityHash = calculateCertificateHash(partialCert);

    const duplicated: Certificate = {
      ...partialCert,
      integrityHash,
    };

    setCertificates((prev) => [duplicated, ...prev]);
    addAuditLog(
      'issued',
      `Certificado duplicado para ${duplicated.studentName} (Novo Código: ${duplicated.code}, Novo UUID: ${duplicated.uuid}).`,
      duplicated.id,
      duplicated.code
    );

    return duplicated;
  };

  const getCertificateByCode = (code: string): Certificate | undefined => {
    const clean = code.trim().toUpperCase();
    return certificates.find((c) => c.code.toUpperCase() === clean);
  };

  const checkCertificateIntegrity = (idOrCode: string): IntegrityVerificationResult => {
    const clean = idOrCode.trim().toUpperCase();
    const cert = certificates.find(
      (c) => c.id === idOrCode || c.code.toUpperCase() === clean || c.uuid === idOrCode
    );

    const result = verifyCertificateIntegrity(cert);

    if (cert) {
      if (result.hasBeenTampered) {
        addAuditLog(
          'tamper_detected',
          `ALERTA DE SEGURANÇA: Alteração inconsistente detectada no certificado ${cert.code} (UUID: ${cert.uuid}). O hash atual difere do registrado na emissão.`,
          cert.id,
          cert.code
        );
      } else {
        addAuditLog(
          'integrity_verified',
          `Verificação criptográfica de integridade realizada para o certificado ${cert.code}. Status: ${result.statusLabel}.`,
          cert.id,
          cert.code
        );
      }
    }

    return result;
  };

  const resetToDemoData = () => {
    setInstitution(INITIAL_INSTITUTION);
    setCourses(INITIAL_COURSES);
    setStudents(INITIAL_STUDENTS);
    setCertificates(INITIAL_CERTIFICATES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.INSTITUTION);
    localStorage.removeItem(STORAGE_KEYS.COURSES);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.CERTIFICATES);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
  };

  const clearAllData = () => {
    setCourses([]);
    setStudents([]);
    setCertificates([]);
    setAuditLogs([]);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        theme,
        toggleTheme,
        user,
        switchUserRole,
        logout,
        institution,
        updateInstitution,
        courses,
        addCourse,
        updateCourse,
        deleteCourse,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        certificates,
        issueCertificate,
        cancelCertificate,
        duplicateCertificate,
        getCertificateByCode,
        checkCertificateIntegrity,
        selectedCertificateId,
        setSelectedCertificateId,
        validationSearchCode,
        setValidationSearchCode,
        auditLogs,
        addAuditLog,
        resetToDemoData,
        clearAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
