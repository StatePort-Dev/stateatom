# U03 Historical Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. One final whole-item review, no per-task reviewer.

**Goal:** Implement the U06 reporter/recipient journey with honest historical
facts, readable local review and immutable developer additions.

**Architecture:** Preserve strict v1 diagnostic parsing and existing save/export.
First build an unimported draft/baseline actor referencing an exact v1 snapshot;
then implement explicit v2 privacy/compatibility, storage and mounted UI/reader.
P04's collector is separate; U03's base must work with `not-recorded` windows.

**Tech Stack:** Existing JavaScript ESM, Node test runner, native MV3 browser
harnesses, immutable paired Atom/UI packages. No new dependencies or service.

**Spec:** `docs/features/qa-pm-handoff-journey.md` (new U06 working decisions,
not retrospective scope-interview approval).

## Global Constraints

- Keep v1 readable and unchanged; no silent schema reinterpretation.
- Historical data only; reading/reporting/appending notes never grants mutation,
  Capture, replay, auto-attach, source fetch or expression/getter reevaluation.
- Original saved/imported report immutable; reviewed derivatives and developer
  findings are new records with truthful content/parent identity.
- Preserve Unknown/Unsupported/Stale and evidence kinds; same build hash is not
  evidence of an execution, a causal join, authorship or successful fix.
- Same 1 MiB public report; 8 local reports / 2 MiB / 7 days unless a later task
  explicitly changes and verifies those constraints.
- Title160, actual/expected/question1024 each; up to8 steps of512; up to8 developer
  findings of4096. Reject over-limit input; never silently truncate an expectation.
- Existing `[data-sp-ui]` visual base, 440/390px, readable shared type, keyboard,
  zoom/reduced motion. No token redesign or simulated production capabilities.
- No public publication/push, other repository, SDK, cloud account or external send.
- User deadline 2026-10-20T04:00:00Z: finish bounded work/verification/local commit;
  leave later steps explicit rather than claim the whole U03 prematurely complete.
  That timebox ended; Continue resumed one storage increment. The later explicit
  autonomous request runs bounded cycles until 2026-10-20T14:00:00Z (18 Mauritius),
  without re-opening completed work.

## Review Focus

- A supposedly excluded value can survive inside a nested v1 fragment or raw JSON:
  task2 asserts exact bytes, not merely hidden preview controls.
- Expected/window information absent in v1 must stay absent: tasks1/2 pin missing
  fields, never infer from old notes/capturedAt.
- A pending save/hash can race newer form input or parent revision: task1 pins
  immutable freeze and expected revision; task3 pins stale UI responses.
- A note or same-named/wrong-build source can be shown as verified evidence:
  tasks1/3/4 keep developer note and hash relation distinct from evidence kind.
- Hostile/duplicate/oversized imports can act on the host or overwrite history:
  tasks2/4 assert inert validation, no fetch/actions and conflict handling.

---

### Task 1: U03.1 unimported handoff draft/baseline actor

**Files:** Create `core/handoff-draft.mjs`, `tests/handoff-draft.test.mjs`;
record `docs/completion/24-u03-handoff-progress.md` and task index.
**Consumes:** strict `parseDiagnostic(raw)` version1 string, reporter-owned plain
fields and host clock; no app object, Chrome API, storage or live privileges.
**Produces:** async `createHandoffDraft(raw, fields, {now})` returning an actor:
`read()`, `update(patch,{expectedRevision})`, `freeze({expectedRevision})`,
`appendFinding({text,build},{expectedRevision})`. Every operation returns a detached
read-only snapshot. Construction hashes the original raw source asynchronously; after that only
`freeze`/`appendFinding` mutations await hashing. `read`/`update` are synchronous.

Internal snapshots are explicitly `stateatom.handoff-draft` version1, **not the
public diagnostic-v2 format and not exportable handoff acceptance**. The source
reference retains exact raw-byte SHA256, UUID, selected property, captured time,
build hash and recorded freshness. No original source/body/notes/URL/selector or
text value is copied. A selected disabled boolean may be retained; text value is
explicitly omitted. Reporter fields come only from explicit input; empty expected
and all observation-window state remain not-supplied/not-recorded. No P04 collector
or old timestamp can invent a window. The original v1 string remains unchanged.

