import { apiRoutes } from "@trace/shared";
import { apiClient } from "@/lib/api-client";
import type {
  Project,
  ProjectEditor,
  CreateProjectInput,
  UpdateProjectInput,
  AddProjectEditorInput,
} from "../types/project.types";

export const projectApi = {
  /**
   * Lists all projects in a workspace, including user's derived access level.
   */
  listByWorkspace: (workspaceId: string) =>
    apiClient<Project[]>(apiRoutes.workspaceProjects(workspaceId)),

  /**
   * Retrieves a single project by ID.
   */
  getById: (projectId: string) =>
    apiClient<Project>(apiRoutes.project(projectId)),

  /**
   * Creates a new project within a workspace.
   */
  create: (workspaceId: string, input: CreateProjectInput) =>
    apiClient<Project>(apiRoutes.workspaceProjects(workspaceId), {
      method: "POST",
      body: JSON.stringify(input),
    }),

  /**
   * Renames a project.
   */
  update: (projectId: string, input: UpdateProjectInput) =>
    apiClient<Project>(apiRoutes.project(projectId), {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  /**
   * Archives (soft-deletes) a project.
   */
  archive: (projectId: string) =>
    apiClient<void>(apiRoutes.project(projectId), {
      method: "DELETE",
    }),

  /**
   * Lists explicit project editors and workspace admins for a project.
   */
  listEditors: (projectId: string) =>
    apiClient<ProjectEditor[]>(apiRoutes.projectEditors(projectId)),

  /**
   * Grants a regular workspace member explicit editing access on a project.
   */
  addEditor: (projectId: string, input: AddProjectEditorInput) =>
    apiClient<ProjectEditor>(apiRoutes.projectEditors(projectId), {
      method: "POST",
      body: JSON.stringify(input),
    }),

  /**
   * Revokes explicit editor access from a user on a project.
   */
  removeEditor: (projectId: string, userId: string) =>
    apiClient<void>(apiRoutes.projectEditor(projectId, userId), {
      method: "DELETE",
    }),
};
