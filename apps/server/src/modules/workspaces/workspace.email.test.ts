import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL ??= "postgres://trace:trace@localhost:55432/trace";
process.env.BETTER_AUTH_SECRET ??= "test-secret-that-is-at-least-32-characters";
process.env.BETTER_AUTH_URL ??= "http://localhost:4000";
process.env.WEB_URL ??= "http://localhost:3000";

test("workspace invitations require email configuration", async () => {
  const { env } = await import("../../config/env");
  const { assertEmailConfigured } = await import("./workspace.email");
  const apiKey = env.RESEND_API_KEY;
  const fromEmail = env.RESEND_FROM_EMAIL;

  try {
    env.RESEND_API_KEY = undefined;
    env.RESEND_FROM_EMAIL = undefined;
    assert.throws(assertEmailConfigured, { status: 503 });
  } finally {
    env.RESEND_API_KEY = apiKey;
    env.RESEND_FROM_EMAIL = fromEmail;
  }
});

test("workspace invitations time out and map delivery failures", async () => {
  const { sendWorkspaceInvite } = await import("./workspace.email");
  const originalFetch = globalThis.fetch;
  let hasTimeoutSignal = false;

  globalThis.fetch = async (_input, init) => {
    hasTimeoutSignal = init?.signal !== undefined;
    throw new Error("network error");
  };

  try {
    await assert.rejects(
      sendWorkspaceInvite("member@example.com", "Workspace", "token"),
      { status: 502, code: "EMAIL_DELIVERY_FAILED" },
    );
    assert.equal(hasTimeoutSignal, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
