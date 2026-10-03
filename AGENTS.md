# Trace

## Stack

- pnpm + Turborepo monorepo
- TypeScript, React, Express
- PostgreSQL + Drizzle
- Yjs for collaboration
- Better Auth for authentication

## Working rules

- Read only the docs relevant to the task.
- Reuse existing code before adding abstractions or dependencies.
- Keep canvases independent.
- Validate authorization on the server; the client is not a security boundary.
- Draft edits do not create history versions.
- Explicit Save creates one immutable version.
- Editors and viewers can read version history; only owners can restore a version.
- Run the smallest relevant pnpm check after changes.

## Commit checklist

Before every commit, run the full repository checks from the root:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
```

Do not commit while any check is failing. For focused changes, run the relevant package check as well. Never commit `.env`, secrets, build output, or database dumps. Follow `CONTRIBUTION.md` for branch, commit, and pull request workflow.

## Monorepo conventions

- Keep product apps under `apps/*` and reusable code under `packages/*`.
- Put runtime dependencies in the package that imports them; keep root dependencies for repo tooling only.
- Use workspace package names such as `@trace/shared`; do not import across apps directly.
- Put shared API types, Zod schemas, and contracts in `packages/shared`.
- Use `pnpm --filter <package> <command>` for focused work and `pnpm <command>` for repo-wide Turbo tasks.
- Keep package scripts consistent: `dev`, `build`, and `typecheck` where applicable.
- Let Turbo cache build and typecheck tasks; keep long-running `dev` tasks uncached.
- Add a package only when it owns a real boundary; do not create empty packages for future use.

## Module structure

- Organize server code by feature under `apps/server/src/modules/<feature>`.
- Keep `app.ts` for Express composition and `index.ts` for process startup/shutdown.
- Keep cross-cutting code in `config`, `db`, `shared/errors`, and `shared/logger`.
- Keep feature validation, routes, and services close to the feature that owns them.
- Do not add controller/repository/factory layers unless the feature has enough behavior to justify them.
- Mirror the approach in `apps/web/src/modules` and `apps/web/src/shared`.

## Project context

- Product behavior: `docs/trace.md`
- Database details will be added in `docs/database.md` when implementation begins.
- Coding simplification rules: `skills/ponytail/SKILL.md`
- Backend rules: `skills/backend-engineering/SKILL.md`
- Database rules: `skills/database/SKILL.md`
- Security rules: `skills/security/SKILL.md`
- Testing rules: `skills/testing/SKILL.md`
- Operations rules: `skills/operations/SKILL.md`
- Knowledge graph rules: `skills/graphify/SKILL.md`
- Architecture decision rules: `skills/architecture-decisions/SKILL.md`
- Swagger rules: `skills/swagger/SKILL.md`
- OpenAPI rules: `skills/openapi-docs/SKILL.md`
- Git hook rules: `skills/husky/SKILL.md`

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
