import { createHash, randomBytes } from "node:crypto";
import type { InviteRole, WorkspaceRole } from "@trace/shared";
import { and, desc, eq, inArray, ne } from "drizzle-orm";
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
import { assertEmailConfigured, sendWorkspaceInvite } from "./workspace.email";

/**
 * Builds a workspace audit record identifying the actor, action, and target.
 */
const audit = (
  workspaceId: string,
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
) => ({ workspaceId, actorId, action, targetType, targetId });

/**
 * Returns the SHA-256 hex digest used to store and look up invitation tokens.
 */
const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

/**
 * Creates a user's default workspace, owner membership, and audit entry atomically.
 * Does nothing when the workspace insert conflicts with an existing record.
 */
export async function createDefaultWorkspace(userId: string, userName: string) {
  const [existing] = await db
    .select({ id: workspace.id })
    .from(workspace)
    .where(and(eq(workspace.ownerId, userId), eq(workspace.isDefault, true)))
    .limit(1);
  if (existing) return;

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

/**
 * Lists a user's workspaces and roles, placing default workspaces before those ordered by latest update.
 */
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

/**
 * Creates a workspace, its owner membership, and an audit entry atomically.
 * Returns the workspace with the owner role.
 */
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

/**
 * Renames a workspace and writes an audit entry after caller authorization.
 * Rejects missing workspaces with 404 and default workspaces with 400.
 */
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

/**
 * Deletes a workspace only when the caller is still its owner.
 * Rejects missing workspaces with 404 and default workspaces with 400.
 */
export async function deleteWorkspace(workspaceId: string, actorId: string) {
  await db.transaction(async (transaction) => {
    const [current] = await transaction
      .select({ isDefault: workspace.isDefault, ownerId: workspace.ownerId })
      .from(workspace)
      .where(eq(workspace.id, workspaceId))
      .for("update");
    if (!current) throw new HttpError(404, "NOT_FOUND", "Workspace not found");
    if (current.isDefault) {
      throw new HttpError(
        400,
        "BAD_REQUEST",
        "Default workspaces cannot be deleted",
      );
    }
    if (current.ownerId !== actorId) {
      throw new HttpError(404, "NOT_FOUND", "Workspace not found");
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

/**
 * Lists workspace memberships with each user's name, email, and role.
 */
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

/**
 * Lists workspace invitations newest first without exposing token hashes.
 */
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

/**
 * Creates or renews an invitation with a fresh token, records it, then emails the recipient.
 * Callers must authorize invitations and normalize the email address.
 * Only owners may invite admins; email delivery failure leaves the invitation stored.
 */
export async function inviteMember(
  workspaceId: string,
  workspaceName: string,
  email: string,
  role: InviteRole,
  actorId: string,
) {
  assertEmailConfigured();

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const invitation = await db.transaction(async (transaction) => {
    const [actor] = await transaction
      .select({ role: workspaceMember.role })
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, actorId),
        ),
      )
      .for("update");
    if (!actor || (actor.role !== "owner" && actor.role !== "admin")) {
      throw new HttpError(404, "NOT_FOUND", "Workspace not found");
    }
    if (role === "admin" && actor.role !== "owner") {
      throw new HttpError(
        403,
        "FORBIDDEN",
        "Only the owner can invite an admin",
      );
    }

    const [existingInvitation] = await transaction
      .select({ role: workspaceInvite.role })
      .from(workspaceInvite)
      .where(
        and(
          eq(workspaceInvite.workspaceId, workspaceId),
          eq(workspaceInvite.email, email),
        ),
      );
    if (existingInvitation?.role === "admin" && actor.role !== "owner") {
      throw new HttpError(
        403,
        "FORBIDDEN",
        "Only the owner can modify an admin invitation",
      );
    }

    const [invitation] = await transaction
      .insert(workspaceInvite)
      .values({ workspaceId, email, role, tokenHash, invitedBy: actorId })
      .onConflictDoUpdate({
        target: [workspaceInvite.workspaceId, workspaceInvite.email],
        set: { role, status: "pending", tokenHash, invitedBy: actorId },
        ...(actor.role === "owner"
          ? {}
          : { where: ne(workspaceInvite.role, "admin") }),
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
    if (!invitation) {
      throw new HttpError(
        403,
        "FORBIDDEN",
        "Only the owner can modify an admin invitation",
      );
    }

    const [existingMember] = await transaction
      .select({ id: workspaceMember.userId })
      .from(workspaceMember)
      .innerJoin(user, eq(user.id, workspaceMember.userId))
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(user.email, email),
        ),
      );
    if (existingMember) {
      throw new HttpError(
        409,
        "CONFLICT",
        "User is already a workspace member",
      );
    }

    await transaction
      .insert(workspaceAudit)
      .values(
        audit(
          workspaceId,
          actorId,
          "workspace.invited",
          "invite",
          invitation.id,
        ),
      );
    return invitation;
  });
  await sendWorkspaceInvite(email, workspaceName, token);
  return invitation;
}

/**
 * Revokes a pending invitation and records the action atomically after caller authorization.
 * Only owners may revoke admin invitations; missing or non-pending invitations are rejected.
 */
export async function revokeInvite(
  workspaceId: string,
  inviteId: string,
  actorId: string,
) {
  await db.transaction(async (transaction) => {
    const [actor] = await transaction
      .select({ role: workspaceMember.role })
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, actorId),
        ),
      )
      .for("update");
    if (!actor || (actor.role !== "owner" && actor.role !== "admin")) {
      throw new HttpError(404, "NOT_FOUND", "Workspace not found");
    }

    const [invitation] = await transaction
      .select({
        role: workspaceInvite.role,
        status: workspaceInvite.status,
        tokenHash: workspaceInvite.tokenHash,
      })
      .from(workspaceInvite)
      .where(
        and(
          eq(workspaceInvite.id, inviteId),
          eq(workspaceInvite.workspaceId, workspaceId),
        ),
      );
    if (!invitation)
      throw new HttpError(404, "NOT_FOUND", "Invitation not found");
    if (invitation.role === "admin" && actor.role !== "owner") {
      throw new HttpError(
        403,
        "FORBIDDEN",
        "Only the owner can revoke an admin invite",
      );
    }
    if (invitation.status !== "pending") {
      throw new HttpError(409, "CONFLICT", "Invitation is not pending");
    }

    const [revoked] = await transaction
      .update(workspaceInvite)
      .set({ status: "revoked" })
      .where(
        and(
          eq(workspaceInvite.id, inviteId),
          eq(workspaceInvite.workspaceId, workspaceId),
          eq(workspaceInvite.status, "pending"),
          eq(workspaceInvite.role, invitation.role),
          eq(workspaceInvite.tokenHash, invitation.tokenHash),
        ),
      )
      .returning({ id: workspaceInvite.id });
    if (!revoked) throw new HttpError(409, "CONFLICT", "Invitation changed");

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

/**
 * Accepts a pending token for the signed-in recipient and creates their membership atomically.
 * Rejects invalid tokens, email mismatches, existing membership, and concurrent token reuse.
 * Returns invitation details without the token hash.
 */
export async function acceptInvite(
  token: string,
  currentUser: { id: string; email: string },
) {
  const tokenHash = hashToken(token);
  return db.transaction(async (transaction) => {
    const [invitation] = await transaction
      .select()
      .from(workspaceInvite)
      .where(eq(workspaceInvite.tokenHash, tokenHash));
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
          eq(workspaceInvite.tokenHash, tokenHash),
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
      workspaceId: accepted.workspaceId,
      userId: currentUser.id,
      role: accepted.role,
    });
    await transaction
      .insert(workspaceAudit)
      .values(
        audit(
          accepted.workspaceId,
          currentUser.id,
          "workspace.invite_accepted",
          "invite",
          accepted.id,
        ),
      );
    return accepted;
  });
}