On freeze, lock form updates synchronously before hashing; hash deterministic
internal baseline data, retain baseline/source identity and never export grant,
lease, executable operation or authority. Frozen data is immutable. Findings append
as Developer note only, retaining baseline and previous entries, monotonic revision,
parent-content digest and exact build-hash relation (`same-hash`, `different-hash`,
`unknown`). Hashes do not upgrade evidence. Every async commit rechecks its expected
revision; concurrent stale append cannot overwrite a later finding. Reject arbitrary
fields, accessors, dangerous keys, bad build hashes and bounds. All external objects
are inspected as own data descriptors; no getter or expression is evaluated.

- [x] RED tests missing module/API; original valid v1 control and text/disabled
  variants; raw legacy secrets never copied; expected/window absent stay explicit.
- [x] RED/GREEN update/invalid/stale revision, detached snapshots, no getter reads,
  limits, sync freeze lock, immutable original/baseline, two competing appends,
  same/different/missing build, parent digest and max8 findings.
- [x] Focused and full existing source suite; preserve original failing controls.
  Verify issued `.20261020.9` source/payload inputs unchanged by this **unimported**
  module; no repack/native rerun justified if executable inputs do not change.
- [x] Local bounded commit; mark only Task1 complete, U03 remains in progress.

### Task 2: U03.2 explicit v2 record, privacy and compatible local storage

**Files:** new `core/handoff-report.mjs`, corresponding tests; narrow updates to
`core/diagnostic.mjs` dispatch/storage helpers and Atom runtime/types as needed.
**Bounded execution slices:** U03.2a is the unimported `minimal-snapshot/1` codec
specified in `docs/features/handoff-minimal-format.md`, with no v1/parser/runtime
importer changes. U03.2b supplies rich per-category privacy and compatible storage.
Task2 is not complete until both meet its original acceptance. This split avoids
claiming a minimal data codec completes the user journey.
U03.2b.1 now isolates the unimported exact-byte storage controller, specified in
`docs/features/handoff-local-store.md`; 35 focused/full1183 pass with unchanged
issued `.12` inputs. U03.2b.2 browser storage/UI integration and rich privacy stay
open. This model does not complete Task2 or installed v2 persistence.
U03.2b.2a now installs the backend on `.14` (full1199/focused95/native storage15,
existing minimal UI13/Settings lifecycle15/types2/admission7). Same-key private
storage2 keeps compact legacy and exact raw files; old public records stay v1.
U03.2b.2b now verifies actual reviewed Save/reopen/import UI on `.17`
(full1227/controllers59/native UI25/storage15/Settings15/default40/legacy6/types2/
admission7). Rich category/field/per-note review is next U03.2b.3; Task2 stays open.

U03.2b.3a now isolates the unimported saved-v1 content projection, specified in
`docs/features/handoff-content-review.md`: source29/full1256 pass, `.17` executable
producer/archive/installed hosts unchanged. This is not a public rich codec,
per-note derivative or installed review. Next U03.2b.3b pins that public format;
remaining full Task2 acceptance is unchanged.

U03.2b.3b now supplies the unimported explicit `reviewed-snapshot/1` codec and
per-note/category/field privacy derivatives: reviewed30/focused94/full1286 pass,
exact `.17` source/archive/installed hosts unchanged. Contract:
`docs/features/handoff-reviewed-format.md`. Next U03.2b.3c integrates all file
consumers and readable review together; no H05 enrichment or whole-Task2 credit.

U03.2b.3c.1 now installs explicit reviewed-profile passive reading/import/storage
and notes on `.18`: full1300/targeted78/native45/storage15/Settings15/default40/
legacy6/types2/admission7 pass. Rich fixtures are synthetic passive-file controls,
not normal reporter creation/H05 enrichment. Next3c.2 adds actual category/field/
per-note controls. Contract: `docs/features/handoff-reviewed-integration.md`.

**Consumes:** Task1 frozen baseline and exact original diagnostic, explicit review
choices. **Produces:** validated historical v2 record/serializer/derivative and
version-aware local storage without changing old record interpretation.

- [x] Pin concrete v2 field layout before implementation, mapping U06 logical
  fields and every retained v1 fragment; no placeholder selected value for omission.
- [ ] RED/GREEN v1 compatibility, per-category/field omission, broken joins,
  exact downloaded bytes, source-map import not consent, notes/paths/values,
  old-schema explicit derivative, budget/duplicate conflict and immutable lineage.
