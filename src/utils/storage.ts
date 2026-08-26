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

export const DEFAULT_CVTE_SYLLABUS = [
  {
    discipline: 'Legislação de Trânsito',
    workload: '10h/a',
    grade: '10',
    instructor: 'PAULO DE JESUS CAMARGO',
  },
  {
    discipline: 'Direção Defensiva',
    workload: '15h/a',
    grade: '9,0',
    instructor: 'ERIK ANDRE RODRIGUES SANTIAGO',
  },
  {
    discipline: 'Primeiros Socorros e Atendimento Inicial',
    workload: '15h/a',
    grade: '10',
    instructor: 'FELIPE VILELA DA COSTA',
  },
  {
    discipline: 'Comportamento e Convívio Social',
    workload: '10h/a',
    grade: '10',
    instructor: 'ERIK ANDRE RODRIGUES SANTIAGO',
  },
];

export const INITIAL_INSTITUTION: InstitutionSettings = {
  name: 'Instituição de Ensino de Trânsito da Base Administrativa do Quartel-General do Exército – Forte Caxias',
  institutionCnpj: '21.744.847/0001-50',
  logoUrl: '',
  email: 'iet.badmqgex@eb.mil.br',
  phone: '(61) 3415-4000',
  website: 'https://www.eb.mil.br',
  city: 'Brasília',
  state: 'DF',
  signatoryName: 'Carlos Henrique Ferreira De Mello',
  signatoryRole: 'Diretor Geral',
  signatoryCpf: '981.050.007-68',
  signatureImageUrl: '',
  secondSignatureName: '',
  secondSignatureRole: '',
  secondSignatureImageUrl: '',
  showSecondSignature: false,
  borderStyle: 'official-security',
  codeFormat: 'cvte',
  showQrCode: true,
  showSeal: true,
  sealText: 'DOCUMENTO AUTÊNTICO • IET FORTE CAXIAS',
  legalInstruction: 'Instrução Nº 592, de 10 de agosto de 2020/Detran-DF',
  contranResolution: 'Resolução Nº 1.020/2025 do CONTRAN',
  validityText: 'com validade de cinco anos após o término do curso',
  showSyllabusOnVerso: true,
  defaultCertificateText:
    'A Instituição de Ensino de Trânsito da Base Administrativa do Quartel-General do Exército – Forte Caxias – ([INSTRUÇÃO]) certifica que [NOME DO ALUNO], inscrito no CPF nº [CPF] e no Nº REGISTRO [Nº REGISTRO], categoria “[CATEGORIA]”, concluiu com aproveitamento o [NOME DO CURSO], ministrado pela IET - Forte Caxias, no período de [DATA INICIAL] a [DATA FINAL], com carga horária de [CARGA HORÁRIA]h/a, [VALIDADE], conforme [RESOLUÇÃO].',
};

/**
 * Replaces placeholders like [NOME DO ALUNO], [NOME DO CURSO], [CARGA HORÁRIA], etc.
 */
