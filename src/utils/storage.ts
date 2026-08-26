import {
  Course,
  Student,
  Certificate,
  InstitutionSettings,
  TemplatePreset,
  AuditLog,
} from '../types';
import { calculateCertificateHash } from './integrity';

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'official',
    name: 'Modelo Oficial Padronizado',
    description: 'Padrão único e oficial da instituição com bordas de alta segurança, guilloché, selo institucional, QR Code e assinaturas com rubrica.',
    badge: 'Modelo Oficial',
    defaultTheme: {
      primaryColor: '#1E293B',
      secondaryColor: '#94A3B8',
      accentColor: '#D97706',
      fontFamily: 'serif',
      borderStyle: 'double',
      backgroundPattern: 'subtle',
      showQrCode: true,
      showSignatoryTitle: true,
      showSeal: true,
    },
  },
];

export const INITIAL_INSTITUTION: InstitutionSettings = {
  name: 'Tech Academy Brasil',
  logoUrl: '',
  email: 'contato@techacademy.com.br',
  phone: '(11) 98765-4321',
  website: 'https://techacademy.com.br',
  city: 'São Paulo',
  state: 'SP',
  signatureName: 'Dra. Maria Souza',
  signatureRole: 'Diretora Acadêmica & Coordenadora de Ensino',
  signatureImageUrl: '',
  secondSignatureName: 'Prof. Carlos Eduardo Silveira',
  secondSignatureRole: 'Coordenador do Conselho Pedagógico',
  secondSignatureImageUrl: '',
  showSecondSignature: true,
  borderStyle: 'official-security',
  codeFormat: 'sequential',
  showQrCode: true,
  showSeal: true,
  sealText: 'DOCUMENTO AUTÊNTICO • EMISSÃO REGISTRADA',
  defaultCertificateText:
    'Certificamos que [NOME DO ALUNO] concluiu com êxito o curso [NOME DO CURSO], com carga horária de [CARGA HORÁRIA] horas, realizado no período de [DATA INICIAL] a [DATA FINAL].',
};

/**
 * Replaces placeholders like [NOME DO ALUNO], [NOME DO CURSO], [CARGA HORÁRIA], etc.
 */
export function interpolateCertificateText(
  templateText?: string,
  vars: {
    studentName?: string;
    courseName?: string;
    workloadHours?: number | string;
    startDate?: string;
    endDate?: string;
    issueDate?: string;
    instructorName?: string;
    institutionName?: string;
    location?: string;
    studentDocument?: string;
  } = {}
): string {
  let text =
    templateText ||
    'Certificamos que [NOME DO ALUNO] concluiu com êxito o curso [NOME DO CURSO], com carga horária de [CARGA HORÁRIA] horas, realizado no período de [DATA INICIAL] a [DATA FINAL].';

  const formatDateBR = (isoDate?: string) => {
    if (!isoDate) return '';
    try {
      const parts = isoDate.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return isoDate;
    } catch {
      return isoDate;
    }
  };

  const startFormatted = formatDateBR(vars.startDate) || '01/01/2026';
  const endFormatted = formatDateBR(vars.endDate) || '15/02/2026';
  const issueFormatted = formatDateBR(vars.issueDate) || '16/02/2026';

  text = text.replace(/\[NOME DO ALUNO\]/gi, vars.studentName || 'Nome do Aluno');
  text = text.replace(/\[NOME DO CURSO\]/gi, vars.courseName || 'Nome do Curso');
  text = text.replace(/\[CARGA HORÁRIA\]/gi, String(vars.workloadHours || '40'));
  text = text.replace(/\[DATA INICIAL\]/gi, startFormatted);
  text = text.replace(/\[DATA FINAL\]/gi, endFormatted);
  text = text.replace(/\[DATA DE EMISSÃO\]/gi, issueFormatted);
  text = text.replace(/\[DATA DE CONCLUSÃO\]/gi, endFormatted);
  text = text.replace(/\[INSTRUTOR\]/gi, vars.instructorName || 'Prof. Instrutor');
  text = text.replace(/\[INSTITUIÇÃO\]/gi, vars.institutionName || 'Tech Academy Brasil');
  text = text.replace(/\[LOCAL\]/gi, vars.location || 'São Paulo, SP');
  text = text.replace(/\[DOCUMENTO\]/gi, vars.studentDocument || '');

  return text;
}

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    name: 'Introdução à Inteligência Artificial & LLMs',
    description: 'Conceitos fundamentais de Inteligência Artificial Generativa, Engenharia de Prompt e arquitetura de Transformers.',
    workloadHours: 40,
    instructorName: 'Prof. Carlos Eduardo',
    institutionName: 'Tech Academy Brasil',
    startDate: '2026-01-10',
    endDate: '2026-02-15',
    modality: 'online',
    createdAt: '2026-01-05T10:00:00Z',
  },
  {
    id: 'course-2',
    name: 'Desenvolvimento Web Full Stack Moderno',
    description: 'Formação completa em TypeScript, React, Node.js, Express, APIs RESTful e boas práticas de arquitetura.',
    workloadHours: 80,
    instructorName: 'Mariana Duarte',
    institutionName: 'Tech Academy Brasil',
    startDate: '2026-01-05',
    endDate: '2026-02-20',
    modality: 'online',
    createdAt: '2026-01-02T10:00:00Z',
  },
  {
    id: 'course-3',
    name: 'UI/UX Design & Design Systems',
    description: 'Design de interfaces modernas, arquitetura de informação, prototipagem avançada no Figma e acessibilidade digital.',
    workloadHours: 32,
    instructorName: 'Rodrigo Lima',
    institutionName: 'Tech Academy Brasil',
    startDate: '2026-01-20',
    endDate: '2026-02-18',
    modality: 'hibrido',
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'course-4',
    name: 'Gestão Ágil de Projetos & Scrum Master',
    description: 'Liderança de equipes ágeis, cerimônias Scrum, métricas de produtividade e entrega contínua de valor.',
    workloadHours: 24,
    instructorName: 'Fernanda Barbosa',
    institutionName: 'Tech Academy Brasil',
    startDate: '2026-02-01',
    endDate: '2026-02-14',
    modality: 'presencial',
    createdAt: '2026-01-15T10:00:00Z',
  },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'student-1',
    fullName: 'João da Silva',
    email: 'joao.silva@email.com',
    documentNumber: '123.456.789-00',
    courseId: 'course-1',
    completionDate: '2026-02-15',
    notes: 'Excelente desempenho no projeto final prático.',
    createdAt: '2026-01-10T14:00:00Z',
  },
  {
    id: 'student-2',
    fullName: 'Ana Beatriz Mendes',
    email: 'ana.mendes@email.com',
    documentNumber: '234.567.890-11',
    courseId: 'course-2',
    completionDate: '2026-02-20',
    notes: 'Conclusão com nota máxima.',
    createdAt: '2026-01-12T15:00:00Z',
  },
  {
    id: 'student-3',
    fullName: 'Lucas Gabriel Oliveira',
    email: 'lucas.oliveira@email.com',
    documentNumber: '345.678.901-22',
    courseId: 'course-3',
    completionDate: '2026-02-18',
    notes: 'Protótipo de Design System aprovado.',
    createdAt: '2026-01-14T11:00:00Z',
  },
  {
    id: 'student-4',
    fullName: 'Camila Rocha Santos',
    email: 'camila.rocha@email.com',
    documentNumber: '456.789.012-33',
    courseId: 'course-4',
    completionDate: '2026-02-14',
    notes: 'Participação ativa nas dinâmicas de sprint.',
    createdAt: '2026-01-16T09:00:00Z',
  },
];

