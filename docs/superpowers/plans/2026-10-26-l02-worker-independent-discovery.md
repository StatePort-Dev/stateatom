# L02 Worker-independent Discovery Plan

> REQUIRED superpowers:executing-plans inline; ONE fresh final whole-item reviewer.

**Goal:** Remove active-worker-only identity dependency from one research driver.
**Architecture:** Exact-path read-only Chrome WebUI snapshot plus strict node guard;
existing loaded nonce/JS proof remains the authority before the explicit driver availability poll and trusted Run/create/prompt.
**Tech Stack:** Existing Node/assert/Playwright; no dependencies or API migration.
**Spec:** ../specs/2026-10-26-l02-worker-independent-discovery-design.md

## Global Constraints
Main/localcommits; no browser/model/native/newcase/cert/trust/profile mutation.
Product/package80/UI2, raw/frozen cases/readers,14deferred minors and20/29 unchanged.
L02.13 load cause unknown; fullL02 and useful model acceptance remain open.

## Review Focus
- Exact full path, unique valid ID, enabled unpacked row; no worker/name guessing.
- Missing/changed WebUI fields refuse rather than invent browser compatibility.
- Baseline replay cannot masquerade as fresh drop; snapshots leak no unrelated data.
- Loaded nonce/bytes remain required before the explicit driver availability poll and trusted Run/create/prompt; no acceptance relaxation.
- Old frozen inputs fail closed; no silent native retry or upgraded historical proof.

### Task 1: Bounded worker-independent discovery source
**Files:** tests/integration/local-comparison-native.mjs; tests/local-comparison-native-owner.test.mjs; docs/completion/188-l02-worker-independent-discovery.md; docs/status.md; docs/completion/task-index.json.
**Interfaces:** readComparisonExtensionUI(expectedPath) browser function returns
{ready,items}; selectComparisonExtension(snapshot,expectedPath,previousID) returns
strict selected identity or null; assertComparisonExtensionAbsent handles baseline.
- [ ] Register base/protected product and old raw/case hashes; task-start/read brief.
- [ ] RED exact-path/worker-absent/control tests, then minimal snapshot/guard/poll integration.
- [ ] GREEN focused existing/new controls, full npm test, syntax/diff/protected hashes.
- [ ] Record source-only result and limitations, localcommit/task-done.
- [ ] ONE whole review, one tested I/C correction pass, defer minors; archive/remove
only own workspace and commit closeout. NextONE L02 discovery native preflight
selection only if justified; no retry158 or quality readiness from these docs.
