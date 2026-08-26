import { Router, Response } from 'express';
import { serverStore } from '../store';
import { AuthenticatedRequest, authenticateApiKey, requireScope } from '../middleware/auth';
import { validateIssueCertificate, validateCancelCertificate } from '../middleware/validator';
import { calculateCertificateHash, generateUUID, maskDocumentNumber } from '../utils/crypto';
import { Certificate, Modality } from '../../src/types';

const router = Router();

router.get('/validate/:codeOrUuid', (req, res: Response) => {
  const { codeOrUuid } = req.params;
  const clean = codeOrUuid.trim().toUpperCase();
  const cert = serverStore.certificates.find(
    (c) => c.code.toUpperCase() === clean || c.uuid.toUpperCase() === clean || c.id === codeOrUuid
  );

  if (!cert) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'CERTIFICATE_NOT_FOUND',
        message: 'Nenhum certificado registrado foi encontrado para o código ou identificador informado.',
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        status: 404,
      },
    });
  }

  const recomputedHash = calculateCertificateHash({
    uuid: cert.uuid,
    code: cert.code,
    studentName: cert.studentName,
    studentDocument: cert.studentDocument,
    courseName: cert.courseName,
    workloadHours: cert.workloadHours,
    modality: cert.modality,
    issueDate: cert.issueDate,
    institutionName: cert.institutionName,
    signatoryName: cert.signatoryName,
  });

  const hashMatches = recomputedHash === cert.integrityHash;
  const isExpired = cert.expiresAt ? new Date() > new Date(cert.expiresAt) : false;
  const effectiveStatus = cert.status === 'cancelled' ? 'cancelled' : isExpired ? 'expired' : 'active';
  const isAuthentic = hashMatches && effectiveStatus === 'active';

  return res.json({
    success: true,
    data: {
      code: cert.code,
      uuid: cert.uuid,
      status: effectiveStatus,
      statusLabel:
        effectiveStatus === 'active'
          ? 'Certificado Válido'
          : effectiveStatus === 'expired'
          ? 'Certificado Expirado'
          : 'Certificado Cancelado',
      student: {
        name: cert.studentName,
        documentMasked: cert.studentDocument ? maskDocumentNumber(cert.studentDocument) : undefined,
      },
      course: {
        name: cert.courseName,
        workloadHours: cert.workloadHours,
        modality: cert.modality,
      },
      institution: {
        name: cert.institutionName,
        instructor: cert.instructorName,
      },
      validity: {
        issueDate: cert.issueDate,
        expiresAt: cert.expiresAt || null,
        isExpired,
      },
      verification: {
        isAuthentic,
        integrityVerified: hashMatches,
        verifiedAt: new Date().toISOString(),
      },
      ...(effectiveStatus === 'cancelled' && {
        cancellation: {
          cancelledAt: cert.cancelledAt,
          reason: cert.cancellationReason || 'Documento revogado pela instituição emissora.',
        },
      }),
    },
    meta: {
      timestamp: new Date().toISOString(),
      service: 'CertifyAI Public Verification Engine',
    },
  });
});

