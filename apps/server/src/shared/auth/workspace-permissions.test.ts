import assert from "node:assert/strict";
import test from "node:test";
import { canEditProject, canWorkspace } from "@trace/shared";

test("workspace and project permissions stay role-scoped", () => {
  assert.equal(canWorkspace("owner", "workspace:delete"), true);
  assert.equal(canWorkspace("admin", "workspace:delete"), false);
  assert.equal(canWorkspace("admin", "project:create"), true);
  assert.equal(canWorkspace("member", "project:create"), false);
  assert.equal(canWorkspace("member", "version:restore"), false);
  assert.equal(canEditProject("admin", false), true);
  assert.equal(canEditProject("member", false), false);
  assert.equal(canEditProject("member", true), true);
});
