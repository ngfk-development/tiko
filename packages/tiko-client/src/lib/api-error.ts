import {
  errorResponseSchema,
  type ErrorCode,
  type ErrorIssue,
} from '@tiko/domain/errors';

export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly issues: ErrorIssue[];

  constructor(
    status: number,
    code: ErrorCode,
    message: string,
    issues: ErrorIssue[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.issues = issues;
  }

  static async fromResponse(res: Response): Promise<ApiError> {
    const body: unknown = await res.json().catch(() => null);
    const parsed = errorResponseSchema.safeParse(body);

    if (!parsed.success) {
      return new ApiError(res.status, 'internal_server_error', res.statusText);
    }

    const { error } = parsed.data;
    const issues = error.code === 'validation_failed' ? error.issues : [];
    return new ApiError(res.status, error.code, error.message, issues);
  }
}

export function errorMessage(error: Error | null) {
  if (!error) return null;
  if (!(error instanceof ApiError)) return 'Something went wrong';

  const [issue] = error.issues;
  return issue?.message ?? error.message;
}
