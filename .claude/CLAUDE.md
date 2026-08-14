# `.claude/`

Committed, project-level Claude Code configuration — every clone and worktree gets the same agent tooling, instead of it living only in one person's local `~/.claude`.

- **`settings.json`** — project settings (permissions, hooks) shared by everyone working in this repo.
- **`commands/`** — custom slash commands (`.md` files), invoked as `/<filename>`.
- **`agents/`** — custom subagent definitions for the `Agent` tool.
- **`skills/`** — custom skills (folder + `SKILL.md` per skill), invoked as `/<skill-name>`.
- **`rules/`** — rules scoped by file glob rather than directory.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for how to add to each of these.

`AGENTS.md` at the repo root stays the source of truth for instructions (commands, git/GitHub rules, safety) — this folder is for tool-specific extensions on top of that, not a duplicate of it.
