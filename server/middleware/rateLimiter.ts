import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitBuckets = new Map<string, RateLimitRecord>();

// Clean up stale buckets every 5 minutes
setInterval(() => {
  const now = Date.now();
  const windowMs = 60 * 1000;
  for (const [key, record] of rateLimitBuckets.entries()) {
    record.timestamps = record.timestamps.filter((t) => now - t < windowMs);
    if (record.timestamps.length === 0) {
      rateLimitBuckets.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function rateLimiter(options?: { defaultLimitPerMin?: number }) {
  const defaultLimit = options?.defaultLimitPerMin || 60;
  const windowMs = 60 * 1000; // 1 minute window

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Determine limit: Use client custom rate limit if authenticated, else default
    const limit = req.apiKey?.rateLimitPerMinute || defaultLimit;

    // Determine client identifier: API Key ID or Client IP
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const clientId = req.apiKey ? `key_${req.apiKey.id}` : `ip_${ip}`;

    const now = Date.now();
    let record = rateLimitBuckets.get(clientId);

    if (!record) {
      record = { timestamps: [] };
      rateLimitBuckets.set(clientId, record);
    }

    // Filter timestamps within the 1-minute window
    record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

    const currentCount = record.timestamps.length;
    const remaining = Math.max(0, limit - currentCount - 1);
    const resetTimeSeconds = Math.ceil((windowMs - (now - (record.timestamps[0] || now))) / 1000);

    // Set standard rate limit headers
    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', (Math.floor(Date.now() / 1000) + resetTimeSeconds).toString());

    if (currentCount >= limit) {
      res.setHeader('Retry-After', resetTimeSeconds.toString());
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Limite de taxa de requisições excedido (${limit} req/min). Aguarde ${resetTimeSeconds} segundos para tentar novamente.`,
          details: [
            {
              issue: `Taxa máxima: ${limit} requisições por minuto. Requisições recebidas: ${currentCount + 1}.`,
            },
          ],
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
          status: 429,
        },
      });
    }

    // Record this request timestamp
    record.timestamps.push(now);
    next();
  };
}
