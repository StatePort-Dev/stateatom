# Shared extension UI implementation plan

**Goal:** Implement the supplied `01-stateatom-shared-extension-ui.md` in the current dirty checkout, including an Atom consumer and a verified local handoff.

**Architecture:** A dependency-free CSS package owns JSON tokens, deterministic generation, native HTML primitives and a versioned contract. Atom copies the package's exported styles at build time and owns its layout and all evidence semantics.

**Constraints:** Keep npm/Node pins, current checkout and unrelated relocation work. No engine/lifecycle changes, embedded work, StatePort modification, push, release or publication. No Capture source imports. Candidate visual baselines require future human review.

## Review focus

- Adjacent host content must retain its computed styles.
- Native disabled and busy states, keyboard focus, labels and long content must remain usable.
- Narrow and zoomed panel, export dialog and reader must not clip operations.
- Tarball must work without access to this checkout, through npm and available pnpm.
- Dirty provenance needs a reproducible build-input digest and immutable versioned output.

## Tasks

- [x] 1. Pin export/generation/isolation requirements in tests; implement `packages/extension-ui/{tokens,styles,scripts,showcase}`, contract, licenses and changelog. Run standalone build and tests.
- [x] 2. Consume package exports in `scripts/build.mjs`; use shared styles in `browser-extension/panel.*` and `reader.*`; preserve dynamic controls and all IDs/operations. Check full unit suite and build.
- [x] 3. Verify real Chromium showcase focus/labels/contrast/long text/zoom/scope and real Atom at fixed wide/narrow sizes. Repeat browser-only save/export/Unknown/Stale and IDE-connected regressions with unique output paths.
- [x] 4. Document design ownership, generation, breaking changes, consumer updates, candidate baselines and evidence. Add AGENTS guidance (no CODEOWNERS exists).
- [x] 5. Build immutable candidate tarball with npm pack; audit allowlisted contents; install and render from clean npm/pnpm consumers; write external `ui-handoff.json` with exact versions, dirty source manifest/digest, artifact hash, exports and executed commands.

## Execution record

Execution is inline, as requested, without another approval cycle or branch/worktree change. The supplied specification is the design authority. Initial tracked diff, status and per-file digests are retained privately in `.artifacts/extension-ui/work/` to protect pre-existing work. No local commit is requested.

Completed: 493 unit tests, full/extensions builds, 22 UI checks, 26 browser checks, 27 IDE/code-journal checks, 16 stable first-read UI checks; npm/pnpm tarball consumers passed. See docs/testing/extension-ui.md for commands, retained failures, hashes and limits. Subsequent work must use packages/extension-ui/design/ as requested.
