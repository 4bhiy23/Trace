import type { Express } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import { apiPaths } from "@trace/shared";

export function registerAuthRoutes(app: Express) {
  app.all(apiPaths.authHandler, toNodeHandler(auth));
}
