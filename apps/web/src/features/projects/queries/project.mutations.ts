import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "../api/project.api";
import { projectKeys } from "./project.keys";
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  AddProjectEditorInput,
} from "../types/project.types";

// Mutation hook to create
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

export function useArchiveProject(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectApi.archive(projectId),
    onSuccess: (_data, projectId) => {
      queryClient.setQueryData<Project[]>(
        projectKeys.listByWorkspace(workspaceId),
        (old) =>
          old
            ? old.map((p) =>
                p.id === projectId
                  ? { ...p, archivedAt: new Date().toISOString() }
                  : p,
              )
            : [],
      );
      queryClient.invalidateQueries({
        queryKey: projectKeys.listByWorkspace(workspaceId),
      });
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

export function usePermanentlyDeleteArchivedProject(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectApi.permanentlyDelete(projectId),
    onSuccess: (_data, projectId) => {
      queryClient.setQueryData<Project[]>(
        projectKeys.listByWorkspace(workspaceId),
        (old) => old?.filter((project) => project.id !== projectId) ?? [],
      );
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

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
