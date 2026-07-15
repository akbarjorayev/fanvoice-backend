import { Request, Response, NextFunction } from 'express';
import { IS_PRODUCTION } from '../constants/env';

export interface AppError extends Error {
  statusCode?: number;
}

export function httpError(message: string, statusCode: number): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  return err;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode ?? 500;
  const message =
    statusCode === 500 && IS_PRODUCTION
      ? 'Internal server error'
      : err.message;

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({ message });
}
