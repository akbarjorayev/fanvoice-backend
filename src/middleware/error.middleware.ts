import { Request, Response, NextFunction } from 'express';
import { IS_PRODUCTION } from '../constants/env';
import { ERROR_CODES, ErrorCode } from '../constants/error-codes';

export interface AppError extends Error {
  statusCode?: number;
  params?: Record<string, string | number>;
}

export function httpError(
  code: ErrorCode,
  statusCode: number,
  params?: Record<string, string | number>,
): AppError {
  const err = new Error(code) as AppError;
  err.statusCode = statusCode;
  err.params = params;
  return err;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode ?? 500;
  const code =
    statusCode === 500 && IS_PRODUCTION ? ERROR_CODES.INTERNAL_SERVER_ERROR : err.message;

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({ code, ...(err.params && { params: err.params }) });
}
