import { createHash, randomBytes } from "node:crypto";
import type { InviteRole, WorkspaceRole } from "@trace/shared";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "../../db/client";
import {
  project,
  projectEditor,
  user,
  workspace,
  workspaceAudit,
  workspaceInvite,
  workspaceMember,
} from "../../db/schema";
import { HttpError } from "../../shared/http/errors";
import { sendWorkspaceInvite } from "./workspace.email";

const audit = (
  workspaceId: string,
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
) => ({ workspaceId, actorId, action, targetType, targetId });

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export async function createDefaultWorkspace(userId: string, userName: string) {
  await db.transaction(async (transaction) => {
    const [created] = await transaction
      .insert(workspace)
      .values({
        name: `${userName}'s Workspace`,
        ownerId: userId,
        isDefault: true,
      })
      .onConflictDoNothing()
      .returning();

    if (!created) return;

    await transaction.insert(workspaceMember).values({
      workspaceId: created.id,
      userId,
      role: "owner",
    });
    await transaction
      .insert(workspaceAudit)
      .values(
        audit(created.id, userId, "workspace.created", "workspace", created.id),
      );
  });
}

export function listWorkspaces(userId: string) {
  return db
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
    .where(eq(workspaceMember.userId, userId))
    .orderBy(desc(workspace.isDefault), desc(workspace.updatedAt));
}

export async function createWorkspace(name: string, ownerId: string) {
  return db.transaction(async (transaction) => {
    const [created] = await transaction
      .insert(workspace)
      .values({ name, ownerId })
      .returning();

    await transaction.insert(workspaceMember).values({
      workspaceId: created.id,
      userId: ownerId,
      role: "owner",
    });
    await transaction
      .insert(workspaceAudit)
      .values(
        audit(
          created.id,
          ownerId,
          "workspace.created",
          "workspace",
          created.id,
        ),
      );

    return { ...created, role: "owner" as const };
  });
}

export async function updateWorkspace(
  workspaceId: string,
  name: string,
  actorId: string,
) {
  return db.transaction(async (transaction) => {
    const [current] = await transaction
      .select({ isDefault: workspace.isDefault })
      .from(workspace)
      .where(eq(workspace.id, workspaceId));
    if (!current) throw new HttpError(404, "NOT_FOUND", "Workspace not found");
    if (current.isDefault) {
      throw new HttpError(
        400,
        "BAD_REQUEST",
        "Default workspaces cannot be renamed",
      );
    }

    const [updated] = await transaction
      .update(workspace)
      .set({ name })
      .where(eq(workspace.id, workspaceId))
      .returning();
    await transaction
      .insert(workspaceAudit)
      .values(
        audit(
          workspaceId,
          actorId,
          "workspace.updated",
          "workspace",
          workspaceId,
        ),
      );
    return updated;
  });
}

export async function deleteWorkspace(workspaceId: string, actorId: string) {
  await db.transaction(async (transaction) => {
    const [current] = await transaction
      .select({ isDefault: workspace.isDefault })
      .from(workspace)
      .where(eq(workspace.id, workspaceId));
    if (!current) throw new HttpError(404, "NOT_FOUND", "Workspace not found");
    if (current.isDefault) {
      throw new HttpError(
        400,
        "BAD_REQUEST",
        "Default workspaces cannot be deleted",
      );
    }

    await transaction
      .insert(workspaceAudit)
      .values(
        audit(
          workspaceId,
          actorId,
          "workspace.deleted",
          "workspace",
          workspaceId,
        ),
      );
    await transaction.delete(workspace).where(eq(workspace.id, workspaceId));
  });
}

export function listMembers(workspaceId: string) {
  return db
    .select({
      workspaceId: workspaceMember.workspaceId,
      userId: workspaceMember.userId,
      name: user.name,
      email: user.email,
      role: workspaceMember.role,
      createdAt: workspaceMember.createdAt,
    })
    .from(workspaceMember)
    .innerJoin(user, eq(user.id, workspaceMember.userId))
    .where(eq(workspaceMember.workspaceId, workspaceId));
}

export function listInvites(workspaceId: string) {
  return db
    .select({
      id: workspaceInvite.id,
      workspaceId: workspaceInvite.workspaceId,
      email: workspaceInvite.email,
      role: workspaceInvite.role,
      status: workspaceInvite.status,
      invitedBy: workspaceInvite.invitedBy,
      createdAt: workspaceInvite.createdAt,
      updatedAt: workspaceInvite.updatedAt,
    })
    .from(workspaceInvite)
    .where(eq(workspaceInvite.workspaceId, workspaceId))
    .orderBy(desc(workspaceInvite.createdAt));
}

