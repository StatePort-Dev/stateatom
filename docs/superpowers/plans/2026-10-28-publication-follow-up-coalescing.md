# V02.35 Publication Follow-up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Coalesce dirty publication follow-ups while preserving all collector/lifecycle semantics.
**Architecture:** One private helper keeps one flight/dirty bit and schedules every required dispatch through its existing scheduler. Runtime/collector code and direct terminal writes remain unchanged. Test helper invocations and real-runtime storage operations separately.
**Tech Stack:** Existing Node tests and owned virtual publication timer; no dependencies.
**Spec:** [short design](../specs/2026-10-28-publication-follow-up-coalescing-design.md), [270 scope](../../completion/270-v02-publication-follow-up-coalescing.md).

## Global Constraints

- Product edit only `packages/atom/src/observation-publisher.mjs`; existing nominal16ms constant unchanged.
- One flight/dirty bit/queued task; no snapshots/record drops or unconditional retry loops.
- Same Promise identity, errors, reentrant notification, failed scheduling/save recovery, independent owners/disposal/current-state dispatch.
- Runtime epoch retries and independent immediate Stop/Clear/revoke/limit writes unchanged; distinguish actual storage calls from publisher calls.
- Preserve frozen269/oldcases/raw/readers/current88/UI2/full36host assets; declared old publisher copy/Git identity retained. No native/model/gate rerun, other repo/SDK/publication/Live/grant/handoff change.

## Review Focus

- New request during notify or final settlement must never be lost.
- Dirty request during failed save may retry only via scheduled new work; exact quiescent error retained.
- Second scheduling failure must reset flight and preserve a later independent request.
- Runtime storage epoch repair must still restore the newest direct terminal/replacement state before queued older work can resurrect it.
- Fixed interleaving operation counts do not imply native speedup/global storage bound/original10% acceptance.

### Task1: Preserve baseline and reproduce

**Files:** modify tests/atom/observation-publisher.test.mjs, tests/atom/production-observation-runtime.test.mjs; local artifacts `.artifacts/v02/publication-follow-up-source/2026-10-28/`.
**Interfaces:** existing createObservationPublisher signature/constant; existing real runtime fixture with synthetic CDP/storage boundaries. No new production API.

- [ ] Register exact old source/test bytes/269raw/case/reader/archives/current270source327build/88UI2/full36dist before edits.
- [ ] RED: default16ms dirty follow-up stays scheduled/sameflight/lateststate; dirty failed-save scheduling; reentrant notify scheduling; second scheduling failure resets. Add actual runtime fixed four-request storage scenario (expected2writes, old3), keeping records/completions/gaps. Add epoch/directStop replacement control or retain exact existing control with explicit operation accounting. No native timing claim.

### Task2: Minimal source change and checks

**Files:** product publisher only, necessary tests, `packages/atom/CHANGELOG.md`.
- [ ] Replace immediate dirty loop with one scheduled next turn after persistence/notification; keep exact old error semantics and no per-event promise handlers.
- [ ] Run RED tests then affected publisher/runtime/history/UI controls. If old tests fail solely due five-immediate-turn assumption, record original failure and use existing bounded completion helper; do not change counts/semantics/old native evidence.
- [ ] Once stable run `npm test` once. Syntax/diff checks and protected map: only declared publisher source differs; exact old copy/Git hash and other current product/archives/officialdist remain.
- [ ] Local source commit with actual counts. No89package/native acceptance implied.

### Task3: One source review/closeout

- [ ] ONE final bounded source review over this plan range; maxone tested Important/Critical fix, no rereview/native/model. Archive own workspace CRC/everybyte/planidentity then only own workspace removal.
- [ ] Update270/index/status/roadmap with source operation results and limits; one next bounded exact changed-package preparation only after current source stable. Local commit. Full21/29 unchanged; original10% gate remainsMISS.

Autonomous inline execution on existing main is already instructed. Brainstorming design questions are opted out by the user; choices above are executor choices, not invented founder approvals.
