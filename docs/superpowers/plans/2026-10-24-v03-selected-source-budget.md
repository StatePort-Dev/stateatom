# Selected workspace source budget implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans inline, task-by-task. No implementer agents; ONE fresh whole-increment review at the end.

**Goal:** Acquire original selected/trace source files before background index
exhaustion without increasing budgets or weakening source acceptance.

**Architecture:** One bounded workspace filesystem reader prioritizes safe candidate
paths, then uses remaining budgets for the existing background walk. Bridge digest,
marker, range and evidence validation stay intact.

**Tech Stack:** Existing Node24 tests/build; Node18.18.2 original app/plugin5;
exact Atom70/UI2 and newly built local VSIX only when recorded helper inputs change.

**Spec:** ../specs/2026-10-24-v03-selected-source-budget-design.md

## Global Constraints

- Main/de6e0f8, local commits only; no branch switch, push/publication or other repo.
- Source160 files/256000-byte-file/2000000-byte-total, no limit increase or truncation into known values.
- Mapped root, symlink, regular-file, descriptor, trust and digest checks mandatory.
- Original selected textarea/disabled=false/scalar/source-digest/IDE-range/timeout criteria unchanged.
- Preserve every old FAIL/result, raw page trace never accepted source by itself.
- No app dependency reinstall, SDK, new UI/design, accounts/certificates/user profiles.
- Source/native/installed/human/first-read/whole-task qualification remain separate.

## Review Focus

- Page-controlled paths cannot escape the mapped root through symlinks, special files, normalization or races.
- Selected/trace candidates share existing budgets and never exclude the selected file merely because unrelated files fill the background index.
- Trust loss or source replacement during awaited filesystem work cannot produce a fresh accepted source.
- Helper/package receipts distinguish unchanged inherited plugin proof from new exact helper/native qualification.
- Original independent source/scalar/IDE/input/export criteria and historical failures are never replaced by easier source controls.

### Task 1: Safe bounded selected-source acquisition and exact helper workflow

**Files:** create core/workspace-sources.mjs, tests/workspace-sources.test.mjs,
tests/bridge-source-priority.test.mjs; modify core/bridge.mjs, ide-extension/README.md;
create completion122 and a preregistered original source case after exact new helper.

**Interfaces:** safePath(root,relative) stays re-exported from core/bridge.mjs;
readWorkspaceSources(root,sourceRoot,{priorityFiles=[],isAllowed=()=>true}={})
returns [{file,text}], no new Atom DTO/wire/version/authority.

- [ ] Write actual bridge HTTP late-selected-file RED, run node --test --test-isolation=none tests/bridge-source-priority.test.mjs; expect original omission failure.
- [ ] Write filesystem budget/scope/symlink/special-file/trust controls before implementing the new reader.
- [ ] Implement workspace reader and bounded bridge candidate extraction; keep existing validator/marker/range logic unchanged.
- [ ] Run node --test --test-isolation=none tests/workspace-sources.test.mjs tests/bridge-source-priority.test.mjs tests/security.test.mjs tests/project-setup.test.mjs; expect PASS. Run full npm test once after source changes.
- [ ] Replay retained original source failure through actual reader/validator, preserve original FAIL; expect selected SFC included and source-only validation no longer Stale. This is not runtime proof.
- [ ] Commit source/tests/spec/plan and docs before building native artifacts.
- [ ] npm run build:extensions; npm run pack:development. Reproduce exact helper bundle/input hashes and archive identity, keep warnings. Check unchanged Atom70/UI2/plugin5 before reuse; do not rerun old native matrices.
- [ ] Derive explicit unchanged-plugin consumer receipt from actual prior strict install plus fresh exact artifact/installed payload checks; never count inherited checks as a fresh install.
- [ ] Preregister only necessary helper/development/consumer receipt identities in original case; same question/criteria. Commit before native execution.
- [ ] Run unchanged independent-vue-source-native.mjs with exact70/new helper and retained original dependency receipt; inspect actual output/screenshots/IDE proof or retained FAIL. No easier substitute target.
- [ ] Record122/current routing and read-only integrity seal; ONE fresh review de6e0f8..final source head, at most one RED→GREEN correction pass/full suite, no re-review.
- [ ] Final aggregate read-only integrity verification, local commit and one next dependency-valid unresolved item. Preserve ledger/evidence; goal remains active until deadline.
