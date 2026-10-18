/**
 * Query key factory for workspaces and workspace sub-resources.
 */
export const workspaceKeys = {
  all: ["workspaces"] as const,
  lists: () => [...workspaceKeys.all, "list"] as const,
  details: () => [...workspaceKeys.all, "detail"] as const,
  detail: (workspaceId: string) =>
    [...workspaceKeys.details(), workspaceId] as const,
  members: (workspaceId: string) =>
    [...workspaceKeys.detail(workspaceId), "members"] as const,
  invites: (workspaceId: string) =>
    [...workspaceKeys.detail(workspaceId), "invites"] as const,
};
