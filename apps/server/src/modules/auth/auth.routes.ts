import type { Express } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";

export function registerAuthRoutes(app: Express) {
  app.all("/api/auth/*splat", toNodeHandler(auth));
}
