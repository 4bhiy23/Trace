# Trace

Trace is a collaborative workspace for technical documentation and engineering diagrams.

## Organization

Each account receives a fixed-name default workspace that cannot be renamed,
deleted, or transferred. Users may own or join additional workspaces. Projects
belong to workspaces, and canvases belong to projects.

Every workspace member can view every project. Workspace owners and admins can
edit every project; ordinary members can edit only projects where they have an
explicit editor grant.

Owners and admins create projects, manage members, and restore canvas versions.
Only owners can manage admins, transfer a non-default workspace, or permanently
delete a non-default workspace.

## Initial scope

The first canvas type is Markdown. The application is a pnpm + Turborepo monorepo using TypeScript, React, Express, PostgreSQL, Drizzle, Yjs, and Better Auth.

## Canvas state

Each canvas has a current draft state. User edits and collaboration updates change that draft state:

- Markdown content changes update the document state.
- Collaboration uses Yjs to synchronize authorized clients.
- Draft persistence may happen automatically or as part of collaboration recovery.
- Draft persistence does not create a permanent history version.

## Version history

An immutable version is created only when a user explicitly clicks Save or uses the equivalent keyboard shortcut.

Each version records the canvas snapshot, author, timestamp, version number, and optional save message. Normal typing, cursor movement, collaboration updates, and other draft changes do not create versions.

## Version permissions

- Workspace owners and admins can view history, save versions, and restore an
  older version.
- Editors can view history, edit the current draft, and create versions with Save. Editors cannot restore history.
- Viewers can view the current canvas and version history but cannot edit, save, or restore.

## Restore behavior

Only the workspace owner or an admin can restore an older version. Restore must
be authorized by the server, apply the selected snapshot as the current canvas
state, synchronize the change through Yjs, and preserve the old version
unchanged.

Restoring creates a new auditable version linked to the version that was restored. History is append-only; existing versions are never overwritten.
