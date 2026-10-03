import type { Express } from "express";
import {
  memberInviteSchema,
  memberRoleUpdateSchema,
  projectCreateSchema,
  projectUpdateSchema,
  apiPaths,
} from "@trace/shared";
import { db } from "../../db/client";
import { user } from "../../db/schema";
import {
  getCurrentUser,
  getRouteParam,
  getUuidParam,
  requireAuth,
} from "../../shared/auth/require-auth";
import { requireProjectRole } from "../../shared/auth/require-project-role";
import { HttpError } from "../../shared/http/errors";
import {
  addMember,
  archiveProject,
  createProject,
  getProject,
  listMembers,
  listProjects,
  removeMember,
  updateMember,
  updateProject,
} from "./project.service";
import { eq } from "drizzle-orm";

export function registerProjectRoutes(app: Express) {
  app.post(apiPaths.projects, requireAuth, async (_request, response) => {
    const input = projectCreateSchema.parse(_request.body);
    const project = await createProject(
      input.name,
      getCurrentUser(response).id,
    );
    response.status(201).json(project);
  });

  app.get(apiPaths.projects, requireAuth, async (_request, response) => {
    response.json(await listProjects(getCurrentUser(response).id));
  });

  app.get(
    apiPaths.project,
    requireAuth,
    requireProjectRole("owner", "editor", "viewer"),
    async (request, response) => {
      response.json(
        await getProject(
          getUuidParam(request, "projectId"),
          getCurrentUser(response).id,
        ),
      );
    },
  );

  app.patch(
    apiPaths.project,
    requireAuth,
    requireProjectRole("owner"),
    async (request, response) => {
      const input = projectUpdateSchema.parse(request.body);
      response.json(
        await updateProject(getUuidParam(request, "projectId"), input.name),
      );
    },
  );

  app.delete(
    apiPaths.project,
    requireAuth,
    requireProjectRole("owner"),
    async (request, response) => {
      await archiveProject(getUuidParam(request, "projectId"));
      response.status(204).send();
    },
  );

  app.get(
    apiPaths.members,
    requireAuth,
    requireProjectRole("owner", "editor", "viewer"),
    async (request, response) => {
      response.json(await listMembers(getUuidParam(request, "projectId")));
    },
  );

  app.post(
    apiPaths.members,
    requireAuth,
    requireProjectRole("owner"),
    async (request, response) => {
      const input = memberInviteSchema.parse(request.body);
      const [memberUser] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, input.email));
      if (!memberUser) throw new HttpError(404, "NOT_FOUND", "User not found");
      response
        .status(201)
        .json(
          await addMember(
            getUuidParam(request, "projectId"),
            memberUser.id,
            input.role,
          ),
        );
    },
  );

  app.patch(
    apiPaths.member,
    requireAuth,
    requireProjectRole("owner"),
    async (request, response) => {
      const input = memberRoleUpdateSchema.parse(request.body);
      response.json(
        await updateMember(
          getUuidParam(request, "projectId"),
          getRouteParam(request, "userId"),
          input.role,
        ),
      );
    },
  );

  app.delete(
    apiPaths.member,
    requireAuth,
    requireProjectRole("owner"),
    async (request, response) => {
      const currentUser = getCurrentUser(response);
      const projectId = getUuidParam(request, "projectId");
      const userId = getRouteParam(request, "userId");
      if (currentUser.id === userId) {
        throw new HttpError(
          400,
          "BAD_REQUEST",
          "Owners cannot remove themselves",
        );
      }
      await removeMember(projectId, userId);
      response.status(204).send();
    },
  );
}
