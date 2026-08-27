import { Certificate, Course, Student, ApiKey, ApiRequestLog, AuditLog } from '../src/types';

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
    this.students = [];
    this.certificates = [];
    this.auditLogs = [];

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
  }
}

export const serverStore = new ServerStore();
