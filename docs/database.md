# Database

Trace uses PostgreSQL through Drizzle. The initial auth migration is followed by
the workspace-domain migration in `apps/server/drizzle`.

## Workspace hierarchy

- `workspace` belongs to an owner. A partial unique index permits only one
  default workspace per owner.
- `workspace_member` records `owner`, `admin`, or `member` access and is unique
  by workspace and user.
- `workspace_invite` stores an email, requested role, status, and SHA-256 token
  hash. Raw invitation tokens are sent by email and are never persisted.
- `project` belongs to a workspace.
- `project_editor` grants an ordinary workspace member edit access to one
  project. Owners and admins inherit edit access without grant rows.
- `workspace_audit` records durable workspace, membership, invitation, and
  project changes. Its workspace reference becomes null after workspace
  deletion so the deletion record survives.

Workspace deletion cascades to memberships, invitations, projects, and project
editor grants. User and workspace ownership deletion remains restricted where
silently cascading would lose ownership or invitation attribution.
