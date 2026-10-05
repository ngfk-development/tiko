import { errorResponseSchema } from '@tiko/domain/errors';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { app } from '../app.ts';
import { AppError } from '../lib/app-error.ts';
import { validate } from '../lib/validate.ts';

app
  .get('/test/common', () => {
    throw new AppError('not_found', 'Thing not found');
  })
  .get('/test/domain', () => {
    throw new AppError('provider_unavailable', 'Provider is not available yet');
  })
  .get('/test/validation', () => {
    const issues = [{ path: ['name'], message: 'Required' }];
    throw new AppError('validation_failed', 'Invalid request', issues);
  })
  .get('/test/unexpected', () => {
    throw new Error('database password is hunter2');
  })
  .post('/test/json', validate('json', z.object({})), (c) => {
    return c.json({ data: null });
  });

async function requestError(path: string, init?: RequestInit) {
  const res = await app.request(`/api/test${path}`, init);
  const body = errorResponseSchema.parse(await res.json());

  return { status: res.status, error: body.error };
}

describe('errorHandler', () => {
  it('maps a common error code to its own status', async () => {
    const { status, error } = await requestError('/common');

    expect(status).toBe(404);
    expect(error).toEqual({ code: 'not_found', message: 'Thing not found' });
  });

  it('maps a domain-specific error code to 409', async () => {
    const { status, error } = await requestError('/domain');

    expect(status).toBe(409);
    expect(error.code).toBe('provider_unavailable');
  });

  it('includes the issues of a validation error', async () => {
    const { status, error } = await requestError('/validation');

    expect(status).toBe(400);
    expect(error).toEqual({
      code: 'validation_failed',
      message: 'Invalid request',
      issues: [{ path: ['name'], message: 'Required' }],
    });
  });

  it('maps malformed JSON to bad_request', async () => {
    const { status, error } = await requestError('/json', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{oops',
    });

    expect(status).toBe(400);
    expect(error.code).toBe('bad_request');
  });

  it('hides the details of an unexpected error', async () => {
    const { status, error } = await requestError('/unexpected');

    expect(status).toBe(500);
    expect(error).toEqual({
      code: 'internal_server_error',
      message: 'Internal Server Error',
    });
  });
});

describe('notFoundHandler', () => {
  it('returns not_found for an unknown route', async () => {
    const { status, error } = await requestError('/nope');

    expect(status).toBe(404);
    expect(error.code).toBe('not_found');
  });
});
