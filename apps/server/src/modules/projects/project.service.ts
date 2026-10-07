import { canEditProject, type WorkspaceRole } from "@trace/shared";
import { and, desc, eq, or, sql } from "drizzle-orm";
import { db } from "../../db/client";
import {
  project,
  projectEditor,
  user,
  workspaceAudit,
  workspaceMember,
} from "../../db/schema";
import { HttpError } from "../../shared/http/errors";

/**
 * Builds a workspace audit record for an action on a project.
 */
const audit = (
  workspaceId: string,
  actorId: string,
  action: string,
  targetId: string,
) => ({ workspaceId, actorId, action, targetType: "project", targetId });

/**
 * Creates a workspace project and its audit entry in one transaction.
 * Returns the project with editor access; callers must authorize the actor.
 */
export async function createProject(
  workspaceId: string,
  name: string,
  actorId: string,
) {
  return db.transaction(async (transaction) => {
    const [created] = await transaction
      .insert(project)
      .values({ workspaceId, name })
      .returning();
    await transaction
      .insert(workspaceAudit)
      .values(audit(workspaceId, actorId, "project.created", created.id));
    return { ...created, access: "editor" as const };
  });
}

/**
 * Lists workspace projects by latest update with access derived from the supplied role and editor grants.
 */
export async function listProjects(
  workspaceId: string,
  userId: string,
  role: WorkspaceRole,
) {
  const rows = await db
    .select({ project, editorId: projectEditor.userId })
    .from(project)
    .leftJoin(
      projectEditor,
      and(
        eq(projectEditor.projectId, project.id),
        eq(projectEditor.userId, userId),
      ),
    )
    .where(eq(project.workspaceId, workspaceId))
    .orderBy(desc(project.updatedAt));

  return rows.map(({ project: item, editorId }) => ({
    ...item,
    access: canEditProject(role, editorId != null) ? "editor" : "viewer",
  }));
}

/**
 * Renames a project and records the actor in an audit entry atomically.
 * Callers must authorize access and supply the project's workspace; missing projects raise 404.
 */
export async function updateProject(
  projectId: string,
  workspaceId: string,
  name: string,
  actorId: string,
) {
  return db.transaction(async (transaction) => {
    const [updated] = await transaction
      .update(project)
      .set({ name })
      .where(eq(project.id, projectId))
      .returning();
    if (!updated) throw new HttpError(404, "NOT_FOUND", "Project not found");
    await transaction
      .insert(workspaceAudit)
      .values(audit(workspaceId, actorId, "project.updated", projectId));
    return { ...updated, access: "editor" as const };
  });
}

/**
 * Marks a project archived and writes an audit entry atomically.
 * Callers must authorize access and supply the project's workspace; missing projects raise 404.
 */
export async function archiveProject(
  projectId: string,
  workspaceId: string,
  actorId: string,
) {
  await db.transaction(async (transaction) => {
    const [archived] = await transaction
      .update(project)
      .set({ archivedAt: new Date() })
      .where(eq(project.id, projectId))
      .returning({ id: project.id });
    if (!archived) throw new HttpError(404, "NOT_FOUND", "Project not found");
    await transaction
      .insert(workspaceAudit)
      .values(audit(workspaceId, actorId, "project.archived", projectId));
  });
}

/**
 * Lists workspace admins and members with explicit editor grants for the project.
 */
export function listProjectEditors(projectId: string) {
  return db
    .select({
      projectId: project.id,
      userId: workspaceMember.userId,
      name: user.name,
      email: user.email,
      createdAt: sql<Date>`coalesce(${projectEditor.createdAt}, ${workspaceMember.createdAt})`,
    })
    .from(project)
    .innerJoin(
      workspaceMember,
      eq(workspaceMember.workspaceId, project.workspaceId),
    )
    .innerJoin(user, eq(user.id, workspaceMember.userId))
    .leftJoin(
      projectEditor,
      and(
        eq(projectEditor.projectId, project.id),
        eq(projectEditor.userId, workspaceMember.userId),
      ),
    )
    .where(
      and(
        eq(project.id, projectId),
        or(
          eq(workspaceMember.role, "admin"),
          eq(projectEditor.projectId, projectId),
        ),
      ),
    );
}

/**
 * Grants project editing to a regular workspace member and returns their details.
 * Callers must authorize access and supply the project's workspace.
 * Missing members raise 404; existing grants and non-member roles raise 409.
 */
export async function addProjectEditor(
  projectId: string,
  workspaceId: string,
  userId: string,
  actorId: string,
) {
  return db.transaction(async (transaction) => {
    const [member] = await transaction
      .select({ role: workspaceMember.role })
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, userId),
        ),
      )
      .for("update");
    if (!member) throw new HttpError(404, "NOT_FOUND", "Member not found");
    if (member.role !== "member") {
      throw new HttpError(
        409,
        "CONFLICT",
        "Owners and admins already edit every project",
      );
    }

    const [editor] = await transaction
      .insert(projectEditor)
      .values({ projectId, userId })
      .onConflictDoNothing()
      .returning();
    if (!editor)
      throw new HttpError(409, "CONFLICT", "Member is already an editor");

    await transaction
      .insert(workspaceAudit)
      .values(audit(workspaceId, actorId, "project.editor_added", projectId));
    const [details] = await transaction
      .select({
        projectId: projectEditor.projectId,
        userId: projectEditor.userId,
        name: user.name,
        email: user.email,
        createdAt: projectEditor.createdAt,
      })
      .from(projectEditor)
      .innerJoin(user, eq(user.id, projectEditor.userId))
      .where(
        and(
          eq(projectEditor.projectId, editor.projectId),
          eq(projectEditor.userId, editor.userId),
        ),
      );
    return details;
  });
}

/**
 * Removes an explicit editor grant and records the action atomically.
 * Callers must authorize access and supply the project's workspace; missing grants raise 404.
 */
export async function removeProjectEditor(
  projectId: string,
  workspaceId: string,
  userId: string,
  actorId: string,
) {
  await db.transaction(async (transaction) => {
    const [removed] = await transaction
      .delete(projectEditor)
      .where(
        and(
          eq(projectEditor.projectId, projectId),
          eq(projectEditor.userId, userId),
        ),
      )
      .returning();
    if (!removed)
      throw new HttpError(404, "NOT_FOUND", "Project editor not found");
    await transaction
      .insert(workspaceAudit)
      .values(audit(workspaceId, actorId, "project.editor_removed", projectId));
  });
}
