# Owned browser process diagnostic implementation plan

> **For agentic workers:** REQUIRED superpowers:executing-plans inline. ONE final fresh read-only review; no implementers/per-task reviewers.

**Goal:** Preserve process facts before refusal and diagnose the owned profile discrepancy in one blank-browser case.
**Architecture:** Separate bounded proc collector/pure admission and finite diagnostic driver; old A02.6 source/cases unchanged.
**Tech Stack:** Existing Node24/Playwright1.63/Chrome153; no upgrade.
**Spec:** ../specs/2026-10-24-owned-process-diagnostic-design.md

## Global Constraints

- Main/local/latestOct25evening/scope-review-1/20of29; fullA02 remains open.
- No old native case rerun, TodoMVC/app/source instrumentation, extension/helper/IDE, GUI/certificate/trust/product/SDK/otherrepo/publication changes.
- ONE new blank diagnostic only after clean frozen source/case; no repeat or admission waiver.
- Only CDP-reported PID and current driver's direct children inspected; no arbitrary process/command-line/profile scan. Never kill a reported PID.
- Missing facts/errors explicit; pure DTO admission is not runtime proof.

## Review Focus

- A refusal/read error must preserve earlier actual facts and permit independent cleanup.
- PID reuse/foreign process must not be promoted into owned browser admission or killed.
- Separate profile-option syntax may be recorded but cannot silently weaken the old exact criterion.
- Diagnostic output must omit unrelated command-line/credential data and survive partial failure.
- Current status must distinguish source IO controls, actual blank Chrome facts and still-unexecuted app questions.

### Task 1: Scoped process facts and one frozen blank diagnostic

**Files:** new experiments/owned-browser-process.mjs and owned-browser-process-run.mjs; new tests/engine/owned-browser-process.test.mjs and owned-browser-process-driver.test.mjs; docs/testing/owned-process-diagnostic-case.json; completion148/current metadata; unique ignored outputs.
**Interfaces:** collectOwnedBrowserProcess(session,{executable,sha256,profile}) -> inert facts/errors including reported process and direct-child observations; admitOwnedBrowserProcess(facts,expected) -> {status,failures}; driver --prepare CASE OUT / --preflight CASE / CASE, no resource on import or unknown args. Save raw facts before admission, context close in finally, no PID kill.

- [x] TDD missing module RED; real owned Node child proc IO plus exact/foreign profile/exe/hash, missing/ambiguous PID/read errors, forbidden flags, separate-token syntax, child/CDP mismatch and finite private-data controls. Implement collector/pure admission without changing old files. Run `node --test --test-isolation=none tests/engine/owned-browser-process.test.mjs` -> PASS.
- [x] TDD finite driver/CLI/refusal persistence/cleanup/hash controls RED→GREEN. Implement clean frozen preparation/strict preflight/exclusive run/save-before-admit/all cleanup with no server/app launch. Affected tests and `npm test` -> PASS, original product/old source/raw hashes unchanged; local source commit.
- [ ] Resource-free prepare/inspect/commit exact case; at most ONE run/poll same handle. Preserve literal refusal/partial. Independent saved input/process/result/cleanup checks and isolated negative controls; no app credit.
- [ ] Relevant final aggregate/local commit/task-done; literal diagnostic only, no app/product credit.

## Final closeout

- [ ] ONE fresh final review; one tested I/C pass maximum/no rereview, explicit rulings/Minors, archive own workspace, clean final checkpoint and one next dependency.
