# A05.3b — session runtime and Actions UI checkpoint

2026-10-21; main, base d86047d, dirty source manifests captured by each immutable
handoff. This is an implemented, partially verified session increment. **A05.3b
and mandatory whole A05 remain in progress.** No acceptance threshold is reduced.

## Product change and boundaries

The existing inspector can explicitly arm one real click on the selected native
backend node in the recorded MAIN execution context. Existing opt-in development
observer records dispatch and supported synchronous body entry/leave. New strictly
validated actions-arm/read/cancel/clear operations bind inspector/view, trace nonce,
run/build/frame/page, selection, inspection and source generation. Read/cleanup use
the recorded unique context; no nearest-node/new-document fallback or app callback
invocation. Source navigation requires the existing IDE's exact digest check.
Independent observation nodes do not establish property/network consequences;
existing source declaration/registration execution:not-observed stays separate.

Actions UI adds Observe next click, Cancel observation and Clear trace with the
existing cards/native controls. Arm budget is explicitly ten seconds in this
experimental development increment, not an approved final Live parameter. No CSS,
tokens, shared UI contract, source notices or report schema changed. Trace is
session-only and explicitly absent from saved reports; Cancel/Clear do not undo
application effects. Runtime function-object identity, full listener coverage and
async effects remain unavailable. Production observation is explicitly unsupported;
F05 two-stage permission is neither bypassed nor extended. SDK remains outside Atom.

Read/inject-only admission is demonstrated by policy tests. Native positive hosts
use an all-development-actions connection: their success does **not** separately
prove a native read-only connection path. No independent-human release blocker is
introduced, and screenshots remain candidates.

## Checks and historical separation

New tests cover policy/wire refusal, primitive-only records, missing/wrong identity,
selection mismatch/orphan leave, exact late-arm cleanup, UI Cancel before next poll,
late source-open refusal and retaining known stale history without source navigation.
The native harness consumes the immutable Atom/UI archives and separately consumed
Vite plugin .20261021.1; it uses two actual MV3 hosts, real Vue/SFC and VS Code,
Atom's owned debugger/native picker and real trusted input, without an app facade.

- .10 checkpoint: full2.log 1687 PASS, focused3.log 62 PASS, native10.log 17 scoped
  checks PASS. Native receipt .artifacts/a05/runtime-native/2026-10-21T04-39-44-750Z/results.json;
  Atom handoff .artifacts/atom/2026-10-21T04-37-28-262Z/atom-handoff.json.
  These precede review fixes and are historical, not current proof.
- ONE bounded runtime/UI review found four Important issues: old cleanup could
  cancel a replacement owner; late IDE result could publish into a new context;
  omitted helper identity became a known identity; stale lifecycle retained owner.
  Addressed with captured-owner cleanup/epoch publication, post-IDE guard, strict
  identity/selection/stack parsing, and navigation/source/detach/tab/lease cleanup.
  Reviewer rechecked only those fixes in source and found none still open. This
  was not whole A05 review and did not execute the race/lifecycle matrix.
- Minor stale-history loss was subsequently corrected: retain known body rows as
  stale, disable source navigation, synchronously stale stored trace on retirement.
- .11 checkpoint full4.log 1688 PASS, exact archive/type/admission checked; no native
  .11 run claimed. Final .12 results are recorded below after execution.
- full3.log/type11.log preserve sandbox EPERM listen/spawn failures; retries use
  authorized local execution, not weaker predicates. Native .9 failed on a new
  harness audit filename; actual IDE audit path corrected for .10 onward. The
  original failed artifacts remain intact.

Reference: supplied extension-ui design README_RU/HANDOFF_RU/SCREEN_INDEX and
Actions03.1/03.2 source. Compared actual first and390px/1100px native viewports:
existing header/card margins,13px base, aligned native controls; narrow controls wrap
without horizontal overflow. New arm/history card is a necessary functional
addition to the simulated reference, not a new design. Agent inspection is not
human visual acceptance. Native controls were checked, but full Tab traversal is
not claimed by that harness.

## Remaining bounded step

Continue A05.3b with runtime-level adversarial regression coverage for replacement
Arm/late IDE verification and the full lifecycle/context/Basic/disabled/throw/
keyboard matrix. Current controller/UI tests and source review do not substitute
for those native/runtime races. Then integrate saved reports and finish original
A05 performance/adapter/production boundaries and ONE whole-item review. Preserve
A05.1/A05.2/A05.3a and all older criteria/results. L02/A05 remain mandatory; U02
Live plus Draft/Apply, U05 picker, U06 bug handoff and production two-stage scope
remain unchanged. Final Live settings, production permission duration/scope and
handoff UX remain decisions in their respective tasks.

## Final .12 checkpoint evidence

- `npm test`: full5.log **1689 PASS**,0 fail/skipped. Focused5:28 PASS.
- `npm run pack:atom`: immutable handoff
  .artifacts/atom/2026-10-21T04-47-46-036Z/atom-handoff.json;
  @stateport/atom0.1.0-candidate.20261021.12, archive SHA256
  933372e3e0e3f1e91c36af826f60bd518d59a737956557c02ca72771fea7bdf5.
- `npm run verify:atom-types -- <handoff>`: strict NodeNext/browser consumers PASS,
  TypeScript5.9.3. `npm run verify:atom-package -- <handoff>`:7 PASS;
  .artifacts/atom/compatibility/2026-10-21T04-49-00-125Z.
- `node tests/integration/action-trace-native.mjs <handoff>`: **17 scoped checks PASS**,
  .artifacts/a05/runtime-native/2026-10-21T04-49-12-974Z/results.json, errors[],
  complete source/host/plugin/workspace input maps unchanged. Actual standalone and
  embedding picker→Arm→native click→body/leave→verified IDE range, Cancel/Clear,
  explicit async body gap and390px/1100px/native controls. Native connection grants
  all development actions. No native read-only/production/keyboard-lifecycle claim.
- `npm run verify:first-read-profile`: original4 checks PASS;
  .runtime/first-profile-runs/2026-10-21T04-50-26-774Z/results.json. This rerun is
  justified by changed runtime/owned-code role; no old experiment was overwritten,
  no compiler/predicate/finite/HTTP threshold or controlled-profile scope changed.
- `node .artifacts/a05/runtime-ui/verify12.mjs`: exact archive/current source,
  native before/after maps, original finite status and test/type/admission receipts
  PASS; verification12.json explicitly retains A05.3b in-progress and remaining gaps.
- Scope consistency check: approved scope-review-1 constraints and all29 task
  identities/statuses/dependencies unchanged. Current A05 checkpoint/progress only.
  `git diff --check`:PASS. Nothing published or changed in another repository.
