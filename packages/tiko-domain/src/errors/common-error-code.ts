export const COMMON_ERROR_CODES = [
  'bad_request',
  'validation_failed',
  'unauthorized',
  'not_found',
  'internal_server_error',
] as const;

export type CommonErrorCode = (typeof COMMON_ERROR_CODES)[number];
