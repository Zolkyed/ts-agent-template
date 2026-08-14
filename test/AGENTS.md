# test/

- Mirror `src/` paths — a file here covers the source file at the same relative path.
- Vitest (`describe`/`it`/`expect`); see `docs/testing.md` for what kind of test belongs where.
- Never weaken or delete a test to make `check` pass — fix the underlying code instead.