/**
 * Switches a member between admin and member roles after caller authorization.
 * Demotion clears project editor grants; the role change and audit entry are atomic.
 * Returns member details, or raises 404 if no membership has the opposite role.
 */
export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  role: InviteRole,
  actorId: string,
) {
  return db.transaction(async (transaction) => {
    const [actor] = await transaction
      .select({ role: workspaceMember.role })
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, actorId),
        ),
      )
      .for("update");
    if (!actor || actor.role !== "owner") {
      throw new HttpError(404, "NOT_FOUND", "Workspace not found");
    }

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

/**
 * Removes a membership and its project editor grants with an audit entry atomically.
 * Callers must authorize member management; owners cannot be removed and only owners may remove admins.
 */
export async function removeMember(
  workspaceId: string,
  userId: string,
  actorId: string,
) {
  await db.transaction(async (transaction) => {
    const [actor] = await transaction
      .select({ role: workspaceMember.role })
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, actorId),
        ),
      )
      .for("update");
    if (!actor || (actor.role !== "owner" && actor.role !== "admin")) {
      throw new HttpError(404, "NOT_FOUND", "Workspace not found");
    }

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
    if (member.role === "owner") {
      throw new HttpError(
        400,
        "BAD_REQUEST",
        "The workspace owner cannot be removed",
      );
    }
    if (member.role === "admin" && actor.role !== "owner") {
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
    const [removed] = await transaction
      .delete(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, userId),
          ne(workspaceMember.role, "owner"),
        ),
      )
      .returning({ userId: workspaceMember.userId });
    if (!removed) throw new HttpError(409, "CONFLICT", "Member role changed");

    await transaction
      .insert(workspaceAudit)
      .values(
        audit(workspaceId, actorId, "workspace.member_removed", "user", userId),
      );
  });
}

/**
 * Removes the user's membership and project editor grants with an audit entry atomically.
 * Owners must transfer ownership before leaving; missing memberships raise 404.
 */
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
      )
      .for("update");
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
    const [left] = await transaction
      .delete(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, userId),
          ne(workspaceMember.role, "owner"),
        ),
      )
      .returning({ userId: workspaceMember.userId });
    if (!left) throw new HttpError(409, "CONFLICT", "Member role changed");

    await transaction
      .insert(workspaceAudit)
      .values(
        audit(workspaceId, userId, "workspace.member_left", "user", userId),
      );
  });
}

/**
 * Transfers a non-default workspace to an existing member and demotes the former owner to admin.
 * Callers must verify current ownership; ownership, roles, and the audit entry change atomically.
 */
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

    const [transferred] = await transaction
      .update(workspace)
      .set({ ownerId: newOwnerId })
      .where(
        and(
          eq(workspace.id, workspaceId),
          eq(workspace.ownerId, currentOwnerId),
          eq(workspace.isDefault, false),
        ),
      )
      .returning({ id: workspace.id });
    if (!transferred)
      throw new HttpError(403, "FORBIDDEN", "Workspace ownership changed");

    const [formerOwner] = await transaction
      .update(workspaceMember)
      .set({ role: "admin" })
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, currentOwnerId),
          eq(workspaceMember.role, "owner"),
        ),
      )
      .returning({ userId: workspaceMember.userId });
    if (!formerOwner)
      throw new HttpError(409, "CONFLICT", "Workspace owner changed");

    const [newOwnerMembership] = await transaction
      .update(workspaceMember)
      .set({ role: "owner" })
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, newOwnerId),
        ),
      )
      .returning({ userId: workspaceMember.userId });
    if (!newOwnerMembership)
      throw new HttpError(409, "CONFLICT", "Member changed");
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
