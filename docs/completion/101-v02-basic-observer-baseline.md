# V02.1 — preregistered Basic/observation baseline; targets missed

2026-10-23, approved scope-review-1. The finite measurement work completed on
unchanged Atom `0.1.0-candidate.20261021.60` / UI `0.2.0-candidate.20261018.2`.
**This workload misses both approved targets on both hosts. V02 remains open,
19/29 whole tasks (~66% equal count), no performance waiver or release claim.**
ONE fresh-context whole-slice review found one Important harness-validation gap;
the single corrective pass is complete, with2385/2385 full source checks PASS.
The finite measurement/reporting slice is complete; neither target is waived.

## Protocol and actual operation

The [protocol/inline plan](../superpowers/plans/2026-10-23-v02-basic-observer.md)
was committed before measurements (`6a55632`), with driver-only corrections
`8357524` and `ba5094e` before the complete attempt. No product/UI/build-source
change or new dependency. No dedicated performance command existed; the new,
explicit direct command is:

```sh
node tests/integration/basic-observer-performance-native.mjs \
  .artifacts/atom/2026-10-23T07-59-52-553Z/atom-handoff.json
```

The direct command's exit0 means the measurement completed, **not target PASS**;
its result explicitly says `targetsMet:false`. It is not a release/CI gate.

Actual Chrome `153.0.8010.12`, Linux6.8.0-146-generic/x64, AMD Ryzen5 5600H,
12 logical CPUs,33498587136 bytes total RAM. Isolated headed Chrome profiles and
owned nested X11 display; Browser plugin unavailable. Actual native private-root
import and site Allow, no TLS bypass/preapproval, app-target CDP, production edit
grant or cloud/model/API call. Standalone and packed embedding consume the exact
old archives/installed host files. No other repository or user process changed.

The app's original trusted-click handler makes20 sequential no-store HTTPS GETs,
1024 ASCII bytes each, updates a visible counter after every response and waits
two app animation frames. Its own clock measures handler entry to those frames.
Identical trusted native X11 clicks in all modes; fixed100ms ISOLATED DOM JSON
readback, no invoked app functions. Counter/request/byte/trusted/action identities
are checked. Both inspector and app remain present in all modes:

- Off: Atom detached.
- Basic: attached read-only, selected `#run` text snapshot.
- Active: same Basic plus an explicitly started owned bounded P04 window, one
  sampled selected-state read, Continue during workload, reopen/Stop/Delete after.

Per host: three fixed warmup blocks (nine workloads), then six balanced mode
permutations repeated five times (30 measured blocks,90 workloads). All198 raw
samples retained across two hosts:180 measured,18 fixed warmup. No result-driven
warmup, trimming, retry deletion, workload change or sample reduction.
Basic UI timing separately uses the actual manual CSS lookup pointerdown through
useful `#run` text + OK + two inspector frames;30 measured observations per host.
This is an existing-page manual lookup route, not picker/installation/full corpus.

## Actual results

All times milliseconds; p95 uses nearest rank. Primary overhead uses the ratio of
mode medians, as preregistered. Paired-block ratios and their tails are also raw
and summarized; they are not silently substituted for the primary metric.

| Metric | Standalone | Embedding | Approved target |
| --- | ---: | ---: | --- |
| Basic lookup p50 / p95 / max |673.05 /1015 /1750|799 /1553.1 /1632.7|p95≤1000; **miss / miss**|
| Off workload p50 / p95 / max |59.1 /81.3 /102.9|63.5 /131.1 /165.2|reference|
| Basic workload p50 / p95 / max |72.35 /109.7 /158.2|75.35 /148.8 /197.5|separate mode|
| Active workload p50 / p95 / max |75.1 /90.4 /98.3|81.85 /170.1 /174.8|separate mode|
| Active / Off median degradation |27.0728%|28.8976%|≤10%; **miss / miss**|
| Basic / Off median degradation |22.4196%|18.6614%|diagnostic comparison|
| Active / Basic median degradation |3.8010%|8.6264%|diagnostic comparison, **not target waiver**|

All66 active windows (including warmups) stopped by explicit user operation,
20 completed requests + one checkpoint =21 records, no truncation/limit stop.
Measured metadata buffers: standalone median8482/max8505 UTF-8 JSON bytes;
embedding median8476/max8505, within64KiB. Start/end snapshots retained separately.
Default private content remains omitted. No browser-RAM-to-subsystem attribution.
0 inspector exceptions and0 console warnings/errors. Shared-host CPU/load and
memory snapshots are raw environmental context, not a proven failure cause.
The successful run ended normally; no whole source/native P04 rerun was needed
for an unchanged product.