export async function inviteMember(
  workspaceId: string,
  workspaceName: string,
  email: string,
  role: InviteRole,
  actorId: string,
  actorRole: WorkspaceRole,
) {
  if (role === "admin" && actorRole !== "owner") {
    throw new HttpError(403, "FORBIDDEN", "Only the owner can invite an admin");
  }

  const [existingMember] = await db
    .select({ id: workspaceMember.userId })
    .from(workspaceMember)
    .innerJoin(user, eq(user.id, workspaceMember.userId))
    .where(
      and(eq(workspaceMember.workspaceId, workspaceId), eq(user.email, email)),
    );
  if (existingMember) {
    throw new HttpError(409, "CONFLICT", "User is already a workspace member");
  }

  const token = randomBytes(32).toString("base64url");
  const [invitation] = await db
    .insert(workspaceInvite)
    .values({
      workspaceId,
      email,
      role,
      tokenHash: hashToken(token),
      invitedBy: actorId,
    })
    .onConflictDoUpdate({
      target: [workspaceInvite.workspaceId, workspaceInvite.email],
      set: {
        role,
        status: "pending",
        tokenHash: hashToken(token),
        invitedBy: actorId,
      },
    })
    .returning({
      id: workspaceInvite.id,
      workspaceId: workspaceInvite.workspaceId,
      email: workspaceInvite.email,
      role: workspaceInvite.role,
      status: workspaceInvite.status,
      invitedBy: workspaceInvite.invitedBy,
      createdAt: workspaceInvite.createdAt,
      updatedAt: workspaceInvite.updatedAt,
    });

  await db
    .insert(workspaceAudit)
    .values(
      audit(workspaceId, actorId, "workspace.invited", "invite", invitation.id),
    );
  await sendWorkspaceInvite(email, workspaceName, token);
  return invitation;
}

export async function revokeInvite(
  workspaceId: string,
  inviteId: string,
  actorId: string,
  actorRole: WorkspaceRole,
) {
  await db.transaction(async (transaction) => {
    const [invitation] = await transaction
      .select({ role: workspaceInvite.role, status: workspaceInvite.status })
      .from(workspaceInvite)
      .where(
        and(
          eq(workspaceInvite.id, inviteId),
          eq(workspaceInvite.workspaceId, workspaceId),
        ),
      );
    if (!invitation)
      throw new HttpError(404, "NOT_FOUND", "Invitation not found");
    if (invitation.role === "admin" && actorRole !== "owner") {
      throw new HttpError(
        403,
        "FORBIDDEN",
        "Only the owner can revoke an admin invite",
      );
    }
    if (invitation.status !== "pending") {
      throw new HttpError(409, "CONFLICT", "Invitation is not pending");
    }

    await transaction
      .update(workspaceInvite)
      .set({ status: "revoked" })
      .where(eq(workspaceInvite.id, inviteId));
    await transaction
      .insert(workspaceAudit)
      .values(
        audit(
          workspaceId,
          actorId,
          "workspace.invite_revoked",
          "invite",
          inviteId,
        ),
      );
  });
}

export async function acceptInvite(
  token: string,
  currentUser: { id: string; email: string },
) {
  return db.transaction(async (transaction) => {
    const [invitation] = await transaction
      .select()
      .from(workspaceInvite)
      .where(eq(workspaceInvite.tokenHash, hashToken(token)));
    if (!invitation || invitation.status !== "pending") {
      throw new HttpError(404, "NOT_FOUND", "Invitation not found");
    }
    if (invitation.email !== currentUser.email.toLowerCase()) {
      throw new HttpError(
        403,
        "FORBIDDEN",
        "Invitation belongs to another email address",
      );
    }

    const [existingMember] = await transaction
      .select({ userId: workspaceMember.userId })
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, invitation.workspaceId),
          eq(workspaceMember.userId, currentUser.id),
        ),
      );
    if (existingMember) {
      throw new HttpError(
        409,
        "CONFLICT",
        "User is already a workspace member",
      );
    }

    const [accepted] = await transaction
      .update(workspaceInvite)
      .set({ status: "accepted" })
      .where(
        and(
          eq(workspaceInvite.id, invitation.id),
          eq(workspaceInvite.status, "pending"),
        ),
      )
      .returning({
        id: workspaceInvite.id,
        workspaceId: workspaceInvite.workspaceId,
        email: workspaceInvite.email,
        role: workspaceInvite.role,
        status: workspaceInvite.status,
        invitedBy: workspaceInvite.invitedBy,
        createdAt: workspaceInvite.createdAt,
        updatedAt: workspaceInvite.updatedAt,
      });
    if (!accepted)
      throw new HttpError(409, "CONFLICT", "Invitation was already used");

    await transaction.insert(workspaceMember).values({
      workspaceId: invitation.workspaceId,
      userId: currentUser.id,
      role: invitation.role,
    });
    await transaction
      .insert(workspaceAudit)
      .values(
        audit(
          invitation.workspaceId,
          currentUser.id,
          "workspace.invite_accepted",
          "invite",
          invitation.id,
        ),
      );
    return accepted;
  });
}