- [ ] Keep exact parent bytes/digest distinct from trust and missing-parent status;
  incompatible/malformed versions reject visibly, no actions/network on parse.
- [ ] Verify affected full/contracts/types and fresh immutable package/native
  boundary if imported. Local commit; do not claim H01 real two-role UI yet.

- [x] U03.2a minimal source profile: codec35/full1131, exact .9 unchanged;
  original source RED retained. No runtime/reader/storage or whole-Task2 completion.
- [ ] U03.2b rich per-category/per-note review, source/response inclusion and
  compatible persisted v1/v2 records; original full Task2 acceptance remains open.

### Task 3: U03.3 reporter UI and passive recipient/revision UI

**Files:** `packages/atom/src/ui.mjs`, `template.mjs`, `atom.css`, focused new
handoff UI module if warranted; `browser-extension/reader.mjs`/HTML/CSS and tests.
**Bounded 3a dependency ruling:** the minimal profile UI may consume Task2a and
existing saved v1 originals before Task2b. It does not silently save v2, expose
unsupported technical inclusion, or complete full Task3/U03/C07. Full 3b still
consumes Task2b storage/rich privacy. Every source/native claim names this boundary.

**Consumes:** Task2 record/privacy/storage interfaces. **Produces:** existing
selected workspace's Prepare issue, structured discrepancy, snapshot-only window,
readable per-category review/download and passive recipient first view/addition.

- [ ] Map supplied reference/control structure and necessary deviations before UI.
- [ ] RED/GREEN field validation, no source/expired window, stale replies,
  preview invalidation, Cancel/no download, original remains intact, no privilege
  adoption, wrong build/unjoined note and keyboard/narrow/zoom/reduced motion.
- [ ] Keep exact JSON advanced; no source/IDE/model required. Window controls
  accurately unavailable until P04; never add a fake recording/collector.
- [ ] Every visual change changelog + supplied-reference/rendered comparison;
  fresh current package/types and actual both-host UI checks. Local commit.

- [x] U03.3a minimal saved-v1 preparation/passive-reader workflow: .12,
  full1148/target41/native13/Settings15/default40/legacy6/types2/admission7;
  source/native failures retained. Parent Task3 stays open.
- [ ] U03.3b consumes rich privacy/storage from Task2b and completes the remaining
  full reporter/recipient/zoom/build-enrichment acceptance; no whole-U03 claim.

### Task 4: U03.4 actual H01–H06 two-role acceptance

**Files:** real integration driver using existing harness/native-browser/receipts,
synthetic shareable fixtures and U03 execution record/index.
**Consumes:** Task3 actual UI. **Produces:** exact packed reporter download →
separate clean recipient → added revision → reopen/original comparison.

- [ ] Prove actual U05 selection and normal reporter controls, explicit download,
  app/inspector closed, no-source recipient first view, privacy and old v1.
- [ ] Hostile/oversized/duplicate/wrong-build/stale/omitted variants; real bytes,
  no linked-resource network, action, permission or Capture side effects.
- [ ] Repeat affected maps/Actions/U02/F05 boundaries without relabelling old
  majority, legacy or prototype results. H07–H09 remain separate P04 work.
- [ ] Current exact package/host/source receipts, full/contracts/types, local commit.

### Task 5: U03 final bounded review and acceptance

- [ ] ONE fresh whole-U03 review; regrade all findings/declined judgments, one
  tested Critical/Important fix pass; ledger Minor, no re-review loop.
- [ ] Complete U03 only with real H01–H06 and current bindings. Preserve P04,
  A05/L02 and broader completion gates. One next dependency-ready item, local commit.


### Current bounded checkpoint — U03.2b.3c.2

Normal reporter category/field and recipient per-note privacy controls now run on
immutable .19, full1323/focused103/native33/storage15/Settings15/default40/legacy6/
types2/admission7. Working contract: `docs/features/handoff-review-controls.md`;
exact receipt: `.artifacts/u03/review-controls/verification19.json`. Old .18 request
callback arrays are explicitly not HTTP proof; .19 inspector CDP observation has a
positive reader.js reload control. Task2/3 remain open, no BASE/task-done reset.
Next bounded U03.2b.3d checks only source-status fidelity in legacy projection;
actual H05 matched-source/build enrichment and saved U02 outcomes follow separately.
Whole U03 Task5 review still occurs once at its full acceptance boundary.


