import { Certificate, Course, Student, ApiKey, ApiRequestLog, AuditLog } from '../src/types';
import { calculateCertificateHash } from './utils/crypto';

// In-Memory Database Store with initial seed data
export class ServerStore {
  public certificates: Certificate[] = [];
  public students: Student[] = [];
  public courses: Course[] = [];
  public apiKeys: ApiKey[] = [];
  public auditLogs: AuditLog[] = [];
  public requestLogs: ApiRequestLog[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    this.courses = [
      {
        id: 'course-1',
        name: 'Desenvolvimento Web Fullstack com React & Node',
        description: 'Formação intensiva em arquitetura de microsserviços, React, TypeScript e Node.js.',
        workloadHours: 120,
        instructorName: 'Prof. Carlos Eduardo Silveira',
        institutionName: 'Tech Academy Brasil',
        startDate: '2025-01-10',
        endDate: '2025-03-20',
        modality: 'online',
        createdAt: '2025-01-05T10:00:00Z',
      },
      {
        id: 'course-2',
        name: 'Inteligência Artificial Aplicada aos Negócios',
        description: 'Modelos de linguagem, automação de processos e estratégias com IA generativa.',
        workloadHours: 40,
        instructorName: 'Dra. Fernanda Vasconcelos',
        institutionName: 'Tech Academy Brasil',
        startDate: '2025-02-01',
        endDate: '2025-02-28',
        modality: 'hibrido',
        createdAt: '2025-01-15T14:00:00Z',
      },
      {
        id: 'course-3',
        name: 'Segurança da Informação e LGPD Corporativa',
        description: 'Fundamentos de privacidade, proteção de dados e conformidade com a LGPD.',
        workloadHours: 60,
        instructorName: 'Especialista Roberto Mendes',
        institutionName: 'Tech Academy Brasil',
        startDate: '2025-03-01',
        endDate: '2025-04-15',
        modality: 'online',
        createdAt: '2025-02-10T09:00:00Z',
      },
    ];

    this.students = [
      {
        id: 'student-1',
        fullName: 'Lucas Henrique de Almeida',
        email: 'lucas.almeida@exemplo.com.br',
        documentNumber: '12345678909',
        courseId: 'course-1',
        completionDate: '2025-03-20',
        createdAt: '2025-01-10T10:00:00Z',
      },
      {
        id: 'student-2',
        fullName: 'Mariana Costa Ribeiro',
        email: 'mariana.costa@exemplo.com.br',
        documentNumber: '98765432100',
        courseId: 'course-2',
        completionDate: '2025-02-28',
        createdAt: '2025-01-12T11:30:00Z',
      },
      {
        id: 'student-3',
        fullName: 'Gabriel Santos Figueiredo',
        email: 'gabriel.santos@exemplo.com.br',
        documentNumber: '45678912344',
        courseId: 'course-3',
        completionDate: '2025-04-15',
        createdAt: '2025-02-01T09:15:00Z',
      },
      {
        id: 'student-4',
        fullName: 'Juliana Paes de Camargo',
        email: 'juliana.camargo@exemplo.com.br',
        documentNumber: '78912345600',
        courseId: 'course-1',
        completionDate: '2024-06-10',
        createdAt: '2024-05-01T08:00:00Z',
      },
    ];

    // Seed Certificates with calculated SHA-256 hashes
    const cert1Hash = calculateCertificateHash({
      uuid: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      code: 'CERT-2026-A8F42X',
      studentName: 'Lucas Henrique de Almeida',
      studentDocument: '12345678909',
      courseName: 'Desenvolvimento Web Fullstack com React & Node',
      workloadHours: 120,
      modality: 'online',
      issueDate: '2025-03-20',
      institutionName: 'Tech Academy Brasil',
      signatoryName: 'Prof. Carlos Eduardo Silveira',
    });

    const cert2Hash = calculateCertificateHash({
      uuid: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      code: 'CERT-2025-EXP999',
      studentName: 'Juliana Paes de Camargo',
      studentDocument: '78912345600',
      courseName: 'Desenvolvimento Web Fullstack com React & Node',
      workloadHours: 120,
      modality: 'online',
      issueDate: '2024-06-10',
      institutionName: 'Tech Academy Brasil',
      signatoryName: 'Prof. Carlos Eduardo Silveira',
    });

    const cert3Hash = calculateCertificateHash({
      uuid: 'c9a646d3-9c61-4cd7-bf15-4702941aa961',
      code: 'CERT-2026-C4N15Q',
      studentName: 'Mariana Costa Ribeiro',
      studentDocument: '98765432100',
      courseName: 'Inteligência Artificial Aplicada aos Negócios',
      workloadHours: 40,
      modality: 'hibrido',
      issueDate: '2025-02-28',
      institutionName: 'Tech Academy Brasil',
      signatoryName: 'Dra. Fernanda Vasconcelos',
    });

    this.certificates = [
      {
        id: 'cert-1',
        uuid: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        code: 'CERT-2026-A8F42X',
        studentId: 'student-1',
        studentName: 'Lucas Henrique de Almeida',
        studentDocument: '12345678909',
        courseId: 'course-1',
        courseName: 'Desenvolvimento Web Fullstack com React & Node',
        courseDescription: 'Formação intensiva em arquitetura de microsserviços, React, TypeScript e Node.js.',
        workloadHours: 120,
        modality: 'online',
        instructorName: 'Prof. Carlos Eduardo Silveira',
        institutionName: 'Tech Academy Brasil',
        issueDate: '2025-03-20',
        location: 'São Paulo, SP',
        signatoryName: 'Prof. Carlos Eduardo Silveira',
        signatoryRole: 'Diretor Acadêmico & Coordenador',
        customText: 'Certificamos que Lucas Henrique de Almeida concluiu com êxito o curso de Desenvolvimento Web Fullstack.',
        templateId: 'official',
        themeSettings: {
          primaryColor: '#312e81',
          secondaryColor: '#4f46e5',
          accentColor: '#f59e0b',
          fontFamily: 'sans',
          borderStyle: 'double',
          backgroundPattern: 'subtle',
          showQrCode: true,
          showSignatoryTitle: true,
          showSeal: true,
        },
        integrityHash: cert1Hash,
        status: 'active',
        createdAt: '2025-03-20T16:00:00Z',
      },
      {
        id: 'cert-2',
        uuid: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        code: 'CERT-2025-EXP999',
        studentId: 'student-4',
        studentName: 'Juliana Paes de Camargo',
        studentDocument: '78912345600',
        courseId: 'course-1',
        courseName: 'Desenvolvimento Web Fullstack com React & Node',
        workloadHours: 120,
        modality: 'online',
        instructorName: 'Prof. Carlos Eduardo Silveira',
        institutionName: 'Tech Academy Brasil',
        issueDate: '2024-06-10',
        expiresAt: '2025-06-10', // Expired
        location: 'São Paulo, SP',
        signatoryName: 'Prof. Carlos Eduardo Silveira',
        signatoryRole: 'Diretor Acadêmico',
        customText: 'Certificamos que Juliana Paes de Camargo concluiu com êxito a certificação técnica.',
        templateId: 'official',
        themeSettings: {
          primaryColor: '#1e3a8a',
          secondaryColor: '#3b82f6',
          accentColor: '#d97706',
          fontFamily: 'serif',
          borderStyle: 'ornate',
          backgroundPattern: 'subtle',
          showQrCode: true,
          showSignatoryTitle: true,
          showSeal: true,
        },
        integrityHash: cert2Hash,
        status: 'expired',
        createdAt: '2024-06-10T14:00:00Z',
      },
      {
        id: 'cert-3',
        uuid: 'c9a646d3-9c61-4cd7-bf15-4702941aa961',
        code: 'CERT-2026-C4N15Q',
        studentId: 'student-2',
        studentName: 'Mariana Costa Ribeiro',
        studentDocument: '98765432100',
        courseId: 'course-2',
        courseName: 'Inteligência Artificial Aplicada aos Negócios',
        workloadHours: 40,
        modality: 'hibrido',
        instructorName: 'Dra. Fernanda Vasconcelos',
        institutionName: 'Tech Academy Brasil',
        issueDate: '2025-02-28',
        location: 'São Paulo, SP',
        signatoryName: 'Dra. Fernanda Vasconcelos',
        signatoryRole: 'Coordenadora de Pós-Graduação',
        customText: 'Certificamos que Mariana Costa Ribeiro concluiu com louvor o curso.',
        templateId: 'official',
        themeSettings: {
          primaryColor: '#0f172a',
          secondaryColor: '#334155',
          accentColor: '#10b981',
          fontFamily: 'cinzel',
          borderStyle: 'solid',
          backgroundPattern: 'waves',
          showQrCode: true,
          showSignatoryTitle: true,
          showSeal: true,
        },
        integrityHash: cert3Hash,
        status: 'cancelled',
        cancelledAt: '2025-03-01T10:00:00Z',
        cancelledBy: 'Diretoria Acadêmica',
        cancellationReason: 'Inconsistência cadastral no módulo complementar; documento revogado e substituído.',
        createdAt: '2025-02-28T18:00:00Z',
      },
    ];

    // Seed Initial Integration API Keys
    this.apiKeys = [
      {
        id: 'key-admin-master',
        name: 'Chave Mestra Administrativa',
        key: 'cert_live_sec99_admin_master_key_8849',
        maskedKey: 'cert_live_...key_8849',
        scopes: ['admin', 'certificates:read', 'certificates:write', 'certificates:admin', 'students:read', 'students:write', 'courses:read', 'courses:write'],
        rateLimitPerMinute: 120,
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        lastUsedAt: '2026-08-26T10:00:00Z',
        integrationType: 'custom',
      },
      {
        id: 'key-moodle-lms',
        name: 'Moodle LMS Webhook Connector',
        key: 'cert_live_mdl_a872e456b3294c718a2098',
        maskedKey: 'cert_live_...a2098',
        scopes: ['certificates:read', 'certificates:write', 'students:read', 'students:write', 'courses:read'],
        rateLimitPerMinute: 60,
        status: 'active',
        createdAt: '2025-01-15T09:00:00Z',
        lastUsedAt: '2026-08-25T17:30:00Z',
        integrationType: 'moodle',
      },
      {
        id: 'key-canvas-edu',
        name: 'Canvas LMS Auto-Issuer',
        key: 'cert_live_cnv_9012f7823abce41124dd78',
        maskedKey: 'cert_live_...4dd78',
        scopes: ['certificates:read', 'certificates:write', 'students:read', 'courses:read'],
        rateLimitPerMinute: 60,
        status: 'active',
        createdAt: '2025-02-01T14:20:00Z',
        lastUsedAt: '2026-08-24T12:00:00Z',
        integrationType: 'canvas',
      },
      {
        id: 'key-hotmart-webhook',
        name: 'Hotmart / Eduzz Hub',
        key: 'cert_live_hot_6721ea1029cbb874a12399',
        maskedKey: 'cert_live_...a12399',
        scopes: ['certificates:write', 'students:write', 'courses:read'],
        rateLimitPerMinute: 45,
        status: 'active',
        createdAt: '2025-03-01T11:00:00Z',
        integrationType: 'hotmart',
      },
    ];

    this.auditLogs = [
      {
        id: 'log-1',
        action: 'issued',
        certificateId: 'cert-1',
        certificateCode: 'CERT-2026-A8F42X',
        userId: 'admin-1',
        userName: 'Admin Geral',
        timestamp: '2025-03-20T16:00:00Z',
        details: 'Emissão inicial com cálculo de hash criptográfico e registro no validador público.',
      },
      {
        id: 'log-2',
        action: 'cancelled',
        certificateId: 'cert-3',
        certificateCode: 'CERT-2026-C4N15Q',
        userId: 'admin-1',
        userName: 'Admin Geral',
        timestamp: '2025-03-01T10:00:00Z',
        details: 'Revogação formal por inconsistência cadastral registrada pela coordenação.',
      },
    ];
  }
}

export const serverStore = new ServerStore();
