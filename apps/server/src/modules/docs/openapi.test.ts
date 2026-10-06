import assert from "node:assert/strict";
import test from "node:test";
import { apiPaths } from "@trace/shared";

process.env.RESEND_API_KEY ??= "test-key";
process.env.RESEND_FROM_EMAIL ??= "noreply@example.com";
process.env.DATABASE_URL ??= "postgres://trace:trace@localhost:55432/trace";
process.env.BETTER_AUTH_SECRET ??= "test-secret-that-is-at-least-32-characters";
process.env.BETTER_AUTH_URL ??= "http://localhost:4000";
process.env.WEB_URL ??= "http://localhost:3000";

test("OpenAPI documents every workspace and project route", async () => {
  const { openApiDocument } = await import("./openapi");
  const documentedPaths = openApiDocument.paths as Record<string, unknown>;
  const paths = [
    apiPaths.workspaces,
    apiPaths.workspace,
    apiPaths.workspaceMembers,
    apiPaths.workspaceMember,
    apiPaths.workspaceInvites,
    apiPaths.workspaceInvite,
    apiPaths.workspaceLeave,
    apiPaths.workspaceTransfer,
    apiPaths.inviteAccept,
    apiPaths.workspaceProjects,
    apiPaths.project,
    apiPaths.projectEditors,
    apiPaths.projectEditor,
  ];

  for (const path of paths) {
    const openApiPath = path.replace(/:([^/]+)/g, "{$1}");
    assert.ok(documentedPaths[openApiPath], `${openApiPath} is undocumented`);
  }
});