export function interpolateCertificateText(
  templateText?: string,
  vars: {
    studentName?: string;
    courseName?: string;
    courseSubhead?: string;
    workloadHours?: number | string;
    startDate?: string;
    endDate?: string;
    issueDate?: string;
    instructorName?: string;
    institutionName?: string;
    institutionCnpj?: string;
    location?: string;
    studentDocument?: string;
    registrationNumber?: string;
    cnhCategory?: string;
    legalInstruction?: string;
    contranResolution?: string;
    validityText?: string;
    signatoryName?: string;
    signatoryRole?: string;
    signatoryCpf?: string;
  } = {}
): string {
  let text =
    templateText ||
    'A Instituição de Ensino de Trânsito da Base Administrativa do Quartel-General do Exército – Forte Caxias – ([INSTRUÇÃO]) certifica que [NOME DO ALUNO], inscrito no CPF nº [CPF] e no Nº REGISTRO [Nº REGISTRO], categoria “[CATEGORIA]”, concluiu com aproveitamento o [NOME DO CURSO], ministrado pela IET - Forte Caxias, no período de [DATA INICIAL] a [DATA FINAL], com carga horária de [CARGA HORÁRIA]h/a, [VALIDADE], conforme [RESOLUÇÃO].';

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

  const formatDateExtensoBR = (isoDate?: string) => {
    if (!isoDate) return '';
    try {
      const parts = isoDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
      }
      return isoDate;
    } catch {
      return isoDate;
    }
  };

  const startFormatted = formatDateBR(vars.startDate) || '08/06/2026';
  const endFormatted = formatDateBR(vars.endDate) || '16/06/2026';
  const issueFormatted = formatDateExtensoBR(vars.issueDate) || '18 de junho de 2026';

  text = text.replace(/\[NOME DO ALUNO\]/gi, vars.studentName || 'CARLOS HENRIQUE CAETANO DA SILVA');
  text = text.replace(/\[NOME DO CURSO\]/gi, vars.courseName || 'Curso Especializado para Condutores de Veículos de Transporte de Emergência');
  text = text.replace(/\[SUBTÍTULO DO CURSO\]/gi, vars.courseSubhead || 'Condutores de Veículos de Transporte de Emergência');
  text = text.replace(/\[CARGA HORÁRIA\]/gi, String(vars.workloadHours || '50'));
  text = text.replace(/\[DATA INICIAL\]/gi, startFormatted);
  text = text.replace(/\[DATA FINAL\]/gi, endFormatted);
  text = text.replace(/\[DATA DE EMISSÃO\]/gi, issueFormatted);
  text = text.replace(/\[DATA DE CONCLUSÃO\]/gi, endFormatted);
  text = text.replace(/\[INSTRUTOR\]/gi, vars.instructorName || 'Prof. Instrutor');
  text = text.replace(/\[INSTITUIÇÃO\]/gi, vars.institutionName || 'Base Administrativa do Quartel-General do Exército – Forte Caxias');
  text = text.replace(/\[LOCAL\]/gi, vars.location || 'Brasília-DF');
  text = text.replace(/\[DOCUMENTO\]/gi, vars.studentDocument || '067.440.731-84');
  text = text.replace(/\[CPF\]/gi, vars.studentDocument || '067.440.731-84');
  text = text.replace(/\[Nº REGISTRO\]/gi, vars.registrationNumber || '07575025319');
  text = text.replace(/\[REGISTRO\]/gi, vars.registrationNumber || '07575025319');
  text = text.replace(/\[CATEGORIA\]/gi, vars.cnhCategory || 'AD');
  text = text.replace(/\[INSTRUÇÃO\]/gi, vars.legalInstruction || 'Instrução Nº 592, de 10 de agosto de 2020/Detran-DF');
  text = text.replace(/\[RESOLUÇÃO\]/gi, vars.contranResolution || 'Resolução Nº 1.020/2025 do CONTRAN');
  text = text.replace(/\[CONTRAN\]/gi, vars.contranResolution || 'Resolução Nº 1.020/2025 do CONTRAN');
  text = text.replace(/\[VALIDADE\]/gi, vars.validityText || 'com validade de cinco anos após o término do curso');
  text = text.replace(/\[CNPJ\]/gi, vars.institutionCnpj || '21.744.847/0001-50');
  text = text.replace(/\[DIRETOR\]/gi, vars.signatoryName || 'Carlos Henrique Ferreira De Mello');
  text = text.replace(/\[SIGNATÁRIO\]/gi, vars.signatoryName || 'Carlos Henrique Ferreira De Mello');
  text = text.replace(/\[CPF DIRETOR\]/gi, vars.signatoryCpf || '981.050.007-68');

  return text;
}

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-cvte',
    name: 'Curso Especializado para Condutores de Veículos de Transporte de Emergência',
    courseSubhead: 'Condutores de Veículos de Transporte de Emergência',
    description: 'Curso de formação e capacitação profissional para condução de veículos de transporte de emergência, em conformidade com as diretrizes do CONTRAN e Detran-DF.',
    workloadHours: 50,
    instructorName: 'Cap. Paulo de Jesus / Ten. Erik Santiago',
    institutionName: 'Base Administrativa do Quartel-General do Exército – Forte Caxias',
    startDate: '2026-06-08',
    endDate: '2026-06-16',
    modality: 'presencial',
    legalInstruction: 'Instrução Nº 592, de 10 de agosto de 2020/Detran-DF',
    contranResolution: 'Resolução Nº 1.020/2025 do CONTRAN',
    syllabus: DEFAULT_CVTE_SYLLABUS,
    createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'course-1',
    name: 'Curso Especializado de Transporte Coletivo de Passageiros',
    courseSubhead: 'Transporte Coletivo de Passageiros',
    description: 'Formação para condução profissional de passageiros e segurança no trânsito.',
    workloadHours: 50,
    instructorName: 'Paulo de Jesus Camargo',
    institutionName: 'Base Administrativa do Quartel-General do Exército – Forte Caxias',
    startDate: '2026-05-10',
    endDate: '2026-05-20',
    modality: 'presencial',
    legalInstruction: 'Instrução Nº 592, de 10 de agosto de 2020/Detran-DF',
    contranResolution: 'Resolução Nº 1.020/2025 do CONTRAN',
    syllabus: DEFAULT_CVTE_SYLLABUS,
    createdAt: '2026-05-01T10:00:00Z',
  },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'student-carlos',
    fullName: 'CARLOS HENRIQUE CAETANO DA SILVA',
    email: 'carlos.caetano@eb.mil.br',
    documentNumber: '067.440.731-84',
    registrationNumber: '07575025319',
    cnhCategory: 'AD',
    courseId: 'course-cvte',
    completionDate: '2026-06-16',
    notes: 'Aprovado com média 10 em todas as disciplinas práticas e teóricas.',
    createdAt: '2026-06-05T14:00:00Z',
  },
  {
    id: 'student-2',
    fullName: 'MARCOS ANTONIO ALBUQUERQUE',
    email: 'marcos.albuquerque@eb.mil.br',
    documentNumber: '112.334.556-77',
    registrationNumber: '08492019482',
    cnhCategory: 'D',
    courseId: 'course-cvte',
    completionDate: '2026-06-16',
    notes: 'Conclusão com excelente aproveitamento.',
    createdAt: '2026-06-05T15:00:00Z',
  },
];

