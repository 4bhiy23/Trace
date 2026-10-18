import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "../api/project.api";
import { projectKeys } from "./project.keys";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  AddProjectEditorInput,
} from "../types/project.types";

/**
 * Mutation hook to create a new project in a workspace.
 */
export function useCreateProject(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) =>
      projectApi.create(workspaceId, input),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.listByWorkspace(workspaceId),
      });
      queryClient.setQueryData(projectKeys.detail(newProject.id), newProject);
    },
  });
}

/**
 * Mutation hook to update/rename a project.
 */
export function useUpdateProject(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      input,
    }: {
      projectId: string;
      input: UpdateProjectInput;
    }) => projectApi.update(projectId, input),
    onSuccess: (updated) => {
      if (workspaceId) {
        queryClient.invalidateQueries({
          queryKey: projectKeys.listByWorkspace(workspaceId),
        });
      } else {
        queryClient.invalidateQueries({ queryKey: projectKeys.all });
      }
      queryClient.setQueryData(projectKeys.detail(updated.id), updated);
    },
  });
}

/**
 * Mutation hook to archive (delete) a project.
 */
export function useArchiveProject(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectApi.archive(projectId),
    onSuccess: (_data, projectId) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.listByWorkspace(workspaceId),
      });
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

/**
 * Mutation hook to add an explicit editor to a project.
 */
export function useAddProjectEditor(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddProjectEditorInput) =>
      projectApi.addEditor(projectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.editors(projectId),
      });
    },
  });
}

/**
 * Mutation hook to remove an explicit editor from a project.
 */
export function useRemoveProjectEditor(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => projectApi.removeEditor(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.editors(projectId),
      });
    },
  });
}
