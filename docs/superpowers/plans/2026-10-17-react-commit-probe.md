# React commit probe implementation plan

Scope: design in `../specs/2026-10-17-react-commit-probe.md`; no new package/resolver.
Implement inline under the user's autonomous execution instruction; obtain independent
code review before accepting the experiment. Existing 96 tests and accepted short-loop
records are the starting evidence, not a reason to regenerate unrelated campaigns.

## 1. Preserve and preregister

- [x] Record historical six-case table, primary P2/control P1 and exact missing edge.
- [x] Preserve old Phase2/diagnosis/short-loop hashes under /tmp (no old writes).
- [x] Record the design, controls, evidence limits and failure rule before implementation.

## 2. RED: native commit mechanism

Create `stateatom-react-commit/run.mjs` and `verify:react-commit`. Use actual browser
and existing synthetic server with an explicit opt-in commit option. Original source
is unchanged. Assert a committed record for P2; current implementation must fail.
Create new output/profile directories; retain errors and input hashes.

## 3. Implement opt-in observer/plugin support

Modify `stateatom-phase2/engine/observer.mjs`: bounded root/container records, profiler
callback collection, selected-element WeakMap and committed target selection in
`snapshot(instance, property, element)`. No app getter/expression reevaluation.
Modify `plugin.mjs`: opt-in `reactCommit` option, AST identification of supported
createRoot/render calls, container passthrough and Profiler wrapping with generated
React imports. Existing default behavior remains unchanged during the probe.
Pass the selected actual DOM element through `engine/browser.mjs` and retain scoped
commit evidence in matchTarget. Validate commit source identity in `engine/slice.mjs`.
Allow the synthetic server to pass the explicit probe option; no business-source edit.

## 4. Verify controls and scope

Native P2/P1 and distinct Rows; same-value discarded evaluation; two roots; missing
commit and changed/replaced DOM; source/stop/retention invalidation; actual semantic
comparison and bounded overhead. Keep fullPath false. Run `npm test` and relevant
builds after source changes, then independent read-only review and focused corrections.
Only then decide whether the binder supports the next state/exchange experiment.

Review focus: speculative same value, DOM node identity/roots, callback-to-target
identity, exact-once evaluation/order/receiver, retention and source freshness.
