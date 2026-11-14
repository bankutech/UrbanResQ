import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/asyncHandler';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `No route for ${req.method} ${req.path}` } });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }

  // Zod schema validation errors
  if (err instanceof ZodError || err?.name === 'ZodError') {
    const firstIssue = err.issues?.[0];
    const pathStr = firstIssue?.path?.length ? ` (${firstIssue.path.join('.')})` : '';
    const message = (firstIssue?.message || 'Invalid request payload') + pathStr;
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message } });
  }

  // MySQL-specific error translation into professional, non-leaky messages
  if (err && err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: { code: 'CONFLICT', message: 'A record with these values already exists.' } });
  }
  if (err && err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: { code: 'INVALID_REFERENCE', message: 'Referenced record does not exist.' } });
  }
  if (
    err &&
    (err.code === 'ECONNREFUSED' ||
      err.code === 'PROTOCOL_CONNECTION_LOST' ||
      err.code === 'ER_ACCESS_DENIED_ERROR' ||
      err.code === 'ER_BAD_DB_ERROR' ||
      err.code === 'ENOTFOUND')
  ) {
    return res.status(503).json({ error: { code: 'DB_UNAVAILABLE', message: 'Database is temporarily unavailable. Please retry.' } });
  }

  // Generic status code on error object
  if (err && typeof err.status === 'number' && err.status >= 400 && err.status < 600) {
    return res.status(err.status).json({ error: { code: err.code || 'REQUEST_FAILED', message: err.message } });
  }

  console.error('[unhandled error]', err);
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } });
}
