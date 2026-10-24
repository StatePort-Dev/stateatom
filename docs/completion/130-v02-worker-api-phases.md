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
