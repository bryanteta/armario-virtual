import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import type { ApiResponse } from '../types';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    const body: ApiResponse = { success: false, error: err.message };
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof SyntaxError && 'body' in (err as object)) {
    res.status(400).json({ success: false, error: 'Invalid JSON body' });
    return;
  }

  const message = err instanceof Error ? err.message : 'Internal server error';
  console.error('[UnhandledError]', err);
  const body: ApiResponse = { success: false, error: message };
  res.status(500).json(body);
};

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ success: false, error: 'Route not found' });
}
