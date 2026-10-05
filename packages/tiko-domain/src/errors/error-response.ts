import { z } from 'zod';

import { errorCodeSchema } from './error-code.ts';

export const errorIssueSchema = z.object({
  path: z.array(z.union([z.string(), z.number()])),
  message: z.string(),
});

export type ErrorIssue = z.infer<typeof errorIssueSchema>;

const validationErrorSchema = z.object({
  code: z.literal('validation_failed'),
  message: z.string(),
  issues: z.array(errorIssueSchema),
});

const otherErrorSchema = z.object({
  code: errorCodeSchema.exclude(['validation_failed']),
  message: z.string(),
});

export const errorResponseSchema = z.object({
  error: z.discriminatedUnion('code', [
    validationErrorSchema,
    otherErrorSchema,
  ]),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
