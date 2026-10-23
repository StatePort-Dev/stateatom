# V02.4 coalesce native observation publication

> **For agentic workers:** use superpowers:executing-plans inline; ONE fresh-context whole bounded-parent review after qualification. No per-test reviewers.

**Goal:** reproduce per-event concurrent storage/notification amplification, then reduce only that publication work while retaining every event, exact owner/window and existing invalidation rules.

**Architecture:** normalization and syncObservation remain synchronous for every native event. Each private observation owner lazily owns a constant-state publisher: one current persistence flight plus a dirty bit, no event/snapshot queue or timer. Events during an outstanding write cause a current-state follow-up and one notification after the final successful save. Original global persist() late-write repair and all direct Start/Read/Stop/Clear/revoke/lifecycle writes stay independent. Notifications retain the original exact tab and scope; no cross-tab broadcast or suppression of foreign/forgotten invalidation. Retired publishers can only save the current global bounded state and carry no authority to reattach or restore an old window.

**Tech Stack:** existing Node source runtime tests, native Chrome packed hosts and unchanged V02.1 workload; no dependency, UI layout, wire/public API or storage schema change.

**Spec:** docs/completion/02-release-scope.md scope-review-1, docs/completion/09-validation-and-release.md V02; current62 record103, review accepted8bc7c56. Three current performance misses stay open. No cause of all tails is assumed.

## Global constraints

- Current main/local commits authorized; no SDK, new redesign, publication or other repository.
- Basic p95≤1000ms; active/off median degradation≤10%; all original tails/order/counts/20GET work retained. No waiver or denominator swap.
- Source/harness/package/native evidence remain separate; independent human is not a blocker.
- Do not globally serialize persist: cleanup/new authority writes cannot wait behind a delayed old publication. Existing late-write repair remains.
- No dropped records, changed event clock/limits/gaps, new debounce interval, production grant change or metadata-as-causality claim.

## Task1 — reproduce and bound publication

**Files:** modify packages/atom/src/runtime.mjs; create packages/atom/src/observation-publisher.mjs and tests/atom/observation-publisher.test.mjs; extend tests/atom/production-observation-runtime.test.mjs; candidate metadata/changelog/lockfile.
**Interfaces:** consumes persist():Promise<void> and notify():void (runtime wrapper already handles async Chrome errors); produces internal createObservationPublisher({persist,notify}):()=>Promise<void>. No public export/type contract.

- [ ] RED integrated original runtime: gate session writes after Start; emit20 complete native requests; assert one publication in flight, all20 records/zero gaps preserved, at most one current-state follow-up and one settled notice. Observe old write/notice counts, not timing-only assertions. Expected old implementation fails with60 in-flight submissions.
- [ ] RED helper controls: same flight for burst, exactly one latest follow-up, new mark during notice/settlement not lost, failure without unbounded retry, failure plus later dirty request can retry, independent publisher routing. Expected missing implementation failures, followed by meaningful behavioral failures if needed.
- [ ] GREEN minimal constant-state owner publisher; replace only collectObservation event publication. Ordinary direct calls and timer unchanged. No snapshot captured by publisher.
- [ ] Integrated controls: delayed old publication cannot block Stop/Clear/new Start or permission removal; releasing it cannot resurrect old private/window state; two owned tabs route notices correctly; context closure still immediate; existing unowned/foreign UI notice invalidation test retained unchanged. Full focused observation/UI/privacy/runtime checks. Expected PASS.
- [ ] New candidate63 identity/changelog/lockfile, syntax/diff and local source commit. If qualification needs a correction, mint a later identity rather than rebuilding issued bytes.

## Task2 — qualify unchanged workload and accept finite scope

**Files:** numbered completion104, task-index/status/root roadmap; ignored raw evidence and ledger.
**Interfaces:** exact candidate63 handoff/new immutable source/build hashes, independent installed pair and both host manifests; same native measurement protocol/targets as101 and103.

- [ ] Freeze all Git-listed source/build inputs before full suite and native execution; full source suite, pack:atom, packed types and9 admission controls. Expected all PASS, no skipped failures; preserve RED logs.
- [ ] Actual both-host native H09 reporter/control lifecycle and unchanged basic-observer-performance-native workload on exact63. Expected completed evidence, not assumed performance PASS. Raw198 samples/66 complete zero-gap windows, all tails retained; keep every target miss open. Only further changed-area native checks for a concrete uncovered boundary, no broad P04 repeat.
- [ ] Verify before/after source/build/archive/install/host identities; recompute raw distributions and event invariants. No fresh credit for historical62 identity/source paths. Record package size and current resource context separately from subsystem attribution.
- [ ] ONE fresh-context whole-parent review, one test-backed material correction pass at most; explicit executor rulings for declined boundaries; commit finite acceptance and name ONE next unfinished item.19/29 stays until actual whole V02 acceptance.

## Review Focus

- Stop/Clear/revoke can finish while old storage is delayed; a late write repairs only current global state.
- A dirty request at flight settlement or persistence failure is not silently lost; no automatic infinite retries.
- Events still normalize synchronously and none disappear; metadata-only notice coalescing is not event coalescing.
- Old/foreign notices keep the conservative UI invalidation behavior, and tab routing never becomes a broadcast.
- Per-owner publisher retains constant state/no historical payload queue; retired async work owns no current window/authority. No global cleanup queue is introduced.
