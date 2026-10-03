# Contributing to Trace

## Before starting

```bash
git switch main
git pull --rebase origin main
git switch -c feat/short-description
```

Use one short-lived branch per feature or fix. Keep `main` stable.

## While working

- Keep commits small and focused.
- Reuse `@trace/shared` contracts instead of redefining API shapes.
- Keep backend features under `apps/server/src/modules`.
- Keep frontend features under `apps/web/src/modules`.
- Never commit `.env`, secrets, build output, or database dumps.
- Before deleting, renaming, or changing a shared export, file, dependency, route, schema, or contract, search all references and check with collaborators when another branch may use it.
- Preserve compatibility by default. Get approval before making a breaking removal or rename.
- Treat audit findings as suggestions; do not apply cleanup automatically when it may affect another contributor.

## Required checks before every commit

Run these from the repository root:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
```

Fix every failure before committing. For a focused change, also run the relevant package check:

```bash
pnpm --filter @trace/web typecheck
pnpm --filter @trace/server typecheck
pnpm --filter @trace/shared typecheck
```

## Commits

Use a short imperative message:

```bash
git add .
git commit -m "add project contracts"
```

## Pull requests

Push the branch and open a Pull Request:

```bash
git push -u origin feat/short-description
```

The PR should explain what changed, how it was tested, and any follow-up work. Merge only after the required checks pass and the code has been reviewed.

After merging, update and clean up locally:

```bash
git switch main
git pull --rebase origin main
git branch -d feat/short-description
```
