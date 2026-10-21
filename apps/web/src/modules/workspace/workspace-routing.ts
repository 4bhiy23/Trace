import { WorkspaceItem, WorkspaceProject } from "./types";

export function toSlug(str: string): string {
  if (!str) return "";
  return encodeURIComponent(
    str
      .trim()
      .toLowerCase()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item",
  );
}


export function findWorkspaceBySlugOrId(
  workspaces: WorkspaceItem[],
  identifier?: string,
): WorkspaceItem | null {
  if (!identifier || !workspaces.length) return null;
  const decoded = decodeURIComponent(identifier).trim().toLowerCase();
  const slugified = toSlug(decoded);

  return (
    workspaces.find((w) => w.id === identifier) ||
    workspaces.find((w) => w.name.trim().toLowerCase() === decoded) ||
    workspaces.find((w) => toSlug(w.name) === slugified) ||
    null
  );
}


export function findProjectBySlugOrId(
  projects: WorkspaceProject[],
  identifier?: string,
): WorkspaceProject | null {
  if (!identifier || !projects.length) return null;
  const decoded = decodeURIComponent(identifier).trim().toLowerCase();
  const slugified = toSlug(decoded);

  return (
    projects.find((p) => p.id === identifier) ||
    projects.find((p) => p.name.trim().toLowerCase() === decoded) ||
    projects.find((p) => toSlug(p.name) === slugified) ||
    null
  );
}

const STORAGE_KEY_WORKSPACE_ID = "trace:last_workspace_id";
const STORAGE_KEY_WORKSPACE_SLUG = "trace:last_workspace_slug";

export function getSavedWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY_WORKSPACE_ID);
  } catch {
    return null;
  }
}

export function saveActiveWorkspace(workspace: { id: string; name: string }) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_WORKSPACE_ID, workspace.id);
    localStorage.setItem(STORAGE_KEY_WORKSPACE_SLUG, toSlug(workspace.name));
  } catch {
    
  }
}
