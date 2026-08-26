import { Certificate, Course, Student, ApiKey, ApiRequestLog, AuditLog } from '../src/types';
import { calculateCertificateHash } from './utils/crypto';

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
    const course: Course = {
      id: 'course-ocia',
      name: 'Operador de Computador com IA',
      courseSubhead: 'Operador de Computador com Inteligência Artificial',
      description: 'Formação profissional em informática, produtividade digital, ferramentas de escritório e uso responsável de Inteligência Artificial.',
      workloadHours: 230,
      instructorName: 'Instrutor Responsável',
      institutionName: 'Base Administrativa do Quartel-General do Exército – Forte Caxias',
      startDate: '2026-06-01',
      endDate: '2026-08-26',
      modality: 'presencial',
      syllabus: [
        { discipline: 'Fundamentos de Informática e Sistemas Operacionais', workload: '40h/a', grade: 'Apto', instructor: 'INSTRUTOR RESPONSÁVEL' },
        { discipline: 'Ferramentas de Escritório e Produtividade Digital', workload: '70h/a', grade: 'Apto', instructor: 'INSTRUTOR RESPONSÁVEL' },
        { discipline: 'Internet, Colaboração e Segurança Digital', workload: '40h/a', grade: 'Apto', instructor: 'INSTRUTOR RESPONSÁVEL' },
        { discipline: 'Inteligência Artificial Generativa e Engenharia de Prompts', workload: '50h/a', grade: 'Apto', instructor: 'INSTRUTOR RESPONSÁVEL' },
        { discipline: 'Projetos Práticos com IA e Automação', workload: '30h/a', grade: 'Apto', instructor: 'INSTRUTOR RESPONSÁVEL' },
      ],
      createdAt: '2026-06-01T10:00:00Z',
    };

    this.courses = [course];

    this.students = [
      {
        id: 'student-1',
        fullName: 'ALUNO DE DEMONSTRAÇÃO',
        email: 'aluno@exemplo.com',
        documentNumber: '000.000.000-00',
        courseId: course.id,
        completionDate: course.endDate,
        notes: 'Aluno de demonstração do curso Operador de Computador com IA.',
        createdAt: '2026-06-01T11:00:00Z',
      },
      {
        id: 'student-2',
        fullName: 'ALUNA EXEMPLO',
        email: 'aluna@exemplo.com',
        documentNumber: '111.111.111-11',
        courseId: course.id,
        completionDate: course.endDate,
        notes: 'Cadastro de exemplo para testes de emissão em lote.',
        createdAt: '2026-06-01T11:15:00Z',
      },
    ];

    const certificateBase = {
      uuid: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      code: '001/OCIA/2026',
      studentName: 'ALUNO DE DEMONSTRAÇÃO',
      studentDocument: '000.000.000-00',
      courseName: course.name,
      workloadHours: course.workloadHours,
      modality: course.modality,
      issueDate: '2026-08-26',
      institutionName: course.institutionName,
      signatoryName: 'Carlos Henrique Ferreira De Mello',
    };

    const integrityHash = calculateCertificateHash(certificateBase);

    this.certificates = [
      {
        id: 'cert-ocia-001',
        ...certificateBase,
        studentId: 'student-1',
        studentEmail: 'aluno@exemplo.com',
        courseId: course.id,
        courseSubhead: course.courseSubhead,
        courseDescription: course.description,
        instructorName: course.instructorName,
        institutionCnpj: '21.744.847/0001-50',
        syllabus: course.syllabus,
        startDate: course.startDate,
        endDate: course.endDate,
        location: 'Brasília-DF',
        signatoryRole: 'Diretor Geral',
        signatoryCpf: '981.050.007-68',
        customText: 'A Base Administrativa do Quartel-General do Exército – Forte Caxias certifica que ALUNO DE DEMONSTRAÇÃO concluiu com aproveitamento o curso Operador de Computador com IA, com carga horária total de 230 horas, desenvolvendo competências em informática, produtividade digital e uso responsável de ferramentas de Inteligência Artificial.',
        templateId: 'official',
        integrityHash,
        status: 'active',
        createdAt: '2026-08-26T15:00:00Z',
      },
    ];

    this.apiKeys = [
      {
        id: 'key-admin-demo',
        name: 'Chave Administrativa de Demonstração',
        key: 'cert_demo_admin_ocia_2026',
        maskedKey: 'cert_demo_..._2026',
        scopes: ['admin', 'certificates:read', 'certificates:write', 'certificates:admin', 'students:read', 'students:write', 'courses:read', 'courses:write'],
        rateLimitPerMinute: 120,
        status: 'active',
        createdAt: '2026-08-26T12:00:00Z',
        integrationType: 'custom',
      },
    ];

    this.auditLogs = [
      {
        id: 'log-ocia-1',
        action: 'issued',
        certificateId: 'cert-ocia-001',
        certificateCode: '001/OCIA/2026',
        userId: 'admin-local',
        userName: 'Administrador Local',
        timestamp: '2026-08-26T15:00:00Z',
        details: 'Certificado de demonstração do curso Operador de Computador com IA emitido com hash de integridade e validação pública.',
      },
    ];
  }
}

export const serverStore = new ServerStore();
