# V02.9 — input request phase diagnosis, preregistered

2026-10-24/main e7a6eba/scope-review-1. V03.14 UI entry evidence is complete within
its scoped composite proof and unchanged native console FAIL. No V03 campaign repeat.

[Design](../superpowers/specs/2026-10-24-v02-input-phases-design.md),
[plan](../superpowers/plans/2026-10-24-v02-input-phases.md),
[case](../testing/input-request-phases-case.json).

Retained V02.8 Live/Apply seconds versus local Draft~22ms justify a smaller question:
which time belongs to the existing owned inputs-apply RPC, and what other owned
state/capability requests overlap? Existing raw clocks do not provide that answer.
Current source has multiple guards/refreshes; no cost/cause is inferred from counts.

Extend only the existing private timing probe's optional validated operation list.
Default Basic behavior stays unchanged. Three new source controls first fail on
original probe (4 existing PASS/3 new FAIL), then combined probe/input-timing14
checks PASS. Original Promise/receiver/arguments/result/error stay exact; private
plan/response getters are not read, options copied, invalid selections refused
before API replacement. This is source evidence, not a native performance result.

New finite native protocol on unchanged70/UI2/native-controls/loopback:5 alternating
blocks/host, first warmup;20 ordered rows/4 warmup/16 measured, one Live and one
Draft+actual Apply per block. Default250ms and all guards stay. Fixed32 request rows,
exactly one successful inputs-apply per gesture, state/capability overlaps retained;
no overlapping durations are summed. Draft app unchanged until Apply, unrelated
outputs/getterReads0 and current acknowledgements remain required. No64-limit/Close
rerun or broader target matrix. CLI preload/direct inspector/permission helper are
explicit setup assistance, not new guide-operation or human proof.

Native execution remains due. Documents/tests do not prove timing or improvement.
No product327 change/build/full suite/app/IDE/certificate/model work. Whole20/29,
fullV02/V03/C09/A02/L02 and original thresholds/distributions remain unchanged.
