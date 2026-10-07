# Workspace architecture implementation plan

## Scope and order

Implement the workspace domain, shared API contracts, and server authorization.
Do not change `apps/web`; its current mock remains untouched. No
general-purpose authorization or notification layer is needed.

## 1. Replace the project-only schema

- Replace `project.ownerId` and `projectMember` with `workspace`,
  `workspaceMember`, `workspaceInvite`, and `projectEditor` tables in
  `apps/server/src/db/schema`.
- Add `workspaceId` to `project`; retain canvas tables only when canvas
  persistence is implemented.
- Use foreign keys and unique constraints for one default workspace per owner,
  one membership per user/workspace, one editor grant per user/project, and
  one active invite per workspace/email.
- Regenerate the initial Drizzle migration because there is no data to retain.

## 2. Establish default workspaces and invitations

- Use Better Auth's `databaseHooks.user.create.after` hook in
  `apps/server/src/modules/auth/auth.ts` to create the account's fixed-name
  default workspace and owner membership.
- Add server environment validation for `RESEND_API_KEY` and
  `RESEND_FROM_EMAIL`; add them to the root `.env.example`.
- Send invitations through Resend's HTTP API with Node's built-in `fetch` after
  persisting a pending invite. Store only a SHA-256 hash of the random token;
  link acceptance must match the authenticated user's email to the invited
  email.
- Repeating an invite to the same pending email rotates and resends the token;
  accepted, revoked, and deleted-workspace invites cannot grant access.

## 3. Share contracts and routes before handlers

- Replace project membership types and schemas in
  `packages/shared/src/contracts.ts` with workspace roles, invite payloads,
  project-editor payloads, and workspace/project response types.
- Add all paths to `apiPaths` and their client builders to `apiRoutes`:
  workspaces, workspace members, invitations, leave/transfer/delete actions,
  workspace-scoped projects, and project editor grants.
- Keep every server route registered with `apiPaths`; keep all web requests on
  `apiRoutes`. Do not hardcode duplicate path strings.

## 4. Implement the smallest authorization surface

- Replace `requireProjectRole` with a workspace resolver that loads membership
  from the project or workspace route parameter and exposes the membership in
  `response.locals`.
- Centralize permission checks in the workspace feature: any member reads,
  owner/admin edit and manage, and a member edits only with a project-editor 
  row. Owners and admins restore versions.
- Implement workspace, member, invitation, project, and editor-grant services
  under `apps/server/src/modules/workspaces`; use transactions for dependent
  writes and return `404` for inaccessible resources where applicable.
- Register the feature in `app.ts`; remove the project-member routes and
  service instead of supporting two permission systems.

## 5. Document and test the server contract

- Update `apps/server/src/modules/docs/openapi.ts` with workspace and invite
  tags, paths, schemas, and role-specific responses; verify `/api/openapi.json`
  and `/api/docs`.
- Add the smallest available server checks for workspace authorization,
  invitation acceptance, editor grants, default-workspace restrictions,
  ownership transfer, and destructive deletion. The repository has no test
  runner today, so add one only if a focused built-in or already-installed
  option cannot exercise these authorization paths.

## Verification and delivery

Run focused package checks after each phase. Before the implementation commit,
run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, and `pnpm build`; do
not commit until the existing `auth.handler` type error is fixed or otherwise
resolved. Verify both OpenAPI endpoints manually after the server routes are
in place.
