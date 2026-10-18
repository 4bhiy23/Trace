import { queryOptions } from "@tanstack/react-query";
import { projectApi } from "../api/project.api";
import { projectKeys } from "./project.keys";

export const projectQueries = {
  /**
   * Options for listing all projects within a workspace.
   */
  listByWorkspace: (workspaceId: string) =>
    queryOptions({
      queryKey: projectKeys.listByWorkspace(workspaceId),
      queryFn: () => projectApi.listByWorkspace(workspaceId),
      enabled: Boolean(workspaceId),
    }),

  /**
   * Options for retrieving details of a single project.
   */
  detail: (projectId: string) =>
    queryOptions({
      queryKey: projectKeys.detail(projectId),
      queryFn: () => projectApi.getById(projectId),
      enabled: Boolean(projectId),
    }),

  /**
   * Options for retrieving editors of a project.
   */
  editors: (projectId: string) =>
    queryOptions({
      queryKey: projectKeys.editors(projectId),
      queryFn: () => projectApi.listEditors(projectId),
      enabled: Boolean(projectId),
    }),
};
