import { Hono } from 'hono';
import { requestId } from 'hono/request-id';

import { healthRoutes } from './features/health/health-routes.ts';
import { integrationRoutes } from './features/integrations/integration-routes.ts';
import { errorHandler, notFoundHandler } from './middleware/error-handler.ts';
import { requestLogger } from './middleware/request-logger.ts';
import type { AppEnv } from './types/app-env.ts';

export const app = new Hono<AppEnv>().basePath('/api');

app.use(requestId());
app.use(requestLogger({ tracePaths: ['/api/health'] }));

app.onError(errorHandler);
app.notFound(notFoundHandler);

const routes = app
  .route('/health', healthRoutes)
  .route('/integrations', integrationRoutes);

export type AppType = typeof routes;
