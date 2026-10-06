import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { env } from "./config/env";
import { registerAuthRoutes } from "./modules/auth/auth.routes";
import { registerHealthRoutes } from "./modules/health/health.routes";
import { registerProjectRoutes } from "./modules/projects/project.routes";
import { registerDocsRoutes } from "./modules/docs/docs.routes";
import { registerWorkspaceRoutes } from "./modules/workspaces/workspace.routes";
import { requestLogger } from "./shared/logger";
import { sendError } from "./shared/http/errors";

export function createApp() {
  const app = express();

  if (env.NODE_ENV !== "production") registerDocsRoutes(app);
  app.use(requestLogger);
  app.use(cors({ origin: env.WEB_URL, credentials: true }));
  registerAuthRoutes(app);
  app.use(express.json());
  registerWorkspaceRoutes(app);
  registerProjectRoutes(app);
  registerHealthRoutes(app);
  app.use(
    (
      error: unknown,
      _request: Request,
      response: Response,
      next: NextFunction,
    ) => {
      void next;
      sendError(response, error);
    },
  );

  return app;
}
