import type { RequestHandler, Response } from "express";
import {
  canEditProject,
  canWorkspace,
  type WorkspaceRole,
} from "@trace/shared";
import { and, eq } from "drizzle-orm";
import { db } from "../../db/client";
import {
  project,
  projectEditor,
  workspace,
  workspaceMember,
} from "../../db/schema";
import { HttpError } from "../http/errors";
import { getCurrentUser, getUuidParam } from "./require-auth";

type WorkspaceContext = {
  id: string;
  name: string;
  ownerId: string;
  isDefault: boolean;
  role: WorkspaceRole;
  createdAt: Date;
  updatedAt: Date;
};

export function getWorkspaceContext(response: Response) {
  const context = response.locals.workspace as WorkspaceContext | undefined;
  if (!context)
    throw new HttpError(403, "FORBIDDEN", "Workspace access denied");
  return context;
}

export function getProjectContext(response: Response) {
  const context = response.locals.project as
    | {
        id: string;
        workspaceId: string;
        name: string;
        archivedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        access: "editor" | "viewer";
      }
    | undefined;
  if (!context) throw new HttpError(403, "FORBIDDEN", "Project access denied");
  return context;
}

export function requireWorkspaceRole(
  ...roles: WorkspaceRole[]
): RequestHandler {
  return async (request, response, next) => {
    const currentUser = getCurrentUser(response);
    const [result] = await db
      .select({
        id: workspace.id,
        name: workspace.name,
        ownerId: workspace.ownerId,
        isDefault: workspace.isDefault,
        role: workspaceMember.role,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      })
      .from(workspaceMember)
      .innerJoin(workspace, eq(workspace.id, workspaceMember.workspaceId))
      .where(
        and(
          eq(workspace.id, getUuidParam(request, "workspaceId")),
          eq(workspaceMember.userId, currentUser.id),
        ),
      );

    if (!result || !roles.includes(result.role)) {
      throw new HttpError(404, "NOT_FOUND", "Workspace not found");
    }

    response.locals.workspace = result;
    next();
  };
}

export function requireProjectAccess(
  access: "read" | "edit" | "manage",
): RequestHandler {
  return async (request, response, next) => {
    const currentUser = getCurrentUser(response);
    const projectId = getUuidParam(request, "projectId");
    const [result] = await db
      .select({
        id: project.id,
        workspaceId: project.workspaceId,
        name: project.name,
        archivedAt: project.archivedAt,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        role: workspaceMember.role,
        editorId: projectEditor.userId,
        workspaceName: workspace.name,
        workspaceOwnerId: workspace.ownerId,
        workspaceIsDefault: workspace.isDefault,
        workspaceCreatedAt: workspace.createdAt,
        workspaceUpdatedAt: workspace.updatedAt,
      })
      .from(project)
      .innerJoin(workspace, eq(workspace.id, project.workspaceId))
      .innerJoin(
        workspaceMember,
        and(
          eq(workspaceMember.workspaceId, project.workspaceId),
          eq(workspaceMember.userId, currentUser.id),
        ),
      )
      .leftJoin(
        projectEditor,
        and(
          eq(projectEditor.projectId, project.id),
          eq(projectEditor.userId, currentUser.id),
        ),
      )
      .where(eq(project.id, projectId));

    const allowed =
      result &&
      (access === "read" ||
        (access === "edit" &&
          canEditProject(result.role, result.editorId != null)) ||
        (access === "manage" && canWorkspace(result.role, "project:manage")));
    if (!allowed) throw new HttpError(404, "NOT_FOUND", "Project not found");

    response.locals.workspace = {
      id: result.workspaceId,
      name: result.workspaceName,
      ownerId: result.workspaceOwnerId,
      isDefault: result.workspaceIsDefault,
      role: result.role,
      createdAt: result.workspaceCreatedAt,
      updatedAt: result.workspaceUpdatedAt,
    };
    response.locals.project = {
      id: result.id,
      workspaceId: result.workspaceId,
      name: result.name,
      archivedAt: result.archivedAt,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      access: canEditProject(result.role, result.editorId != null)
        ? "editor"
        : "viewer",
    };
    next();
  };
}
