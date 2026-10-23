# V02.1 Basic and bounded observation measurements

> **For agentic workers:** Use superpowers:executing-plans, inline task execution with ONE fresh-context review of this bounded parent at the end.

**Goal:** obtain reproducible, preregistered actual-browser latency and workload-overhead measurements without changing product behavior or declaring full V02 complete.

**Architecture:** use the existing immutable Atom60/UI pair and headed native browser/HTTPS/admission helpers. A small measurement protocol owns fixed interleaving and statistics; the driver uses actual inspector controls and identical trusted X11 app gestures in all modes. Preserve every attempt and raw sample.

**Tech Stack:** existing Node24 test runner, native Chrome153 MV3, Linux nested X11; existing Chrome scripting only for bounded fixture DOM probes, no parallel app CDP, no app implementation injection.

**Authority:** docs/completion/09-validation-and-release.md V02; scope-review-1; user opted into autonomous task/commit execution. Executor chooses the finite workload below, not a newly approved reference corpus or performance waiver. Stay on main by user instruction. No public/other-repository/SDK changes, UI redesign or fresh broad P04 audit.

## Preregistered protocol (before measurements)

- Exact candidate: `.artifacts/atom/2026-10-23T07-59-52-553Z/atom-handoff.json`, Atom `.60` / UI `.2`. Verify archives/installed hosts and all product/build inputs before and after. No package.json script mutation: it is a recorded build input. Newly declared command: `node tests/integration/basic-observer-performance-native.mjs <exact-handoff>`.
- Both standalone and embedding, isolated profiles and actual native root import/site Allow. No TLS bypass, permission preapproval or fresh app debugger client. Atom grants remain read-only.
- One app page per host. Fixed original click handler: 20 sequential no-store HTTPS GETs, each 1024 ASCII bytes, update a visible counter after every response, then wait two requestAnimationFrames. Timing starts at trusted handler entry and ends after those frames. No artificial server delay. Original app records action/trust, duration, status, request/byte counts in a DOM JSON result. Read only that JSON via ISOLATED scripting after gesture, at 100ms polling in every mode. No fixture function invocation through automation.
- Modes: `off` = Atom detached, inspector still open; `basic` = attached read-only, selected `#run` text snapshot; `active` = same read-only Basic plus explicitly started owned P04 window, sampled checkpoint before workload, Continue during workload, reopen/Stop afterward. Capture start/end metadata/JSON size outside timed work. Delete only this trial's owned window after capture. No Actions/dev observer/Live/model attribution.
- Orders: six permutations of off/basic/active, repeated five times = 30 measured paired blocks per host, 90 measured workloads. Three warmup blocks use the first three permutations, all recorded/excluded by fixed warmup label = nine warmup workloads per host. No adaptive warmup, retry/outlier deletion or sample reduction. Abort leaves INCOMPLETE, raw rows retained; a new attempt has a unique output directory.
- One Basic latency sample per Basic trial, 30 measured + three warmup per host: real manual CSS lookup button pointerdown to rendered `#run` text snapshot, `status=OK`, followed by two inspector animation frames. Programmatic setup/fill before pointerdown excluded. This measures the existing-page manual lookup route, not picker, first installation or full Basic corpus. Record all latency tails; validate selected target/property/value separately.
- Workload distributions: nearest-rank p50/p95/max; retain ordered individual rows. Primary overhead = `100*(median(active duration)/median(off duration)-1)` per host; also report Basic/off, active/Basic, and per-block ratios/tails. Approved <=10% target applied to this workload, no waiver. Basic route p95 <=1000ms. Both are scoped outcomes; full V02 remains open even if passing.
- Record CPU model/core count/total RAM/OS/architecture/browser, available memory/load before/after (no hostname), package/archive sizes, all driver/helper/protocol/source hashes and exact revision/dirty state. No whole-browser memory attribution. Unexpected actions/errors/record limits/stopped-before-end invalidate the run, never count as fast samples.
- Pilot/setup debugging uses unique attempts with the same workload; no tuning after measured results. Fix a proven driver defect with an explicit retained failure and new preregistration identity; product changes need a new candidate. A true threshold miss remains open.

## Task 1: protocol, statistics and actual driver

**Files:** create `tests/helpers/basic-observer-performance.mjs`, `tests/atom/basic-observer-performance.test.mjs`, `tests/integration/basic-observer-performance-native.mjs`.

**Interfaces:** protocol exports fixed mode orders, request/byte/sample counts and `summarizePerformance(rows, host)`; driver writes immutable `preregistration.json`, `samples.jsonl`, source snapshots and final `results.json`.

- [ ] RED: statistics tests reject incomplete/duplicate/error/untrusted/mismatched rows; preserve tail outlier; distinguish fixed warmup from measured rows; p95 nearest rank and median ratio target decisions on fixed data.
- [ ] GREEN: implement protocol/statistics without discarding valid rows or accepting invalid ones. Run `node --test --test-isolation=none tests/atom/basic-observer-performance.test.mjs`.
- [ ] Implement fixed workload and native UI driver. Record preregistration before browser launch, flush each raw trial; monitor exact mode and no editing grant. Driver correctness errors remain distinct from actual target misses.
- [ ] Verify syntax + protocol tests + `git diff --check`; locally commit harness before measured acceptance.

## Task 2: execute exact candidate and report bounded outcomes

**Files:** new numbered V02.1 completion record; update task-index/status/roadmap only to actual states.

- [ ] Run newly declared native command sequentially for both hosts; retain failed/incomplete attempts and all raw rows/source hashes. No repeated full source suite for an unchanged product is required; run relevant harness tests.
- [ ] Inspect raw distributions/mode admission, useful content, request ledger counts and input hashes. Keep misses unresolved. Document command, identities, environment and scope limitations, ONE bounded next step.
- [ ] ONE fresh-context read-only review of whole V02.1 parent against protocol/evidence; rule explicitly on declined-to-judge boundaries. One correction pass if material findings, no review loop.
- [ ] Commit verified results and dependencies locally. Full V02 stays in progress and overall count remains19/29 unless a separate whole item is actually accepted.

## Review Focus

Invalid/incomplete rows cannot produce PASS; active buffer truncation cannot lower overhead; UI timer must start at actual gesture and include completion/render; interleaving/warmups cannot change after results; exact immutable package and source hashes must survive host runs. Tests pin invalid-row and tail handling; actual native run must establish these integration boundaries.
