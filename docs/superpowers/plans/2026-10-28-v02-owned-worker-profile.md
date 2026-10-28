# V02.34 Owned Worker Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Identify sampled current extension-worker call paths during a finite owned network/observer workload, without rerunning the original acceptance gate.

**Architecture:** Exact official88/UI2/Google156, fresh owned profile and local HTTP synthetic fixture. Reuse the unchanged original20GET×1024B workload and trusted X11 actor, but never compute original overhead/latency acceptance from this diagnostic. Profile ONLY the extension's existing service-worker target through existing `extensionWorkerSession()`; no app debugger session, code wrapper, API override or product mutation.

**Tech Stack:** Existing owned native Google/desktop/UI helpers, CDP Profiler, Node source tests. Context7 primary Profiler/Target docs retrieved; installed Playwright protocol declarations confirm start/stop/Profile fields. Actual worker support remains to be observed, not inferred from docs.

**Spec:** [269 bounded diagnostic](../../completion/269-v02-active-overhead-diagnostic.md), unchanged [V02 acceptance](../../completion/09-validation-and-release.md).

## Global Constraints

- ONE diagnostic collection, exact10segments: alternating Basic/Active five times, no warmup/adaptive length/retry.20GET×1024B/trial,200total; same original app script/HTML. HTTP localhost is an explicit different diagnostic transport, not the original HTTPS gate.
- Worker-only sampling interval1000microseconds, explicit enable→setSamplingInterval before ten start/stop pairs→disable. No precise coverage, app Profiler/Debugger/session or global tracing.
- Bind own worker target/context/compiled service-worker.js SHA and disable its Debugger before app activity. Worker profiled/held alive is an observation perturbation; no renderer/browser-wide cost, critical-path/causal speedup/floor/statistical claim.
- Active windows use existing reporter Start/checkpoint/Continue and Stop/Clear. Require original20requests/completed/1checkpoint/21records/zero-gaps bounds, but do not run old full readers or original198-row workload/gates.
- Profile graphs/samples/timeDeltas retained. Missing/refused/malformed/low-source samples retain their literal diagnostic limitation; no second collection. No script bodies from app targets.
- Actual command/PID/target/window/source/raw/profiler-stop/closure/inputs recorded. No zero-error/global cleanup claim from a scoped inspector/worker journal alone.
- Profile readback per segment≤5000ms, all CDP commands retain20s helper deadlines; setup/UI/cooperative whole collection300000ms. No universal hard wall-clock guarantee. Partial profiles/errors and owned cleanup survive failure.
- Old87measurement/FIRSTreader budgets remain0, original10%target MISS unchanged. No TLS/certificate/trust/model/personal profile/SDK/publication/host edit.

## Review Focus

- Worker sampler must not connect to an application target or broaden the Atom lease.
- Native sampled function names are code-linked metadata, never exact invocation counts or native thread CPU percentages.
- Inclusive ancestor sample counts overlap and must never be summed as independent elapsed work.
- Profiler stop/disable/session cleanup errors retain partial raw and do not become a successful diagnostic.
- Sparse/empty/foreign samples and missing20request windows cannot become identified hot paths or an accepted performance target.

### Task1: Pure CPU profile reader and source controls

**Files:** Create `tests/helpers/owned-worker-cpu-profile.mjs`, `tests/owned-worker-cpu-profile.test.mjs`.
**Interfaces:** `workerProfileProtocol()` fixed values above; `summarizeWorkerProfile(profile,workerURL)` validates finite V8 graph/sample/timeDeltas and returns exact self/inclusive sample counts by frame plus idle/unknown categories, without performance acceptance. Synthetic profiles stay source fixtures.

- [ ] RED tests: independently literal tiny tree/sample counts, inclusive overlap, duplicate/missing/cyclic IDs, malformed/negative deltas, empty/foreign source qualification and native CLI early refusal. Run `node --test tests/owned-worker-cpu-profile.test.mjs`; expected absenthelper/driver failures.
- [ ] Implement minimal pure reader and driver admissions. GREEN same tests, plus existing performance-protocol tests; no production/source API change.

### Task2: Freeze exact one native diagnostic

**Files:** Create `tests/integration/owned-worker-profile.mjs`, `docs/testing/owned-worker-profile-case.json`; local artifacts `.artifacts/v02/owned-worker-profile/2026-10-28/`.
**Interfaces:** exact `--case ... --case-sha64hex --revision40hex`, clean exact source/host, case inGit and frozeninputs before exclusiveattempt. Raw row records workload/trusted/app counters/server query order, source/window identities and relative `.cpuprofile` hash. Separate one saved verifier binds exit0/signalnull/source/case/raw/profiles and preservation.

- [ ] Register current source/artifacts/closed original and model evidence/old diagnostics before source changes. No model-profile read/write or old diagnostic execution.
- [ ] Reuse existing original workload exports/native actor and reporter flow on current official UI. Headful fresh owned Google profile, test-only loadUnpacked; prove exact compiled worker on its own target and UI on its own page. No normal-install claim.
- [ ] Fixed ten segments; profiler starts after mode/window setup, stops after original trusted workload settles, before reporter teardown. Retain raw profile immediately; stop/disable current profiler independently on failure. Persist partial rows/traffic/errors; close only owned sessions/browser/desktop/server.
- [ ] Source/affected checks, syntax/diff/frozen inputs; clean case/source commit. ONE native invocation then ONE saved verifier. No profile/stopping/window/category variants after results.

### Task3: Final bounded review and source decision

- [ ] ONE final source/saved-profile review, no native/verifier repeat. One tested Important/Critical source correction maximum; Minors deferred. WholeV02review not consumed.
- [ ] Archive own workspace CRC/everybyte/plan identity. Report actual call-path observations and limits; choose at most ONE concrete next source fix only if actual profile plus code supports it. Otherwise record the exact unestablished cause, never invent one. Update269/current routing/local commit; full21/29 unchanged.

User requested autonomous inline task→commit iteration on existing main; no new approval pause. No publication or other-repo implementation is part of this plan. Source-only harness changes do not justify repeating the prior6005 product/source suite by default; run focused meaningful checks and retain inherited full result with its exact revision.
