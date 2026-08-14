# Contributing

## Workflow

1. Open or claim a GitHub Issue.
2. Branch off `main` — see [naming](#branch-naming).
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/).
4. Run `npm run verify` before opening a PR.
5. Open a PR with `Closes #<issue>` in the description.
6. Squash merge once CI passes and review is resolved.

## Branch naming

```text
feature/123-add-auth
fix/124-token-expiration
refactor/125-auth-service
docs/126-update-readme
chore/127-update-deps
```

## Commit messages

```text
feat: ...
fix: ...
refactor: ...
test: ...
docs: ...
chore: ...
```

The PR title follows the same convention — squash merge uses it as the commit that lands on `main`, and [`release-please`](.github/workflows/release-please.yml) reads it to compute the next version.

## Local setup

```bash
npm ci
npm run check    # format:check + lint + typecheck + test
npm run fix      # autofix what check would flag
npm run verify   # check + build — run before opening a PR
```

See [`AGENTS.md`](AGENTS.md) for the full set of rules an AI agent working in this repo should follow.
