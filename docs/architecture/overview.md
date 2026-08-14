# Architecture overview

## Layout

```text
src/     application code
test/    tests, mirroring src/ structure
docs/    everything in this folder
```

## Module boundaries

This is a template repo — replace this section with the real module map once code exists: what lives where, what depends on what, and why any unusual decision was made.

## Where new code belongs

- New logic → `src/`, colocated with what it's closest to functionally.
- New tests → `test/`, mirroring the `src/` path being tested.
- A decision worth preserving → `docs/architecture/decisions/` once this file gets too big to hold them inline.

Once this file accumulates enough one-off decisions to get noisy, split them out as ADRs under `docs/architecture/decisions/` so future readers get the _why_, not just the _what_.
