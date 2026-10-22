export type CanvasType = "markdown" | "architecture" | "flow" | "dbml" | "uml";
export type Role = "owner" | "editor" | "viewer";
export type AccessPermission = "editor" | "viewer" | "workspace" | "private";

export interface WorkspaceFile {
  id: string;
  name: string;
  type: CanvasType;
  projectId: string;
  description?: string;
  location?: string | null;
  createdAt: string; // e.g. "1 week ago"
  createdTimestamp: number;
  editedAt: string; // e.g. "10 mins ago"
  editedTimestamp: number;
  commentsCount?: number;
  author: {
    name: string;
    avatarUrl?: string;
    initials: string;
    color: string;
  };
  isPrivate?: boolean;
  isArchived?: boolean;
}

export interface ProjectMemberAssignment {
  email: string;
  name?: string;
  role: Role;
  isOwner?: boolean;
}

export interface WorkspaceProject {
  id: string;
  name: string;
  description?: string;
  count: number;
  access?: AccessPermission;
  members?: ProjectMemberAssignment[];
  archivedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  updatedTimestamp?: number;
}

export type WorkspaceFolder = WorkspaceProject;

export type FilterTab = "all" | "recents" | "created-by-me";

export type SortField = "name" | "type" | "edited" | "created";
export type SortDirection = "asc" | "desc";

export interface WorkspaceItem {
  id: string;
  name: string;
  ownerId?: string;
  isDefault: boolean;
  role: "owner" | "admin" | "member";
  membersCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