U03.2b.3d now guards legacy non-Code-linked source creation and offers explicit
simple fallback with persistent explanation. Final .21 full1335/focused100/native41/
storage15/types2/admission7; .20 intermediate and all failures remain separate.
Authority/UI CSS source identity retains historical19 Settings/default/legacy
results without rerun or freshness upgrade. Task2/3 stay OPEN. Next U03.2b.4a pins
an actual H05 source/build evidence attachment contract and unimported model before
new runtime/UI integration. No evidence threshold or old format is relaxed.

### Bounded U03.2b.4a: unimported local source evidence comparison

Working contract `docs/features/handoff-source-evidence.md`; add only
`core/handoff-source-evidence.mjs` and `tests/handoff-source-evidence.test.mjs`.
Keep old profiles/runtime unchanged. Existing identity.build is collected-source
sample hash, not whole-app build attestation. No public attachment/H05 completion.

- [x] RED exact real-file path/digest/build matching, mismatched/missing/name-only,
  stale/ambiguous/omitted anchors and minimal unjoined controls.
- [x] RED/GREEN snapshot-before-await, strict own data/bounds/no getter or source
  execution; frozen output without source bytes/raw clones.
- [x] Focused/full checks, unchanged issued .21 source/archive/entire hosts;
  retain original RED and one bounded local commit.
- [ ] Next separate public versioned attachment/recipient review integration and
  actual H05 native acceptance; no task-done2/3 or whole-U03 claim from model.

Source-only4a final26/full1361; exact .21 unchanged, no installed/native H05 claim.
Next4b public versioned attachment and parent/consent semantics before UI wiring.

### Bounded U03.2b.4b.1: unimported public source attachment append/parse

Contract `docs/features/handoff-source-attachment.md`. Add only new codec/tests,
plus a narrow shared validated-anchor helper in the unimported4a model if needed.
No dispatcher/runtime changes or repack. New explicit profile source-evidence/1
retains a strict baseProfile view; packets bind Developer note and exact parent.

- [x] RED/GREEN real-file computed attachment, explicit includeFiles/default none,
  same/different/missing/name-only/stale/omitted controls, no hidden source bytes.
- [x] Strict root/packet/reference/file types, sizes, kinds and deterministic
  reasons; integrity versus rehashed-untrusted data stays explicit.
- [x] Exact parent/raw whitespace, baseline/prior-note/prior-packet immutability,
  new-note association, stale/concurrent children and note-only preservation.
- [x] Snapshot mutable finding/review/files before await; no getter/expression or
  linked-resource/app/permission effects. Focused/full plus unchanged .21 binding.
- [x] Local bounded commit; next4b.2 privacy before installed4c/nativeH05. Parent
  Task2/3 and whole U03 remain OPEN.

4b.1 source append/parse complete only: public26/focused52/full1387, exact .21
unchanged. Next4b.2 monotone packet/file privacy before installed4c/nativeH05.

### Bounded U03.2b.4b.2: unimported source-attachment privacy derivatives

Contract continuation `docs/features/handoff-source-attachment.md`; narrow updates
only to that codec/tests. No dispatcher/UI/repack. Keep strict base codec semantics;
minimal copy requires explicit omission of all notes, normal rich supports per-note.

- [x] RED/GREEN per-note/packet/file omission, actual removed bytes, cumulative
  counts, original/prior retained entries immutable and no restore through parent.
- [x] Drop packet file data when source category/path/digest anchors are removed,
  including unjoined/missing-digest same-path cases; preserve unrelated packets.
- [x] Exact parent/root privacy identity and historical packet baseline references;
  append-after-privacy and privacy-after-append, old minimal explicit all-notes limit.
- [x] Own choices/clock/file lists snapshot before await, getter/refusal/budgets/
  overflow/inert controls; focused/full plus exact unchanged .21 executable binding.
- [x] Local bounded commit, then installed4c actual recipient controls/native H05.
  Parent Task2/3/whole U03 remain OPEN.

4b.2 source privacy complete only: privacy23/focused75/full1410, exact .21
unchanged. Next4c.1 explicit passive dispatcher/read/storage +focused old reviewed
omission-counter guard before new package;4c.2 normal source-file UI/nativeH05.