const rawCertificates = [
  {
    id: 'cert-1',
    uuid: 'a3d2e5b8-17a4-4f51-9c60-84f932e6a101',
    code: 'CERT-2026-A8F42X',
    studentId: 'student-1',
    studentName: 'João da Silva',
    studentDocument: '123.456.789-00',
    courseId: 'course-1',
    courseName: 'Introdução à Inteligência Artificial & LLMs',
    courseDescription: 'Fundamentos de IA Generativa e LLMs.',
    workloadHours: 40,
    modality: 'online' as const,
    instructorName: 'Prof. Carlos Eduardo',
    institutionName: 'Tech Academy Brasil',
    issueDate: '2026-02-16',
    startDate: '2026-01-10',
    endDate: '2026-02-15',
    location: 'São Paulo, SP',
    signatoryName: 'Dra. Maria Souza',
    signatoryRole: 'Diretora Acadêmica',
    customText:
      'Certificamos que João da Silva concluiu com êxito o curso Introdução à Inteligência Artificial & LLMs, com carga horária total de 40 horas, realizado no período de 10/01/2026 a 15/02/2026 na modalidade Online.',
    templateId: 'official' as const,
    themeSettings: TEMPLATE_PRESETS[0].defaultTheme,
    status: 'active' as const,
    createdAt: '2026-02-16T10:30:00Z',
  },
  {
    id: 'cert-2',
    uuid: 'b4e3f6c9-28b5-4a62-ad71-95a043f7b202',
    code: 'CERT-2026-B9K73Z',
    studentId: 'student-2',
    studentName: 'Ana Beatriz Mendes',
    studentDocument: '234.567.890-11',
    courseId: 'course-2',
    courseName: 'Desenvolvimento Web Full Stack Moderno',
    courseDescription: 'TypeScript, React, Node.js e APIs RESTful.',
    workloadHours: 80,
    modality: 'online' as const,
    instructorName: 'Mariana Duarte',
    institutionName: 'Tech Academy Brasil',
    issueDate: '2026-02-21',
    startDate: '2026-01-05',
    endDate: '2026-02-20',
    location: 'São Paulo, SP',
    signatoryName: 'Dra. Maria Souza',
    signatoryRole: 'Diretora Acadêmica',
    customText:
      'Certificamos que Ana Beatriz Mendes concluiu com distinção e aproveitamento exemplar o curso Desenvolvimento Web Full Stack Moderno, cumprindo com excelência a carga horária de 80 horas no período de 05/01/2026 a 20/02/2026.',
    templateId: 'official' as const,
    themeSettings: TEMPLATE_PRESETS[0].defaultTheme,
    status: 'active' as const,
    createdAt: '2026-02-21T14:15:00Z',
  },
  {
    id: 'cert-3',
    uuid: 'c5f4a7d0-39c6-4b73-be82-06b154a8c303',
    code: 'CERT-2026-C4N15Q',
    studentId: 'student-3',
    studentName: 'Lucas Gabriel Oliveira',
    studentDocument: '345.678.901-22',
    courseId: 'course-3',
    courseName: 'UI/UX Design & Design Systems',
    courseDescription: 'Design de interfaces modernas e acessibilidade.',
    workloadHours: 32,
    modality: 'hibrido' as const,
    instructorName: 'Rodrigo Lima',
    institutionName: 'Tech Academy Brasil',
    issueDate: '2026-02-19',
    startDate: '2026-01-20',
    endDate: '2026-02-18',
    location: 'São Paulo, SP',
    signatoryName: 'Dra. Maria Souza',
    signatoryRole: 'Diretora Acadêmica',
    customText:
      'Certificamos que Lucas Gabriel Oliveira participou e concluiu o programa de capacitação profissional em UI/UX Design & Design Systems, totalizando 32 horas de formação técnica.',
    templateId: 'official' as const,
    themeSettings: TEMPLATE_PRESETS[0].defaultTheme,
    status: 'cancelled' as const,
    cancelledAt: '2026-02-22T09:00:00Z',
    cancelledBy: 'Administrador (Admin)',
    cancellationReason: 'Emissão duplicada corrigida pelo setor acadêmico.',
    createdAt: '2026-02-19T16:00:00Z',
  },
  {
    id: 'cert-4',
    uuid: 'd6a5b8e1-40d7-4c84-cf93-17c265b9d404',
    code: 'CERT-2025-EXP999',
    studentId: 'student-4',
    studentName: 'Camila Rocha Santos',
    studentDocument: '456.789.012-33',
    courseId: 'course-4',
    courseName: 'Gestão Ágil de Projetos & Scrum Master',
    courseDescription: 'Certificação profissional com validade temporal de 1 ano.',
    workloadHours: 24,
    modality: 'presencial' as const,
    instructorName: 'Fernanda Barbosa',
    institutionName: 'Tech Academy Brasil',
    issueDate: '2024-02-14',
    expiresAt: '2025-02-14',
    startDate: '2024-02-01',
    endDate: '2024-02-14',
    location: 'São Paulo, SP',
    signatoryName: 'Dra. Maria Souza',
    signatoryRole: 'Diretora Acadêmica',
    customText:
      'Certificamos que Camila Rocha Santos completou a certificação em Gestão Ágil de Projetos & Scrum Master com carga horária de 24 horas.',
    templateId: 'official' as const,
    themeSettings: TEMPLATE_PRESETS[0].defaultTheme,
    status: 'expired' as const,
    createdAt: '2024-02-14T10:00:00Z',
  },
];

