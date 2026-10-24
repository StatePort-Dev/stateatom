# Native-control restoration availability implementation plan

> **For agentic workers:** REQUIRED superpowers:executing-plans inline; ONE fresh whole-item review after task-done, no implementer/per-task reviewers.

**Goal:** Stop advertising restoration when the ledger already knows it must refuse.
**Architecture:** Share the existing exact restoration ownership predicate between snapshot availability and prepareRestore; keep current backend preflight/error ordering.
**Tech Stack:** Existing Node24 pure JS and controlled DOM tests; no dependency/API changes.
**Spec:** ../specs/2026-10-24-v03-restore-availability-design.md

## Global Constraints

- Main/local/current autonomous instruction through Oct25 evening; whole20/29 unchanged.
- No guard waiver/rebase/epoch reset/auto write/native rerun/new candidate/SDK/otherrepo/publication/profile/trust change.
- Existing labels/styles/tokens/response ledger unchanged; native disabled derives from exact ledger state.
- Original raw/cases/guide FAIL preserved. Changed product source is a declared new revision, not proof against old frozen current-file requirements.
- Availability is current local eligibility, not future capability/target admission or successful app restoration.

## Review Focus

- Same-value external/ABA/missing/replaced/options-changed inputs disable restoration without dropping history.
- New owned edit after an external epoch can undo itself; original baseline remains blocked.
- Unrelated unwritten sibling cannot make an otherwise valid last edit unavailable.
- Pending/closed/tainted/history64 and partial restoration must preserve exact preparation/error semantics.
- Mounted input UI must consume actual ledger flags, not a hand-set boolean, and emit no writer request for a state update.

### Task 1: Exact restoration availability and consumer controls

**Files:** modify core/control-ledger.mjs, tests/control-ledger.test.mjs, tests/atom/control-editor.test.mjs, tests/atom/input-ui.test.mjs, packages/atom/CHANGELOG.md; completion151/current metadata.
**Interfaces:** createControlLedger snapshot retains shape with boolean canUndo/canRestoreBaseline; private restorationEntries(kind) and ownsRestorationEntries(entries) consumed by snapshot and prepareRestore. No new public interface or writer grant.

- [x] Add source regressions: same/ABA/missing/replaced/options changed retain history but both flags false; owned sequence true, pending/tainted/closed/history64 false; unrelated sibling undo true; new owned edit undo true but prior baseline false; partial undo retry true. Editor and actual mounted UI consume ledger changes and no write on refresh. Run `node --test --test-isolation=none tests/control-ledger.test.mjs tests/atom/control-editor.test.mjs tests/atom/input-ui.test.mjs` → watch actual flag assertion RED.
- [x] Implement shared private ownership/entry helpers and exact flags. Preparation preserves guard order and existing errors. Same command → PASS. Append Unreleased consumer changelog, no token/layout change.
- [x] Run `npm test` → all PASS; run retained preliminary probe to a new sealed report without overwriting original, four literal outcomes unchanged and eligibility corrected. Hash all changed/protected files and original raw; document no native/installed/visual acceptance. `git diff --check` → PASS; local scoped commit.
- [ ] task-done with focused three-file command; ONE fresh final review, effect regrade and at most one tested I/C fix pass/no rereview. Record deferred Minors/rulings, archive/hash/remove only own workspace, clean local commit and one next dependency.
