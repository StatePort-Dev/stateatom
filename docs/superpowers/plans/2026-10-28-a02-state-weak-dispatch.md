# State handoff weak-method dispatch implementation plan

> Execute inline with superpowers:executing-plans; ONE final source-slice review.

Goal: prevent late app WeakRef method/accessor dispatch in the existing state ledger.
Architecture: capture the own callable deref once, use captured Reflect.apply for
private references; keep current gates and weak retention. JavaScript/node:test.
Spec: ../specs/2026-10-28-a02-state-weak-dispatch-design.md.

## Global constraints
Main/local, autonomy until09:00 Mauritius October28. One existing source file only.
No native/browser/model/GC/CA/SDK/otherrepo/publish. Protect old50case/raw/readers and
86product327/archives. Do not infer selected/field/writer/full lineage or GC cause.

## Review focus
Late accessor/method replacement must have0application calls; captured method uses
the original private receiver; unavailable capability stays unsupported without
getter invocation; lost refs/state/setter/commit replacements remain Unknown; no
new strong retention, thresholds, DTOs or helper installation claim.

## Task1 — one state ledger correction
- [ ] Freeze before-source/product/protected inputs and own ledger.
- [ ] Add tests/engine/react-state-weak-dispatch.test.mjs; reproduce late native
  WeakRef prototype method/accessor dispatch with finally restoration before asserts.
- [ ] Modify only src/engine/react-state.mjs to capture own callable deref and route
  all private dereferences through captured apply. No getter-capability adoption.
- [ ] Verify new positive and missing/collected/replaced/Stop controls, existing
  tests/engine/react-state.test.mjs, applicable engine suites and full npm test.
- [ ] Syntax/diff/input preservation; one final source review and one tested I/C
  correction pass only if needed; no review/native rerun; local source commit.
- [ ] Archive/hash/verify only own workspace, close source54 and choose one nextitem.
