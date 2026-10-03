import { z } from "zod";

export const roleSchema = z.enum(["owner", "editor", "viewer"]);
export type Role = z.infer<typeof roleSchema>;

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
  z.object({
    x: z.number(),
    y: z.number(),
  }),
);

export const canvasDraftSchema = z.object({
  identity: canvasIdentitySchema,
  source: z.string().optional(),
  model: z.unknown().optional(),
  layout: canvasLayoutSchema.default({}),
});
export type CanvasDraft = z.infer<typeof canvasDraftSchema>;

export type Project = {
  id: string;
  name: string;
  ownerId: string;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectMember = {
  projectId: string;
  userId: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
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

// For backend use
export const apiPaths = {
  authHandler: "/api/auth/*splat",
  authSignUpEmail: "/api/auth/sign-up/email",
  authSignInEmail: "/api/auth/sign-in/email",
  authGetSession: "/api/auth/get-session",
  authSignOut: "/api/auth/sign-out",
  projects: "/api/projects",
  project: "/api/projects/:projectId",
  members: "/api/projects/:projectId/members",
  member: "/api/projects/:projectId/members/:userId",
  canvases: "/api/projects/:projectId/canvases",
  canvas: "/api/canvases/:canvasId",
  versions: "/api/canvases/:canvasId/versions",
  restore: "/api/canvases/:canvasId/versions/:versionId/restore",
} as const;

// For frontend use
export const apiRoutes = {
  projects: "/api/projects",
  project: (projectId: string) => `/api/projects/${projectId}`,
  members: (projectId: string) => `/api/projects/${projectId}/members`,
  canvases: (projectId: string) => `/api/projects/${projectId}/canvases`,
  canvas: (canvasId: string) => `/api/canvases/${canvasId}`,
  versions: (canvasId: string) => `/api/canvases/${canvasId}/versions`,
  restore: (canvasId: string, versionId: string) =>
    `/api/canvases/${canvasId}/versions/${versionId}/restore`,
} as const;

export const projectCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
});
export const projectUpdateSchema = projectCreateSchema.partial();

export const memberInviteSchema = z.object({
  email: z.string().trim().email(),
  role: z.enum(["editor", "viewer"]),
});

export const memberRoleUpdateSchema = z.object({
  role: z.enum(["editor", "viewer"]),
});

export const canvasCreateSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
  })
  .and(canvasIdentitySchema);

export const canvasUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  draft: canvasDraftSchema.optional(),
});

export const saveVersionSchema = z.object({
  message: z.string().trim().max(280).optional(),
});

export const restoreVersionSchema = z.object({
  versionId: z.string().uuid(),
});

export const permissionActionSchema = z.enum([
  "project:read",
  "project:manage",
  "member:manage",
  "canvas:read",
  "canvas:edit",
  "version:save",
  "version:restore",
  "export:read",
]);
export type PermissionAction = z.infer<typeof permissionActionSchema>;

export const rolePermissions: Record<Role, readonly PermissionAction[]> = {
  owner: [
    "project:read",
    "project:manage",
    "member:manage",
    "canvas:read",
    "canvas:edit",
    "version:save",
    "version:restore",
    "export:read",
  ],
  editor: [
    "project:read",
    "canvas:read",
    "canvas:edit",
    "version:save",
    "export:read",
  ],
  viewer: ["project:read", "canvas:read"],
};

export function can(role: Role, action: PermissionAction) {
  return rolePermissions[role].includes(action);
}

export const errorCodeSchema = z.enum([
  "BAD_REQUEST",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "VALIDATION_ERROR",
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
