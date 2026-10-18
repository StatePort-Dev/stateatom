# Production Source Mapping Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. The user explicitly requested autonomous implementation; intermediate review questions are waived. Stay on the checked-out branch.

**Goal:** Offline and permitted network source exploration for scripts actually loaded in the selected tab, with safe diagnostics and honest artifact identity.
**Architecture:** A bounded pure map/archive validator and an in-memory debugger-bound session integrate with the existing Atom runtime, transport, panel and diagnostic reader. External HTTPS sites use separately opted-in read-only inspection and optional origin permissions. No new inspector, resolver, SDK or cloud service.
**Tech Stack:** Existing Node 24/npm 11, esbuild, MV3/Chrome APIs, pinned trace-mapping 0.3.31 (MIT), Web Crypto, bounded ZIP stored/deflate streams.
**Spec:** docs/features/production-source-mapping.md

## Global Constraints

- Artifact identity never proves UI dependency or execution. Without an independent anchor, show `not linked to element`.
- No sources/sourceRoot fetching, executable source, authenticated cross-origin requests, redirects, source persistence or default source export.
- Preserve existing localhost/IDE/experiment behavior and historical 0/6 criteria.
- Preserve supplied UI reference; reuse native shared controls without token/primitive changes.
- Local changes only; no publication or StatePort modification.

## Review Focus

- Malformed VLQ, source indices, oversized JSON/ZIP and dishonest ZIP sizes fail within explicit budgets.
- A script from an older deployment or a second build retains its own identity; filenames cannot upgrade matching.
- Navigation, detach, execution-context loss and in-flight imports cannot reuse old source claims.
- Read-only external inspection cannot call experiments, clear storage/cache, reload, or forward IDE context.
- Diagnostics retain only bounded identities and positions, excluding source bodies, map URLs and internal file names even with legacy content opt-in.

### Task 1: Bounded offline map and artifact loading

**Files:** core/source-maps.mjs, core/source-map-archive.mjs, tests/source-maps.test.mjs, package.json/lock.
**Interfaces:** parseSourceMap(bytes), readSourceBundle(bytes,name), associateSourceMap(script,bundle), lookupSource(map,line,column); hashes explicitly use UTF-8 script text versus artifact bytes.

- [x] Write failing map, position-only, digest mismatch and hostile archive tests; run with node --test.
- [x] Implement strict budgets, ZIP validation and trace-mapping lookup; use independently supplied artifact bytes and manifest digests for Exact.
- [x] Verify the new tests and retain dependency notices in browser/package outputs.

### Task 2: Debugger-bound session, network policy and read-only sites

**Files:** packages/atom/src/source-map-session.mjs, runtime.mjs, platform.mjs, transport.mjs, types; browser-extension host/manifest/content; tests/atom/source-maps.test.mjs.
**Interfaces:** createSourceMapSession({send,fetch,permitted}) owns inventories and parsed maps outside storage; snapshot contains no source bodies; runtime exposes inventory/import/acquire/lookup/clear operations.

- [x] Write failing session identity, navigation race, network scope/redirect/auth denial tests.
- [x] Bind scriptParsed/context/navigation lifecycle, bounded imports and network requests to tab/run/script identity; invalidate before replacement.
- [x] Add host opt-in HTTPS permission and read-only lease/operation enforcement; keep embedded default localhost scope.
- [x] Verify session, transport and existing lifecycle suites.

### Task 3: Existing panel, safe diagnostics and actual MV3 acceptance

**Files:** packages/atom/src/source-map-ui.mjs, template.mjs, ui.mjs, atom.css; core/diagnostic.mjs; browser-extension/reader.mjs; tests/integration/production-source-mapping.mjs; docs/testing/production-source-mapping.md; changelogs/status/README.
**Interfaces:** UI uses session operations; reports receive only session.snapshot() identities and mapping positions. Sources remain in worker memory.

- [x] Write failing diagnostic omission and MV3 acceptance checks for a built/minified React fixture without IDE/plugin.
- [x] Add discover/import/URL/clear/manual generated-position lookup controls with explicit candidate/anchor boundary, session status and inert excerpts.
- [x] Exercise exact bundle, same-name mismatch, no source content, stale/navigation, offline import, diagnostic save/review/download/reader, keyboard and narrow views.
- [x] Run npm test, npm run build, npm run verify:browser and npm run verify:react-host-ui plus the new declared verification command; record exact configurations/results and unverified gates.
- [x] Obtain independent code review, fix material findings, and finish with git diff --check/status.


## Execution decisions and review

- Native inline execution on the original branch; the user requested autonomy.
- The spec's explicit source-exploration alternative is implemented. No supported
  production UI/property anchor exists; candidate text is never upgraded to a
  producer claim. Real enterprise SSO/native Chrome permission UX remain unverified.
- ZIP subset: flat v3 maps, stored/deflate file and directory entries; indexed maps,
  ZIP64/encryption/symlinks remain explicit bounded failures.
- Five independent-review findings were fixed with focused regression coverage.
  Actual MV3 additionally found a helper-triggered refresh loop; its regression
  failed before the source-change notification filter was corrected.
- Working-tree delivery without push, publication or StatePort modification.
  Validation commands and evidence paths live in docs/testing/production-source-mapping.md.

Final checks: npm test 568/568; real production-map MV3 19/19; browser-only 26/26 with stable inputs; React/open IDE UI 11/11 with stable inputs; build and diff whitespace checks passed. See the validation record for warnings, retained failed attempts and unsupported gates.
