# A02 — complete native counter interval

Case318 remains INCOMPLETE at
`.artifacts/a02/selected-list-semantics/2026-10-29T07-00-45-001Z/`.
Initial and created/changed/same-value/toggled samples acquired exact counters.
At filtered, raw coverage omits Input entirely: V8's reset/delta result has no
exact range for an unchanged function. No count is inferred from absence. The
first-load deduction318 does not apply after a reset and correctly refused.

Measurement decision, before any successful whole comparison: use one complete
native counter interval per phase, from before navigation through the final action.
Do not reset the counter between actions. Acquire all17 exact original function
ranges/call counts directly at the end. No absence-to-zero or parent deduction,
omitted role, count tolerance, forced callback or application mutation is allowed.
Compare exact aggregate counts for Original/Off/On separately for each source
family. Retain all nine per-action DOM/checkbox snapshots and empty exception
lists, with exact equality; source-level evaluation/order/throw controls remain
separately scoped. This measures whole-workflow call parity, **not per-action
counter parity**. Cases316/318 are not relabelled passed.

This method addresses the actual CDP reset/delta limitation while retaining282's
original requirement of matching relevant calls/side effects and output behavior.
No comparison mismatch has been observed or discarded; acquisition refused before
any complete comparison. The previous per-action counter protocol is retained as
incomplete evidence, not silently weakened. Raw native coverage precedes decoding.

One six-phase native collection, `--complete-interval-counts`, same exact saved
installed On bytes, source families,17roles and actions from316. A real count or
output mismatch is a failure, not grounds to change this protocol. Browser
profiles and local source server close on success/failure. No product/UI change,
new package, SDK, publication, benchmark or trust-store action.

## First UI preparation failure

Run `2026-10-29T07-06-21-578Z` is INCOMPLETE in the first Original phase before
final counter acquisition: TodoMVC's real Delete button is CSS-hidden until its
row is hovered. The driver clicked the hidden button and correctly timed out;
no force-click, CSS rewrite or application handler invocation was used. Add the
normal row hover before the existing Delete click. Counts/window/17roles and all
outputs remain unchanged. One corrective six-phase run is allowed for this
concrete driver omission; preserve the failed raw and do not claim counter parity
from it. This is a UI preparation correction, not a product behavior change.
