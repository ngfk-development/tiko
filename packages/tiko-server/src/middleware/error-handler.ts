import type {
  CommonErrorCode,
  ErrorCode,
  ErrorResponse,
} from '@tiko/domain/errors';
import type { Context, ErrorHandler, NotFoundHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

import { AppError } from '../lib/app-error.ts';
import type { AppEnv } from '../types/app-env.ts';

const COMMON_STATUS: Record<CommonErrorCode, ContentfulStatusCode> = {
  bad_request: 400,
  validation_failed: 400,
  unauthorized: 401,
  not_found: 404,
  internal_server_error: 500,
};

const DOMAIN_ERROR_STATUS: ContentfulStatusCode = 409;

function isCommonErrorCode(code: ErrorCode): code is CommonErrorCode {
  return Object.hasOwn(COMMON_STATUS, code);
}

function statusFor(code: ErrorCode): ContentfulStatusCode {
  return isCommonErrorCode(code) ? COMMON_STATUS[code] : DOMAIN_ERROR_STATUS;
}

function errorResponse(c: Context<AppEnv>, error: ErrorResponse['error']) {
  return c.json<ErrorResponse>({ error }, statusFor(error.code));
}

export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  if (err instanceof AppError) {
    const { message } = err;

    const error: ErrorResponse['error'] =
      err.code === 'validation_failed'
        ? { code: err.code, message, issues: err.issues ?? [] }
        : { code: err.code, message };

    return errorResponse(c, error);
  }

  if (err instanceof HTTPException && err.status < 500) {
    return errorResponse(c, { code: 'bad_request', message: err.message });
  }

  c.var.log.error({ err }, 'request errored');

  return errorResponse(c, {
    code: 'internal_server_error',
    message: 'Internal Server Error',
  });
};

export const notFoundHandler: NotFoundHandler<AppEnv> = (c) => {
  return errorResponse(c, { code: 'not_found', message: 'Not Found' });
};
