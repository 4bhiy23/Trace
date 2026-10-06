import type { Express } from "express";
import type { IncomingMessage, ServerResponse } from "node:http";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import { apiPaths } from "@trace/shared";

export function registerAuthRoutes(app: Express) {
  const handler = toNodeHandler(auth);
  app.all(apiPaths.authHandler, (request, response) =>
    handler(
      request as unknown as IncomingMessage,
      response as unknown as ServerResponse,
    ),
  );
}