const rawCertificates = [
  {
    id: 'cert-cvte-006',
    uuid: 'a3d2e5b8-17a4-4f51-9c60-84f932e6a101',
    code: '006/CVTE/2026',
    studentId: 'student-carlos',
    studentName: 'CARLOS HENRIQUE CAETANO DA SILVA',
    studentDocument: '067.440.731-84',
    registrationNumber: '07575025319',
    cnhCategory: 'AD',
    courseId: 'course-cvte',
    courseName: 'Curso Especializado para Condutores de Veículos de Transporte de Emergência',
    courseSubhead: 'Condutores de Veículos de Transporte de Emergência',
    courseDescription: 'Capacitação especializada de condutores de emergência.',
    workloadHours: 50,
    modality: 'presencial' as const,
    instructorName: 'Paulo de Jesus Camargo / Erik Santiago',
    institutionName: 'Base Administrativa do Quartel-General do Exército – Forte Caxias',
    institutionCnpj: '21.744.847/0001-50',
    legalInstruction: 'Instrução Nº 592, de 10 de agosto de 2020/Detran-DF',
    contranResolution: 'Resolução Nº 1.020/2025 do CONTRAN',
    validityText: 'com validade de cinco anos após o término do curso',
    syllabus: DEFAULT_CVTE_SYLLABUS,
    issueDate: '2026-06-18',
    startDate: '2026-06-08',
    endDate: '2026-06-16',
    location: 'Brasília-DF',
    signatoryName: 'Carlos Henrique Ferreira De Mello',
    signatoryRole: 'Diretor Geral',
    signatoryCpf: '981.050.007-68',
    customText:
      'A Instituição de Ensino de Trânsito da Base Administrativa do Quartel-General do Exército – Forte Caxias – (Instrução Nº 592, de 10 de agosto de 2020/Detran-DF) certifica que CARLOS HENRIQUE CAETANO DA SILVA, inscrito no CPF nº 067.440.731-84 e no Nº REGISTRO 07575025319, categoria “AD”, concluiu com aproveitamento o Curso Especializado para Condutores de Veículos de Transporte de Emergência, ministrado pela IET - Forte Caxias, no período de 08 a 16 de junho de 2026, com carga horária de 50h/a, com validade de cinco anos após o término do curso, conforme Resolução Nº 1.020/2025 do CONTRAN.',
    templateId: 'official' as const,
    themeSettings: TEMPLATE_PRESETS[0].defaultTheme,
    status: 'active' as const,
    createdAt: '2026-06-18T10:30:00Z',
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
