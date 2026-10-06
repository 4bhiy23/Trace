import type { Express } from "express";
import {
  apiPaths,
  projectCreateSchema,
  projectEditorCreateSchema,
  projectUpdateSchema,
} from "@trace/shared";
import {
  getCurrentUser,
  getRouteParam,
  requireAuth,
} from "../../shared/auth/require-auth";
import {
  getProjectContext,
  getWorkspaceContext,
  requireProjectAccess,
  requireWorkspaceRole,
} from "../../shared/auth/require-workspace-access";
import {
  addProjectEditor,
  archiveProject,
  createProject,
  listProjectEditors,
  listProjects,
  removeProjectEditor,
  updateProject,
} from "./project.service";

export function registerProjectRoutes(app: Express) {
  app.get(
    apiPaths.workspaceProjects,
    requireAuth,
    requireWorkspaceRole("owner", "admin", "member"),
    async (_request, response) => {
      const context = getWorkspaceContext(response);
      response.json(
        await listProjects(
          context.id,
          getCurrentUser(response).id,
          context.role,
        ),
      );
    },
  );

  app.post(
    apiPaths.workspaceProjects,
    requireAuth,
    requireWorkspaceRole("owner", "admin"),
    async (request, response) => {
      const input = projectCreateSchema.parse(request.body);
      response
        .status(201)
        .json(
          await createProject(
            getWorkspaceContext(response).id,
            input.name,
            getCurrentUser(response).id,
          ),
        );
    },
  );

  app.get(
    apiPaths.project,
    requireAuth,
    requireProjectAccess("read"),
    (_request, response) => response.json(getProjectContext(response)),
  );

  app.patch(
    apiPaths.project,
    requireAuth,
    requireProjectAccess("manage"),
    async (request, response) => {
      const input = projectUpdateSchema.parse(request.body);
      const project = getProjectContext(response);
      response.json(
        await updateProject(
          project.id,
          project.workspaceId,
          input.name,
          getCurrentUser(response).id,
        ),
      );
    },
  );

  app.delete(
    apiPaths.project,
    requireAuth,
    requireProjectAccess("manage"),
    async (_request, response) => {
      const project = getProjectContext(response);
      await archiveProject(
        project.id,
        project.workspaceId,
        getCurrentUser(response).id,
      );
      response.status(204).send();
    },
  );

  app.get(
    apiPaths.projectEditors,
    requireAuth,
    requireProjectAccess("manage"),
    async (_request, response) => {
      response.json(await listProjectEditors(getProjectContext(response).id));
    },
  );

  app.post(
    apiPaths.projectEditors,
    requireAuth,
    requireProjectAccess("manage"),
    async (request, response) => {
      const input = projectEditorCreateSchema.parse(request.body);
      const project = getProjectContext(response);
      response
        .status(201)
        .json(
          await addProjectEditor(
            project.id,
            project.workspaceId,
            input.userId,
            getCurrentUser(response).id,
          ),
        );
    },
  );

  app.delete(
    apiPaths.projectEditor,
    requireAuth,
    requireProjectAccess("manage"),
    async (request, response) => {
      const project = getProjectContext(response);
      await removeProjectEditor(
        project.id,
        project.workspaceId,
        getRouteParam(request, "userId"),
        getCurrentUser(response).id,
      );
      response.status(204).send();
    },
  );
}
