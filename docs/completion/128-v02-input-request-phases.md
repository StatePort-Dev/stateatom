# V02.9 — input request phase diagnosis, runtime complete; review pending

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

Actual native diagnostic is below. Documents/tests alone do not prove timing or improvement.
No product327 change/build/full suite/app/IDE/certificate/model work. Whole20/29,
fullV02/V03/C09/A02/L02 and original thresholds/distributions remain unchanged.


## Actual finite phase result

Preregister15a084a, actual28765/exit0:
`.artifacts/v02/input-phases/2026-10-24T00-57-39-389Z/results.json`, status
`PASS_INPUT_RPC_PHASE_DIAGNOSIS_NOT_PERFORMANCE_ACCEPTANCE`.20 ordered rows/4 warmup/
16 measured, exactly10 per host.14 source checks,341 stable native inputs/327
unchanged product inputs/exact70/UI2 archives/installed hosts.0 inspector console/
errors; fixture current acknowledgements, Draft unchanged before Apply, unrelated
outputs/getterReads0 and22 exact ledger checkpoints pass. Own Chrome/display/server
close. No IDE/certificate/app-source or product-build operation occurred.

All64 recorded owned RPC rows are retained:20 inputs-apply,42 state,2 capabilities.
Exactly one Apply per gesture; every Promise completes, no pending/overflow/foreign
operation. State refreshDeep flags are true. These are timing-only metadata: no
plan/token/resource/value/response/error content is logged. The expected visible
synthetic input/ledger remains separate local fixture evidence.

Per-host/mode medians, milliseconds,4 measured each (raw minima/p95/max retained):

| Host/mode | Useful paint | Apply RPC | Non-RPC residual | Paint after ready |
| --- | ---: | ---: | ---: | ---: |
| Standalone Live |1107.15|833.10|275.55|21.80|
| Standalone Apply |880.35|856.90|24.70|22.35|
| Embedding Live |1099.55|823.95|273.45|19.40|
| Embedding Apply |888.10|862.50|22.25|19.80|

Residuals are computed per row, then summarized; separate medians need not sum.
Local Draft paint medians24.85/24.80ms. Live includes unchanged250ms debounce.
Most measured Apply-to-paint time is inside the existing Apply RPC. Ordinary measured
state rows are2/gesture and overlap Apply by median519–543ms. Last state responses
complete median579–636ms after Apply completes. Overlapping durations are not summed,
and these observations do not prove that state traffic causes Apply delay.

Current host1min load2.44→2.92 differs from retained65 load6.42→10.97→9.78. Different
candidate/run/load/instrumentation means no product acceleration or current65
qualification is inferred. All original distributions, long tails and Basic/active/
warm/source targets remain open; four samples per endpoint are not a replacement
performance acceptance corpus or newly approved Live/Apply SLO.

Independent verify-native.mjs/native-checkpoint.json checks all20 rows,64 phases,
341 hashes, exact archives/hosts/327 source inputs,22 ledgers and10 negative controls
(missing/order/Apply/cap/pending/private fields/duration/trust/host/residual). PASS.
This verifies this finite diagnostic, not internal CPU/storage/guard attribution.

## Post-run acquisition-failure cleanup correction

Source inspection found a session-close rejection could skip the subsequent browser
close in the same finally try. Extracted actual finalizer control first fails1 of3
cases, then3/3 pass after separating the two cleanup attempts. Both session/browser
failure causes remain separate; no native process is launched by these tests.
The successful native run stays15a084a; cleanup-correction.json pins old/new driver
bytes and proves that this is the entire current-driver difference. No new current-
driver native pass or product suite/build/pack is claimed. Plan checkbox reporting
is read against its original Git revision when validating preregistration.

ONE final fresh whole-increment review remains pending. FullV02/V03/C09/A02/L02 and
whole20/29 remain open. Next one bounded V02.10 measures the internal native-command
part of this Apply path before choosing an optimization; preserve every admission/
revocation/revision check, no guard removal or product fix is pre-approved by this
boundary timing. No repetition of the full mode/corpus or V03 app/IDE campaign.
