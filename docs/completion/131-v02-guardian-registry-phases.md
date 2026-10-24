# V02.12 — guardian registry worker intervals

2026-10-24/main532f4dc/scope-review-1. Whole20/29 (~69% equal count), fullV02/
V03/C09/A02/L02 and original targets remain open. V02.11 completed a finite API
occupancy diagnosis; uncovered Apply medians482–515ms have no established cause.
[Design](../superpowers/specs/2026-10-24-v02-guardian-registry-phases-design.md),
[plan](../superpowers/plans/2026-10-24-v02-guardian-registry-phases.md),
[fixed case](../testing/input-guardian-registry-phases-case.json).

## Preregistration state — not runtime proof

Source guardian broker/document/session/wire shows an existing dedicated-worker
registry request plus snapshot per guardian operation. New reversible diagnostic
wraps own offscreen Worker.prototype.postMessage and listens for matching existing
native replies. Exact receiver/arguments/return/error forwarded once; no new Worker,
request, timer, Promise observer, event cancellation, payload mutation, params/result/
nonce/code/snapshot/capability read. Only fixed operation/ordinal/times/Boolean rows;
matching IDs stay in internal memory. Error/protocol/second matching worker/duplicate/
cap/pending/external replacement/listener failures have source controls.

The new zero-argument native accessor binds the one fixed guardian document under
the privately captured installed extension ID; it refuses ambiguity/foreign targets,
ignores caller arguments and copies returned minimal target metadata. App remains
solely Atom-owned. Product327/helper223/exact71/UI2/archive/installed hosts unchanged.
No new package, guard/queue/cache/revision/admission/Live/grant/handoff policy, visual
or public API change. No SDK/push/publication/other repo/IDE/certificate/account/
system trust/user profile action or old campaign repeat.

Registry intervals cover only offscreen→registry-worker→offscreen. Chrome Port and
preceding/following offscreen/serviceworker/JS/queue work stay unknown. Three raw
clocks/coarsening retained; registry/API/combined clipped unions never add overlapping
categories or infer selected Apply-only identity, CPU, critical path or speedup.
Concurrent state and registry health snapshots remain included. Instrumented API
Promise observers retain V02.11's unhandled-rejection reporting limitation.

Fixed bothhosts3alternating Live/Draft blocks/firstwarmup:12rows/4warm8measured,
one Apply/gesture, current250ms/actual ack/Draft unchanged before Apply/unrelated/
getter0/ledger checks. API16384/registry16384/inspector32, no pending/overflow/
unsupported acceptance. Write raw snapshots before every validation, including
failed rows. Source combined78PASS; full source pending at this registration.
Actual new-layer native run and ONE final review remain due. Historical native22/
backend/types/admission, V02.11 first2048FAIL and separate16384 result stay original.
Documents and source tests alone establish no new runtime measurement or readiness.


## Actual finite result

Full source2673PASS/0FAIL/0SKIP; combined78PASS including12 actual-source/VM driver
failure controls. Exact current327/helper223/archives/installed hosts/Chrome/case
preflight PASS, registered in localda87a6f before launch. Native handle43644 terminal0,
actualda87a6f/clean inputs:
`.artifacts/v02/input-guardian-registry-phases/2026-10-24T02-45-40-919Z/results.json`,
`PASS_GUARDIAN_REGISTRY_PHASE_DIAGNOSIS_NOT_PERFORMANCE_ACCEPTANCE`.

12rows/4warmup/8measured,354 unchanged preregistered inputs/14ledger checkpoints,
40inspectorRPC=12Apply+26state+2capabilities.24465worker API rows and21876registry rows:
10944snapshot/7111verify/1910begin/1911finish. Registry peak2342,0rejected/pending/
overflow/unsupported; API peak2625/0rejected. All current acknowledgements, trusted
inputs, Draft unchanged before Apply, unrelated output/getter0 and persisted
non-executable ledger checks pass. Both fixed owned guardian targets and service
workers detach; owned browsers/display/server close.0instrumented inspector/worker/
guardian errors and console. No uninstrumented rejection-completeness claim.

Medians milliseconds, **n2 measured per host/mode**, same instrumented run:

| Host | Mode | Apply RPC | API union | Registry union | Combined union | Uncovered |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| standalone |Live |727.30 |255.25 |241.50 |493.15 |234.15 |
| standalone |Draft/Apply |785.05 |264.40 |266.40 |526.90 |258.15 |
| embedding |Live |730.40 |255.35 |243.20 |495.25 |235.15 |
| embedding |Draft/Apply |743.35 |255.10 |251.65 |503.35 |240.00 |

Registry intervals include an additional offscreen/dedicated-worker message segment
not visible in V02.11. The combined union is recomputed on all raw intervals, never
a sum of the medians/categories. Remaining234–258ms is still Unknown; the measured
registry segment does not include whole Chrome Port transit, document/serviceworker
JS/queues, nor prove CPU, critical path, exact Apply ownership or removable guards.
Counts include concurrent state/health and do not alone justify fewer checks. This
run's extra observer differs from V02.11, so between-run timing is no speedup proof.
Original250ms/thresholds/fullV02/whole20-of29 unchanged.

All raw snapshots retained before validation, exactly matching samples/terminal
result. Saved verifier independently sweeps registry/API/combined unions, checks
354 current inputs/327 product/helper223/archives/install/14ledgers/three clocks and
25 malformed protocol controls: PASS, native-checkpoint.json. EarlierV02.11 first
2048FAIL and separate16384 result remain original; no rerun or reconstructed data.
ONE final fresh readonly V02.12 review is due. Next candidate V02.13 is a bounded
source control for redundant registry snapshots on unchanged-lease verification;
first establish which operations mutate authority and preserve every revalidation,
recovery and cleanup barrier. This is an executor candidate, not an approved shortcut,
implemented optimization, changed grant policy or permission to remove guards.
