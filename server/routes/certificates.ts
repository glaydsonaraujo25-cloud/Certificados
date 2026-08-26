import { Router, Response } from 'express';
import { serverStore } from '../store';
import { AuthenticatedRequest, authenticateApiKey, requireScope } from '../middleware/auth';
import { validateIssueCertificate, validateCancelCertificate } from '../middleware/validator';
import { calculateCertificateHash, generateUUID, maskDocumentNumber } from '../utils/crypto';
import { Certificate, Modality, CertificateTemplateId } from '../../src/types';

const router = Router();

/**
 * 1. Public Endpoint: Validar Certificado
 * Publicly accessible, rate limited, strictly returns ONLY necessary public verification fields.
 * Never exposes internal signatures, raw hashes, or admin logs.
 */
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

  // Determine expiration state
  let effectiveStatus = cert.status;
  if (cert.status === 'active' && cert.expiresAt) {
    const expDate = new Date(cert.expiresAt);
    const today = new Date();
    if (today > expDate) {
      effectiveStatus = 'expired';
    }
  }

  // Strictly return ONLY essential public information
  const publicPayload = {
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
      isExpired: effectiveStatus === 'expired',
    },
    verification: {
      isAuthentic: effectiveStatus !== 'cancelled',
      verifiedAt: new Date().toISOString(),
    },
    ...(effectiveStatus === 'cancelled' && {
      cancellation: {
        cancelledAt: cert.cancelledAt,
        reason: cert.cancellationReason || 'Documento revogado pela instituição emissora.',
      },
    }),
  };

  return res.json({
    success: true,
    data: publicPayload,
    meta: {
      timestamp: new Date().toISOString(),
      service: 'CertifyAI Public Verification Engine',
    },
  });
});

/**
 * 2. Protected Endpoint: Consultar Lista de Certificados
 * Requires 'certificates:read' or 'admin'
 */
