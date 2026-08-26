import { Router, Response } from 'express';
import { serverStore } from '../store';
import { AuthenticatedRequest, authenticateApiKey, requireScope } from '../middleware/auth';
import { validateCreateCourse } from '../middleware/validator';
import { Course, Modality } from '../../src/types';

const router = Router();

/**
 * Consultar Cursos (Protected)
 * Requires 'courses:read' or 'admin'
 */
router.get('/', authenticateApiKey, requireScope('courses:read'), (req: AuthenticatedRequest, res: Response) => {
  const { modality, search } = req.query;

  let list = [...serverStore.courses];

  if (modality && typeof modality === 'string' && modality !== 'all') {
    list = list.filter((c) => c.modality === modality);
  }

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.description.toLowerCase().includes(s) ||
        c.instructorName.toLowerCase().includes(s)
    );
  }

  // Enrich with count of certificates issued
  const enriched = list.map((course) => {
    const issuedCount = serverStore.certificates.filter((cert) => cert.courseId === course.id).length;
    return {
      ...course,
      certificatesIssuedCount: issuedCount,
    };
  });

  res.json({
    success: true,
    data: enriched,
    meta: {
      total: enriched.length,
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * Criar Curso (Protected)
 * Requires 'courses:write' or 'admin'
 */
router.post(
  '/',
  authenticateApiKey,
  requireScope('courses:write'),
  validateCreateCourse,
  (req: AuthenticatedRequest, res: Response) => {
    const {
      name,
      description = '',
      workloadHours,
      instructorName = 'Instrutor Titular',
      institutionName = 'Tech Academy Brasil',
      startDate = new Date().toISOString().split('T')[0],
      endDate = new Date().toISOString().split('T')[0],
      modality = 'online',
    } = req.body;

    const newCourse: Course = {
      id: `course-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      workloadHours: Number(workloadHours),
      instructorName: instructorName.trim(),
      institutionName: institutionName.trim(),
      startDate,
      endDate,
      modality: modality.toLowerCase() as Modality,
      createdAt: new Date().toISOString(),
    };

    serverStore.courses.unshift(newCourse);

    res.status(201).json({
      success: true,
      data: newCourse,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }
);

/**
 * Consultar Curso por ID (Protected)
 */
router.get('/:id', authenticateApiKey, requireScope('courses:read'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const course = serverStore.courses.find((c) => c.id === id);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'COURSE_NOT_FOUND',
        message: `Curso com ID '${id}' não foi encontrado.`,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        status: 404,
      },
    });
  }

  const certs = serverStore.certificates.filter((c) => c.courseId === course.id);

  res.json({
    success: true,
    data: {
      ...course,
      certificatesIssuedCount: certs.length,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
