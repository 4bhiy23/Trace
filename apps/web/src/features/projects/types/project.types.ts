import type { Project, ProjectAccess, ProjectEditor } from "@trace/shared";

export type { Project, ProjectAccess, ProjectEditor };

export interface CreateProjectInput {
  name: string;
}

export interface UpdateProjectInput {
  name: string;
}

export interface AddProjectEditorInput {
  userId: string;
}