router.get('/', authenticateApiKey, requireScope('certificates:read'), (req: AuthenticatedRequest, res: Response) => {
  const { status, studentId, courseId, query, page = '1', limit = '50' } = req.query;

  let list = [...serverStore.certificates];

  if (status && typeof status === 'string' && status !== 'all') {
    list = list.filter((c) => c.status === status);
  }

  if (studentId && typeof studentId === 'string') {
    list = list.filter((c) => c.studentId === studentId);
  }

  if (courseId && typeof courseId === 'string') {
    list = list.filter((c) => c.courseId === courseId);
  }

  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    list = list.filter(
      (c) =>
        c.studentName.toLowerCase().includes(q) ||
        c.courseName.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.uuid.toLowerCase().includes(q)
    );
  }

  const p = Math.max(1, parseInt(page as string, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
  const total = list.length;
  const paginated = list.slice((p - 1) * l, p * l);

  res.json({
    success: true,
    data: paginated,
    meta: {
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * 3. Protected Endpoint: Consultar Certificado Específico (Full Data)
 * Requires 'certificates:read' or 'admin'
 */
router.get('/:idOrCode', authenticateApiKey, requireScope('certificates:read'), (req: AuthenticatedRequest, res: Response) => {
  const { idOrCode } = req.params;
  const clean = idOrCode.trim().toUpperCase();

  const cert = serverStore.certificates.find(
    (c) => c.id === idOrCode || c.code.toUpperCase() === clean || c.uuid.toUpperCase() === clean
  );

  if (!cert) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'CERTIFICATE_NOT_FOUND',
        message: `Certificado não encontrado para o identificador '${idOrCode}'.`,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        status: 404,
      },
    });
  }

  res.json({
    success: true,
    data: cert,
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * 4. Protected Endpoint: Consultar Status & Integridade Criptográfica
 * Requires 'certificates:read' or 'admin'
 */
router.get('/:idOrCode/status', authenticateApiKey, requireScope('certificates:read'), (req: AuthenticatedRequest, res: Response) => {
  const { idOrCode } = req.params;
  const clean = idOrCode.trim().toUpperCase();

  const cert = serverStore.certificates.find(
    (c) => c.id === idOrCode || c.code.toUpperCase() === clean || c.uuid.toUpperCase() === clean
  );

  if (!cert) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'CERTIFICATE_NOT_FOUND',
        message: 'Certificado não encontrado para verificação de status.',
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        status: 404,
      },
    });
  }

  // Recalculate hash to verify integrity
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

  const isHashMatch = recomputedHash === cert.integrityHash;
  const isExpired = cert.expiresAt ? new Date() > new Date(cert.expiresAt) : false;
  const isCancelled = cert.status === 'cancelled';

  res.json({
    success: true,
    data: {
      certificateId: cert.id,
      code: cert.code,
      uuid: cert.uuid,
      currentStatus: cert.status,
      isExpired,
      isCancelled,
      isAuthentic: isHashMatch && !isCancelled && !isExpired,
      integrity: {
        hashMatches: isHashMatch,
        registeredHash: cert.integrityHash,
        evaluatedHash: recomputedHash,
        algorithm: 'SHA-256',
      },
      audit: {
        issuedAt: cert.createdAt,
        cancelledAt: cert.cancelledAt || null,
        cancellationReason: cert.cancellationReason || null,
      },
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * 5. Protected Endpoint: Emitir Certificado
 * Requires 'certificates:write' or 'admin'
 * Ideal for Moodle, Canvas, Hotmart, Eduzz Webhook integrations and corporate LMS.
 */
router.post(
  '/issue',
  authenticateApiKey,
  requireScope('certificates:write'),
  validateIssueCertificate,
  (req: AuthenticatedRequest, res: Response) => {
    const {
      studentId,
      studentName,
      studentEmail,
      studentDocument,
      courseId,
      courseName,
      courseDescription,
      workloadHours,
      modality = 'online',
      instructorName,
      institutionName = 'Tech Academy Brasil',
      issueDate = new Date().toISOString().split('T')[0],
      expiresAt,
      location = 'São Paulo, SP',
      signatoryName = 'Prof. Carlos Eduardo Silveira',
      signatoryRole = 'Diretor Acadêmico',
      customText,
      templateId = 'modern',
      themeSettings,
    } = req.body;

    // Resolve Student
    let resolvedStudentName = studentName;
    let resolvedStudentDoc = studentDocument;
    let finalStudentId = studentId || `student-${Date.now()}`;

    if (studentId) {
      const existingStudent = serverStore.students.find((s) => s.id === studentId);
      if (existingStudent) {
        resolvedStudentName = existingStudent.fullName;
        resolvedStudentDoc = existingStudent.documentNumber || resolvedStudentDoc;
      }
    } else if (studentName && studentEmail) {
      // Auto-register student if email provided
      const newStudent = {
        id: finalStudentId,
        fullName: studentName.trim(),
        email: studentEmail.trim(),
        documentNumber: studentDocument ? studentDocument.trim() : undefined,
        courseId: courseId || undefined,
        completionDate: issueDate,
        createdAt: new Date().toISOString(),
      };
      serverStore.students.push(newStudent);
    }

    // Resolve Course
    let resolvedCourseName = courseName;
    let resolvedWorkload = workloadHours ? Number(workloadHours) : 40;
    let resolvedInstructor = instructorName || 'Coordenação Acadêmica';
    let finalCourseId = courseId || `course-${Date.now()}`;

    if (courseId) {
      const existingCourse = serverStore.courses.find((c) => c.id === courseId);
      if (existingCourse) {
        resolvedCourseName = existingCourse.name;
        resolvedWorkload = existingCourse.workloadHours || resolvedWorkload;
        resolvedInstructor = existingCourse.instructorName || resolvedInstructor;
      }
    }

    // Generate unique code (e.g. CERT-2026-X89ABC)
    const year = new Date(issueDate).getFullYear() || 2026;
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `CERT-${year}-${randomHex}`;
    const uuid = generateUUID();
    const newCertId = `cert-${Date.now()}`;

    // Calculate Cryptographic Integrity Hash
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

    const defaultTheme = {
      primaryColor: '#312e81',
      secondaryColor: '#4f46e5',
      accentColor: '#f59e0b',
      fontFamily: 'sans' as const,
      borderStyle: 'double' as const,
      backgroundPattern: 'subtle' as const,
      showQrCode: true,
      showSignatoryTitle: true,
      showSeal: true,
    };

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
      customText:
        customText ||
        `Certificamos que ${resolvedStudentName} concluiu com aproveitamento o curso de ${resolvedCourseName}, totalizando ${resolvedWorkload} horas de formação.`,
      templateId: 'official',
      themeSettings: { ...defaultTheme, ...(themeSettings || {}) },
      integrityHash,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    serverStore.certificates.unshift(newCertificate);

    // Record Audit Log
    serverStore.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: 'issued',
      certificateId: newCertId,
      certificateCode: code,
      userId: req.apiKey?.id || 'api-client',
      userName: `API Client: ${req.apiKey?.name || 'Sistema Externo'}`,
      timestamp: new Date().toISOString(),
      details: `Emissão automática via API REST (Integração: ${req.apiKey?.integrationType || 'Webhook'}). Hash: ${integrityHash.substring(0, 16)}...`,
    });

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
        integrityHash: newCertificate.integrityHash,
        validationUrl: `https://${req.get('host') || 'certify.academy'}/#validate?code=${newCertificate.code}`,
        qrCodeContent: `https://${req.get('host') || 'certify.academy'}/#validate?code=${newCertificate.code}`,
      },
      meta: {
        issuedBy: req.apiKey?.name || 'Sistema Integrado',
        timestamp: new Date().toISOString(),
      },
    });
  }
);

/**
 * 6. Protected Endpoint: Cancelar/Revogar Certificado
 * Requires 'certificates:admin' or 'admin'
 */
router.post(
  '/:id/cancel',
  authenticateApiKey,
  requireScope('certificates:admin'),
  validateCancelCertificate,
  (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;

    const cert = serverStore.certificates.find((c) => c.id === id || c.code === id || c.uuid === id);

    if (!cert) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CERTIFICATE_NOT_FOUND',
          message: `Certificado não encontrado para o identificador '${id}'.`,
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
          status: 404,
        },
      });
    }

    if (cert.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_CANCELLED',
          message: 'Este certificado já se encontra cancelado.',
          details: [{ issue: `Cancelado anteriormente em ${cert.cancelledAt}.` }],
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
          status: 400,
        },
      });
    }

    cert.status = 'cancelled';
    cert.cancelledAt = new Date().toISOString();
    cert.cancelledBy = req.apiKey?.name || 'API Administrator';
    cert.cancellationReason = reason.trim();

    // Audit log
    serverStore.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: 'cancelled',
      certificateId: cert.id,
      certificateCode: cert.code,
      userId: req.apiKey?.id || 'admin',
      userName: req.apiKey?.name || 'Admin',
      timestamp: new Date().toISOString(),
      details: `Revogação formal de certificado via API: "${reason.trim()}".`,
    });

    res.json({
      success: true,
      data: {
        id: cert.id,
        code: cert.code,
        uuid: cert.uuid,
        status: 'cancelled',
        cancelledAt: cert.cancelledAt,
        cancellationReason: cert.cancellationReason,
      },
      meta: {
        timestamp: new Date().toISOString(),
        message: 'Certificado cancelado e revogado com sucesso no validador público.',
      },
    });
  }
);

export default router;
