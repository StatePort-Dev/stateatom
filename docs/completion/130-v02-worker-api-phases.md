# V02.11 — own-worker API intervals during input gestures

2026-10-24/main e21f10b/scope-review-1. V02.10 complete, exact71/UI2 unchanged.
Whole20/29 (~69% equal task count), fullV02/V03/C09/A02/L02 and original targets
remain open. [Design](../superpowers/specs/2026-10-24-v02-worker-api-phases-design.md),
[plan](../superpowers/plans/2026-10-24-v02-worker-api-phases.md),
[fixed case](../testing/input-worker-api-phases-case.json).

## Question and change boundary

V02.10 still measured~727–753ms Apply RPC medians on71. V02.2/5/6 did not observe
worker API intervals during these gestures; their connection/domain/workload controls
stay historical. Current source contains repeated native reads and authority checks,
but counts alone prove no timing cause. This finite diagnosis records existing own
worker Chrome API intervals, with original inspector RPCs separately retained.

No product branch, guard/cache/revision/admission/queue change, new package/dependency,
host copy, SDK/API, visual redesign or unapproved parameter. No app-target test CDP,
app code/getter/expression, IDE/certificate/account/other-repository action.
The shared native test helper adds only a zero-argument session accessor bound to
its already observed extension service worker. Arbitrary target input is ignored.
The inspected application remains Atom-owned throughout.

## Source and failure controls

New worker probe wraps nine fixed own-worker Chrome APIs: native debugger commands,
tabs.get, permission checks, scripting, session/local storage get/set and runtime
sendMessage. Native/tab/script operations filter configured tabId via own data
descriptors without invoking accessors; permission/storage/runtime are worker-wide,
not assigned to one request. Only API/method labels, ordinals/times and Boolean
outcomes are retained; no params, payloads, keys/values, token, script body/args,
plan, response or error content. The original Promise/value/error, receiver and
arguments stay exact; no extra request is sent. Callback/non-native-Promise calls
forward unchanged but invalidate the diagnostic, without reading thenable getters.

Fixed2048 API cap/32 inspector RPC cap; pending/reset/restore, partial install
rollback, external replacement, private getters and native method whitelist have
source controls. New summary validates raw clock/row schemas and clips interval
unions, not overlapping sums. Apply acknowledgements remain mandatory; settled
inner API rejections are retained/countable metadata rather than automatically
failed outer Apply. Unknown/null/pending/overflow/unsupported is never accepted.
Intrinsic Promise observation may affect unhandled-rejection reporting; worker
console evidence remains instrumented, without uninstrumented completeness claims.

RED included absent new modules and missing accessor. The first accessor fixture
incorrectly marked the synthetic child already exited; retained as setup error,
then live-child fixture demonstrated missing-function RED→GREEN. Additional
target-getter control actually failed before descriptor filtering; settled-API
rejection control failed before Boolean outcome handling. All retained in
`.superpowers/sdd/2026-10-24-v02-worker-api-phases/`.
Final source47PASS/0skip; full npm test2654PASS/0FAIL/0SKIP. Earlier full2653PASS
predated the last aggregation-rule control and remains separately recorded.
New driver initial case/Git/read errors and independent worker restore/detach,
inspector/browser/display/server finalization:6 actual-source synthetic controls
PASS in `.artifacts/v02/worker-api-phases/2026-10-24/startup-controls*`.
These controls launch no child, browser, display, server or profile.

## Native protocol and interpretation — preregistered, not yet executed

Exact71 `.artifacts/atom/2026-10-24T01-26-15-352Z/atom-handoff.json`, Atom SHA
`caffac193e058c1ed3fa8b280b2edacdca4425b0351e8b9b6bbb673958062663`;
UI2 SHA `2bfc8229a45e02f775bb563f27d9a803d51dd977145f46843c45a884e07289e5`.
No rebuild. Recheck all327 product/build inputs, helper223 and exact archives/installed
hosts; prior packed types2/admission9/backend13/native22 remain original evidence.

Both hosts,3 alternating Live/Draft blocks each, first warmup:12rows/4warmup/8measured.
Existing native-controls/loopback actor, current250ms, one Apply per gesture,
actual ack/Draft unchanged before Apply/unrelated output/getter0/ledger checks.
Only own worker gets the API wrapper via its exact CDP target. Reset/snapshot/restore
are outside the gesture clock. Capture background state and whole settling window;
no limit/Close/old matrix/HTTPS/app/IDE/source/model campaign.

