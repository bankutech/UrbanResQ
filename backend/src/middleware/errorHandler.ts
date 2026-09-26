import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/asyncHandler';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `No route for ${req.method} ${req.path}` } });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }

  // MySQL-specific error translation into professional, non-leaky messages
  if (err && err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: { code: 'CONFLICT', message: 'A record with these values already exists.' } });
  }
  if (err && err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: { code: 'INVALID_REFERENCE', message: 'Referenced record does not exist.' } });
  }
  if (err && (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST')) {
    return res.status(503).json({ error: { code: 'DB_UNAVAILABLE', message: 'Database is temporarily unavailable. Please retry.' } });
  }

  console.error('[unhandled error]', err);
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } });
}
