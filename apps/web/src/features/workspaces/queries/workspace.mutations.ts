import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workspaceApi } from "../api/workspace.api";
import { workspaceKeys } from "./workspace.keys";
import type {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
  TransferWorkspaceInput,
} from "../types/workspace.types";

/**
 * Mutation hook to create a new workspace.
 */
export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWorkspaceInput) => workspaceApi.create(input),
    onSuccess: (newWorkspace) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      queryClient.setQueryData(
        workspaceKeys.detail(newWorkspace.id),
        newWorkspace,
      );
    },
  });
}

/**
 * Mutation hook to rename an existing workspace.
 */
export function useUpdateWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateWorkspaceInput) =>
      workspaceApi.update(workspaceId, input),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      queryClient.setQueryData(workspaceKeys.detail(workspaceId), updated);
    },
  });
}

/**
 * Mutation hook to delete a workspace.
 */
export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId: string) => workspaceApi.delete(workspaceId),
    onSuccess: (_data, workspaceId) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      queryClient.removeQueries({
        queryKey: workspaceKeys.detail(workspaceId),
      });
    },
  });
}

/**
 * Mutation hook to invite a new member to a workspace.
 */
export function useInviteMember(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: InviteMemberInput) =>
      workspaceApi.inviteMember(workspaceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.invites(workspaceId),
      });
    },
  });
}

/**
 * Mutation hook to revoke a pending invitation.
 */
export function useRevokeInvite(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) =>
      workspaceApi.revokeInvite(workspaceId, inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.invites(workspaceId),
      });
    },
  });
}

/**
 * Mutation hook to promote or demote a workspace member's role.
 */
export function useUpdateMemberRole(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateMemberRoleInput) =>
      workspaceApi.updateMemberRole(workspaceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(workspaceId),
      });
    },
  });
}

/**
 * Mutation hook to remove a member from a workspace.
 */
export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      workspaceApi.removeMember(workspaceId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(workspaceId),
      });
    },
  });
}

/**
 * Mutation hook to leave a workspace.
 */
export function useLeaveWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId: string) => workspaceApi.leave(workspaceId),
    onSuccess: (_data, workspaceId) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      queryClient.removeQueries({
        queryKey: workspaceKeys.detail(workspaceId),
      });
    },
  });
}

/**
 * Mutation hook to transfer workspace ownership.
 */
export function useTransferWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TransferWorkspaceInput) =>
      workspaceApi.transfer(workspaceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.detail(workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(workspaceId),
      });
    },
  });
}

/**
 * Mutation hook to accept an invitation token.
 */
export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => workspaceApi.acceptInvite(token),
    onSuccess: (invitation) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(invitation.workspaceId),
      });
    },
  });
}
