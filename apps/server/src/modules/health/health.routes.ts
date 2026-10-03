import type { Express } from "express";
import { env } from "../../config/env";
import { sql } from "../../db/client";

export function registerHealthRoutes(app: Express) {
  app.get("/health", async (_request, response) => {
    try {
      await sql`select 1`;
      response.json({
        status: "ok",
        service: "trace-api",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        environment: env.NODE_ENV,
        checks: { database: "ok" },
      });
    } catch {
      response.status(503).json({
        status: "degraded",
        service: "trace-api",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        environment: env.NODE_ENV,
        checks: { database: "error" },
      });
    }
  });
}
