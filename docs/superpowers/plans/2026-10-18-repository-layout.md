# Repository layout implementation plan

> **For agentic workers:** Use superpowers:executing-plans inline for this mechanical relocation; preserve the current shared checkout.

**Goal:** Remove the fourteen historical stateatom-* root directories while retaining working product behavior and reproducible regressions.

**Architecture:** Product instrumentation and first-read implementation move to src/engine and src/first-read. Synthetic inspection applications move to tests/fixtures/inspection; unit suites stay under tests, native workflows under tests/integration, acquisition-only prototypes under experiments. Existing core/browser/IDE boundaries and npm command names remain.

**Tech Stack:** Existing Node 24/npm 11, ESM, Babel/esbuild, Vite, Playwright and VS Code; dependencies unchanged.

**Spec:** The user's cleanup instruction executes the previously discussed src/tests/experiments separation. No functionality, resolver, framework or release changes.

## Global constraints

- Preserve unrelated untracked feature documents and the pending maintainer-alpha documentation edits.
- Preserve old X-Ray source, frozen candidates, artifacts and criteria; never rewrite historical run hashes as fresh proof.
- Preserve fixture source bytes, MIT/Apache provenance, exact compiler/tool pins and fail-closed proof boundaries.
- Update executable paths, source-folder setup, compiler source bindings and current documentation together; no forwarding legacy root directories.
- Keep all existing npm command names, dependency versions and lock integrity unchanged.
- No branch/worktree, commit, push or release is requested for this cleanup.

## Review focus

- Relative imports, dynamic URLs and temporary module copies resolve from their new depth.
- Owned compiler recipe and browser-input pins bind exact moved/updated files; tampering still refuses.
- Real IDE/source markers and first-read joins use the new fixture path without changing the fixture's execution.
- Harness fingerprints include their own moved sources; historical output directories remain distinct.
- No unrelated source, historical fixture, notice or generated evidence is silently lost.

### Task 1: Inventory and relocate

- [x] Record before hashes, uncommitted work and an exact old/new map.
- [x] Stop the owned live demo; preserve ignored legacy artifacts in .runtime before removing old directories.
- [x] Move every tracked source to the agreed responsibility, then observe the existing suite's missing-import failure before updating callers.

### Task 2: Restore paths and compiler bindings

- [x] Rebase relative imports, dynamic URLs, test fixture roots, fingerprint lists, npm entrypoints and test globs.
- [x] Re-pin only relocated/changed first-read source and recipe bytes; preserve all third-party/native pins and original fixture digests.
- [x] Run all unit regressions and build; diagnose specific failures without deleting assertions or widening accepted inputs.

### Task 3: Current documentation and verification

- [x] Publish the layout map locally, update current setup/architecture/provenance/notice pointers and preserve historical results.
- [x] Run short-loop and actual installed-helper first-read UI sequentially with new output tags; run affected native compiler/session controls where relocation creates risk.
- [x] Review the whole relocation against the map, source pins and unrelated-work hashes; resolve material findings.
- [x] Report final locations, actual checks and deletion/retention decisions. Leave changes local.
