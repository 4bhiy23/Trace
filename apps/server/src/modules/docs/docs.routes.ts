import type { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { apiPaths } from "@trace/shared";
import { openApiDocument } from "./openapi";

export function registerDocsRoutes(app: Express) {
  app.get(apiPaths.openApi, (_request, response) => {
    response.json(openApiDocument);
  });
  app.use(apiPaths.docs, swaggerUi.serve, swaggerUi.setup(openApiDocument));
}
