import { Request, Response, NextFunction } from 'express';

export interface ValidationErrorDetail {
  field: string;
  issue: string;
}

export function validateIssueCertificate(req: Request, res: Response, next: NextFunction) {
  const { studentName, studentId, courseName, courseId, workloadHours, modality, issueDate } = req.body;
  const errors: ValidationErrorDetail[] = [];

  if (!studentName && !studentId) {
    errors.push({ field: 'studentName', issue: 'O nome do aluno ou studentId é obrigatório.' });
  }

  if (!courseName && !courseId) {
    errors.push({ field: 'courseName', issue: 'O nome do curso ou courseId é obrigatório.' });
  }

  if (workloadHours !== undefined) {
    const num = Number(workloadHours);
    if (isNaN(num) || num <= 0 || num > 5000) {
      errors.push({
        field: 'workloadHours',
        issue: 'A carga horária (workloadHours) deve ser um número positivo entre 1 e 5000.',
      });
    }
  }

  if (modality && !['online', 'presencial', 'hibrido'].includes(modality.toLowerCase())) {
    errors.push({
      field: 'modality',
      issue: "A modalidade deve ser 'online', 'presencial' ou 'hibrido'.",
    });
  }

  if (issueDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(issueDate) || isNaN(new Date(issueDate).getTime())) {
      errors.push({
        field: 'issueDate',
        issue: 'Data de emissão inválida. Utilize o formato AAAA-MM-DD (ex: 2026-03-25).',
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados da requisição inválidos ou incompletos.',
        details: errors,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        status: 400,
      },
    });
  }

  next();
}

export function validateCreateStudent(req: Request, res: Response, next: NextFunction) {
  const { fullName, email, documentNumber } = req.body;
  const errors: ValidationErrorDetail[] = [];

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 3) {
    errors.push({
      field: 'fullName',
      issue: 'O nome completo do aluno deve conter no mínimo 3 caracteres.',
    });
  }

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push({
      field: 'email',
      issue: 'Informe um endereço de e-mail válido (ex: aluno@exemplo.com.br).',
    });
  }

  if (documentNumber) {
    const cleanDoc = documentNumber.replace(/\D/g, '');
    if (cleanDoc.length !== 11 && cleanDoc.length !== 14 && cleanDoc.length < 5) {
      errors.push({
        field: 'documentNumber',
        issue: 'Documento deve ser um CPF (11 dígitos), CNPJ (14 dígitos) ou documento válido.',
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Falha na validação dos dados cadastrais do aluno.',
        details: errors,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        status: 400,
      },
    });
  }

  next();
}

export function validateCreateCourse(req: Request, res: Response, next: NextFunction) {
  const { name, workloadHours, modality } = req.body;
  const errors: ValidationErrorDetail[] = [];

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    errors.push({
      field: 'name',
      issue: 'O título do curso deve conter no mínimo 3 caracteres.',
    });
  }

  if (!workloadHours || isNaN(Number(workloadHours)) || Number(workloadHours) <= 0) {
    errors.push({
      field: 'workloadHours',
      issue: 'A carga horária em horas deve ser um número maior que zero.',
    });
  }

  if (modality && !['online', 'presencial', 'hibrido'].includes(modality.toLowerCase())) {
    errors.push({
      field: 'modality',
      issue: "Modalidade inválida. Opções aceitas: 'online', 'presencial', 'hibrido'.",
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados do curso inválidos.',
        details: errors,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        status: 400,
      },
    });
  }

  next();
}

export function validateCancelCertificate(req: Request, res: Response, next: NextFunction) {
  const { reason } = req.body;
  const errors: ValidationErrorDetail[] = [];

  if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
    errors.push({
      field: 'reason',
      issue: 'A justificativa do cancelamento é obrigatória e deve ter pelo menos 5 caracteres.',
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Justificativa de cancelamento inválida.',
        details: errors,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        status: 400,
      },
    });
  }

  next();
}
