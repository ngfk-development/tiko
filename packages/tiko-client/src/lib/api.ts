import type { AppType } from '@tiko/server';
import { hc } from 'hono/client';

import { ApiError } from './api-error.ts';

const client = hc<AppType>('/', {
  fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    const res = await fetch(input, init);
    if (!res.ok) throw await ApiError.fromResponse(res);

    return res;
  },
});

export const api = client.api;
