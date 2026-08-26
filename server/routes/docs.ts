import { Router, Response } from 'express';

const router = Router();

/**
 * Retorna a especificação e catálogo completo da API Segura de Certificados
 */
router.get('/', (_req, res: Response) => {
  res.json({
    openapi: '3.1.0',
    info: {
      title: 'CertifyAI - API Segura de Certificados',
      version: '1.0.0',
      description:
        'Arquitetura corporativa de microsserviços para emissão, consulta, integridade criptográfica e validação pública de certificados educacionais e profissionais.',
      contact: {
        name: 'Suporte à Integração e API CertifyAI',
        email: 'api@certify.academy',
      },
    },
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'Chave de API emitida no painel administrativo (ex: cert_live_...)',
      },
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'API-Key',
        description: 'Token no cabeçalho Authorization: Bearer cert_live_...',
      },
    },
    rateLimiting: {
      policy: 'Sliding Window por IP e Chave de API',
      standardHeaders: [
        'X-RateLimit-Limit: Limite máximo por janela (ex: 60 req/min)',
        'X-RateLimit-Remaining: Quantidade restante disponível',
        'X-RateLimit-Reset: Timestamp Unix de renovação da cota',
        'Retry-After: Segundos de espera em caso de HTTP 429',
      ],
    },
    endpoints: [
      {
        path: '/api/v1/certificates/validate/:codeOrUuid',
        method: 'GET',
        access: 'Public',
        scopeRequired: 'none',
        summary: 'Validar Certificado Publicamente',
        description:
          'Consulta pública e segura de autenticidade. Retorna estritamente as informações necessárias para comprovação e mascara dados sensíveis.',
        sampleResponse: {
          success: true,
          data: {
            code: 'CERT-2026-A8F42X',
            uuid: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
            status: 'active',
            statusLabel: 'Certificado Válido',
            student: {
              name: 'Lucas Henrique de Almeida',
              documentMasked: '***.456.789-**',
            },
            course: {
              name: 'Desenvolvimento Web Fullstack com React & Node',
              workloadHours: 120,
              modality: 'online',
            },
            institution: {
              name: 'Tech Academy Brasil',
              instructor: 'Prof. Carlos Eduardo Silveira',
            },
            validity: {
              issueDate: '2025-03-20',
              expiresAt: null,
              isExpired: false,
            },
            verification: {
              isAuthentic: true,
              verifiedAt: '2026-08-26T10:35:00Z',
            },
          },
        },
      },
      {
        path: '/api/v1/certificates/:idOrCode',
        method: 'GET',
        access: 'Protected',
        scopeRequired: 'certificates:read',
        summary: 'Consultar Certificado Completo',
        description: 'Recupera o registro completo do certificado para plataformas integradas e sistemas ERP.',
      },
      {
        path: '/api/v1/certificates/:idOrCode/status',
        method: 'GET',
        access: 'Protected',
        scopeRequired: 'certificates:read',
        summary: 'Consultar Status & Integridade Criptográfica',
        description: 'Avalia se o hash SHA-256 é consistente com a assinatura dos dados e audita histórico de anulação.',
      },
      {
        path: '/api/v1/certificates/issue',
        method: 'POST',
        access: 'Protected',
        scopeRequired: 'certificates:write',
        summary: 'Emitir Certificado',
        description:
          'Gera um novo certificado oficial com UUID v4, código alfanumérico, cálculo de hash SHA-256 e gravação na trilha de auditoria.',
        sampleRequest: {
          studentName: 'Mariana Costa Ribeiro',
          studentEmail: 'mariana.costa@exemplo.com.br',
          studentDocument: '98765432100',
          courseName: 'Inteligência Artificial Aplicada aos Negócios',
          workloadHours: 40,
          modality: 'hibrido',
          issueDate: '2026-03-25',
          institutionName: 'Tech Academy Brasil',
          instructorName: 'Dra. Fernanda Vasconcelos',
          signatoryName: 'Dra. Fernanda Vasconcelos',
          signatoryRole: 'Coordenadora Acadêmica',
        },
      },
      {
        path: '/api/v1/students',
        method: 'POST',
        access: 'Protected',
        scopeRequired: 'students:write',
        summary: 'Criar Aluno',
        description: 'Cadastra um novo participante na base com validação de documento e unicidade de e-mail.',
        sampleRequest: {
          fullName: 'Gabriel Santos Figueiredo',
          email: 'gabriel.santos@exemplo.com.br',
          documentNumber: '45678912344',
          courseId: 'course-1',
        },
      },
      {
        path: '/api/v1/courses',
        method: 'GET',
        access: 'Protected',
        scopeRequired: 'courses:read',
        summary: 'Consultar Cursos Disponíveis',
        description: 'Lista catálogo de cursos, cargas horárias e contadores de certificados emitidos.',
      },
    ],
    errorEnvelopeFormat: {
      success: false,
      error: {
        code: 'VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN_INSUFFICIENT_SCOPE | CERTIFICATE_NOT_FOUND | RATE_LIMIT_EXCEEDED | INTERNAL_SERVER_ERROR',
        message: 'Descrição amigável do erro ocorrido.',
        details: [
          {
            field: 'workloadHours',
            issue: 'A carga horária deve ser um número positivo.',
          },
        ],
        timestamp: '2026-08-26T10:35:00Z',
        path: '/api/v1/certificates/issue',
        status: 400,
      },
    },
  });
});

export default router;
