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
U03.2b.2b actual Save/import/reopen UI remains next, with rich privacy still open.

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
