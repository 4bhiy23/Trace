import { apiRoutes } from "@trace/shared";
import { apiClient } from "@/lib/api-client";
import type {
  Workspace,
  WorkspaceMember,
  WorkspaceInvite,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
  TransferWorkspaceInput,
} from "../types/workspace.types";

export const workspaceApi = {
  /**
   * Lists all workspaces where the current user is a member.
   */
  list: () => apiClient<Workspace[]>(apiRoutes.workspaces),

  /**
   * Retrieves workspace details and role for a specific workspace.
   */
  getById: (workspaceId: string) =>
    apiClient<Workspace>(apiRoutes.workspace(workspaceId)),

  /**
   * Creates a new workspace.
   */
  create: (input: CreateWorkspaceInput) =>
    apiClient<Workspace>(apiRoutes.workspaces, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  /**
   * Renames a workspace (non-default only).
   */
  update: (workspaceId: string, input: UpdateWorkspaceInput) =>
    apiClient<Workspace>(apiRoutes.workspace(workspaceId), {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  /**
   * Deletes a non-default workspace (owner only).
   */
  delete: (workspaceId: string) =>
    apiClient<void>(apiRoutes.workspace(workspaceId), {
      method: "DELETE",
    }),

  /**
   * Lists all members of a workspace.
   */
  listMembers: (workspaceId: string) =>
    apiClient<WorkspaceMember[]>(apiRoutes.workspaceMembers(workspaceId)),

  /**
   * Updates a member's role (promote/demote between admin and member, owner only).
   */
  updateMemberRole: (workspaceId: string, input: UpdateMemberRoleInput) =>
    apiClient<WorkspaceMember>(
      apiRoutes.workspaceMember(workspaceId, input.userId),
      {
        method: "PATCH",
        body: JSON.stringify({ role: input.role }),
      },
    ),

  /**
   * Removes a member from the workspace.
   */
  removeMember: (workspaceId: string, userId: string) =>
    apiClient<void>(apiRoutes.workspaceMember(workspaceId, userId), {
      method: "DELETE",
    }),

  /**
   * Lists pending invitations for a workspace.
   */
  listInvites: (workspaceId: string) =>
    apiClient<WorkspaceInvite[]>(apiRoutes.workspaceInvites(workspaceId)),

  /**
   * Invites a member to the workspace via email.
   */
  inviteMember: (workspaceId: string, input: InviteMemberInput) =>
    apiClient<WorkspaceInvite>(apiRoutes.workspaceInvites(workspaceId), {
      method: "POST",
      body: JSON.stringify(input),
    }),

  /**
   * Revokes a pending workspace invitation.
   */
  revokeInvite: (workspaceId: string, inviteId: string) =>
    apiClient<void>(apiRoutes.workspaceInvite(workspaceId, inviteId), {
      method: "DELETE",
    }),

  /**
   * Leaves the workspace.
   */
  leave: (workspaceId: string) =>
    apiClient<void>(apiRoutes.workspaceLeave(workspaceId), {
      method: "POST",
    }),

  /**
   * Transfers ownership of a non-default workspace to another member.
   */
  transfer: (workspaceId: string, input: TransferWorkspaceInput) =>
    apiClient<void>(apiRoutes.workspaceTransfer(workspaceId), {
      method: "POST",
      body: JSON.stringify(input),
    }),

  /**
   * Accepts an invitation using a secret token.
   */
  acceptInvite: (token: string) =>
    apiClient<WorkspaceInvite>(apiRoutes.inviteAccept(token), {
      method: "POST",
    }),
};
