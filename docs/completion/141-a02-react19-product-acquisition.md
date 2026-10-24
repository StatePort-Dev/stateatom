# A02.4 — product React19 acquisition (in progress)

Current: **Tasks1–2 implemented and source-tested; Task3 product delivery remains pending.**
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

## Task2: strict profile and exact selected-node wiring

Source now admits the explicit `react19-state-ancestors` profile with Node24,
Vite7.3.7 in app/plugin, React/react-dom19.2.5 and both original A02.3 dev-source
hashes. It refuses conflicting legacy options or mismatched vendor bytes, including
at dependency load. Automatic JSX stays intact. Vite's pre HTML hook prepends the
runtime module; the native tap bridge resolves only own data methods at tap time,
keeps the original receiver/return/error behavior and exposes no research globals.
HTML injection and synthetic ordering controls are not yet actual browser proof.

The product observer owns one collector, separately admits its adapter, refuses
mode reuse, and invalidates/stops native evidence on HMR/stop/reconfiguration.
Deep text/disabled readers can ask this explicit runtime about an unmarked actual
node. Existing native disabled identity/ABA guards remain. Independent
`nativeStateAncestors` never creates a source target or committed property producer.
Missing/wrong node/contract, stopped state, absent WeakRef and capacities stay Unknown.

New controls: initial34 ran **4PASS/30FAIL** before implementation; one failure was
a test that read an install-wrapper getter copied before config, corrected to test
the actual source plugin contract. After implementation, the JSX-preservation
assertion was corrected to allow existing data markers; **34/34 passed**. Two further
admission/reconfiguration controls pass, for **36 new controls** in total. Focused
regressions **227PASS/0FAIL/0SKIP** preceded those last two controls; the final
admission subset is24PASS. Actual command and full logs are in the SDD ledger.
No full source suite or installed product acceptance is claimed at this step.

Adding the runtime import exposed fixed import lists in three source harnesses:
operand6FAIL and entry/receipt8FAIL were retained before correcting only their
module resolution. First-read's compiler recipe refused the changed plugin hash,
as intended. Its plugin pin and self hash were refreshed to the actual edited
source; guards, limits, contracts and vendor pins are unchanged. The channel test
was then denied by the filesystem sandbox's local listener restriction; the same
focused suite passed with the temporary loopback listener permitted. No browser,
IDE profile, certificate or system-trust change occurred.

Both actual local React19.2.5 vendor sources were transformed through the new probe:
source hashes and native site counts match the retained A02.3 recipe,2files/2loads.
This is a source-transform comparison only. Original experiments/results are
unchanged; no old native campaign was repeated. The development packer's copy and
source-manifest lists now include the new runtime dependency, avoiding a missing
module in its next build. No artifact was rebuilt under an existing identity.

## Remaining work in this same item

Task3 supplies a compact scoped product presentation/handoff, versioned local
artifacts and a preregistered actual UI qualification. The current73 package does
not contain or call this collector. No source-resolver authority, producer edge or
new capability may be inferred from its source tests. One fresh whole-item review
happens after Task3, with one tested Important/Critical correction pass at most;
no per-subtask reviewer is dispatched.

Next step: **A02.4 Task3 — product display/handoff, immutable packages and finite actual qualification.**
SDK, publication, other repositories and redesign remain excluded. A02's general
ownership stopping rule and L02's no-blind-tuning stopping point remain in force.
All V03 input failures, Unknowns and deferred native Node-admission Minor remain
preserved; no input guard or recovery policy changed here.