Evidence directory:
`.artifacts/v02/basic-observer/2026-10-23T08-54-06-578Z/`.
`preregistration.json` was written before browser launch and hashed in
`results.json`; `samples.jsonl`, `workloads.jsonl`, `windows.jsonl`,
`attempts.jsonl`, `native.log` preserve raw operation/timing. `verification.json`
recomputes every summary from all198 raw rows and checks candidate archives,
installed pair/both host manifests and all334 before/after/current input hashes
at that original verification checkpoint. The later review correction changes
three harness/test files explicitly, as recorded below; the original receipt is
retained with its original time and identities.
The product manifest has268 inputs; the measurement adds its exact protocol,
plan, driver/tests/helpers and build inputs. No old P04 result becomes a timing.

## Retained failures and source checks

- `2026-10-23T08-51-32-993Z`: INCOMPLETE before first workload,0 samples. Exact
  X11-window title lookup failed; the actual title is later confirmed as
  `V02 fixed workload - Google Chrome for Testing`. Established substring lookup
  with bounded wait fixed only the driver.
- `2026-10-23T08-52-31-347Z`: INCOMPLETE during first active-window cleanup,
  three warmup workloads/two finalized samples,0 measured samples. The driver
  incorrectly expected Clear to remove its state; the existing contract retains
  a deleted tombstone. Corrected to require deleted/null window+identity/empty
  records. The original warmup1 latency1346.7ms remains recorded/excluded only by
  the fixed warmup label. This was no product defect or threshold waiver.
- Statistics tests were RED for missing implementation then GREEN5. Incomplete,
  duplicate, nonfinite, untrusted, changed-workload, changed-order, wrong-host and
  truncated-window rows cannot establish acceptance; valid outliers are retained.
  Protocol + existing observation-runtime contract checks37/37 PASS (0 skipped),
  syntax and `git diff --check` PASS. Logs retained beside the raw run.

## ONE whole-slice review and correction

Fresh read-only reviewer `/root/v02_baseline_review`, range `efa7be6…3604d69`:
Critical0, Important1(P2), Minor0. Independent5 tests,198 raw summaries,334 original
inputs and exact archives/installed hosts checked. No new native run or second
review. The actual66 windows independently have zero gaps.

Important finding: recording `window.gaps` without rejecting missing/malformed/
nonzero values could admit a dropped response phase while20 completed requests
and21 records still match. Control with `future=1` incorrectly passed. The
regression was RED (missing exception), then GREEN6 after sharing strict
`assertPerformanceWindow` between summarizer and native pre-cleanup validation.
All nine exact gap keys are required and must be numeric zero. Metadata is saved
before validation, so a rejected trial remains reviewable. Full `npm test` after
this ONE corrective pass:2385/2385 PASS,0fail/skip/cancel,84077.3009ms; syntax and
`git diff --check` PASS. This is current source evidence, not fresh installed
product or performance evidence.

Original driver/helper/tests are retained beside their recorded hashes. The
separate `review/verification-reviewed.json` explicitly records the three changed
harness/test inputs,331 unchanged current measurement inputs,268 unchanged product
inputs plus every build input. All198 original rows/66 windows revalidate with
the stricter code and reproduce exactly the original serialized summaries and
target misses. No unchanged native workload was repeated; the original334-input
preregistration and native source identities remain historical, not silently
rewritten as a run of the corrected harness. Full/RED/GREEN logs and the retained
review/rulings report reside in `review/` beside the baseline.

Executor rulings on reviewer boundaries: full V02 lifecycle/modes/corpus stay
open; other apps/browsers/hardware/routes are unmeasured; causality and remedies
belong to controlled V02.2 diagnosis; human usability/visual fidelity are unclaimed
and a human is no blocker; public release readiness/publication is outside scope.
Misreading those boundaries would create false full/portable/usability/release
acceptance or justify an unproven product change. No deferred minor finding.

## Active dependencies and next bounded step

V02 is in progress. F01/F02 base controls and bounded P04 are complete. Full V02
still needs the remaining mode/lifecycle/corpus acceptance and its F05/U02/U05/
A05/L02 completed-baseline dependencies; mandatory useful L02 remains open, A05
mandatory/scoped complete. A02 and official integration/release gates remain open.
An independent human is not a blocker; SDK/publication/another repository are out
of this execution scope.

Next ONE step: **V02.2 bounded diagnosis of Basic latency and the transport/event
cost already present with Basic**, preserving this exact baseline and the fixed
workload. The active/Basic comparison suggests the whole active/off cost cannot
be attributed to the P04 collector alone; it is not causal proof of the source.
Preregister any controlled domain/phase comparison before running it. Fix only a
proven bounded defect, qualify a new candidate for product changes, and rerun the
same protocol. Neither a changed denominator nor a slower workload closes these
misses. No blind optimization/full-project reaudit or automatic threshold waiver.
