import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { registerAuthRoutes } from "./modules/auth/auth.routes";
import { registerHealthRoutes } from "./modules/health/health.routes";
import { requestLogger } from "./shared/logger";

export function createApp() {
  const app = express();

  app.use(requestLogger);
  app.use(cors({ origin: env.WEB_URL, credentials: true }));
  registerAuthRoutes(app);
  app.use(express.json());
  registerHealthRoutes(app);

  return app;
}
