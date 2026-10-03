import type { Express } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";

export function registerAuthRoutes(app: Express) {
  const handler = toNodeHandler(auth);
  app.all("/api/auth/*splat", (req, res) => {
    return handler(
      req as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );
  });
}
