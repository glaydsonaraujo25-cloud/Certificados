export type Modality = 'online' | 'presencial' | 'hibrido';

export type CertificateStatus = 'active' | 'cancelled' | 'expired';

export type CertificateTemplateId = 'official';

export type UserRole = 'admin' | 'operator' | 'instructor';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface SyllabusItem {
  id?: string;
  discipline: string;
  workload: string;
  grade: string;
  instructor: string;
}

export interface InstitutionSettings {
  name: string;
  institutionCnpj?: string;
  logoUrl?: string;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  state?: string;
  signatoryName?: string;
  signatoryRole?: string;
  signatoryCpf?: string;
  signatureImageUrl?: string;
  secondSignatureName?: string;
  secondSignatureRole?: string;
  secondSignatureImageUrl?: string;
  showSecondSignature?: boolean;
  backgroundImageUrl?: string;
  borderStyle?: 'official-security' | 'classic-gold' | 'modern-executive' | 'academic-formal';
  defaultCertificateText?: string;
  legalInstruction?: string;
  contranResolution?: string;
  validityText?: string;
  codeFormat?: 'sequential' | 'alphanumeric' | 'cvte';
  showQrCode?: boolean;
  showSeal?: boolean;
  sealText?: string;
  showSyllabusOnVerso?: boolean;
}

export interface Course {
  id: string;
  name: string;
  courseSubhead?: string;
  description: string;
  workloadHours: number;
  instructorName: string;
  institutionName: string;
  startDate: string;
  endDate: string;
  modality: Modality;
  legalInstruction?: string;
  contranResolution?: string;
  syllabus?: SyllabusItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  fullName: string;
  email: string;
  documentNumber?: string; // CPF or ID
  registrationNumber?: string; // Nº Registro CNH
  cnhCategory?: string; // Categoria (ex: "AD", "B", "D", "E")
  courseId?: string;
  completionDate?: string;
  notes?: string;
  createdAt: string;
}

export interface CertificateThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: 'serif' | 'sans' | 'display' | 'cinzel';
  borderStyle?: string;
  backgroundPattern?: string;
  showQrCode?: boolean;
  showSignatoryTitle?: boolean;
  showSeal?: boolean;
}

export interface Certificate {
  id: string;
  uuid: string; // Unique Universal Identifier v4
  code: string; // Public validation code, e.g. 006/CVTE/2026 or CERT-2026-000001
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentDocument?: string; // CPF
  registrationNumber?: string; // Nº REGISTRO CNH
  cnhCategory?: string; // Categoria CNH, ex: "AD"
  courseId: string;
  courseName: string;
  courseSubhead?: string; // ex: "Condutores de Veículos de Transporte de Emergência"
  courseDescription?: string;
  workloadHours: number;
  modality: Modality;
  instructorName: string;
  institutionName: string;
  institutionCnpj?: string;
  institutionLogoUrl?: string;
  legalInstruction?: string; // ex: "Instrução Nº 592, de 10 de agosto de 2020/Detran-DF"
  contranResolution?: string; // ex: "Resolução Nº 1.020/2025 do CONTRAN"
  validityText?: string; // ex: "com validade de cinco anos após o término do curso"
  syllabus?: SyllabusItem[];
  issueDate: string; // YYYY-MM-DD (Data de emissão)
  expiresAt?: string; // YYYY-MM-DD (Data de expiração/validade)
  startDate?: string;
  endDate?: string;
  location?: string;
  signatoryName: string;
  signatoryRole: string;
  signatoryCpf?: string;
  signatureImageUrl?: string;
  secondSignatoryName?: string;
  secondSignatoryRole?: string;
  secondSignatureImageUrl?: string;
  customText?: string;
  observations?: string;
  templateId?: CertificateTemplateId;
  themeSettings?: CertificateThemeSettings;
  integrityHash: string; // SHA-256 integrity hash calculated at issuance time
  status: CertificateStatus;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  createdAt: string;
}

export interface TemplatePreset {
  id: CertificateTemplateId;
  name: string;
  description: string;
  badge: string;
  defaultTheme: CertificateThemeSettings;
}

export interface AuditLog {
  id: string;
  action: 'issued' | 'cancelled' | 'duplicated' | 'updated' | 'exported' | 'integrity_verified' | 'tamper_detected';
  certificateId?: string;
  certificateCode?: string;
  userId: string;
  userName: string;
  timestamp: string;
  details: string;
}

export type ApiScope =
  | 'certificates:read'
  | 'certificates:write'
  | 'certificates:admin'
  | 'students:read'
  | 'students:write'
  | 'courses:read'
  | 'courses:write'
  | 'admin';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  maskedKey: string;
  scopes: ApiScope[];
  rateLimitPerMinute: number;
  status: 'active' | 'revoked';
  createdAt: string;
  lastUsedAt?: string;
  integrationType: 'custom' | 'moodle' | 'canvas' | 'hotmart' | 'eduzz' | 'hris';
}

export interface ApiRequestLog {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  statusCode: number;
  durationMs: number;
  clientId?: string;
  clientName?: string;
  ip: string;
  userAgent?: string;
  requestBodySnippet?: string;
  responseSnippet?: string;
  errorMessage?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    timestamp: string;
    [key: string]: any;
  };
  error?: {
    code: string;
    message: string;
    details?: Array<{ field?: string; issue: string }>;
    timestamp: string;
    path: string;
    status: number;
  };
}

