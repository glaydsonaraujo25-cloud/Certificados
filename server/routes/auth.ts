import { Router, Response } from 'express';
import { serverStore } from '../store';
import { AuthenticatedRequest, authenticateApiKey, requireScope } from '../middleware/auth';
import { generateApiKey } from '../utils/crypto';
import { ApiKey, ApiScope } from '../../src/types';

const router = Router();

/**
 * Listar Chaves de API (Protected - Admin only)
 */
router.get('/keys', authenticateApiKey, requireScope('admin'), (req: AuthenticatedRequest, res: Response) => {
  // Return keys (without exposing raw secrets for older keys if already stored)
  res.json({
    success: true,
    data: serverStore.apiKeys,
    meta: {
      total: serverStore.apiKeys.length,
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * Criar Nova Chave de API (Protected - Admin only)
 */
router.post('/keys', authenticateApiKey, requireScope('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { name, scopes, rateLimitPerMinute = 60, integrationType = 'custom', environment = 'live' } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'O nome da chave de API deve ter no mínimo 3 caracteres.',
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        status: 400,
      },
    });
  }

  const validScopes: ApiScope[] = [
    'certificates:read',
    'certificates:write',
    'certificates:admin',
    'students:read',
    'students:write',
    'courses:read',
    'courses:write',
    'admin',
  ];

  const selectedScopes: ApiScope[] = Array.isArray(scopes) && scopes.length > 0
    ? scopes.filter((s: string) => validScopes.includes(s as ApiScope))
    : ['certificates:read', 'certificates:write', 'students:read', 'courses:read'];

  const { key, maskedKey } = generateApiKey(environment === 'test' ? 'test' : 'live');

  const newApiKey: ApiKey = {
    id: `key-${Date.now()}`,
    name: name.trim(),
    key,
    maskedKey,
    scopes: selectedScopes,
    rateLimitPerMinute: Number(rateLimitPerMinute) || 60,
    status: 'active',
    createdAt: new Date().toISOString(),
    integrationType: integrationType || 'custom',
  };

  serverStore.apiKeys.unshift(newApiKey);

  res.status(201).json({
    success: true,
    data: newApiKey,
    meta: {
      message: 'Chave de API gerada com sucesso. Guarde o token com segurança.',
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * Revogar Chave de API (Protected - Admin only)
 */
router.post('/keys/:id/revoke', authenticateApiKey, requireScope('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const key = serverStore.apiKeys.find((k) => k.id === id);
  if (!key) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'KEY_NOT_FOUND',
        message: `Chave de API com ID '${id}' não foi encontrada.`,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        status: 404,
      },
    });
  }

  key.status = 'revoked';

  res.json({
    success: true,
    data: key,
    meta: {
      message: 'Chave de API revogada. Qualquer requisição futura utilizando este token será rejeitada com 401 Unauthorized.',
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * Consultar Logs de Requisições da API em Tempo Real (Protected - Admin only)
 */
router.get('/logs', authenticateApiKey, requireScope('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { limit = '100' } = req.query;
  const l = Math.min(200, Math.max(1, parseInt(limit as string, 10) || 100));

  res.json({
    success: true,
    data: serverStore.requestLogs.slice(0, l),
    meta: {
      totalLogs: serverStore.requestLogs.length,
      limit: l,
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
