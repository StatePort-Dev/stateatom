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
