import type { Express, Request, Response } from "express";
import {
  apiPaths,
  canvasCreateSchema,
  canvasDraftUpdateSchema,
  canvasRenameSchema,
} from "@trace/shared";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { canvas } from "../../db/schema";
import { getUuidParam, requireAuth } from "../../shared/auth/require-auth";
import {
  authorizeProject,
  getProjectContext,
  requireProjectAccess,
} from "../../shared/auth/require-workspace-access";
import { HttpError } from "../../shared/http/errors";
import {
  disconnectCanvasRoom,
  replaceCollaborativeDraft,
  type CanvasRooms,
} from "./canvas-collaboration";

const summary = {
  id: canvas.id,
  projectId: canvas.projectId,
  name: canvas.name,
  type: canvas.type,
  subtype: canvas.subtype,
  createdAt: canvas.createdAt,
  updatedAt: canvas.updatedAt,
};

const detail = { ...summary, draft: canvas.draft, revision: canvas.revision };

async function loadCanvas(
  request: Request,
  response: Response,
  access: "read" | "edit" | "manage",
) {
  const [item] = await db
    .select(detail)
    .from(canvas)
    .where(eq(canvas.id, getUuidParam(request, "canvasId")));
  if (!item) throw new HttpError(404, "NOT_FOUND", "Canvas not found");
  const project = await authorizeProject(response, item.projectId, access);
  return { item, project };
}

export function registerCanvasRoutes(app: Express, rooms: CanvasRooms) {
  app.get(
    apiPaths.canvases,
    requireAuth,
    requireProjectAccess("read"),
    async (_request, response) => {
      const project = getProjectContext(response);
      response.json(
        await db
          .select(summary)
          .from(canvas)
          .where(eq(canvas.projectId, project.id))
          .orderBy(desc(canvas.updatedAt)),
      );
    },
  );

  app.post(
    apiPaths.canvases,
    requireAuth,
    requireProjectAccess("edit"),
    async (request, response) => {
      const project = getProjectContext(response);
      if (project.archivedAt)
        throw new HttpError(409, "CONFLICT", "Project is archived");

      const { name, ...identity } = canvasCreateSchema.parse(request.body);
      const [created] = await db
        .insert(canvas)
        .values({
          ...identity,
          projectId: project.id,
          name,
          draft: { identity, source: "", layout: {} },
        })
        .returning(detail);
      response.status(201).json({
        ...created,
        workspaceId: project.workspaceId,
        access: project.access,
      });
    },
  );

  app.get(apiPaths.canvas, requireAuth, async (request, response) => {
    const { item, project } = await loadCanvas(request, response, "read");
    response.json({
      ...item,
      workspaceId: project.workspaceId,
      access: project.archivedAt ? "viewer" : project.access,
    });
  });

  app.patch(apiPaths.canvas, requireAuth, async (request, response) => {
    const { item, project } = await loadCanvas(request, response, "edit");
    if (project.archivedAt)
      throw new HttpError(409, "CONFLICT", "Project is archived");

    const { revision, source } = canvasDraftUpdateSchema.parse(request.body);
    if (item.type === "markdown") {
      await replaceCollaborativeDraft(rooms, item.id, revision, source);
      const { item: updated } = await loadCanvas(request, response, "read");
      response.json({
        ...updated,
        workspaceId: project.workspaceId,
        access: project.access,
      });
      return;
    }

    const [updated] = await db
      .update(canvas)
      .set({
        draft: { ...item.draft, source },
        revision: sql`${canvas.revision} + 1`,
      })
      .where(and(eq(canvas.id, item.id), eq(canvas.revision, revision)))
      .returning(detail);
    if (!updated)
      throw new HttpError(
        409,
        "CONFLICT",
        "This draft changed in another session. Copy your edits before reopening the canvas.",
      );
    response.json({
      ...updated,
      workspaceId: project.workspaceId,
      access: project.access,
    });
  });

  app.patch(apiPaths.canvasName, requireAuth, async (request, response) => {
    const { item, project } = await loadCanvas(request, response, "manage");
    if (project.archivedAt)
      throw new HttpError(409, "CONFLICT", "Project is archived");

    const { name } = canvasRenameSchema.parse(request.body);
    const [updated] = await db
      .update(canvas)
      .set({ name })
      .where(and(eq(canvas.id, item.id), eq(canvas.projectId, project.id)))
      .returning(summary);
    if (!updated) throw new HttpError(404, "NOT_FOUND", "Canvas not found");
    response.json(updated);
  });

  app.delete(apiPaths.canvas, requireAuth, async (request, response) => {
    const { item, project } = await loadCanvas(request, response, "manage");
    if (project.archivedAt)
      throw new HttpError(409, "CONFLICT", "Project is archived");

    const [deleted] = await db
      .delete(canvas)
      .where(and(eq(canvas.id, item.id), eq(canvas.projectId, project.id)))
      .returning({ id: canvas.id });
    if (!deleted) throw new HttpError(404, "NOT_FOUND", "Canvas not found");

    disconnectCanvasRoom(rooms, deleted.id);
    response.status(204).end();
  });
}
