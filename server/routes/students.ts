import { Router, Response } from 'express';
import { serverStore } from '../store';
import { AuthenticatedRequest, authenticateApiKey, requireScope } from '../middleware/auth';
import { validateCreateStudent } from '../middleware/validator';
import { Student } from '../../src/types';

const router = Router();

/**
 * Listar Alunos (Protected)
 * Requires 'students:read' or 'admin'
 */
router.get('/', authenticateApiKey, requireScope('students:read'), (req: AuthenticatedRequest, res: Response) => {
  const { query, courseId, page = '1', limit = '50' } = req.query;

  let list = [...serverStore.students];

  if (courseId && typeof courseId === 'string') {
    list = list.filter((s) => s.courseId === courseId);
  }

  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    list = list.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.documentNumber && s.documentNumber.includes(q))
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
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * Criar Aluno (Protected)
 * Requires 'students:write' or 'admin'
 */
router.post(
  '/',
  authenticateApiKey,
  requireScope('students:write'),
  validateCreateStudent,
  (req: AuthenticatedRequest, res: Response) => {
    const { fullName, email, documentNumber, courseId, completionDate, notes } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate email
    const existing = serverStore.students.find((s) => s.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'STUDENT_ALREADY_EXISTS',
          message: `Já existe um aluno cadastrado com o e-mail '${normalizedEmail}'.`,
          details: [{ field: 'email', issue: 'E-mail duplicado.' }],
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
          status: 409,
        },
      });
    }

    const newStudent: Student = {
      id: `student-${Date.now()}`,
      fullName: fullName.trim(),
      email: normalizedEmail,
      documentNumber: documentNumber ? documentNumber.trim() : undefined,
      courseId: courseId || undefined,
      completionDate: completionDate || undefined,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };

    serverStore.students.unshift(newStudent);

    res.status(201).json({
      success: true,
      data: newStudent,
      meta: {
        timestamp: new Date().toISOString(),
        createdById: req.apiKey?.id,
        createdByName: req.apiKey?.name,
      },
    });
  }
);

/**
 * Consultar Aluno por ID (Protected)
 */
router.get('/:id', authenticateApiKey, requireScope('students:read'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const student = serverStore.students.find((s) => s.id === id);

  if (!student) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'STUDENT_NOT_FOUND',
        message: `Aluno com ID '${id}' não foi localizado.`,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        status: 404,
      },
    });
  }

  // Also include issued certificates for this student
  const studentCerts = serverStore.certificates.filter(
    (c) => c.studentId === student.id || c.studentDocument === student.documentNumber
  );

  res.json({
    success: true,
    data: {
      ...student,
      certificates: studentCerts.map((c) => ({
        id: c.id,
        code: c.code,
        uuid: c.uuid,
        courseName: c.courseName,
        status: c.status,
        issueDate: c.issueDate,
      })),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
