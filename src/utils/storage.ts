import {
  Course,
  Student,
  Certificate,
  InstitutionSettings,
  TemplatePreset,
  AuditLog,
} from '../types';

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'official',
    name: 'Modelo Oficial Padronizado',
    description: 'Padrão único e oficial da instituição com brasões, bordas institucionais, código de autenticidade e assinatura.',
    badge: 'Modelo Oficial',
    defaultTheme: {
      primaryColor: '#1E293B',
      secondaryColor: '#94A3B8',
      accentColor: '#D97706',
      fontFamily: 'serif',
      borderStyle: 'double',
      backgroundPattern: 'subtle',
      showSignatoryTitle: true,
      showSeal: true,
    },
  },
];

export const DEFAULT_AI_SYLLABUS = [
  { discipline: 'Informática Básica e Sistemas Operacionais', workload: '40h/a', grade: '10', instructor: 'INSTRUTOR RESPONSÁVEL' },
  { discipline: 'Ferramentas de Escritório e Produtividade', workload: '60h/a', grade: '10', instructor: 'INSTRUTOR RESPONSÁVEL' },
  { discipline: 'Inteligência Artificial Aplicada ao Escritório', workload: '60h/a', grade: '10', instructor: 'INSTRUTOR RESPONSÁVEL' },
  { discipline: 'Engenharia de Prompts e IA Generativa', workload: '40h/a', grade: '10', instructor: 'INSTRUTOR RESPONSÁVEL' },
  { discipline: 'Segurança Digital, Ética e Boas Práticas com IA', workload: '30h/a', grade: '10', instructor: 'INSTRUTOR RESPONSÁVEL' },
];

export const DEFAULT_CVTE_SYLLABUS = DEFAULT_AI_SYLLABUS;

export const INITIAL_INSTITUTION: InstitutionSettings = {
  name: 'Base Administrativa do Quartel-General do Exército – Forte Caxias',
  institutionCnpj: '21.744.847/0001-50',
  logoUrl: '',
  email: 'badmqgex@eb.mil.br',
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
  codeFormat: 'sequential',
  showSeal: true,
  sealText: 'DOCUMENTO AUTÊNTICO • FORTE CAXIAS',
  legalInstruction: '',
  contranResolution: '',
  validityText: 'certificação referente à conclusão e ao aproveitamento no curso',
  showSyllabusOnVerso: true,
  defaultCertificateText: 'A Base Administrativa do Quartel-General do Exército – Forte Caxias certifica que [NOME DO ALUNO], inscrito no CPF nº [CPF], concluiu com aproveitamento o curso [NOME DO CURSO], realizado no período de [DATA INICIAL] a [DATA FINAL], com carga horária total de [CARGA HORÁRIA] horas, desenvolvendo competências em informática, produtividade digital e uso responsável de ferramentas de Inteligência Artificial.',
};

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
  let text = templateText || INITIAL_INSTITUTION.defaultCertificateText || '';
  const formatDateBR = (isoDate?: string) => {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : isoDate;
  };
  const formatDateExtensoBR = (isoDate?: string) => {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };
  const startFormatted = formatDateBR(vars.startDate);
  const endFormatted = formatDateBR(vars.endDate);
  const issueFormatted = formatDateExtensoBR(vars.issueDate);

  text = text.replace(/\[NOME DO ALUNO\]/gi, vars.studentName || 'NOME DO ALUNO');
  text = text.replace(/\[NOME DO CURSO\]/gi, vars.courseName || 'Operador de Computador com IA');
  text = text.replace(/\[SUBTÍTULO DO CURSO\]/gi, vars.courseSubhead || 'Operador de Computador com Inteligência Artificial');
  text = text.replace(/\[CARGA HORÁRIA\]/gi, String(vars.workloadHours || '230'));
  text = text.replace(/\[DATA INICIAL\]/gi, startFormatted);
  text = text.replace(/\[DATA FINAL\]/gi, endFormatted);
  text = text.replace(/\[DATA DE EMISSÃO\]/gi, issueFormatted);
  text = text.replace(/\[DATA DE CONCLUSÃO\]/gi, endFormatted);
  text = text.replace(/\[INSTRUTOR\]/gi, vars.instructorName || 'Instrutor Responsável');
  text = text.replace(/\[INSTITUIÇÃO\]/gi, vars.institutionName || INITIAL_INSTITUTION.name);
  text = text.replace(/\[LOCAL\]/gi, vars.location || 'Brasília-DF');
  text = text.replace(/\[DOCUMENTO\]/gi, vars.studentDocument || '');
  text = text.replace(/\[CPF\]/gi, vars.studentDocument || '');
  text = text.replace(/\[Nº REGISTRO\]/gi, vars.registrationNumber || '');
  text = text.replace(/\[REGISTRO\]/gi, vars.registrationNumber || '');
  text = text.replace(/\[CATEGORIA\]/gi, vars.cnhCategory || '');
  text = text.replace(/\[INSTRUÇÃO\]/gi, vars.legalInstruction || '');
  text = text.replace(/\[RESOLUÇÃO\]/gi, vars.contranResolution || '');
  text = text.replace(/\[CONTRAN\]/gi, vars.contranResolution || '');
  text = text.replace(/\[VALIDADE\]/gi, vars.validityText || '');
  text = text.replace(/\[CNPJ\]/gi, vars.institutionCnpj || INITIAL_INSTITUTION.institutionCnpj || '');
  text = text.replace(/\[DIRETOR\]/gi, vars.signatoryName || 'Diretor Geral');
  text = text.replace(/\[SIGNATÁRIO\]/gi, vars.signatoryName || 'Diretor Geral');
  text = text.replace(/\[CPF DIRETOR\]/gi, vars.signatoryCpf || '');
  return text;
}

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-operador-ia',
    name: 'Operador de Computador com IA',
    courseSubhead: 'Operador de Computador com Inteligência Artificial',
    description: 'Formação profissional em operação de computadores, ferramentas de escritório, produtividade digital, IA generativa, engenharia de prompts, segurança digital e uso responsável da Inteligência Artificial.',
    workloadHours: 230,
    instructorName: 'Instrutor Responsável',
    institutionName: 'Base Administrativa do Quartel-General do Exército – Forte Caxias',
    startDate: '2026-06-01',
    endDate: '2026-08-26',
    modality: 'presencial',
    legalInstruction: '',
    contranResolution: '',
    syllabus: DEFAULT_AI_SYLLABUS,
    createdAt: '2026-06-01T10:00:00Z',
  },
];

export const INITIAL_STUDENTS: Student[] = [];
export const INITIAL_CERTIFICATES: Certificate[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
