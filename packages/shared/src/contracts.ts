import { z } from "zod";

export const workspaceRoleSchema = z.enum(["owner", "admin", "member"]);
export type WorkspaceRole = z.infer<typeof workspaceRoleSchema>;

export const inviteRoleSchema = z.enum(["admin", "member"]);
export type InviteRole = z.infer<typeof inviteRoleSchema>;

export const inviteStatusSchema = z.enum(["pending", "accepted", "revoked"]);
export type InviteStatus = z.infer<typeof inviteStatusSchema>;

export const workspaceActionSchema = z.enum([
  "workspace:read",
  "workspace:update",
  "workspace:delete",
  "workspace:transfer",
  "member:invite",
  "member:manage",
  "admin:manage",
  "project:create",
  "project:manage",
  "version:restore",
]);
export type WorkspaceAction = z.infer<typeof workspaceActionSchema>;

const workspacePermissions: Record<WorkspaceRole, readonly WorkspaceAction[]> =
  {
    owner: workspaceActionSchema.options,
    admin: [
      "workspace:read",
      "workspace:update",
      "member:invite",
      "member:manage",
      "project:create",
      "project:manage",
      "version:restore",
    ],
    member: ["workspace:read"],
  };

export function canWorkspace(role: WorkspaceRole, action: WorkspaceAction) {
  return workspacePermissions[role].includes(action);
}

export function canEditProject(role: WorkspaceRole, hasEditorGrant: boolean) {
  return role === "owner" || role === "admin" || hasEditorGrant;
}

export const canvasTypeSchema = z.enum([
  "markdown",
  "dbml",
  "uml",
  "architecture",
  "flow",
]);
export type CanvasType = z.infer<typeof canvasTypeSchema>;

export const umlSubtypeSchema = z.enum(["class", "sequence"]);
export type UmlSubtype = z.infer<typeof umlSubtypeSchema>;

export const canvasIdentitySchema = z
  .object({
    type: canvasTypeSchema,
    subtype: umlSubtypeSchema.nullable().default(null),
  })
  .superRefine(({ type, subtype }, context) => {
    if (type === "uml" && subtype === null) {
      context.addIssue({
        code: "custom",
        path: ["subtype"],
        message: "UML canvases require a subtype",
      });
    }

    if (type !== "uml" && subtype !== null) {
      context.addIssue({
        code: "custom",
        path: ["subtype"],
        message: "Only UML canvases can have a subtype",
      });
    }
  });

export const canvasLayoutSchema = z.record(
  z.string(),
  z.object({ x: z.number(), y: z.number() }),
);

export const canvasDraftSchema = z.object({
  identity: canvasIdentitySchema,
  source: z.string().optional(),
  model: z.unknown().optional(),
  layout: canvasLayoutSchema.default({}),
});
export type CanvasDraft = z.infer<typeof canvasDraftSchema>;

