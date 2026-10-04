import type { IncomingMessage, ServerResponse } from "node:http";
import type { Express } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import { apiPaths } from "@trace/shared";

export function registerAuthRoutes(app: Express) {
  const handler = toNodeHandler(auth);
  app.all(apiPaths.authHandler, (req, res) => {
    return handler(
      req as unknown as IncomingMessage,
      res as unknown as ServerResponse,
    );
  });
}
