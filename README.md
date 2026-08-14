<div align="center">

<img src="docs/assets/ai-agent-example.svg" alt="Simple flat-style illustration of a robot, representing an AI coding agent" width="140" />

# TypeScript Repo Template

Reusable, AI-agent-ready repo scaffold — Claude Code config, CI, release automation, and conventions wired up from day one.

</div>

## Setup checklist

Tick these off in order. Details for each are in the matching section below.

**Do first — nothing else works well without these**

- [ ] `gh` CLI installed and authenticated — needed to script the GitHub-side steps below
- [ ] [Canonical `check` / `fix` / `verify` commands](#canonical-commands)
- [ ] [`AGENTS.md`](#agentsmd) at repo root — Commands + Safety sections — nest more in subfolders as they need their own rules
- [ ] [`.gitignore`](#gitignore) — block `node_modules/`, `dist/`, `.env`
- [ ] `LICENSE` — declare terms explicitly, even if "all rights reserved"
- [ ] [CI workflow](#github-actions-ci) — install → check → build
- [ ] [Branch protection on `main`](#repository-settings) — require PR + passing CI, block force-push
- [ ] [Secret scanning + push protection](#repository-settings) enabled (Settings → Code security)

**Do next — makes the agent noticeably better, not just safer**

- [ ] [`docs/`](#docs) — `api/`, `architecture/`, `guides/`
- [ ] [`.claude/`](#claude-directory) — committed project-level Claude Code config (`commands/`, `agents/`, `skills/`, `rules/`, `settings.json`)
- [ ] [Git hooks](#git-hooks) (Husky + `lint-staged`) enforcing Conventional Commits
- [ ] [`release-please`](#release-please) — turns those commits into `CHANGELOG.md` + version bumps
- [ ] [`.editorconfig`](#editorconfig)
- [ ] [Issue templates](#issue-templates) (YAML forms)
- [ ] [Pull request template](#pull-request-template)
- [ ] [PR title lint](#pr-title) — enforces Conventional Commits on the commit that actually lands on `main`
- [ ] [AI PR review](#ai-pr-review) — auto inline + summary comments on every PR
- [ ] [Labels](#labels) (`bug`/`feature`/`refactor`/`docs`/`chore`)
- [ ] [Dependabot](#dependabot) + [Code scanning](#code-scanning) (Dependency Review)
- [ ] [`.npmrc`](#npmrc) (`engine-strict`, `save-exact`)
- [ ] [`.env.example`](#envexample) kept in sync with `.env`
- [ ] `mise` pinning the toolchain (`.mise.toml`) — reproducibility, not a team-size feature
- [ ] `rg` and `jq`/`yq` installed locally

**Later — once it's not just you**

- [ ] [`CODEOWNERS`](#codeowners)
- [ ] `CONTRIBUTING.md`
- [ ] Dev Containers
- [ ] GitHub Projects
- [ ] `direnv`
- [ ] ADRs under `docs/architecture/decisions/`

## Reference

Everything above, explained.

- [Stack](#stack)
- [Workflow](#workflow)
- [GitHub configuration](#github-configuration)
- [Local tooling](#local-tooling)
- [Files that help the agent specifically](#files-that-help-the-agent-specifically)
- [CLI tools](#cli-tools)
- [Final repository structure](#final-repository-structure)

## Stack

### Core

| Tool | Responsibility |
|---|---|
| **Git** | Source control, branches, commits, worktrees, merge/rebase |
| **VS Code** | Editor + native Git/worktree UI |
| **GitHub** | Issues, PRs, Actions, repository |
| **`gh`** | GitHub CLI: issues, PRs, Actions |
| **`npx` + Skills** | AI workflows/instructions |
| **Claude Code** | AI agent |

### Worth adding — no dedicated section below

| Tool | Responsibility | Priority |
|---|---|---:|
| **`mise`** | Pin/manage project tool versions | ⭐⭐⭐⭐ |
| **Dev Containers** | Reproducible development environment | ⭐⭐⭐ |
| **GitHub Projects** | Organize Issues/tasks | ⭐⭐⭐ |
| **`direnv`** | Per-project environment variables | ⭐⭐ |

## Workflow

```mermaid
flowchart LR
    A["Issue #123"] --> P["/plan"]
    P --> B["Branch<br/>feature/123-..."]
    B --> C["Commits<br/>(conventional)"]
    C --> D["Push"]
    D --> E["PR · Closes #123"]
    E --> F{"CI"}
    F -- fail --> C
    F -- pass --> G["Review"]
    G --> H["Squash merge"]
    H --> I["Branch deleted"]
    H --> J["Issue closed"]
```

**Worktrees** — sequential for one thing at a time, parallel for independent issues:

```text
Sequential   issue → done → issue → done
Parallel     issue-a ▸ worktree-a  ┐
             issue-b ▸ worktree-b  ├─ same time
             issue-c ▸ worktree-c  ┘
```

**Git / `gh` config:**

```bash
git config extensions.worktreeConfig true
git config --global push.autoSetupRemote true
gh config set prompt disabled
```

## GitHub configuration

### Repository settings

Protect `main`:

```text
main
├── Require pull request
├── Require CI checks
├── Require conversation resolution
├── Block force pushes
├── Block branch deletion
└── Require branch to be up to date (optional)
```

Also enable **automatically delete head branches** after merge, and **secret scanning + push protection** (Settings → Code security) — free, GitHub-native, zero config, the cheapest defense against an agent leaking a key.

> Nothing goes directly into main.

### Branch naming

```text
feature/123-add-auth
fix/124-token-expiration
refactor/125-auth-service
docs/126-update-readme
chore/127-update-deps
```

Issue #123 → branch → commits → PR → `Closes #123`

### Issue templates

YAML forms, not markdown — structured fields parse reliably for AI/automation.

```text
.github/
└── ISSUE_TEMPLATE/
    ├── feature_request.yml
    ├── bug_report.yml
    └── config.yml   # blank_issues_enabled: false
```

### Labels

Match the [Conventional Commits](#git-hooks) types so an issue's label predicts the commit prefix its fix will use — `bug` → `fix:`, `feature` → `feat:`, `refactor` → `refactor:`, `docs` → `docs:`, `chore` → `chore:`.

Create them once via `gh label create` (or the repo's Labels UI) — most repos manage labels this way rather than syncing them from a committed file; it's only worth automating once you're maintaining the same label set across many repos:

```bash
gh label create bug -c d73a4a -d "Something isn't working"
gh label create feature -c a2eeef -d "New functionality"
gh label create refactor -c fbca04 -d "Code change with no behavior change"
gh label create docs -c 0075ca -d "Documentation only"
gh label create chore -c cfd3d7 -d "Maintenance, tooling, deps"
```

The [issue templates](#issue-templates) apply these automatically via each form's `labels:` field.

### Pull request template

```text
.github/
└── PULL_REQUEST_TEMPLATE.md
```

### PR title

The one place [Conventional Commits](#git-hooks) actually matters at merge time: squash merge uses the PR title as the commit that lands on `main`, and that's what [`release-please`](#release-please) reads to compute the version bump. The `commit-msg` hook only checks individual commits during the PR — it says nothing about the title, so lint it separately:

```yaml
# .github/workflows/pr-title.yml
on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  lint-pr-title:
    runs-on: ubuntu-latest
    steps:
      - uses: amannn/action-semantic-pull-request@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Add it as a required status check in [Repository settings](#repository-settings) — otherwise it runs but doesn't block the merge, and the whole point is that a bad title can't land.

### AI PR review

Automatic first-pass review on every PR — inline comments on the flagged lines plus a summary comment — using each vendor's native GitHub integration, so no API key and no extra billing beyond the existing subscription.

**Claude Code** (Team/Enterprise plan): `claude.ai/admin-settings/claude-code` → Setup → install the GitHub App → select repos → pick a trigger (on PR open / on every push / manual).

**GitHub Copilot**: repo → Settings → Rulesets → New branch ruleset → under Branch rules enable **Automatically request Copilot code review** → optionally **Review new pushes** (re-review each push) and **Review draft pull requests**.

### GitHub Actions (CI)

```text
.github/
└── workflows/
    └── ci.yml
```

Minimum:

```text
CI
├── install   (cached — keeps the agent's feedback loop fast)
├── check     (same command as local — see Canonical commands)
└── build
```

Run the exact same `check`/`verify` command here as locally, not a parallel set of steps that happens to check similar things — see [Canonical commands](#canonical-commands). CI existing to catch a difference between "passes locally" and "passes for real" only works if there isn't a second, slightly different definition of "passes."

### Dependabot

```text
.github/
└── dependabot.yml
```

GitHub automatically creates dependency PRs. Set `commit-message.prefix` (e.g. `chore`) on every ecosystem — without it, Dependabot's PR titles (`Bump lodash from 4.17.20 to 4.17.21`) have no Conventional Commit type and fail the [PR title](#pr-title) check, making them unmergeable.

### Code scanning

Dependabot updates known dependencies after the fact; this catches problems before merge:

```text
.github/
└── workflows/
    └── dependency-review.yml    # actions/dependency-review-action — blocks a PR adding a vulnerable/bad-license dep
```

Free, GitHub-native, no extra account or billing.

### `release-please`

```text
.github/
└── workflows/
    └── release-please.yml
release-please-config.json
.release-please-manifest.json
```

Reads Conventional Commit history since the last release and opens a PR that bumps the version and updates `CHANGELOG.md` — merging that PR is the release. This is the actual payoff of enforcing [Conventional Commits](#git-hooks): without something consuming the convention, it's just a formatting rule nobody benefits from.

**Version bump** — highest-impact commit type since the last tag wins:

```text
fix:                        → patch  (1.2.3 → 1.2.4)
feat:                       → minor  (1.2.3 → 1.3.0)
feat!: / BREAKING CHANGE:   → major  (1.2.3 → 2.0.0)
docs:, chore:, refactor:    → no bump on their own
```

**Tags** — SemVer, `v`-prefixed (`v1.2.3`), matching the GitHub Releases convention. `release-please` creates the tag itself when its release PR is merged — don't tag manually, or the tag drifts from what the changelog actually shipped.

### `CODEOWNERS`

```text
.github/
└── CODEOWNERS
```

Explicit review boundaries once more than one contributor — human or agent — is involved. Skip it for a solo repo; there's no one to route to.

## Local tooling

### Git hooks

`.git/hooks/` isn't tracked by git, so it won't survive a clone or new worktree. JS/TS stack → [Husky](https://github.com/typicode/husky) + [`lint-staged`](https://github.com/okonet/lint-staged), wired up via `npm install`. Non-JS hook needed → [`pre-commit`](https://pre-commit.com/) instead.

Enforce Conventional Commits on `commit-msg` via [`commitlint`](https://commitlint.js.org/) (config in `commitlint.config.js`):

```text
feat: ...
fix: ...
refactor: ...
test: ...
docs: ...
chore: ...
```

### `.editorconfig`

Consistent formatting across VS Code and other editors.

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

### Prettier

`.editorconfig` sets baseline editor behavior; it doesn't rewrite code. Prettier auto-fixes style, so output is formatted consistently every time.

```json
{
  "scripts": {
    "format": "prettier --write ."
  }
}
```

- Wired into `check` via `format:check` (see [Canonical commands](#canonical-commands)); add it to `lint-staged.config.js` (or `pre-commit`) too if you want the fix applied before the commit even lands.
- Commit `.prettierrc` and `.prettierignore` so formatting is deterministic across sessions and worktrees, not whatever defaults happen to be installed.

### ESLint

Prettier only handles formatting — it won't catch an unused variable, a missing `await`, or an unreachable branch. ESLint catches those:

```json
{
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "fix": "npm run format && eslint . --fix"
  }
}
```

`--max-warnings 0` matters specifically for an agent: without it, warnings pile up silently and `check` stays green while quality erodes. Commit `eslint.config.js` for the same reason as `.prettierrc` — deterministic rules across sessions and worktrees.

### VS Code

Commit project-level config:

```text
.vscode/
├── settings.json
├── extensions.json
├── tasks.json
└── launch.json
```

`extensions.json` recommends extensions for the project — don't force them unless necessary:

```json
{
  "recommendations": [
    "EditorConfig.EditorConfig",
    "eamodio.gitlens",
    "GitHub.vscode-pull-request-github",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

The last two aren't just nice-to-haves — `settings.json` sets `esbenp.prettier-vscode` as the default formatter and wires ESLint's autofix into `codeActionsOnSave`, so without both extensions actually installed, those settings silently do nothing.

**GitLens** is the one extension worth calling out specifically — inline blame/history, the fastest way to see what an agent changed and when without leaving the editor.

### `.gitignore`

Prevents build output, `node_modules`, and `.env` from ever being committed — the base guard against an agent leaking secrets or bloating history.

```gitignore
node_modules/
dist/
build/
.env
.env.*
!.env.example
```

### `.npmrc`

`engine-strict` blocks installs on the wrong Node/npm version instead of silently succeeding; `save-exact` pins newly added dependencies to an exact version instead of a `^range`, so a later install doesn't quietly drift.

```ini
engine-strict=true
save-exact=true
```

### `.env.example`

`.env` itself is gitignored, so without this the agent has no way to know what config even exists — it'll guess variable names or skip a feature that needs one. Commit the shape, not the values:

```bash
DATABASE_URL=
API_KEY=
PORT=3000
```

Keep it in sync with `.env` by hand — nothing enforces this automatically, so a stale `.env.example` quietly becomes as misleading as no file at all.

## Files that help the agent specifically

These are the highest-leverage additions in this document — the difference between "the agent read some rules" and "the agent's output is actually verified and placed correctly."

### Canonical commands

One command per action, runnable without guessing the package manager or flags:

```text
check   → format:check + lint + typecheck + test   (single entry point, run before every commit)
fix     → format + lint --fix                      (autofix what check would flag)
build   → production build
verify  → check + build                            ("is this actually ready" — run before opening a PR)
```

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint": "eslint . --max-warnings 0",
    "fix": "npm run format && eslint . --fix",
    "typecheck": "...",
    "test": "...",
    "check": "npm run format:check && npm run lint && npm run typecheck && npm run test",
    "build": "...",
    "verify": "npm run check && npm run build"
  }
}
```

`git diff --check` is worth adding to `check` too — it's nearly free and catches whitespace/conflict-marker errors nothing else looks for.

Polyglot repo? Use `just` or a `Makefile` instead, so the entry point isn't tied to one language's tooling.

CI runs this same command — see [GitHub Actions (CI)](#github-actions-ci).

This is what gives the agent a deterministic pass/fail signal instead of a plausible-looking guess: `edit → check → fix failures → check`, no need to understand your internal tooling beyond "`verify` passing means done."

### `AGENTS.md`

At the repository root. Keep it short — Skills hold the detailed workflows.

```markdown
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
```

The `Commands` block is the highest-leverage line in this file — same reason as [Canonical commands](#canonical-commands) above.

**Nest it.** Once the root file exists, add scoped `AGENTS.md` files inside the directories that need their own rules — the agent picks up the closest one to whatever it's editing, on top of the root:

```text
AGENTS.md
src/
└── AGENTS.md
test/
└── AGENTS.md
```

### `docs/`

Start flat. Split into subfolders only once one category has enough files to justify it.

```text
docs/
├── api/
│   ├── overview.md
│   └── endpoints.md
├── architecture/
│   ├── overview.md
│   └── decisions/
├── guides/
│   ├── getting-started.md
│   └── advanced-usage.md
└── assets/         # images referenced by the docs above
```

**`docs/assets/`** — diagrams and screenshots referenced by the docs above, e.g. `docs/assets/ai-agent-example.svg`:

<img src="docs/assets/ai-agent-example.svg" alt="Simple flat-style illustration of a robot, representing an AI coding agent" width="160" />

**`docs/architecture/overview.md`** — module boundaries, where new code belongs, and why any unusual decisions exist. This is what lets an agent place a new file correctly instead of guessing from whatever's nearby. Once the project has enough of these, split them into ADRs under `docs/architecture/decisions/` — preserves *why*, not just *what*, so future agents don't re-litigate settled decisions.

### `.claude/` directory

Committed, project-level Claude Code configuration — every clone and worktree gets the same agent tooling, instead of it living only in one person's local `~/.claude`.

```text
.claude/
├── CLAUDE.md        # what's in this folder and why
├── CONTRIBUTING.md  # how to add to each subfolder below
├── settings.json    # project settings, shared by everyone
├── commands/        # custom slash commands — /<filename>
├── agents/          # custom subagent definitions
├── skills/          # custom skills — folder + SKILL.md per skill
└── rules/           # optional: rules scoped by file glob, not directory
```

`AGENTS.md` stays the source of truth for instructions — this is for tool-specific extensions on top of it, not a duplicate.

## CLI tools

| Tool | Why it matters for AI coding | Priority |
|---|---|---:|
| **`gh`** | Agent checks CI/review status without leaving the CLI — `gh pr checks`, `gh run view`, `gh pr view --comments` | ⭐⭐⭐⭐⭐ |
| **`rg` (ripgrep)** | Fast, predictable search — what Claude Code's own search tool already shells out to | ⭐⭐⭐⭐⭐ |
| **`jq` / `yq`** | Inspect/transform JSON/YAML reliably instead of the agent guessing structure | ⭐⭐⭐⭐⭐ |

The one habit worth building in: an agent should reach for `gh` before asking you "did the PR pass?"

```bash
gh pr checks               # did CI pass
gh run view --log-failed   # why did it fail
gh pr view --comments      # what did review say
```

## Final repository structure

```text
.
├── .claude/
│   ├── CLAUDE.md
│   ├── CONTRIBUTING.md
│   ├── settings.json
│   ├── commands/
│   │   └── README.md
│   ├── agents/
│   │   └── README.md
│   ├── skills/
│   │   └── README.md
│   └── rules/
│       └── README.md
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── feature_request.yml
│   │   ├── bug_report.yml
│   │   └── config.yml
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── dependency-review.yml
│   │   ├── release-please.yml
│   │   └── pr-title.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── dependabot.yml
│   └── CODEOWNERS
├── .husky/
│   ├── pre-commit
│   └── commit-msg
├── .vscode/
│   ├── settings.json
│   ├── extensions.json
│   ├── tasks.json
│   └── launch.json
├── docs/
│   ├── api/
│   │   ├── overview.md
│   │   └── endpoints.md
│   ├── architecture/
│   │   ├── overview.md
│   │   └── decisions/
│   ├── guides/
│   │   ├── getting-started.md
│   │   └── advanced-usage.md
│   └── assets/
│       └── ai-agent-example.svg
├── src/
│   ├── AGENTS.md
│   └── index.ts
├── test/
│   ├── AGENTS.md
│   └── index.test.ts
├── .editorconfig
├── .env.example
├── .gitignore
├── .mise.toml
├── .npmrc
├── .prettierignore
├── .prettierrc
├── commitlint.config.js
├── eslint.config.js
├── lint-staged.config.js
├── release-please-config.json
├── .release-please-manifest.json
├── tsconfig.json
├── tsconfig.build.json
├── package.json
├── package-lock.json
├── AGENTS.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```