export const INITIAL_CERTIFICATES: Certificate[] = rawCertificates.map((cert) => ({
  ...cert,
  integrityHash: calculateCertificateHash(cert),
}));

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    action: 'issued',
    certificateId: 'cert-1',
    certificateCode: 'CERT-2026-A8F42X',
    userId: 'user-admin',
    userName: 'Carlos Silva (Admin)',
    timestamp: '2026-02-16T10:30:00Z',
    details: 'Certificado emitido para João da Silva (UUID: a3d2e5b8-17a4-4f51-9c60-84f932e6a101). Hash criptográfico registrado.',
  },
  {
    id: 'log-2',
    action: 'issued',
    certificateId: 'cert-2',
    certificateCode: 'CERT-2026-B9K73Z',
    userId: 'user-admin',
    userName: 'Carlos Silva (Admin)',
    timestamp: '2026-02-21T14:15:00Z',
    details: 'Certificado emitido para Ana Beatriz Mendes (UUID: b4e3f6c9-28b5-4a62-ad71-95a043f7b202). Hash criptográfico registrado.',
  },
  {
    id: 'log-3',
    action: 'cancelled',
    certificateId: 'cert-3',
    certificateCode: 'CERT-2026-C4N15Q',
    userId: 'user-admin',
    userName: 'Carlos Silva (Admin)',
    timestamp: '2026-02-22T09:00:00Z',
    details: 'Certificado CERT-2026-C4N15Q cancelado. Motivo: Emissão duplicada.',
  },
  {
    id: 'log-4',
    action: 'issued',
    certificateId: 'cert-4',
    certificateCode: 'CERT-2025-EXP999',
    userId: 'user-admin',
    userName: 'Carlos Silva (Admin)',
    timestamp: '2024-02-14T10:00:00Z',
    details: 'Certificação profissional emitida para Camila Rocha Santos com prazo de validade até 14/02/2025.',
  },
];
