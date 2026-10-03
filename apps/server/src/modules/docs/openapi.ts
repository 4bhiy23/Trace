import { apiPaths, roleSchema } from "@trace/shared";
import { env } from "../../config/env";

const openApiPath = (path: string) => path.replace(/:([^/]+)/g, "{$1}");

const errorResponse = {
  description: "Error",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ApiError" },
    },
  },
};

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Trace API",
    version: "0.1.0",
    description: "API for Trace collaborative engineering workspaces.",
  },
  servers: [{ url: env.BETTER_AUTH_URL }],
  tags: [
    { name: "Operations" },
    { name: "Authentication" },
    { name: "Projects" },
    { name: "Members" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Operations"],
        summary: "Check API and database health",
        responses: {
          "200": {
            description: "API and database are healthy",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
              },
            },
          },
          "503": {
            description: "A required dependency is unavailable",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
              },
            },
          },
        },
      },
    },
    [apiPaths.authSignUpEmail]: {
      post: {
        tags: ["Authentication"],
        summary: "Create an account with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignUpEmail" },
            },
          },
        },
        responses: {
          "200": {
            description: "Account created and session started",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResult" },
              },
            },
          },
          "400": errorResponse,
        },
      },
    },
    [apiPaths.authSignInEmail]: {
      post: {
        tags: ["Authentication"],
        summary: "Sign in with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignInEmail" },
            },
          },
        },
        responses: {
          "200": {
            description: "Signed in and session cookie set",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResult" },
              },
            },
          },
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
          "200": {
            description: "Current session or null",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResult" },
              },
            },
          },
        },
      },
    },
    [apiPaths.authSignOut]: {
      post: {
        tags: ["Authentication"],
        summary: "Sign out the current session",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": { description: "Signed out" },
          "401": errorResponse,
        },
      },
    },
    [apiPaths.projects]: {
      get: {
        tags: ["Projects"],
        summary: "List projects visible to the current user",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Projects",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Project" },
                },
              },
            },
          },
          "401": errorResponse,
        },
      },
      post: {
        tags: ["Projects"],
        summary: "Create a project",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProjectCreate" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created project",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Project" },
              },
            },
          },
          "400": errorResponse,
          "401": errorResponse,
        },
      },
    },
    [openApiPath(apiPaths.project)]: {
      parameters: [{ $ref: "#/components/parameters/ProjectId" }],
      get: {
        tags: ["Projects"],
        summary: "Get a project",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Project",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Project" },
              },
            },
          },
          "401": errorResponse,
          "403": errorResponse,
          "404": errorResponse,
        },
      },
      patch: {
        tags: ["Projects"],
        summary: "Rename a project",
        description: "Owner only.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProjectUpdate" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated project",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Project" },
              },
            },
          },
          "400": errorResponse,
          "401": errorResponse,
          "403": errorResponse,
        },
      },
      delete: {
        tags: ["Projects"],
        summary: "Archive a project",
        description: "Owner only.",
        security: [{ cookieAuth: [] }],
        responses: {
          "204": { description: "Project archived" },
          "401": errorResponse,
          "403": errorResponse,
          "404": errorResponse,
        },
      },
    },
    [openApiPath(apiPaths.members)]: {
      parameters: [{ $ref: "#/components/parameters/ProjectId" }],
      get: {
        tags: ["Members"],
        summary: "List project members",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Members",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ProjectMember" },
                },
              },
            },
          },
          "401": errorResponse,
          "403": errorResponse,
        },
      },
      post: {
        tags: ["Members"],
        summary: "Add an existing user to a project",
        description: "Owner only.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MemberInvite" },
            },
          },
        },
        responses: {
          "201": {
            description: "Member added",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProjectMember" },
              },
            },
          },
          "400": errorResponse,
          "401": errorResponse,
          "403": errorResponse,
          "404": errorResponse,
        },
      },
    },
    [openApiPath(apiPaths.member)]: {
      parameters: [
        { $ref: "#/components/parameters/ProjectId" },
        { $ref: "#/components/parameters/UserId" },
      ],
      patch: {
        tags: ["Members"],
        summary: "Change a member role",
        description: "Owner only.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MemberRoleUpdate" },
            },
          },
        },
        responses: {
          "200": {
            description: "Member updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProjectMember" },
              },
            },
          },
          "400": errorResponse,
          "401": errorResponse,
          "403": errorResponse,
          "404": errorResponse,
        },
      },
      delete: {
        tags: ["Members"],
        summary: "Remove a project member",
        description: "Owner only.",
        security: [{ cookieAuth: [] }],
        responses: {
          "204": { description: "Member removed" },
          "400": errorResponse,
          "401": errorResponse,
          "403": errorResponse,
          "404": errorResponse,
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
      ProjectId: {
        name: "projectId",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
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
          requestId: { type: "string", format: "uuid" },
          fields: {
            type: "object",
            additionalProperties: { type: "array", items: { type: "string" } },
          },
        },
      },
      HealthResponse: {
        type: "object",
        required: [
          "status",
          "service",
          "timestamp",
          "uptimeSeconds",
          "environment",
          "checks",
        ],
        properties: {
          status: { type: "string", enum: ["ok", "degraded"] },
          service: { type: "string", example: "trace-api" },
          timestamp: { type: "string", format: "date-time" },
          uptimeSeconds: { type: "integer", minimum: 0 },
          environment: {
            type: "string",
            enum: ["development", "test", "production"],
          },
          checks: {
            type: "object",
            required: ["database"],
            properties: {
              database: { type: "string", enum: ["ok", "error"] },
            },
          },
        },
      },
      Project: {
        type: "object",
        required: ["id", "name", "ownerId", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          ownerId: { type: "string" },
          archivedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProjectMember: {
        type: "object",
        required: ["userId", "name", "email", "role"],
        properties: {
          userId: { type: "string" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: roleSchema.options },
        },
      },
      ProjectCreate: {
        type: "object",
        required: ["name"],
        properties: { name: { type: "string", minLength: 1, maxLength: 120 } },
      },
      ProjectUpdate: {
        type: "object",
        properties: { name: { type: "string", minLength: 1, maxLength: 120 } },
      },
      MemberInvite: {
        type: "object",
        required: ["email", "role"],
        properties: {
          email: { type: "string", format: "email" },
          role: {
            type: "string",
            enum: roleSchema.options.filter((role) => role !== "owner"),
          },
        },
      },
      MemberRoleUpdate: {
        type: "object",
        required: ["role"],
        properties: {
          role: {
            type: "string",
            enum: roleSchema.options.filter((role) => role !== "owner"),
          },
        },
      },
    },
  },
} as const;