export type Workspace = {
  id: string;
  name: string;
  ownerId: string;
  isDefault: boolean;
  role: WorkspaceRole;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceMember = {
  workspaceId: string;
  userId: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  createdAt: string;
};

export type WorkspaceInvite = {
  id: string;
  workspaceId: string;
  email: string;
  role: InviteRole;
  status: InviteStatus;
  invitedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectAccess = "editor" | "viewer";

export type Project = {
  id: string;
  workspaceId: string;
  name: string;
  access: ProjectAccess;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectEditor = {
  projectId: string;
  userId: string;
  name: string;
  email: string;
  createdAt: string;
};

export type Canvas = {
  id: string;
  projectId: string;
  name: string;
  type: CanvasType;
  subtype: UmlSubtype | null;
  draft: CanvasDraft;
  createdAt: string;
  updatedAt: string;
};

export type CanvasVersion = {
  id: string;
  canvasId: string;
  versionNumber: number;
  snapshot: CanvasDraft;
  authorId: string;
  message: string | null;
  createdAt: string;
};

export const apiPaths = {
  health: "/health",
  openApi: "/api/openapi.json",
  docs: "/api/docs",
  authHandler: "/api/auth/*splat",
  authSignUpEmail: "/api/auth/sign-up/email",
  authSignInEmail: "/api/auth/sign-in/email",
  authGetSession: "/api/auth/get-session",
  authSignOut: "/api/auth/sign-out",
  workspaces: "/api/workspaces",
  workspace: "/api/workspaces/:workspaceId",
  workspaceMembers: "/api/workspaces/:workspaceId/members",
  workspaceMember: "/api/workspaces/:workspaceId/members/:userId",
  workspaceInvites: "/api/workspaces/:workspaceId/invites",
  workspaceInvite: "/api/workspaces/:workspaceId/invites/:inviteId",
  workspaceLeave: "/api/workspaces/:workspaceId/leave",
  workspaceTransfer: "/api/workspaces/:workspaceId/transfer",
  inviteAccept: "/api/workspace-invites/:token/accept",
  workspaceProjects: "/api/workspaces/:workspaceId/projects",
  project: "/api/projects/:projectId",
  projectEditors: "/api/projects/:projectId/editors",
  projectEditor: "/api/projects/:projectId/editors/:userId",
  canvases: "/api/projects/:projectId/canvases",
  canvas: "/api/canvases/:canvasId",
  versions: "/api/canvases/:canvasId/versions",
  restore: "/api/canvases/:canvasId/versions/:versionId/restore",
} as const;

export const apiRoutes = {
  health: apiPaths.health,
  openApi: apiPaths.openApi,
  docs: apiPaths.docs,
  workspaces: apiPaths.workspaces,
  workspace: (workspaceId: string) => `/api/workspaces/${workspaceId}`,
  workspaceMembers: (workspaceId: string) =>
    `/api/workspaces/${workspaceId}/members`,
  workspaceMember: (workspaceId: string, userId: string) =>
    `/api/workspaces/${workspaceId}/members/${userId}`,
  workspaceInvites: (workspaceId: string) =>
    `/api/workspaces/${workspaceId}/invites`,
  workspaceInvite: (workspaceId: string, inviteId: string) =>
    `/api/workspaces/${workspaceId}/invites/${inviteId}`,
  workspaceLeave: (workspaceId: string) =>
    `/api/workspaces/${workspaceId}/leave`,
  workspaceTransfer: (workspaceId: string) =>
    `/api/workspaces/${workspaceId}/transfer`,
  inviteAccept: (token: string) =>
    `/api/workspace-invites/${encodeURIComponent(token)}/accept`,
  workspaceProjects: (workspaceId: string) =>
    `/api/workspaces/${workspaceId}/projects`,
  project: (projectId: string) => `/api/projects/${projectId}`,
  projectEditors: (projectId: string) => `/api/projects/${projectId}/editors`,
  projectEditor: (projectId: string, userId: string) =>
    `/api/projects/${projectId}/editors/${userId}`,
  canvases: (projectId: string) => `/api/projects/${projectId}/canvases`,
  canvas: (canvasId: string) => `/api/canvases/${canvasId}`,
  versions: (canvasId: string) => `/api/canvases/${canvasId}/versions`,
  restore: (canvasId: string, versionId: string) =>
    `/api/canvases/${canvasId}/versions/${versionId}/restore`,
} as const;

const nameSchema = z.string().trim().min(1).max(120);

export const workspaceCreateSchema = z.object({ name: nameSchema });
export const workspaceUpdateSchema = workspaceCreateSchema;

export const workspaceInviteSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: inviteRoleSchema.default("member"),
});

export const workspaceMemberRoleUpdateSchema = z.object({
  role: inviteRoleSchema,
});

export const workspaceTransferSchema = z.object({ userId: z.string().min(1) });

export const projectCreateSchema = z.object({ name: nameSchema });
export const projectUpdateSchema = projectCreateSchema;

export const projectEditorCreateSchema = z.object({
  userId: z.string().min(1),
});

export const canvasCreateSchema = z
  .object({ name: nameSchema })
  .and(canvasIdentitySchema);

export const canvasUpdateSchema = z.object({
  name: nameSchema.optional(),
  draft: canvasDraftSchema.optional(),
});

export const saveVersionSchema = z.object({
  message: z.string().trim().max(280).optional(),
});

export const restoreVersionSchema = z.object({
  versionId: z.string().uuid(),
});

export const errorCodeSchema = z.enum([
  "BAD_REQUEST",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "VALIDATION_ERROR",
  "EMAIL_DELIVERY_FAILED",
  "INTERNAL_ERROR",
]);

export const apiErrorSchema = z.object({
  code: errorCodeSchema,
  message: z.string(),
  requestId: z.string().uuid().optional(),
  fields: z.record(z.string(), z.array(z.string())).optional(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

export const collaborationEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("sync:start"), canvasId: z.string().uuid() }),
  z.object({ type: z.literal("sync:update"), update: z.string() }),
  z.object({ type: z.literal("presence:update"), userId: z.string() }),
]);
export type CollaborationEvent = z.infer<typeof collaborationEventSchema>;
