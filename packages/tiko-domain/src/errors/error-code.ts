import { z } from 'zod';

import { PROVIDER_ERROR_CODES } from '../providers/provider-error-code.ts';
import { COMMON_ERROR_CODES } from './common-error-code.ts';

export const ERROR_CODES = [
  ...COMMON_ERROR_CODES,
  ...PROVIDER_ERROR_CODES,
] as const;

export const errorCodeSchema = z.enum(ERROR_CODES);

export type ErrorCode = z.infer<typeof errorCodeSchema>;
