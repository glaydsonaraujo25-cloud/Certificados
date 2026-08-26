import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { serverStore } from '../store';
import { ApiRequestLog } from '../../src/types';

export function requestLogger(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const method = req.method as ApiRequestLog['method'];
  const path = req.originalUrl || req.url;
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown';

  // Keep a safe copy of body (excluding passwords/secrets if any)
  let requestBodySnippet: string | undefined;
  if (req.body && Object.keys(req.body).length > 0) {
    try {
      const sanitized = { ...req.body };
      if (sanitized.key) sanitized.key = '***';
      if (sanitized.apiKey) sanitized.apiKey = '***';
      requestBodySnippet = JSON.stringify(sanitized).substring(0, 300);
    } catch {
      // ignore
    }
  }

  // Intercept response finish
  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const statusCode = res.statusCode;

    const logEntry: ApiRequestLog = {
      id: requestId,
      timestamp: new Date().toISOString(),
      method,
      path,
      statusCode,
      durationMs,
      clientId: req.apiKey?.id,
      clientName: req.apiKey?.name,
      ip: typeof ip === 'string' ? ip : '127.0.0.1',
      userAgent,
      requestBodySnippet,
    };

    // Store in circular memory log
    serverStore.requestLogs.unshift(logEntry);
    if (serverStore.requestLogs.length > 200) {
      serverStore.requestLogs.pop();
    }

    // Console output for server terminal
    const statusColor =
      statusCode < 300
        ? '\x1b[32m'
        : statusCode < 400
        ? '\x1b[36m'
        : statusCode < 500
        ? '\x1b[33m'
        : '\x1b[31m';
    console.log(
      `[API] ${req.method} ${path} ${statusColor}${statusCode}\x1b[0m ${durationMs}ms - Client: ${
        req.apiKey?.name || 'Public'
      }`
    );
  });

  next();
}

/**
 * Standardized Error Handling Middleware
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('[API Unhandled Error]', err);

  const status = err.status || err.statusCode || 500;
  const code = err.code || (status === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR');
  const message =
    err.message || 'Ocorreu um erro interno no servidor ao processar a requisição.';

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      details: err.details || undefined,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      status,
    },
  });
}
