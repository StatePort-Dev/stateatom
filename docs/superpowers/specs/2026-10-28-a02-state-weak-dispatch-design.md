# State handoff weak-method dispatch

Autonomous maintenance selection, not a new approved product feature. The existing
React state handoff ledger must not call application-installed WeakRef deref methods
or accessors after bootstrap while observing original hook results/current witnesses.
No getter/expression replay, stronger evidence, new event or lifetime/retention policy.

Options: leave dynamic lookup (retains avoidable app dispatch); capture one callable
own-data method and apply it privately (chosen, matches existing captured Object.is/
Reflect.apply); generic intrinsic/ownership layer (out of scope). Capture is only a
post-bootstrap boundary; it does not attest constructor/bootstrap purity or actual GC.
Missing/accessor method refuses native state acquisition without invoking accessor.

Exactly src/engine/react-state.mjs may change. Add a focused test file with real
WeakRef post-init replacement controls and clearly synthetic declared native events,
plus missing/collected/forged refs, copied update, replaced state/setter, revision,
selected ancestor and Stop refusals. Existing compiler/vendor/state tests retained.
Do not change old case/readers, native budgets, package receipts or host. No new UI.
One source review; no re-review. Source success never establishes installed/native
lineage or solves50's unknown weak-reference loss.
