import type { ErrorCode, ErrorIssue } from '@tiko/domain/errors';

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly issues: ErrorIssue[] | null;

  constructor(code: 'validation_failed', message: string, issues: ErrorIssue[]);
  constructor(code: Exclude<ErrorCode, 'validation_failed'>, message: string);
  constructor(
    code: ErrorCode,
    message: string,
    issues: ErrorIssue[] | null = null,
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.issues = issues;
  }
}
