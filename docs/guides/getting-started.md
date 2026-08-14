# Getting started

```bash
mise install        # pins the toolchain from .mise.toml
npm ci               # install dependencies
cp .env.example .env # fill in real values
npm run verify        # confirm the checkout is healthy
```

Git hooks (`lint-staged` on staged files, `commitlint` on the commit message) are wired up automatically by the `prepare` script the first time you run `npm ci`/`npm install` — no separate setup step.
