import {
  createIntegrationSchema,
  integrationSchema,
} from '@tiko/domain/integrations';
import { Hono } from 'hono';

import { validate } from '../../lib/validate.ts';
import type { AppEnv } from '../../types/app-env.ts';
import { integrationService } from './integration-service.ts';

const idParam = integrationSchema.pick({ id: true });

export const integrationRoutes = new Hono<AppEnv>()
  .get('/', (c) => {
    const integrations = integrationService.list();
    return c.json({ data: integrations });
  })
  .post('/', validate('json', createIntegrationSchema), (c) => {
    const integration = integrationService.create(c.req.valid('json'));
    return c.json({ data: integration }, 201);
  })
  .delete('/:id', validate('param', idParam), (c) => {
    const { id } = c.req.valid('param');
    integrationService.remove(id);
    return c.json({ data: { id } });
  });
