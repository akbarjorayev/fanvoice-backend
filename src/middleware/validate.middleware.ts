import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ERROR_CODES } from '../constants/error-codes';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((e) => ({
        field: e.path.join('.'),
        code: e.message,
      }));
      res.status(400).json({ code: ERROR_CODES.VALIDATION_FAILED, errors });
      return;
    }
    req.body = result.data;
    next();
  };
}
