import { Request, Response, NextFunction } from 'express';
import { serverStore } from '../store';
import { ApiKey, ApiScope } from '../../src/types';

// Extended Express Request
export interface AuthenticatedRequest extends Request {
  apiKey?: ApiKey;
  clientInfo?: {
    id: string;
    name: string;
    scopes: ApiScope[];
    integrationType: string;
  };
}

/**
 * Authentication Middleware
 * Validates X-API-Key header or Authorization: Bearer <token>
 */
export function authenticateApiKey(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const customKeyHeader = req.headers['x-api-key'];

  let token: string | undefined;

  if (typeof customKeyHeader === 'string' && customKeyHeader.trim()) {
    token = customKeyHeader.trim();
  } else if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Chave de API ausente. Forneça o cabeçalho X-API-Key ou Authorization: Bearer <sua_chave>.',
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        status: 401,
      },
    });
  }

  const matchingKey = serverStore.apiKeys.find(
    (k) => k.key === token && k.status === 'active'
  );

  if (!matchingKey) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_API_KEY',
        message: 'Chave de API inválida, revogada ou expirada.',
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        status: 401,
      },
    });
  }

  // Update lastUsedAt
  matchingKey.lastUsedAt = new Date().toISOString();

  // Attach to request
  req.apiKey = matchingKey;
  req.clientInfo = {
    id: matchingKey.id,
    name: matchingKey.name,
    scopes: matchingKey.scopes,
    integrationType: matchingKey.integrationType,
  };

  next();
}

/**
 * Authorization Scope Middleware
 * Ensures the authenticated client holds the required scope(s)
 */
export function requireScope(requiredScope: ApiScope) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.apiKey || !req.clientInfo) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Autenticação necessária para acessar este recurso.',
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
          status: 401,
        },
      });
    }

    const scopes = req.clientInfo.scopes;
    const hasAdmin = scopes.includes('admin');
    const hasDirectScope = scopes.includes(requiredScope);

    if (!hasAdmin && !hasDirectScope) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_INSUFFICIENT_SCOPE',
          message: `Permissão insuficiente. Este endpoint requer o escopo '${requiredScope}'.`,
          details: [
            {
              issue: `Escopos atuais da chave: [${scopes.join(', ')}]. Escopo necessário: '${requiredScope}'.`,
            },
          ],
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
          status: 403,
        },
      });
    }

    next();
  };
}