export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  role: InviteRole,
  actorId: string,
) {
  return db.transaction(async (transaction) => {
    const [updated] = await transaction
      .update(workspaceMember)
      .set({ role })
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, userId),
          eq(workspaceMember.role, role === "admin" ? "member" : "admin"),
        ),
      )
      .returning();
    if (!updated) throw new HttpError(404, "NOT_FOUND", "Member not found");

    if (role === "member") {
      const projects = await transaction
        .select({ id: project.id })
        .from(project)
        .where(eq(project.workspaceId, workspaceId));
      if (projects.length > 0) {
        await transaction.delete(projectEditor).where(
          and(
            eq(projectEditor.userId, userId),
            inArray(
              projectEditor.projectId,
              projects.map(({ id }) => id),
            ),
          ),
        );
      }
    }
    await transaction
      .insert(workspaceAudit)
      .values(
        audit(
          workspaceId,
          actorId,
          "workspace.member_role_updated",
          "user",
          userId,
        ),
      );
    const [member] = await transaction
      .select({
        workspaceId: workspaceMember.workspaceId,
        userId: workspaceMember.userId,
        name: user.name,
        email: user.email,
        role: workspaceMember.role,
        createdAt: workspaceMember.createdAt,
      })
      .from(workspaceMember)
      .innerJoin(user, eq(user.id, workspaceMember.userId))
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, userId),
        ),
      );
    return member;
  });
}

export async function removeMember(
  workspaceId: string,
  userId: string,
  actorId: string,
  actorRole: WorkspaceRole,
) {
  await db.transaction(async (transaction) => {
    const [member] = await transaction
      .select({ role: workspaceMember.role })
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, userId),
        ),
      );
    if (!member) throw new HttpError(404, "NOT_FOUND", "Member not found");
    if (member.role === "owner") {
      throw new HttpError(
        400,
        "BAD_REQUEST",
        "The workspace owner cannot be removed",
      );
    }
    if (member.role === "admin" && actorRole !== "owner") {
      throw new HttpError(
        403,
        "FORBIDDEN",
        "Only the owner can remove an admin",
      );
    }

    const projects = await transaction
      .select({ id: project.id })
      .from(project)
      .where(eq(project.workspaceId, workspaceId));
    if (projects.length > 0) {
      await transaction.delete(projectEditor).where(
        and(
          eq(projectEditor.userId, userId),
          inArray(
            projectEditor.projectId,
            projects.map(({ id }) => id),
          ),
        ),
      );
    }
    await transaction
      .delete(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, userId),
        ),
      );
    await transaction
      .insert(workspaceAudit)
      .values(
        audit(workspaceId, actorId, "workspace.member_removed", "user", userId),
      );
  });
}

export async function leaveWorkspace(workspaceId: string, userId: string) {
  await db.transaction(async (transaction) => {
    const [member] = await transaction
      .select({ role: workspaceMember.role })
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, userId),
        ),
      );
    if (!member) throw new HttpError(404, "NOT_FOUND", "Workspace not found");
    if (member.role === "owner") {
      throw new HttpError(
        400,
        "BAD_REQUEST",
        "Transfer ownership before leaving",
      );
    }

    const projects = await transaction
      .select({ id: project.id })
      .from(project)
      .where(eq(project.workspaceId, workspaceId));
    if (projects.length > 0) {
      await transaction.delete(projectEditor).where(
        and(
          eq(projectEditor.userId, userId),
          inArray(
            projectEditor.projectId,
            projects.map(({ id }) => id),
          ),
        ),
      );
    }
    await transaction
      .delete(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, userId),
        ),
      );
    await transaction
      .insert(workspaceAudit)
      .values(
        audit(workspaceId, userId, "workspace.member_left", "user", userId),
      );
  });
}

export async function transferWorkspace(
  workspaceId: string,
  newOwnerId: string,
  currentOwnerId: string,
) {
  await db.transaction(async (transaction) => {
    const [current] = await transaction
      .select({ isDefault: workspace.isDefault })
      .from(workspace)
      .where(eq(workspace.id, workspaceId));
    if (!current) throw new HttpError(404, "NOT_FOUND", "Workspace not found");
    if (current.isDefault) {
      throw new HttpError(
        400,
        "BAD_REQUEST",
        "Default workspace ownership cannot be transferred",
      );
    }

    const [newOwner] = await transaction
      .select({ role: workspaceMember.role })
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, newOwnerId),
        ),
      );
    if (!newOwner) throw new HttpError(404, "NOT_FOUND", "Member not found");

    await transaction
      .update(workspace)
      .set({ ownerId: newOwnerId })
      .where(eq(workspace.id, workspaceId));
    await transaction
      .update(workspaceMember)
      .set({ role: "admin" })
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, currentOwnerId),
        ),
      );
    await transaction
      .update(workspaceMember)
      .set({ role: "owner" })
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, newOwnerId),
        ),
      );
    await transaction
      .insert(workspaceAudit)
      .values(
        audit(
          workspaceId,
          currentOwnerId,
          "workspace.transferred",
          "user",
          newOwnerId,
        ),
      );
  });
}
