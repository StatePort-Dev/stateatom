# V01.2 native candidate lane implementation plan

> For agentic workers: use executing-plans inline under the existing autonomous
> main/local-commit authorization; ONE whole V01 review after finite stages.

**Goal:** run a bounded actual MV3 Basic/picker/save/export/fresh-reader and
production-map matrix on one immutable package pair, reproducible locally/CI.
**Spec:** approved09-validation V01;109 retains missing native/installed-IDE gaps.
**Architecture:** existing native Chrome backend/own-inspector input, unchanged
picker fixture and map harness. Sequential runner freezes inputs, uses an exclusive
cooperative lock, retains each child result and fails rather than skips missing
environment or changed identity. No app-target test debugger or certificate setup.
**Stack:** Node24/npm11,lockfile Playwright1.63.0 Chromium/esbuild,GitHub Actions.

## Constraints and executor choices

- Existing product65/UI2 bytes unchanged; no root package/dependency/API/style edits.
- Headless-new Chromium is actual MV3; local runner records browser/environment,
  not a human visual study or performance measurement. No TLS bypass/CA required.
- Preserve old embedding/map results. Do not use stale embedding unsupported-feature
  expectations as a gate. Map harness retains all19 predicates/host; only neutral
  version label and machine-readable result sentinel may change.
- Basic uses the existing picker fixture, read-only default, trusted actual target
  selection/refinement/cancel and zero app actions. Save legacy historical diagnostic,
  review actual bytes/download, then import in a separate fresh extension profile
  after the originating browser closes. Unknown/runtime/non-authority persist.
- CI extends packed-contracts after its exact pair/types/admission, installs locked
  Chromium/system deps. No remote invocation/push/release. Missing runtime is a
  non-success outcome, never a mock/skip. Installed VSIX stays separate V01.3.

## Task1 — finite runner contract

Files: tests/helpers/native-candidate-lane.mjs,tests/atom/native-candidate-lane.test.mjs,
scripts/verify-native-candidate.mjs. Fixed two entrypoints only, no generic runner.
Interfaces: immutableHandoffPath(latest,root) rejects latest/escape; validateLaneResult
(caseId,result,handoffSha256) requires exact schema/status/check names/count and
all PASS, expected two hosts/current handoff/frozen inputs; returns small summary.
Runner validates source/archive/install/hosts before/after, claims owned lock,
spawns both children sequentially with unique outputs, retains stdout/result hashes.
Exclusive lock conflict refuses without killing foreign work; no stale-lock auto-delete.

- [ ] RED positive two-case results and wrong handoff/empty checks/missing host/
  failed status/source drift/unsafe path controls; expected real assertions fail.
- [ ] GREEN minimal fixed contract/runner; focused checks/syntax pass. No full
  source/native repeat for source-only runner controls. Commit before actual native.

## Task2 — actual Basic/fresh-reader harness

File tests/integration/basic-reader-native.mjs. Native read-only attach/primary
pick nested span/keyboard parent/cancel/no app action. Exact report target/property/
value/Unknown/default exclusions; native review/download equality. Close original
browser, fresh profile reader imports exact file with no app tab/helper/source/
editing authority; no app request on import. Capture own-console/page errors.
Use existing source-map-native.mjs for manual production-map association separately;
do not call its generated coordinates element-linked or infer callback execution.

- [ ] Run new source controls/syntax and freeze source/package/harness/fixture/plan.
- [ ] Commit then run exact candidate command once; expected current65 two-host
  Basic/fresh-reader + existing39 map checks with zero errors/source drift. Preserve
  any incomplete attempt; fix concrete preparation only without repeating valid
  phases unnecessarily. Product defects require RED/GREEN/new immutable identity.

## Task3 — CI wiring and scoped result

- [ ] Extend same packed-contracts job using its immutable handoff output, install
  Chromium through npx playwright install --with-deps chromium (official1.63 docs
  retrieved via Context7). Validate YAML/Bash and candidate identity contract.
- [ ] Record110/task-index/status/ROADMAP, localcommit. Report local actual/native
  vs remote CI unexecuted. Next ONE V01.3 installed-VSIX maintainer route, not new
  performance/model/certificate campaigns. WholeV01/19of29 remains open until its
  remaining stage/review; no release/publication/other repository.

## Review focus

Missing Chrome/port conflict must fail without a passed matrix; changed source or
handoff cannot borrow another candidate result; omitted host/empty checks never
pass; lock cleanup touches only owned work; fresh reader cannot borrow live source
or mutation state. Keep raw failure/tails and report only exercised evidence.
