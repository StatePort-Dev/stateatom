# First-release decision — accepted Basic latency deviation

29 October 2026. After receiving the exact current94 results and the separate
1-second Basic criterion, the maintainer answered: «Принять для первого релиза».

The measured Basic p95 **1065.7 ms standalone / 1232.2 ms official StatePort**,
with maximum **1280.2 ms**, is accepted for the first release. The original
1000 ms target and both MISS results remain unchanged in [341](341-v02-current94-latency-results.md).
This removes optimization or an unchanged benchmark retry as a prerequisite for
this deviation. It is not a new general latency limit or approval of regressions.

Evidence: complete66-row join (60 measured,6 warmup),
`.artifacts/v02/current94-basic/2026-10-29T11-45-54-183Z/results.json`,
SHA256 `5b8889a283e0f3772f0bdf8a0fc7563b72a6260b81ced614582da14d6364ab94`.
Loopback HTTP, real picker on a different target before timed manual lookup;
no claim of HTTPS equivalence, picker latency or new Active overhead measurement.
The separately accepted Active deviation281 remains separate.

Final package95 corrects stale picker refinement342. Its affected native checks,
remaining lifecycle/privacy evidence reconciliation, U04/I03/V03/V04 still apply.
This decision alone does not complete V02 or establish installation or release.
