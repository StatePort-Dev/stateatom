# A02.4 — product React19 acquisition (in progress)

Current: **Task1 implemented and source-tested; Tasks2–3 remain pending.**
Scope-review-1; main0328993 baseline. No installed React19 support, full A02,
V03 or new whole-task acceptance is established by this prerequisite. Still20/29.
[Design](../superpowers/specs/2026-10-24-a02-react19-product-acquisition-design.md),
[plan](../superpowers/plans/2026-10-24-a02-react19-product-acquisition.md).

## Task1: private product collector

`src/engine/react19-acquisition.mjs` now provides an inert, private factory with
`tap`, exact-node `snapshot`, `stop` and numeric `retention`. It promotes the
bounded A02.3 identity mechanism without importing research globals or providing
a fixture oracle. Original experiment sources and results are unchanged.

The collector checks the actual current root's child/sibling tree, selected host,
ancestor native hook/queue/dispatch/result references and revision. It records
opaque IDs for an observed applied input and reducer function. It does not inspect
app state fields or execute the reducer again. An observed ancestor remains
independent of the selected property's producer. Public hook kind, field ownership,
state-to-prop and selected-property origin remain Unknown; fullPathfalse.

Ignored reducer calls do not supply origins. Same result/new revision remains
distinct; cloned/unobserved updates, changed primitive actions and render-phase
resets cannot borrow an earlier update. Wrong root/hook/queue/result/node and
foreign/detached targets refuse. A second root is outside this bounded profile.
Tree512/hook64/ancestor64/event4096 limits refuse rather than truncate a positive
witness. App references are weak; stop removes the current witness. These are
page observations, not hostile-page attestation or general writer exclusion.

TDD: actual imported module missing →21 failures; implementation →21 passed.
Additional applied-input/reducer/dispatch-ID requirement first failed on missing
fields, then passed after adding opaque identities. Final **22 new controls** and
**38 focused source controls passed**,0failed/skipped:

```sh
node --test --test-isolation=none tests/engine/react19-acquisition.test.mjs tests/engine/react19-ordinary.test.mjs tests/engine/react19-reducer.test.mjs tests/engine/react19-reducer-observer.test.mjs
```

Controls include opaque app Proxy/getter counters remaining zero; equal selected
nodes; same state/new revision; ignored/clone/reset/carry-forward; uncommitted work;
old return pointers; metadata accessors; capacities and stop. Existing experiment
controls are source checks only; old native14/22 campaigns were not rerun or
promoted to current product proof. Syntax/diff checks passed. Full source suite,
package/build/type/admission, actual product UI and final review remain due after
wiring; historical full2799 is not claimed as a fresh run here.

## Remaining work in this same item

Task2 wires this collector into a strict opt-in React19.2.5 development profile,
the existing observer lifecycle and exact selected-node route. Existing React18,
Vue and first-read contracts must remain isolated. Automatic JSX must be preserved;
unsupported compiler/profile combinations must refuse explicitly.

Task3 supplies a compact scoped product presentation/handoff, versioned local
artifacts and a preregistered actual UI qualification. The current73 package does
not contain or call this collector. No source-resolver authority, producer edge or
new capability may be inferred from its library export or source tests. One fresh
whole-item review happens after those tasks, with one tested Important/Critical
correction pass at most; no per-subtask reviewer is dispatched.

Next step: **A02.4 Task2 — strict pinned profile and observer/selected-node wiring.**
SDK, publication, other repositories and redesign remain excluded. A02's general
ownership stopping rule and L02's no-blind-tuning stopping point remain in force.
All V03 input failures, Unknowns and deferred native Node-admission Minor remain
preserved; no input guard or recovery policy changed here.
