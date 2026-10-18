# Workspace architecture

## Goal

Trace organizes work as user, workspace, project, then canvas. Every account
has one non-deletable, non-transferable default workspace named from the
account at creation. Users may create additional workspaces.

All workspace members can view every project and canvas in that workspace.
There is no per-project visibility setting. Edit access is granted only to
selected projects for ordinary members.

## Data model

- `workspace`: `id`, `name`, `ownerId`, `isDefault`, and timestamps.
- `workspaceMember`: `workspaceId`, `userId`, and `owner`, `admin`, or
  `member` role.
- `workspaceInvite`: workspace, email, invited role, token, and pending,
  accepted, or revoked state. Invitations do not expire.
- `project`: belongs to one workspace. Projects have no separate owner.
- `projectEditor`: a `(projectId, userId)` grant for members allowed to edit
  that project.
- `canvas`: remains under a project.

The workspace owner and admins inherit editor access to every project, so they
do not need `projectEditor` rows.

## Authorization

| Actor  | Read         | Edit/save             | Workspace management                             | Restore versions |
| ------ | ------------ | --------------------- | ------------------------------------------------ | ---------------- |
| Owner  | All projects | All projects          | Full control                                     | Yes              |
| Admin  | All projects | All projects          | Invite/remove members and manage project editors | Yes              |
| Member | All projects | Granted projects only | No                                               | No               |

Only the owner can promote or demote admins, transfer a non-default workspace,
or permanently delete a non-default workspace. Admins cannot change ownership
or administrator status.

Only owners and admins can create projects. They can grant or revoke a
member's project-editor access. A member or admin can leave a workspace. An
owner must transfer a non-default workspace before leaving and cannot leave the
default workspace.

## Invitations

Owners and admins invite users by email. An invitation sends an email and
creates no access until it is accepted. It remains valid until accepted,
revoked, or its workspace is deleted.

## Deletion

The default workspace cannot be deleted or renamed. A non-default workspace
may be permanently deleted only by its owner. Deletion cascades to its
projects, canvases, drafts, and version history.

## API and migration

Shared contracts will define workspace, membership, invitation, and
project-editor payloads and route builders. Project routes become
workspace-scoped. Server authorization resolves workspace membership and
project-editor grants; client state is never trusted for access control.

There is no production data to preserve. The existing project-only schema and
initial migration may be replaced rather than migrated. OpenAPI and the docs
endpoint must cover the new routes and be verified after implementation.

## Verification

Test server authorization for all role/action combinations, invitation
acceptance and revocation, inherited admin access, member editor grants,
default-workspace restrictions, owner-only destructive actions, and cascade
deletion. Run focused package checks while implementing and all repository
checks before committing implementation work.