Retain worker and inspector time origins. [W3C High Resolution Time](https://w3c.github.io/hr-time/#examples)
describes translating worker timestamps to document origin; browser coarsening and
instrumentation limit interpretation, with no invented precision bound. Clip API
intervals to the observed Apply RPC and compute unions. Worker-wide APIs and state
can overlap: temporal occupancy is not selected-request identity, CPU/guard cause
or a critical path. Uncovered interval includes unobserved guardian/JS/queue and
unwrapped work; it is not automatically any one of them.

Actual native result and ONE final fresh review remain pending. Documents and source
checks alone establish neither the measurement nor full feature readiness. Keep
historical evidence/cases/criteria, deferred old Minors and local-only commits.

Before the first native attempt, an additional actual-evaluator VM control exposed
that function serialization lost ES-module strict receiver semantics. RED observed
a global receiver instead of undefined; strict Runtime.evaluate prefix gives GREEN,
including exact undefined/null forwarding. Driver controls now7PASS (six startup/
cleanup plus this VM control). The case's driver hash is updated before execution,
with the original registration retained in Git; no native result or criterion is
rewritten. Product327/source module tests/full2654 remain unchanged.

## First actual attempt — retained FAIL, no API attribution

Actualfea1a96/handle31003/exit1:
`.artifacts/v02/input-worker-api-phases/2026-10-24T02-08-40-191Z/results.json`.
First standalone Live warmup exceeds the2048-record cap; summary refusal is correct,
0accepted rows. Inspector/worker errors and console are empty, input maps stable;
own worker/browser/display/server close. The driver failed to retain the raw
snapshot before validation, so the exact count/API breakdown cannot be recovered.
Do not reconstruct it or turn this attempt into a pass.

A pre-validation retention control fails on original driver and passes after saving
raw snapshots/current failure before every validation. Original case/source/result
remain unchanged in Git/artifacts. The separately preregistered
[capacity addendum](../testing/input-worker-api-phases-capacity.md) and
[new case](../testing/input-worker-api-phases-capacity-case.json) opt in to a fixed
16384 metadata ceiling for the same12-row question. Default2048 and its2049-refusal
remain; both source probe and validator demand explicit larger-budget opt-in and
continue rejecting overflow. Source capacity RED20PASS/2FAIL→GREEN; combined57
source/driver controls PASS. No original V02/SLO/authority/privacy threshold changes.
Cost is larger bounded recording/memory/observer overhead, not a permitted loss of
slow/tail/unknown data. The separate current run is still due.

Current full source after retention/capacity change:2656PASS/0FAIL/0SKIP,
`full-source-capacity.log`; combined57 source/driver/VM controls PASS. The earlier
2654 result belongs to the original2048 implementation. Both remain retained.

## Actual separate capacity result

Actual8673fe1/handle90727/exit0:
`.artifacts/v02/input-worker-api-phases/2026-10-24T02-15-52-693Z/results.json`,
`PASS_WORKER_API_PHASE_DIAGNOSIS_NOT_PERFORMANCE_ACCEPTANCE`.
All12rows/4warmup/8measured,2fresh hosts/14ledger checkpoints,40 owned inspector
RPCs=12Apply+26state+2capabilities.24,466worker API rows,0rejected,0pending/overflow/
unsupported, peak2598 (first warmup), within separately fixed16384. Measured whole
windows contain1922Live/1932Draft API rows, including concurrent state. The first
2048 FAIL is still FAIL; new counts are not reconstructed evidence for that run.

351 preregistered inputs stable; exact327 product inputs/helper223/71/UI2/installed
pair/both hosts verified without rebuilding.0instrumented inspector/worker errors
and console; every current ack, Draft-before-Apply unchanged state, unrelated output/
getter0 and persisted non-executable summary passes. Own worker sessions, browser,
display and server close. Original types/admission/backend/native22 are retained,
not rerun or upgraded. All raw worker snapshots are written before validation and
agree exactly with each successful sample/terminal result.

Medians, milliseconds, **2 measured samples per host/mode**:

| Host | Mode | Apply RPC | API interval union inside Apply | Uncovered Apply interval |
| --- | --- | ---: | ---: | ---: |
| standalone |Live |746.30 |256.20 |490.10 |
| standalone |Draft/Apply |747.70 |253.70 |494.00 |
| embedding |Live |736.65 |254.70 |481.95 |
| embedding |Draft/Apply |791.95 |277.05 |514.90 |

Native-command API union medians52.30–57.20ms; selected-tab lookup126–143ms and
worker-wide permission62–69ms are separately retained in the checkpoint. Do not
sum these categories: their operations can overlap with each other and state.
This does not assign the uncovered interval to guardian RPC, JS, queues or one
request, or prove that removing authority checks is safe. It does not qualify an
uninstrumented p95 target, demonstrate a new speedup or invent a Live/Apply SLO.
Clock origins/raw precision and every tail remain recorded; no quantization bound
or cross-process causal identity is inferred.

Saved-result verifier `.artifacts/v02/worker-api-phases/2026-10-24/verify-native.mjs`
passes exact input/archive/install/trace/ledger checks and15 deliberately malformed
protocol controls. A second sweep-line implementation independently reproduces
all clipped API unions/uncovered intervals. Checkpoint native-checkpoint.json binds
actual result/commit and every raw count, without another native execution.
ONE final fresh review is now due. The next bounded candidate after that review is
V02.12: choose/register a narrow guardian-RPC timing control for the still-uncovered
Apply interval before any new product optimization. The recording method is not
claimed already approved or implemented; no guard removal or old matrix rerun.


## Final review and source-only correction

ONE fresh read-only review `/root/v0211_whole_review` (gpt-6-astra/high),
e21f10b..3a38ae0:0Critical/1Important/0newMinor. Important: the returned worker
metadata aliased the object captured by the session accessor. Caller mutation of
its targetId could redirect a subsequent attachment. Actual-source synthetic test
reproduced attachment to `app` (1PASS/1FAIL); capture of a private observed target ID
and a separate returned metadata copy makes it pass. Arbitrary accessor arguments
and later changes to the original observation also cannot redirect attachment.

ONE correction pass; combined58PASS/full2657PASS/0FAIL/0SKIP. Sandbox-blocked test
launch/full suite are retained as environment failures, not functional RED. Actual
mutation RED and final unrestricted source logs are distinct. No new native run,
product327/package/helper change or second reviewer. Native remains8673fe1; the
actual driver never mutated returned worker metadata. Explicit before/after hashes,
source/test copies and exact two-file allowance are in
`.artifacts/v02/worker-api-phases/2026-10-24/post-run-harness-correction.json`.
Original native verifier/checkpoint remain unchanged. `verify-after-review.mjs`
checks all remaining349 registered inputs unchanged and exactly those two declared
changes, plus every original protocol/row/archive/install/ledger/15negative control;
post-review-checkpoint.json PASS. No product evidence is inferred from this test fix.

Review boundaries accepted with their costs: instrumented n2 cannot accept fullV02
or speedup; concurrent API occupancy cannot identify Apply-only causality, CPU,
critical path or uncovered cause; origins/coarsening do not supply a timer error
bound; rejection observers cannot prove uninstrumented console completeness.
Modified Promise species/intrinsics, Proxy traps/inherited target containers and
hostile temporary API replacement are outside the trusted diagnostic, so neither
universal semantics nor tamper-proof integrity is claimed. The missing first failed
snapshot is irrecoverable, so its exact counts stay unavailable. The helper fix has
source evidence only; prior native22/types/admission/backend/campaigns remain their
original revisions. No broad inherited helper audit, UI/human/clean-host/IDE/SDK/
release/fullV03/C09/A02/L02 acceptance is added. Earlier historical-pending wording
and V02.9 sparse optional-operation Minor remain deferred; native lists are dense.
V02.12's guardian recording method is still a separate design choice, not approval
from this review. Each boundary/cost is recorded in the retained ledger.

V02.11 is complete as a finite worker API interval diagnosis. Whole20/29 (~69%),
fullV02 and original thresholds unchanged. Next bounded item **V02.12** chooses and
registers a narrow guardian-RPC timing control for the uncovered Apply interval;
no authority check removal, full matrix, IDE, certificates or other repo work.
