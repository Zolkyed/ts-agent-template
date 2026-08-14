# Setup guide

```bash
mise install        # pins the toolchain from .mise.toml
npm ci               # install dependencies
cp .env.example .env # fill in real values
npm run verify        # confirm the checkout is healthy
```

Git hooks (`lint-staged` on staged files, `commitlint` on the commit message) are wired up automatically by the `prepare` script the first time you run `npm ci`/`npm install` — no separate setup step.

## Optional local tooling

```bash
brew install gitleaks   # or see https://github.com/gitleaks/gitleaks#installing
```

Not required — CI runs `gitleaks` on every PR regardless — but if it's on your `PATH`, the pre-commit hook also scans staged changes before they're committed.
