# A02.4 — product React19 acquisition (in progress)

Current: **Tasks1–2 complete; Task3 source/packages tested. First native attempt stopped at Attach before feature gates. Qualification and final review remain pending.**
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

## Task3 source/package checkpoint — native not started

The inspector now renders a compact independent ancestor count and eligible update
origin count. It requires the current source-connected page/occurrence and bounded
well-formed witnesses; stale, foreign, malformed, duplicate, oversized or promoted
records cannot display a positive observation. It never turns ancestors into the
selected property's operands or committed producer. Opaque IDs are not displayed.
The informational paragraph uses ordinary13px body text and existing composition;
shared CSS/tokens/contract are unchanged. Supplied HTML/Figma index/reference docs
were read. The real native mechanism has no equivalent in that synthetic prototype;
this one information line is an intentional addition. Rendered fidelity remains
unverified until the actual candidates are captured and reviewed.

For this bounded implementation, saved v1 diagnostics explicitly omit native
ancestor observations. The live summary and saved limitation disclose the omission;
the limitation is available in the existing review catalogue. It is not a new report
schema, a preserved saved native witness, or approval of a general handoff redesign.

Presentation/mounted UI/report controls: **72 ran68PASS/4FAIL before the change,
then72PASS**. Two more malformed-witness controls give **74PASS/0FAIL/0SKIP**.
Full source suite on the final Atom75 product code: **2912PASS/0FAIL/0SKIP**,
133.74s, command `npm test`. The earlier Atom74 full2912 and intermediate package
are retained separately;74 used an existing11px hint and never had a native run.
Removing that class required a new immutable75, not rewriting74. Packed75
TypeScript consumers **2PASS** and package admission **9PASS**. Native-driver
unknown-option refusal first failed1of2 controls, then passed2of2; these two entry
controls were added after that full source run. Syntax/diff checks pass.

Exact local artifacts, all built with explicit dirty source receipts before the
upcoming code commit:

- Atom75: `.artifacts/atom/2026-10-24T07-53-55-011Z/atom-handoff.json`,
  tarball SHA256 `7ba9226f05ba6136af95104466350976fd90867357e5e488f5450cc2097e0eba`.
- UI2 unchanged: SHA256 `2bfc8229a45e02f775bb563f27d9a803d51dd977145f46843c45a884e07289e5`.
- Plugin7: `.artifacts/development/2026-10-24T07-36-48-776Z/plugin-handoff.json`.
  The new explicit `pack:development -- --plugin-only` mode uses its own receipt
  schema/file and makes no helper VSIX. Default combined receipt shape is retained;
  an immutable-artifact check refuses reissued plugin bytes under an old identity.
- Atom75 packed types: `type-consumer-result.json` beside its handoff. Admission9:
  `.artifacts/atom/compatibility/2026-10-24T07-57-42-407Z`.

The preparation reused one owned app copy and the already installed exact plugin7;
no old app campaign or extra dependency install was repeated for the font correction.
Original TodoMVC28-file upstream manifest, original package/lock and source stay
unchanged. The declared Vite overlay is qualification tooling for the original
Webpack application, not its original/clean install build. The HTTP helper uses
its existing source API; this is not installed VSIX/IDE trust acceptance. No IDE,
browser-profile GUI, certificate, system-trust, production or external publication
change occurred. The initial74 preparation is preserved; the75 variant is separate:
`.artifacts/a02/react19-product/2026-10-24T07-40-59-380Z/prepared75.json`.

A finite ten-check case is frozen in `docs/testing/react19-product-case.json`.
It declares CLI preload, two real equal titles, one compiler-marker removal control,
same-value and changed ordinary edits, normal/hover/keyboard/narrow candidates,
actual saved/downloaded v1 omission, public observer stop and cleanup. Marker removal
is an explicit metadata fault control, not naturally unmarked app evidence. Stop
is a harness lifecycle intervention, not a product Stop UI. No callback/getter/value
or app source is manufactured. First result/FAIL must be retained without waiver.

Pre-native source admission passed for **3216inputs/17tool links** on75/plugin7;
no browser/server was started by `--preflight`. Inputs include actual process
executable identity, pinned Chrome, package/installed host bytes, helper/source,
static app dependencies, installed tooling and original/copied app. A clean code/case
commit is required before the one actual run. The source/package checkpoint does
not establish the new native product route or full A02/V03 acceptance.

## First actual native attempt — startup gate not passed

Exact code/case commit **63c1c5b**, original case
`A02.4-product-native-ancestors`, one actual run, tool session47354, exit1:
`.artifacts/a02/react19-product/2026-10-24T07-40-59-380Z/results.json`.
Result SHA256 **9f955338bbad571145b2ed882947b9835c1b93dab42c9bf6dd3b6a9aba1bf4d6**.

Literal status is **INCOMPLETE_PRODUCT_QUALIFICATION_NOT_A02**. Only the artifact/
registration check passed: **1of10**, no app observation and **0app inputs**. The
second setup check timed out trying to activate Attach, before private helper
pairing or the TodoMVC operations. Screenshot `failure-candidate.png` is actual,
not a rendered mockup. It shows unchecked cache permission and Not attached.
The native button denial code/title was not captured. No ancestor, same-value,
visual/report/stop or product acceptance follows from this attempt.

All3216 inputs and17 tool links matched afterward. Helper, Chrome, Vite, Xephyr,
UI/observer handles and logs were closed. Chrome1093807/Vite1093569 were absent;
no browser/IDE profile or certificate GUI was opened. Vite actually chose5173 for
its port0 configuration; the observed origin is recorded, not called an ephemeral
assigned port. Ordinary cases were not exercised or counted as passed.

Independent saved-result verification passed **12 negative controls** with status
`PASS_RETAINED_STARTUP_FAILURE_NOT_PRODUCT_ACCEPTANCE`, at
`startup-verification/verification.json`. This proves preservation of the failure
record, not success of the native criterion. Its strict verifier/checkpoint binds
all3216 current inputs before any protocol change; later source drift must not be
passed off as a fresh reproduction of that original code. The clean pre-change
checkpoint is `startup-verification/pre-change-checkpoint.json`.

A separate source-only probe of unchanged `capabilities.mjs` confirms that normal
HTTP Attach requires read/inject/**cache**: without cache it returns
CAPABILITY_DENIED / "cache capability required"; with cache it becomes available.
`platform.mjs` filters optional grants by exactly checked site actions. The original
protocol checked none; the actual screenshot is consistent with that omission.
This is a concrete source-supported setup defect, not a captured native denial
reason or proof that all remaining setup will pass. Probe:
`startup-verification/attach-source-probe.json`. Product policy/guards remain intact.

## Remaining work in this same item

Next bounded step: **A02.4 Task3b — source/mounted UI Attach/cache admission control,
then a separately frozen corrected setup case if that control passes.** Keep the
first case, result, screenshots, inputs and criteria unchanged. No immediate rerun,
no generic permission bypass and no changing read-only/production policy. The same
ten native feature/cleanup checks remain required before this item can be called
delivered. One final whole-item reviewer remains pending; none was dispatched early.

Full A02/V03/V02/L02/C09 remain open;20/29 unchanged. The original V03 input failures,
Unknowns and deferred native Node-admission Minor remain preserved. The new driver's
actual Node check does not repair or upgrade that old harness. No input guard,
Live/production policy, SDK, publication, other repository or redesign changed.
