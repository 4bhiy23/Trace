/**
 * Query key factory for projects and project editor grants.
 */
export const projectKeys = {
  all: ["projects"] as const,
  workspaceLists: () => [...projectKeys.all, "workspace"] as const,
  listByWorkspace: (workspaceId: string) =>
    [...projectKeys.workspaceLists(), workspaceId] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (projectId: string) => [...projectKeys.details(), projectId] as const,
  editors: (projectId: string) =>
    [...projectKeys.detail(projectId), "editors"] as const,
};
