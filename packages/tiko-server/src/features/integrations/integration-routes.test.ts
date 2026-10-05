import { errorResponseSchema } from '@tiko/domain/errors';
import { integrationSchema } from '@tiko/domain/integrations';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { app } from '../../app.ts';

const BASE = '/api/integrations';

function post(body: unknown) {
  return app.request(BASE, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function createIntegration(name = 'Company X') {
  const res = await post({ provider: 'harvest', name });
  const body = z.object({ data: integrationSchema }).parse(await res.json());
  return body.data;
}

async function readError(res: Response) {
  const body = errorResponseSchema.parse(await res.json());
  return body.error;
}

describe('GET /api/integrations', () => {
  it('lists created integrations', async () => {
    const integration = await createIntegration();

    const res = await app.request(BASE);
    const body = z
      .object({ data: z.array(integrationSchema) })
      .parse(await res.json());

    expect(res.status).toBe(200);
    expect(body.data).toContainEqual(integration);
  });
});

describe('POST /api/integrations', () => {
  it('creates an integration', async () => {
    const res = await post({ provider: 'harvest', name: 'Company X' });
    const body = z.object({ data: integrationSchema }).parse(await res.json());

    expect(res.status).toBe(201);
    expect(body.data).toMatchObject({ provider: 'harvest', name: 'Company X' });
  });

  it('trims the name', async () => {
    const res = await post({ provider: 'harvest', name: '  Company Y  ' });
    // Read the raw body: parsing with integrationSchema would trim the name itself.
    const body = await res.json();

    expect(body.data.name).toBe('Company Y');
  });

  it('rejects a provider that is not available yet', async () => {
    const res = await post({ provider: 'moneybird', name: 'Company X' });
    const error = await readError(res);

    expect(res.status).toBe(409);
    expect(error.code).toBe('provider_unavailable');
  });

  it('rejects invalid input with an issue per field', async () => {
    const res = await post({ provider: 'xero', name: '   ' });
    const error = await readError(res);

    expect(res.status).toBe(400);
    expect(error).toMatchObject({
      code: 'validation_failed',
      issues: [{ path: ['provider'] }, { path: ['name'] }],
    });
  });

  it('rejects a name longer than 100 characters', async () => {
    const res = await post({ provider: 'harvest', name: 'a'.repeat(101) });
    const error = await readError(res);

    expect(res.status).toBe(400);
    expect(error).toMatchObject({
      code: 'validation_failed',
      issues: [{ path: ['name'] }],
    });
  });
});

describe('DELETE /api/integrations/:id', () => {
  it('deletes an integration', async () => {
    const integration = await createIntegration();

    const res = await app.request(`${BASE}/${integration.id}`, {
      method: 'DELETE',
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { id: integration.id } });
  });

  it('returns not_found for an integration that does not exist', async () => {
    const integration = await createIntegration();
    await app.request(`${BASE}/${integration.id}`, { method: 'DELETE' });

    const res = await app.request(`${BASE}/${integration.id}`, {
      method: 'DELETE',
    });
    const error = await readError(res);

    expect(res.status).toBe(404);
    expect(error.code).toBe('not_found');
  });

  it('rejects an id that is not a UUID', async () => {
    const res = await app.request(`${BASE}/nope`, { method: 'DELETE' });
    const error = await readError(res);

    expect(res.status).toBe(400);
    expect(error).toMatchObject({
      code: 'validation_failed',
      issues: [{ path: ['id'] }],
    });
  });
});
