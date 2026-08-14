# Testing

```text
Unit        → pure logic
Integration → modules interacting
E2E         → user workflows
```

Every bug fix adds a regression test; every new feature adds tests. Don't weaken or delete a test to make it pass — fix the underlying code instead (see the Safety rule in [`AGENTS.md`](../AGENTS.md)).

Run the full suite with `npm run test`, or the full gate with `npm run check`.
