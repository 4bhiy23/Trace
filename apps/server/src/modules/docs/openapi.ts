import {
  apiPaths,
  inviteRoleSchema,
  inviteStatusSchema,
  workspaceRoleSchema,
} from "@trace/shared";
import { env } from "../../config/env";

const openApiPath = (path: string) => path.replace(/:([^/]+)/g, "{$1}");
/**
 * Builds an OpenAPI reference to a named component schema.
 */
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const errorResponse = {
  description: "Error",
  content: { "application/json": { schema: ref("ApiError") } },
};
const securedErrors = {
  "400": errorResponse,
  "401": errorResponse,
  "403": errorResponse,
  "404": errorResponse,
  "409": errorResponse,
};
/**
 * Describes a required JSON request body using a named component schema.
 */
const jsonBody = (schema: string) => ({
  required: true,
  content: { "application/json": { schema: ref(schema) } },
});
/**
 * Describes a JSON response using a named component schema.
 */
const jsonResponse = (description: string, schema: string) => ({
  description,
  content: { "application/json": { schema: ref(schema) } },
});
/**
 * Describes a JSON array response whose items use a named component schema.
 */
const arrayResponse = (description: string, schema: string) => ({
  description,
  content: {
    "application/json": {
      schema: { type: "array", items: ref(schema) },
    },
  },
});

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Trace API",
    version: "0.2.0",
    description: "API for Trace collaborative engineering workspaces.",
  },
  servers: [{ url: env.BETTER_AUTH_URL }],
  tags: [
    { name: "Operations" },
    { name: "Authentication" },
    { name: "Workspaces" },
    { name: "Members" },
    { name: "Invitations" },
    { name: "Projects" },
  ],
  paths: {
    [apiPaths.health]: {
      get: {
        tags: ["Operations"],
        summary: "Check API and database health",
        responses: {
          "200": jsonResponse("API and database are healthy", "HealthResponse"),
          "503": jsonResponse("A dependency is unavailable", "HealthResponse"),
        },
      },
    },
    [apiPaths.authSignUpEmail]: {
      post: {
        tags: ["Authentication"],
        summary: "Create an account and its default workspace",
        requestBody: jsonBody("SignUpEmail"),
        responses: {
          "200": jsonResponse("Account created", "AuthResult"),
          "400": errorResponse,
        },
      },
    },
    [apiPaths.authSignInEmail]: {
      post: {
        tags: ["Authentication"],
        summary: "Sign in with email and password",
        requestBody: jsonBody("SignInEmail"),
        responses: {
          "200": jsonResponse("Signed in", "AuthResult"),
          "400": errorResponse,
          "401": errorResponse,
        },
      },
    },
    [apiPaths.authGetSession]: {
      get: {
        tags: ["Authentication"],
        summary: "Get the current session",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": jsonResponse("Current session or null", "AuthResult"),
        },
      },
    },
    [apiPaths.authSignOut]: {
      post: {
        tags: ["Authentication"],
        summary: "Sign out",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": { description: "Signed out" },
          "401": errorResponse,
        },
      },
    },
    [apiPaths.workspaces]: {
      get: {
        tags: ["Workspaces"],
        summary: "List the current user's workspaces",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": arrayResponse("Workspaces", "Workspace"),
          "401": errorResponse,
        },
      },
      post: {
        tags: ["Workspaces"],
        summary: "Create a non-default workspace",
        security: [{ cookieAuth: [] }],
        requestBody: jsonBody("WorkspaceCreate"),
        responses: {
          "201": jsonResponse("Workspace created", "Workspace"),
          "400": errorResponse,
          "401": errorResponse,
        },
      },
    },
    [openApiPath(apiPaths.workspace)]: {
      parameters: [{ $ref: "#/components/parameters/WorkspaceId" }],
      get: {
        tags: ["Workspaces"],
        summary: "Get a workspace",
        description: "Available to every workspace member.",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": jsonResponse("Workspace", "Workspace"),
          ...securedErrors,
        },
      },
      patch: {
        tags: ["Workspaces"],
        summary: "Rename a non-default workspace",
        description: "Owner or admin. Default workspaces cannot be renamed.",
        security: [{ cookieAuth: [] }],
        requestBody: jsonBody("WorkspaceCreate"),
        responses: {
          "200": jsonResponse("Workspace updated", "Workspace"),
          ...securedErrors,
        },
      },
      delete: {
        tags: ["Workspaces"],
        summary: "Permanently delete a non-default workspace",
        description: "Owner only. Cascades to projects and related data.",
        security: [{ cookieAuth: [] }],
        responses: {
          "204": { description: "Workspace deleted" },
          ...securedErrors,
        },
      },
    },
    [openApiPath(apiPaths.workspaceMembers)]: {
      parameters: [{ $ref: "#/components/parameters/WorkspaceId" }],
      get: {
        tags: ["Members"],
        summary: "List workspace members",
        description: "Available to every workspace member.",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": arrayResponse("Members", "WorkspaceMember"),
          ...securedErrors,
        },
      },
    },
    [openApiPath(apiPaths.workspaceMember)]: {
      parameters: [
        { $ref: "#/components/parameters/WorkspaceId" },
        { $ref: "#/components/parameters/UserId" },
      ],
      patch: {
        tags: ["Members"],
        summary: "Promote or demote a member",
        description: "Owner only.",
        security: [{ cookieAuth: [] }],
        requestBody: jsonBody("WorkspaceMemberRoleUpdate"),
        responses: {
          "200": jsonResponse("Member updated", "WorkspaceMember"),
          ...securedErrors,
        },
      },
      delete: {
        tags: ["Members"],
        summary: "Remove a workspace member",
        description: "Owner or admin. Only the owner can remove an admin.",
        security: [{ cookieAuth: [] }],
        responses: {
          "204": { description: "Member removed" },
          ...securedErrors,
        },
      },
    },
    [openApiPath(apiPaths.workspaceInvites)]: {
      parameters: [{ $ref: "#/components/parameters/WorkspaceId" }],
      get: {
        tags: ["Invitations"],
        summary: "List workspace invitations",
        description: "Owner or admin.",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": arrayResponse("Invitations", "WorkspaceInvite"),
          ...securedErrors,
        },
      },
      post: {
        tags: ["Invitations"],
        summary: "Invite a workspace member by email",
        description: "Owner or admin. Only the owner can invite an admin.",
        security: [{ cookieAuth: [] }],
        requestBody: jsonBody("WorkspaceInviteCreate"),
        responses: {
          "201": jsonResponse("Invitation created", "WorkspaceInvite"),
          "502": errorResponse,
          "503": errorResponse,
          ...securedErrors,
        },
      },
    },
    [openApiPath(apiPaths.workspaceInvite)]: {
      parameters: [
        { $ref: "#/components/parameters/WorkspaceId" },
        { $ref: "#/components/parameters/InviteId" },
      ],
      delete: {
        tags: ["Invitations"],
        summary: "Revoke a pending invitation",
        description:
          "Owner or admin. Only the owner can revoke an admin invite.",
        security: [{ cookieAuth: [] }],
        responses: {
          "204": { description: "Invitation revoked" },
          ...securedErrors,
        },
      },
    },
    [openApiPath(apiPaths.workspaceLeave)]: {
      parameters: [{ $ref: "#/components/parameters/WorkspaceId" }],
      post: {
        tags: ["Members"],
        summary: "Leave a workspace",
        description:
          "Members and admins may leave. Owners must transfer first.",
        security: [{ cookieAuth: [] }],
        responses: {
          "204": { description: "Workspace left" },
          ...securedErrors,
        },
      },
    },
    [openApiPath(apiPaths.workspaceTransfer)]: {
      parameters: [{ $ref: "#/components/parameters/WorkspaceId" }],
      post: {
        tags: ["Workspaces"],
        summary: "Transfer ownership",
        description: "Owner only. Default workspace ownership cannot transfer.",
        security: [{ cookieAuth: [] }],
        requestBody: jsonBody("WorkspaceTransfer"),
        responses: {
          "204": { description: "Ownership transferred" },
          ...securedErrors,
        },
      },
    },
    [openApiPath(apiPaths.inviteAccept)]: {
      parameters: [{ $ref: "#/components/parameters/InviteToken" }],
      post: {
        tags: ["Invitations"],
        summary: "Accept a workspace invitation",
        description: "The signed-in email must match the invitation.",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": jsonResponse("Invitation accepted", "WorkspaceInvite"),
          ...securedErrors,
        },
      },
    },
    [openApiPath(apiPaths.workspaceProjects)]: {
      parameters: [{ $ref: "#/components/parameters/WorkspaceId" }],
      get: {
        tags: ["Projects"],
        summary: "List all projects in a workspace",
        description: "Available to every workspace member.",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": arrayResponse("Projects", "Project"),
          ...securedErrors,
        },
      },
      post: {
        tags: ["Projects"],
        summary: "Create a project",
        description: "Owner or admin.",
        security: [{ cookieAuth: [] }],
        requestBody: jsonBody("ProjectCreate"),
        responses: {
          "201": jsonResponse("Project created", "Project"),
          ...securedErrors,
        },
      },
    },
    [openApiPath(apiPaths.project)]: {
      parameters: [{ $ref: "#/components/parameters/ProjectId" }],
      get: {
        tags: ["Projects"],
        summary: "Get a project",
        description: "Available to every member of its workspace.",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": jsonResponse("Project", "Project"),
          ...securedErrors,
        },
      },
      patch: {
        tags: ["Projects"],
        summary: "Rename a project",
        description: "Workspace owner or admin.",
        security: [{ cookieAuth: [] }],
        requestBody: jsonBody("ProjectCreate"),
        responses: {
          "200": jsonResponse("Project updated", "Project"),
          ...securedErrors,
        },
      },
      delete: {
        tags: ["Projects"],
        summary: "Archive a project",
        description: "Workspace owner or admin.",
        security: [{ cookieAuth: [] }],
        responses: {
          "204": { description: "Project archived" },
          ...securedErrors,
        },
      },
    },
    [openApiPath(apiPaths.projectEditors)]: {
      parameters: [{ $ref: "#/components/parameters/ProjectId" }],
      get: {
        tags: ["Projects"],
        summary: "List project editors",
        description:
          "Workspace owner or admin. Includes inherited admin access and explicit member grants; excludes the workspace owner.",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": arrayResponse("Project editors", "ProjectEditor"),
          ...securedErrors,
        },
      },
      post: {
        tags: ["Projects"],
        summary: "Grant project editor access",
        description: "Workspace owner or admin. The target must be a member.",
        security: [{ cookieAuth: [] }],
        requestBody: jsonBody("ProjectEditorCreate"),
        responses: {
          "201": jsonResponse("Editor granted", "ProjectEditor"),
          ...securedErrors,
        },
      },
    },
    [openApiPath(apiPaths.projectEditor)]: {
      parameters: [
        { $ref: "#/components/parameters/ProjectId" },
        { $ref: "#/components/parameters/UserId" },
      ],
      delete: {
        tags: ["Projects"],
        summary: "Revoke project editor access",
        description: "Workspace owner or admin.",
        security: [{ cookieAuth: [] }],
        responses: {
          "204": { description: "Editor revoked" },
          ...securedErrors,
        },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "better-auth.session_token",
      },
    },
    parameters: {
      WorkspaceId: {
        name: "workspaceId",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      ProjectId: {
        name: "projectId",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      InviteId: {
        name: "inviteId",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      InviteToken: {
        name: "token",
        in: "path",
        required: true,
        schema: { type: "string", minLength: 32 },
      },
      UserId: {
        name: "userId",
        in: "path",
        required: true,
        schema: { type: "string" },
      },
    },
    schemas: {
      SignUpEmail: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 1 },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
        },
      },
      SignInEmail: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
        },
      },
      AuthResult: {
        type: "object",
        nullable: true,
        additionalProperties: true,
      },
      ApiError: {
        type: "object",
        required: ["code", "message"],
        properties: {
          code: { type: "string" },
          message: { type: "string" },
          fields: {
            type: "object",
            additionalProperties: { type: "array", items: { type: "string" } },
          },
        },
      },
      HealthResponse: {
        type: "object",
        required: ["status", "service", "timestamp", "checks"],
        properties: {
          status: { type: "string", enum: ["ok", "degraded"] },
          service: { type: "string" },
          timestamp: { type: "string", format: "date-time" },
          uptimeSeconds: { type: "integer", minimum: 0 },
          environment: { type: "string" },
          checks: { type: "object", additionalProperties: true },
        },
      },
      Workspace: {
        type: "object",
        required: [
          "id",
          "name",
          "ownerId",
          "isDefault",
          "role",
          "createdAt",
          "updatedAt",
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          ownerId: { type: "string" },
          isDefault: { type: "boolean" },
          role: { type: "string", enum: workspaceRoleSchema.options },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      WorkspaceCreate: {
        type: "object",
        required: ["name"],
        properties: { name: { type: "string", minLength: 1, maxLength: 120 } },
      },
      WorkspaceMember: {
        type: "object",
        required: [
          "workspaceId",
          "userId",
          "name",
          "email",
          "role",
          "createdAt",
        ],
        properties: {
          workspaceId: { type: "string", format: "uuid" },
          userId: { type: "string" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: workspaceRoleSchema.options },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      WorkspaceMemberRoleUpdate: {
        type: "object",
        required: ["role"],
        properties: {
          role: { type: "string", enum: inviteRoleSchema.options },
        },
      },
      WorkspaceInviteCreate: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email" },
          role: {
            type: "string",
            enum: inviteRoleSchema.options,
            default: "member",
          },
        },
      },
      WorkspaceInvite: {
        type: "object",
        required: [
          "id",
          "workspaceId",
          "email",
          "role",
          "status",
          "invitedBy",
          "createdAt",
          "updatedAt",
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          workspaceId: { type: "string", format: "uuid" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: inviteRoleSchema.options },
          status: { type: "string", enum: inviteStatusSchema.options },
          invitedBy: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      WorkspaceTransfer: {
        type: "object",
        required: ["userId"],
        properties: { userId: { type: "string" } },
      },
      Project: {
        type: "object",
        required: [
          "id",
          "workspaceId",
          "name",
          "access",
          "createdAt",
          "updatedAt",
        ],
        properties: {
          id: { type: "string", format: "uuid" },
          workspaceId: { type: "string", format: "uuid" },
          name: { type: "string" },
          access: { type: "string", enum: ["editor", "viewer"] },
          archivedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProjectCreate: {
        type: "object",
        required: ["name"],
        properties: { name: { type: "string", minLength: 1, maxLength: 120 } },
      },
      ProjectEditorCreate: {
        type: "object",
        required: ["userId"],
        properties: { userId: { type: "string" } },
      },
      ProjectEditor: {
        type: "object",
        required: ["projectId", "userId", "name", "email", "createdAt"],
        properties: {
          projectId: { type: "string", format: "uuid" },
          userId: { type: "string" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
} as const;
