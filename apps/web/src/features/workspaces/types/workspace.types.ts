import type {
  Workspace,
  WorkspaceMember,
  WorkspaceRole,
  WorkspaceInvite,
  InviteRole,
  InviteStatus,
} from "@trace/shared";

export type {
  Workspace,
  WorkspaceMember,
  WorkspaceRole,
  WorkspaceInvite,
  InviteRole,
  InviteStatus,
};

export interface CreateWorkspaceInput {
  name: string;
}

export interface UpdateWorkspaceInput {
  name: string;
}

export interface InviteMemberInput {
  email: string;
  role?: InviteRole;
}

export interface UpdateMemberRoleInput {
  userId: string;
  role: InviteRole;
}

export interface TransferWorkspaceInput {
  userId: string;
}
