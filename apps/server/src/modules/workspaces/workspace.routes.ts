import type { Express } from "express";
import {
  apiPaths,
  workspaceCreateSchema,
  workspaceInviteSchema,
  workspaceMemberRoleUpdateSchema,
  workspaceTransferSchema,
  workspaceUpdateSchema,
} from "@trace/shared";
import {
  getCurrentUser,
  getRouteParam,
  getUuidParam,
  requireAuth,
} from "../../shared/auth/require-auth";
import {
  getWorkspaceContext,
  requireWorkspaceRole,
} from "../../shared/auth/require-workspace-access";
import {
  acceptInvite,
  createWorkspace,
  deleteWorkspace,
  inviteMember,
  leaveWorkspace,
  listInvites,
  listMembers,
  listWorkspaces,
  removeMember,
  revokeInvite,
  transferWorkspace,
  updateMemberRole,
  updateWorkspace,
} from "./workspace.service";

/**
 * Registers workspace, membership, invitation, and ownership endpoints with access checks.
 */
export function registerWorkspaceRoutes(app: Express) {
  app.get(apiPaths.workspaces, requireAuth, async (_request, response) => {
    response.json(await listWorkspaces(getCurrentUser(response).id));
  });

  app.post(apiPaths.workspaces, requireAuth, async (request, response) => {
    const input = workspaceCreateSchema.parse(request.body);
    response
      .status(201)
      .json(await createWorkspace(input.name, getCurrentUser(response).id));
  });

  app.get(
    apiPaths.workspace,
    requireAuth,
    requireWorkspaceRole("owner", "admin", "member"),
    (_request, response) => response.json(getWorkspaceContext(response)),
  );

  app.patch(
    apiPaths.workspace,
    requireAuth,
    requireWorkspaceRole("owner", "admin"),
    async (request, response) => {
      const input = workspaceUpdateSchema.parse(request.body);
      const context = getWorkspaceContext(response);
      const updated = await updateWorkspace(
        context.id,
        input.name,
        getCurrentUser(response).id,
      );
      response.json({ ...updated, role: context.role });
    },
  );

  app.delete(
    apiPaths.workspace,
    requireAuth,
    requireWorkspaceRole("owner"),
    async (_request, response) => {
      await deleteWorkspace(
        getWorkspaceContext(response).id,
        getCurrentUser(response).id,
      );
      response.status(204).send();
    },
  );

  app.get(
    apiPaths.workspaceMembers,
    requireAuth,
    requireWorkspaceRole("owner", "admin", "member"),
    async (_request, response) => {
      response.json(await listMembers(getWorkspaceContext(response).id));
    },
  );

  app.patch(
    apiPaths.workspaceMember,
    requireAuth,
    requireWorkspaceRole("owner"),
    async (request, response) => {
      const input = workspaceMemberRoleUpdateSchema.parse(request.body);
      response.json(
        await updateMemberRole(
          getWorkspaceContext(response).id,
          getRouteParam(request, "userId"),
          input.role,
          getCurrentUser(response).id,
        ),
      );
    },
  );

  app.delete(
    apiPaths.workspaceMember,
    requireAuth,
    requireWorkspaceRole("owner", "admin"),
    async (request, response) => {
      const context = getWorkspaceContext(response);
      await removeMember(
        context.id,
        getRouteParam(request, "userId"),
        getCurrentUser(response).id,
      );
      response.status(204).send();
    },
  );

  app.get(
    apiPaths.workspaceInvites,
    requireAuth,
    requireWorkspaceRole("owner", "admin"),
    async (_request, response) => {
      response.json(await listInvites(getWorkspaceContext(response).id));
    },
  );

  app.post(
    apiPaths.workspaceInvites,
    requireAuth,
    requireWorkspaceRole("owner", "admin"),
    async (request, response) => {
      const input = workspaceInviteSchema.parse(request.body);
      const context = getWorkspaceContext(response);
      response
        .status(201)
        .json(
          await inviteMember(
            context.id,
            context.name,
            input.email,
            input.role,
            getCurrentUser(response).id,
          ),
        );
    },
  );

  app.delete(
    apiPaths.workspaceInvite,
    requireAuth,
    requireWorkspaceRole("owner", "admin"),
    async (request, response) => {
      const context = getWorkspaceContext(response);
      await revokeInvite(
        context.id,
        getUuidParam(request, "inviteId"),
        getCurrentUser(response).id,
      );
      response.status(204).send();
    },
  );

  app.post(
    apiPaths.workspaceLeave,
    requireAuth,
    requireWorkspaceRole("owner", "admin", "member"),
    async (_request, response) => {
      await leaveWorkspace(
        getWorkspaceContext(response).id,
        getCurrentUser(response).id,
      );
      response.status(204).send();
    },
  );

  app.post(
    apiPaths.workspaceTransfer,
    requireAuth,
    requireWorkspaceRole("owner"),
    async (request, response) => {
      const input = workspaceTransferSchema.parse(request.body);
      await transferWorkspace(
        getWorkspaceContext(response).id,
        input.userId,
        getCurrentUser(response).id,
      );
      response.status(204).send();
    },
  );

  app.post(apiPaths.inviteAccept, requireAuth, async (request, response) => {
    response.json(
      await acceptInvite(
        getRouteParam(request, "token"),
        getCurrentUser(response),
      ),
    );
  });
}
