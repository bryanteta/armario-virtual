import type { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// Lightweight dev-mode auth: reads userId from X-User-Id header.
// Replace with JWT verification for production.
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const userId = req.headers['x-user-id'];

  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    return next(new AppError(401, 'Missing X-User-Id header'));
  }

  req.userId = userId.trim();
  next();
}
