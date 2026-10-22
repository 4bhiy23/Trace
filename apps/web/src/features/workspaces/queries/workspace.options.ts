import { queryOptions } from "@tanstack/react-query";
import { workspaceApi } from "../api/workspace.api";
import { workspaceKeys } from "./workspace.keys";

export const workspaceQueries = {
  /**
   * Options for listing all workspaces for the signed-in user.
   */
  list: () =>
    queryOptions({
      queryKey: workspaceKeys.lists(),
      queryFn: () => workspaceApi.list(),
    }),

  /**
   * Options for retrieving details of a single workspace.
   */
  detail: (workspaceId: string) =>
    queryOptions({
      queryKey: workspaceKeys.detail(workspaceId),
      queryFn: () => workspaceApi.getById(workspaceId),
      enabled: Boolean(workspaceId),
    }),

  /**
   * Options for retrieving members of a workspace.
   */
  members: (workspaceId: string) =>
    queryOptions({
      queryKey: workspaceKeys.members(workspaceId),
      queryFn: () => workspaceApi.listMembers(workspaceId),
      enabled: Boolean(workspaceId),
    }),

  /**
   * Options for retrieving pending invites of a workspace.
   */
  invites: (workspaceId: string) =>
    queryOptions({
      queryKey: workspaceKeys.invites(workspaceId),
      queryFn: () => workspaceApi.listInvites(workspaceId),
      enabled: Boolean(workspaceId),
    }),
};
