# Development Instructions

## Commands

- Install: `npm ci`
- Check: `npm run check`
- Fix: `npm run fix`
- Build: `npm run build`
- Verify: `npm run verify`

## Git

- Work only in the current worktree.
- Never work directly on `main`.
- Inspect `git status` before making changes — including before reset, checkout, clean, or stash.
- Use Conventional Commits.

## GitHub

- Every task should correspond to a GitHub Issue.
- Reference the Issue in the PR (`Closes #123`).
- Do not merge PRs unless explicitly requested.

## Dependencies

- Never hand-edit the lockfile — update it only through package-manager commands.
- Commit lockfile changes alongside the `package.json` change that caused them.

## Testing

- Run `verify` before opening a PR.
- Every bug fix adds a regression test; every new feature adds tests.
- Do not weaken or delete a test to make it pass.

## Code

- Follow existing project architecture — see `docs/architecture/overview.md`.
- Don't modify unrelated files.

## Safety

- Never delete files unless the task requires it.
- Never read, modify, or commit secrets or `.env` files.
- Never disable a test or lint rule to make CI pass.
- Never `--force` push or rewrite history on a shared branch.
- Never modify CI or security configuration unless the task requires it.
- Ask before merging PRs, deleting branches, or making unrelated refactors.
