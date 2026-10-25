# Recording Publication Turn Implementation Plan

> REQUIRED superpowers:executing-plans inline; ONE fresh final whole-item reviewer.

**Goal:** Coalesce quickly acknowledged recording saves until the next event-loop task without delaying collection or terminal persistence.
**Architecture:** One private scheduled flight per publisher; synchronous ledger unchanged; persist reads current state, no queued DTOs.
**Tech Stack:** Existing JavaScript/Node test runner, no dependency/API version change.
**Spec:** ../specs/2026-10-26-v02-recording-publication-turn-design.md

## Global Constraints
Currentmain/localcommits; original evidence/thresholds unchanged,20of29/fullV02open.
No native/browser/profile/TLS/certificate/SDK/UI/otherrepo/publication or metrics policy change.
Existing13minor findings deferred. Only publisher and focused source tests change.
No new Live cadence/production grant scope decisions. No source-to-performance claim.

## Review Focus
- Immediate Stop/Clear/revoke/limit writes remain independent while a recording save is queued or delayed, with current-state late-write repair.
- One scheduled callback/flight/dirty flag; no event or snapshot queue and no per-event rejection-handler growth.
- Scheduling/save/notice failures reset the flight; no hidden retry loop or lost dirty/reentrant request.
- Independent owners/tabs preserve routing and cannot block each other.
- Runtime event records/identities/caps/precise timestamps remain exact; no metrics/domain/permission edits or native target claim.

### Task 1: Coalesce recording publication before the first save
**Files:** packages/atom/src/observation-publisher.mjs; tests/atom/observation-publisher.test.mjs; tests/atom/production-observation-runtime.test.mjs; docs/completion/184-v02-recording-publication-turn.md; docs/status.md; docs/completion/task-index.json.
**Interfaces:** Consumes existing persist/notify functions reading current state; produces same publish Promise contract, optional private schedule callback injection for deterministic source tests.
- [ ] task-start/read brief, register old product inputs and changed files.
- [ ] RED deterministic fast-ack/scheduled current-state regression; implement one scheduled first-save callback.
  Expected: old implementation fails batching assertion; corrected publisher passes all unit controls including errors/reentrancy/owners.
- [ ] Add queued-runtime terminal/revoke/new-window regressions and preserve old controls; run focused source suite.
  Expected: exact ledger/terminal current state, no resurrected window, unchanged permissions/native calls.
- [ ] Run full npm test, syntax and diff checks, record bounded source-only evidence and local commit/task-done.
  Expected: all source checks pass, historical native results preserved/unclaimed,20of29/fullV02 unchanged.

## Final Closeout
- [ ] ONE fresh reviewer/grade every finding and declined scope with effect/cost; ONE tested I/C pass, minors deferred/no rereview.
- [ ] Archive only this workspace CRC/bytes/identity, remove only own workspace, clean local commit. Next one bounded exact-candidate qualification task; no native run inside this item.
