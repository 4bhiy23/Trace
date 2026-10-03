import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/client";
import { project, projectMember, user } from "../../db/schema";
import { HttpError } from "../../shared/http/errors";

export async function createProject(name: string, ownerId: string) {
  return db.transaction(async (transaction) => {
    const [created] = await transaction
      .insert(project)
      .values({ name, ownerId })
      .returning();

    await transaction.insert(projectMember).values({
      projectId: created.id,
      userId: ownerId,
      role: "owner",
    });

    return created;
  });
}

export function listProjects(userId: string) {
  return db
    .select({ project, role: projectMember.role })
    .from(projectMember)
    .innerJoin(project, eq(projectMember.projectId, project.id))
    .where(eq(projectMember.userId, userId))
    .orderBy(desc(project.updatedAt));
}

export async function getProject(projectId: string, userId: string) {
  const [result] = await db
    .select({ project, role: projectMember.role })
    .from(projectMember)
    .innerJoin(project, eq(projectMember.projectId, project.id))
    .where(and(eq(project.id, projectId), eq(projectMember.userId, userId)));

  if (!result) throw new HttpError(404, "NOT_FOUND", "Project not found");
  return result;
}

export async function updateProject(projectId: string, name?: string) {
  const [updated] = await db
    .update(project)
    .set({ ...(name === undefined ? {} : { name }) })
    .where(eq(project.id, projectId))
    .returning();

  if (!updated) throw new HttpError(404, "NOT_FOUND", "Project not found");
  return updated;
}

export async function archiveProject(projectId: string) {
  const [archived] = await db
    .update(project)
    .set({ archivedAt: new Date() })
    .where(eq(project.id, projectId))
    .returning();

  if (!archived) throw new HttpError(404, "NOT_FOUND", "Project not found");
}

export async function listMembers(projectId: string) {
  return db
    .select({
      userId: projectMember.userId,
      name: user.name,
      email: user.email,
      role: projectMember.role,
    })
    .from(projectMember)
    .innerJoin(user, eq(projectMember.userId, user.id))
    .where(eq(projectMember.projectId, projectId));
}

export async function addMember(
  projectId: string,
  userId: string,
  role: "editor" | "viewer",
) {
  const [member] = await db
    .insert(projectMember)
    .values({ projectId, userId, role })
    .returning();
  return member;
}

export async function updateMember(
  projectId: string,
  userId: string,
  role: "editor" | "viewer",
) {
  const [member] = await db
    .update(projectMember)
    .set({ role })
    .where(
      and(
        eq(projectMember.projectId, projectId),
        eq(projectMember.userId, userId),
      ),
    )
    .returning();

  if (!member) throw new HttpError(404, "NOT_FOUND", "Member not found");
  return member;
}

export async function removeMember(projectId: string, userId: string) {
  const [member] = await db
    .delete(projectMember)
    .where(
      and(
        eq(projectMember.projectId, projectId),
        eq(projectMember.userId, userId),
      ),
    )
    .returning();

  if (!member) throw new HttpError(404, "NOT_FOUND", "Member not found");
}
