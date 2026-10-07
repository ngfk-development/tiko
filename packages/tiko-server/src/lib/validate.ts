import { zValidator } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import type { z } from 'zod';

import { AppError } from './app-error.ts';

export function validate<
  Target extends keyof ValidationTargets,
  Schema extends z.ZodType,
>(target: Target, schema: Schema) {
  return zValidator(target, schema, (result) => {
    if (result.success) return;

    const issues = result.error.issues.map((issue) => {
      const path = issue.path.map((key) => {
        return typeof key === 'symbol' ? key.toString() : key;
      });

      return { path, message: issue.message };
    });

    throw new AppError('validation_failed', 'Invalid request', issues);
  });
}
