import { Course, Student, Certificate, InstitutionSettings, TemplatePreset, AuditLog } from '../types';

export const TEMPLATE_PRESETS: TemplatePreset[] = [{
  id: 'official',
  name: 'Modelo Oficial CVTE',
  description: 'Modelo institucional inspirado no certificado oficial do curso de transporte de emergência.',
  badge: 'Modelo Oficial',
  defaultTheme: { primaryColor: '#111827', secondaryColor: '#64748B', accentColor: '#D97706', fontFamily: 'serif', borderStyle: 'double', backgroundPattern: 'subtle', showSignatoryTitle: true, showSeal: true },
}];

export const DEFAULT_CVTE_SYLLABUS = [
  { discipline: 'Legislação de Trânsito', workload: '10h/a', grade: 'Apto', instructor: 'INSTRUTOR RESPONSÁVEL' },
  { discipline: 'Direção Defensiva', workload: '15h/a', grade: 'Apto', instructor: 'INSTRUTOR RESPONSÁVEL' },
  { discipline: 'Noções de Primeiros Socorros, Respeito ao Meio Ambiente e Convívio Social', workload: '10h/a', grade: 'Apto', instructor: 'INSTRUTOR RESPONSÁVEL' },
  { discipline: 'Relacionamento Interpessoal e Condução de Veículos de Emergência', workload: '15h/a', grade: 'Apto', instructor: 'INSTRUTOR RESPONSÁVEL' },
];

// Mantido como alias temporário para componentes antigos que ainda importam este nome.
export const DEFAULT_AI_SYLLABUS = DEFAULT_CVTE_SYLLABUS;

export const INITIAL_INSTITUTION: InstitutionSettings = {
  name: 'Instituição de Ensino de Trânsito da Base Administrativa do Quartel-General do Exército – Forte Caxias',
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
  codeFormat: 'cvte',
  showSeal: true,
  sealText: 'BASE ADMINISTRATIVA DO QUARTEL-GENERAL DO EXÉRCITO',
  legalInstruction: 'Instrução Nº 592, de 10 de agosto de 2020/Detran-DF',
  contranResolution: 'Resolução Nº 1.020/2025 do CONTRAN',
  validityText: 'validade de cinco anos após o término do curso',
  showSyllabusOnVerso: true,
  defaultCertificateText: '[INSTITUIÇÃO] ([INSTRUÇÃO]) certifica que [NOME DO ALUNO], inscrito no CPF nº [CPF] e no Nº REGISTRO [REGISTRO], categoria “[CATEGORIA]”, concluiu com aproveitamento o [NOME DO CURSO], ministrado pela IET - Forte Caxias, no período de [DATA INICIAL] a [DATA FINAL], com carga horária de [CARGA HORÁRIA]h/a, com [VALIDADE], conforme [RESOLUÇÃO].',
};

export function interpolateCertificateText(templateText?: string, vars: {
  studentName?: string; courseName?: string; courseSubhead?: string; workloadHours?: number | string; startDate?: string; endDate?: string; issueDate?: string; instructorName?: string; institutionName?: string; institutionCnpj?: string; location?: string; studentDocument?: string; registrationNumber?: string; cnhCategory?: string; legalInstruction?: string; contranResolution?: string; validityText?: string; signatoryName?: string; signatoryRole?: string; signatoryCpf?: string;
} = {}): string {
  let text = templateText || INITIAL_INSTITUTION.defaultCertificateText || '';
  const formatDateBR = (isoDate?: string) => { if (!isoDate) return ''; const p = isoDate.split('-'); return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : isoDate; };
  const replacements: Array<[RegExp, string]> = [
    [/\[NOME DO ALUNO\]/gi, vars.studentName || 'NOME DO ALUNO'], [/\[NOME DO CURSO\]/gi, vars.courseName || 'Curso Especializado para Condutores de Veículos de Transporte de Emergência'], [/\[SUBTÍTULO DO CURSO\]/gi, vars.courseSubhead || 'Condutores de Veículos de Transporte de Emergência'], [/\[CARGA HORÁRIA\]/gi, String(vars.workloadHours || '50')], [/\[DATA INICIAL\]/gi, formatDateBR(vars.startDate)], [/\[DATA FINAL\]/gi, formatDateBR(vars.endDate)], [/\[INSTRUTOR\]/gi, vars.instructorName || 'Instrutor Responsável'], [/\[INSTITUIÇÃO\]/gi, vars.institutionName || INITIAL_INSTITUTION.name], [/\[LOCAL\]/gi, vars.location || 'Brasília-DF'], [/\[DOCUMENTO\]/gi, vars.studentDocument || ''], [/\[CPF\]/gi, vars.studentDocument || ''], [/\[Nº REGISTRO\]/gi, vars.registrationNumber || ''], [/\[REGISTRO\]/gi, vars.registrationNumber || ''], [/\[CATEGORIA\]/gi, vars.cnhCategory || ''], [/\[INSTRUÇÃO\]/gi, vars.legalInstruction || INITIAL_INSTITUTION.legalInstruction || ''], [/\[RESOLUÇÃO\]/gi, vars.contranResolution || INITIAL_INSTITUTION.contranResolution || ''], [/\[CONTRAN\]/gi, vars.contranResolution || INITIAL_INSTITUTION.contranResolution || ''], [/\[VALIDADE\]/gi, vars.validityText || INITIAL_INSTITUTION.validityText || ''], [/\[CNPJ\]/gi, vars.institutionCnpj || INITIAL_INSTITUTION.institutionCnpj || ''], [/\[DIRETOR\]/gi, vars.signatoryName || 'Diretor Geral'], [/\[SIGNATÁRIO\]/gi, vars.signatoryName || 'Diretor Geral'], [/\[CPF DIRETOR\]/gi, vars.signatoryCpf || '']
  ];
  replacements.forEach(([pattern, value]) => { text = text.replace(pattern, value); });
  return text;
}

export const INITIAL_COURSES: Course[] = [{
  id: 'course-cvte',
  name: 'Curso Especializado para Condutores de Veículos de Transporte de Emergência',
  courseSubhead: 'Condutores de Veículos de Transporte de Emergência',
  description: 'Curso especializado para capacitação de condutores de veículos de transporte de emergência.',
  workloadHours: 50,
  instructorName: 'Instrutor Responsável',
  institutionName: 'Instituição de Ensino de Trânsito da Base Administrativa do Quartel-General do Exército – Forte Caxias',
  startDate: '2026-06-08',
  endDate: '2026-06-16',
  modality: 'presencial',
  legalInstruction: 'Instrução Nº 592, de 10 de agosto de 2020/Detran-DF',
  contranResolution: 'Resolução Nº 1.020/2025 do CONTRAN',
  syllabus: DEFAULT_CVTE_SYLLABUS,
  createdAt: '2026-06-01T10:00:00Z',
}];

export const INITIAL_STUDENTS: Student[] = [];
export const INITIAL_CERTIFICATES: Certificate[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
