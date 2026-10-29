# A02 — first-load nested-function zero proof

Diagnostic317 retained raw initial/created native coverage at
`.artifacts/a02/selected-list-semantics/2026-10-29T06-57-41-465Z/`.
At initial empty list, native `Item2` exact function range has count0 and five
lexically nested callbacks have no compiled native range. After creating two
rows, all17 exact ranges exist, including those five with count0. The issue is
uncreated lazy nested functions, not an offset mismatch or a product extra call.

Keep316's exact17-role per-action equality and all six phases. For the FIRST
sample only, acquired before any app navigation/execution, a callback lexically
nested in the exact original parent with native count0 is proven not yet created
and therefore has zero calls. Record this as a source/native deduction with the
actual parent range, separately from direct native function counts. No inference
from absent coverage alone, names, values or a later zero-count parent is allowed:
after resetting counters, an earlier retained closure could still exist. Missing,
ambiguous or nonzero parent evidence refuses. The rest of the native matrix still
requires every exact function range; no role, threshold or action is removed.

The new source regression reproduces missing-initial rejection then verifies only
that bounded first-load deduction; post-reset and missing/nonzero-parent cases
still refuse. No application callback/getter or skipped branch is executed to
manufacture a counter. One corrected six-phase collection using
`--initial-parent-proof`, same frozen installed On bytes and original actions.
316 stays INCOMPLETE;317 stays diagnostic-only. This is a measurement correction,
not a product change, native invocation attestation or release acceptance alone.