router.get('/', authenticateApiKey, requireScope('certificates:read'), (req: AuthenticatedRequest, res: Response) => {
  const { status, studentId, courseId, query, page = '1', limit = '50' } = req.query;
  let list = [...serverStore.certificates];

  if (status && typeof status === 'string' && status !== 'all') list = list.filter((c) => c.status === status);
  if (studentId && typeof studentId === 'string') list = list.filter((c) => c.studentId === studentId);
  if (courseId && typeof courseId === 'string') list = list.filter((c) => c.courseId === courseId);
  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    list = list.filter((c) =>
      c.studentName.toLowerCase().includes(q) ||
      c.courseName.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.uuid.toLowerCase().includes(q)
    );
  }

  const p = Math.max(1, parseInt(page as string, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
  const total = list.length;

  res.json({
    success: true,
    data: list.slice((p - 1) * l, p * l),
    meta: { total, page: p, limit: l, totalPages: Math.ceil(total / l), timestamp: new Date().toISOString() },
  });
});

router.get('/:idOrCode', authenticateApiKey, requireScope('certificates:read'), (req: AuthenticatedRequest, res: Response) => {
  const { idOrCode } = req.params;
  const clean = idOrCode.trim().toUpperCase();
  const cert = serverStore.certificates.find(
    (c) => c.id === idOrCode || c.code.toUpperCase() === clean || c.uuid.toUpperCase() === clean
  );

  if (!cert) return res.status(404).json({ success: false, error: { code: 'CERTIFICATE_NOT_FOUND', message: 'Certificado não encontrado.', timestamp: new Date().toISOString(), path: req.originalUrl, status: 404 } });

  res.json({ success: true, data: cert, meta: { timestamp: new Date().toISOString() } });
});

router.post('/issue', authenticateApiKey, requireScope('certificates:write'), validateIssueCertificate, (req: AuthenticatedRequest, res: Response) => {
  const {
    studentId,
    studentName,
    studentEmail,
    studentDocument,
    courseId,
    courseName,
    courseDescription,
    workloadHours,
    modality = 'presencial',
    instructorName,
    institutionName = 'Instituição de Ensino',
    issueDate = new Date().toISOString().split('T')[0],
    expiresAt,
    location = 'Brasília-DF',
    signatoryName = 'Diretor Geral',
    signatoryRole = 'Diretor Geral',
    customText,
    themeSettings,
  } = req.body;

  let resolvedStudentName = studentName;
  let resolvedStudentDoc = studentDocument;
  const finalStudentId = studentId || `student-${Date.now()}`;

  if (studentId) {
    const existingStudent = serverStore.students.find((s) => s.id === studentId);
    if (existingStudent) {
      resolvedStudentName = existingStudent.fullName;
      resolvedStudentDoc = existingStudent.documentNumber || resolvedStudentDoc;
    }
  } else if (studentName && studentEmail) {
    serverStore.students.push({
      id: finalStudentId,
      fullName: studentName.trim(),
      email: studentEmail.trim(),
      documentNumber: studentDocument ? studentDocument.trim() : undefined,
      courseId: courseId || undefined,
      completionDate: issueDate,
      createdAt: new Date().toISOString(),
    });
  }

  let resolvedCourseName = courseName;
  let resolvedWorkload = workloadHours ? Number(workloadHours) : 40;
  let resolvedInstructor = instructorName || 'Coordenação Acadêmica';
  const finalCourseId = courseId || `course-${Date.now()}`;

  if (courseId) {
    const existingCourse = serverStore.courses.find((c) => c.id === courseId);
    if (existingCourse) {
      resolvedCourseName = existingCourse.name;
      resolvedWorkload = existingCourse.workloadHours || resolvedWorkload;
      resolvedInstructor = existingCourse.instructorName || resolvedInstructor;
    }
  }

  const year = new Date(issueDate).getFullYear() || new Date().getFullYear();
  const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
  const code = `CERT-${year}-${randomHex}`;
  const uuid = generateUUID();
  const newCertId = `cert-${Date.now()}`;

  const integrityHash = calculateCertificateHash({
    uuid,
    code,
    studentName: resolvedStudentName,
    studentDocument: resolvedStudentDoc,
    courseName: resolvedCourseName,
    workloadHours: resolvedWorkload,
    modality: modality.toLowerCase(),
    issueDate,
    institutionName,
    signatoryName,
  });

  const newCertificate: Certificate = {
    id: newCertId,
    uuid,
    code,
    studentId: finalStudentId,
    studentName: resolvedStudentName,
    studentDocument: resolvedStudentDoc,
    courseId: finalCourseId,
    courseName: resolvedCourseName,
    courseDescription: courseDescription || `Conclusão do curso ${resolvedCourseName}`,
    workloadHours: resolvedWorkload,
    modality: modality.toLowerCase() as Modality,
    instructorName: resolvedInstructor,
    institutionName,
    issueDate,
    expiresAt: expiresAt || undefined,
    location,
    signatoryName,
    signatoryRole,
    customText: customText || `Certificamos que ${resolvedStudentName} concluiu com aproveitamento o curso de ${resolvedCourseName}, totalizando ${resolvedWorkload} horas de formação.`,
    templateId: 'official',
    themeSettings: themeSettings || { showQrCode: true, showSeal: true, showSignatoryTitle: true },
    integrityHash,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  serverStore.certificates.unshift(newCertificate);
  serverStore.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    action: 'issued',
    certificateId: newCertId,
    certificateCode: code,
    userId: req.apiKey?.id || 'api-client',
    userName: `API Client: ${req.apiKey?.name || 'Sistema Externo'}`,
    timestamp: new Date().toISOString(),
    details: `Emissão via API REST. Modelo oficial aplicado.`,
  });

  const protocol = req.secure || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const host = req.get('host') || 'localhost:3000';
  const validationUrl = `${protocol}://${host}/verificar/${encodeURIComponent(newCertificate.code)}`;

  res.status(201).json({
    success: true,
    data: {
      id: newCertificate.id,
      uuid: newCertificate.uuid,
      code: newCertificate.code,
      status: newCertificate.status,
      studentName: newCertificate.studentName,
      courseName: newCertificate.courseName,
      workloadHours: newCertificate.workloadHours,
      issueDate: newCertificate.issueDate,
      expiresAt: newCertificate.expiresAt || null,
      validationUrl,
      qrCodeContent: validationUrl,
    },
    meta: { issuedBy: req.apiKey?.name || 'Sistema Integrado', timestamp: new Date().toISOString() },
  });
});

router.post('/:id/cancel', authenticateApiKey, requireScope('certificates:admin'), validateCancelCertificate, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const cert = serverStore.certificates.find((c) => c.id === id || c.code === id || c.uuid === id);

  if (!cert) return res.status(404).json({ success: false, error: { code: 'CERTIFICATE_NOT_FOUND', message: 'Certificado não encontrado.', timestamp: new Date().toISOString(), path: req.originalUrl, status: 404 } });
  if (cert.status === 'cancelled') return res.status(400).json({ success: false, error: { code: 'ALREADY_CANCELLED', message: 'Este certificado já está cancelado.', timestamp: new Date().toISOString(), path: req.originalUrl, status: 400 } });

  cert.status = 'cancelled';
  cert.cancelledAt = new Date().toISOString();
  cert.cancelledBy = req.apiKey?.name || 'Sistema Externo';
  cert.cancellationReason = reason;

  serverStore.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    action: 'cancelled',
    certificateId: cert.id,
    certificateCode: cert.code,
    userId: req.apiKey?.id || 'api-client',
    userName: req.apiKey?.name || 'Sistema Externo',
    timestamp: new Date().toISOString(),
    details: `Certificado cancelado via API. Motivo: ${reason}`,
  });

  res.json({ success: true, data: { id: cert.id, code: cert.code, status: cert.status, cancelledAt: cert.cancelledAt }, meta: { timestamp: new Date().toISOString() } });
});

export default router;
