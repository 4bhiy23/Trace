import type { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./openapi";

export function registerDocsRoutes(app: Express) {
  app.get("/api/openapi.json", (_request, response) => {
    response.json(openApiDocument);
  });
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
}
