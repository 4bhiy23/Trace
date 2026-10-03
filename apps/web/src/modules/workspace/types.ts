export type CanvasType = "markdown" | "architecture" | "flow" | "dbml" | "uml";
export type Role = "owner" | "editor" | "viewer";

export interface WorkspaceFile {
  id: string;
  name: string;
  type: CanvasType;
  location: string | null; // null or folder name
  createdAt: string; // e.g. "1 week ago"
  createdTimestamp: number;
  editedAt: string; // e.g. "10 mins ago"
  editedTimestamp: number;
  commentsCount: number;
  author: {
    name: string;
    avatarUrl?: string;
    initials: string;
    color: string;
  };
  isPrivate?: boolean;
  isArchived?: boolean;
}

export interface WorkspaceFolder {
  id: string;
  name: string;
  count: number;
}

export type FilterTab =
  "all" | "recents" | "created-by-me" | "folders" | "unsorted";

export type SortField = "name" | "edited" | "created";
export type SortDirection = "asc" | "desc";
