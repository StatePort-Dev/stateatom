# F05 Production Changes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. No per-task agents; one fresh whole-item reviewer only at final acceptance.

**Goal:** Enable supported production inputs only after two sequential Settings confirmations, with exact bounded live authority and visible revocation.

**Architecture:** One in-memory policy owns private per-view confirmation tickets
and ten-minute tab/origin/native-document grants. Runtime and Chrome platform share
it; the platform and its native command boundary revalidate the same grant. Existing
U02 adapters/evidence remain unchanged; production inspection remains read-only
and legacy cache/reload trials remain denied.

**Tech Stack:** Existing ESM modules, Node test runner, Chrome MV3 and native CDP,
existing Atom UI and supplied shared extension reference. No new dependency.

**Spec:** `docs/features/production-changes.md`

## Global Constraints

- Work on current main after `7da18df`; local commits only, no publication/SDK/other repo.
- New policy: exact tab/origin/native main-frame document; ten minutes after second confirmation; no persistence/adoption.
- Tickets last two minutes total, private client/view binding, distinct risk/scope tickets; no first-step authority.
- Only U02 json-response/dom-control operations; no automatic app request/reload/cache/storage reset on enabling/typing.
- Navigation, owner/permission loss, expiry/revoke and restart/update invalidate; preserve Unknown/Unsupported/Stale and foreign ownership.
- Current runtime production.changes stays unavailable until integration/actual Settings acceptance; inert models cannot prove native support.
- User authorized autonomous task–verification–local commit cycles until 04:00 UTC; do not add repeated skill approval pauses or claim these new choices were earlier approved.
- Retain every historical criterion/result; synthetic/agent UI is labelled separately from human acceptance.

### Task 1: F05.1 inert confirmation and grant policy

**Files:** `packages/atom/src/production-change-policy.mjs`,
`tests/atom/production-change-policy.test.mjs`, contract/plan/execution/index.
**Produces:** Inert two-stage actor, exact target and opaque owner/view binding,
fixed operation kinds, one-use/replay-safe tickets, expiry/revoke/owner close,
bounded records, clock failure and inert-data validation. No runtime importer.

- [x] Read this contract; write failing tests for no grant, first only, second,
  cancel either, target changes, expiry/revoke, forgery/replay and two views.
- [x] Implement minimal policy without Chrome, timers, storage or app writer.
- [x] Focused/full verification, unchanged issued package inputs, local commit.

### Task 2: F05.2 real host and runtime authority

**Files:** platform/runtime/capabilities/transport/public types, guardian command
boundary where needed, new focused platform/runtime models and declared native
permission/authority test. **Consumes:** Task1 actor. **Produces:** same policy at
runtime/host admission, real native document scope, pending cleanup and explicit
read-only reattach, production input observations without legacy instrumentation.

- [x] Define exact host/runtime/transport interfaces from current code; capture
  the conservative lease-renewal and cleanup order before RED.
- [x] RED/GREEN default/first-only/forged scope, post-await expiry/revoke/doc loss,
  old inspector, foreign lease, restart and owned cleanup controls.
- [x] Prove actual browser permission route on disposable local HTTPS; distinguish
  browser permission from Settings grant and do not alter issued artifacts.
- [x] New immutable candidate, source/full/packed/native changed-area proof and
  bounded local commit. Keep feature unavailable to ordinary UI until Task3.

### Task 3: F05.3 Settings and visible revocation

**Files:** Atom-local production Settings component/template/CSS/ui/types,
synthetic controlled-render/native suite and package changelog.
**Consumes:** Task2 enforced operations. **Produces:** supplied-reference-aligned
Settings with two genuinely sequential warnings, exact scope/limits, cancel,
visible status/expiry/revoke and view-lifetime cleanup.

- [x] Record reference/control mappings and necessary narrow adaptation before RED.
- [x] RED/GREEN first-step cannot enable, cancel/no effects, two views/context loss,
  keyboard/narrow/reduced-motion and no automatic app requests/handlers.
- [ ] Fresh immutable candidate and actual both-host HTTPS Live/Draft/Undo/revoke,
  native expiry/interruption controls, default local U02 regression and packed types.
- [ ] Compare rendered first viewport/type/controls with reference; agent candidates
  remain separate from human visual approval. Local commit.

### Task 4: F05.4 bounded acceptance

**Files:** exact result/source/payload receipts, task index/roadmap/status.

- [ ] Verify exact latest packed identity, production matrix and relevant original
  legacy controls without a broad project re-audit.
- [ ] ONE fresh whole-F05 reviewer; regrade findings; ONE tested Critical/Important
  fix pass RED→GREEN + full suite, no re-review. Record declined judgments/rulings.
- [ ] Complete F05 only if real Settings/runtime/host/native gates pass; otherwise
  commit honest bounded progress. Name one next dependency-ready item; continue
  authorized cycles until deadline, without implementing all29 in one work item.
