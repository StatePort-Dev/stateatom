# A02.4 — product React19 acquisition (in progress)

Current: **Four native75 scenarios retained; the old 11px font failure remains literal. Scoped76 font correction/source checks/packages are ready; remaining native UI/report/stop and final review are pending.**
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

## Task3b source admission control and corrected registration

The existing mounted inspector was exercised with the actual capability policy:
read/inject without cache shows Attach disabled with title "cache capability
required"; adding only the required checked cache action enables Attach. This is
source/mounted UI evidence, not a native reason retroactively assigned to the first
failed run. Focused inspector/capability controls **75PASS**, then with native CLI
refusals **77PASS/0FAIL/0SKIP**. No product/runtime/CSS/permission policy changed.

A separate case `react19-product-cache-case.json` retains all ten original feature/
cleanup checks and max1run. It first records the actual no-cache denial, then checks
cache in the existing exact-local-site Settings and records available admission
before clicking Attach. It cannot silently force availability or bypass a guard.
The preparer defaults to this explicit corrected case; the original case remains
unchanged. Both before/after admission records must be retained even on failure.

The fresh output/cache/profile preparation reuses the unchanged copied app,
installed plugin7 and exact Atom75/UI2 archives, with no reinstall or new package
version. Its path is
`.artifacts/a02/react19-product-cache/2026-10-24T08-20-31-062Z/prepared.json`.
Preflight: **3217inputs/17links PASS**, no browser started. Only the new case adds
an input; the existing source-harness/preparer changes are explicit. Original native
inputs now have3214 physical matches plus2 old Git blobs verified at63c1c5b, recorded
in `startup-verification/protocol-source-delta-final.json`. The prior strict
3216-input clean checkpoint, literal failed result and original case are intact.
This is historical source preservation, not a fresh run of original code.

## Corrected actual native attempt — six gates, font FAIL

Code **dc835d35256b18931aed0b8e33aa0fe516581aac**, corrected case
`A02.4-product-native-ancestors-cache-admission`, one actual attempt, tool52897
terminal exit1. Literal result **INCOMPLETE_PRODUCT_QUALIFICATION_NOT_A02**:
`.artifacts/a02/react19-product-cache/2026-10-24T08-20-31-062Z/results.json`,
SHA256 **2f700269712695cf5e418cbc6901fc9e92285c1dc78bf5e6af570c4ab46574d2**.

**6of10 gates passed**. In this fresh owned profile, the actual policy/button first
reported CAPABILITY_DENIED / "cache capability required", disabled with cache
unchecked. After checking only that action in normal Settings, actual admission
became available and the button enabled. Attach and the existing HTTP source helper
connection then succeeded. This fresh controlled native comparison is separate
from the first run's uncaptured denial reason; the first FAIL remains unchanged.

Four actual native scenarios passed with five exact selected snapshots:

- Equal titles select different actual native host IDs with one shared ancestor
  queue; ancestor co-location does not establish either row's property producer.
- After the declared compiler-marker deletion, fresh selection of the same second
  host retains native ancestry while source target/property producer stay Unknown.
- Real same-value edit creates a different applied result/revision/update; its
  opaque native input ID equals the preceding result ID.
- Changing first title while second stays equal retains the second host and common
  queue, with the next native applied input/result identity. No row-field origin,
  public hook kind, state-to-prop transfer or full lineage is inferred.

The next gate failed immediately on actual computed typography:
**11px != required13px** for the new paragraph. Removing its hint class in75 was
insufficient: the existing parent `.sp-atom-boundaries` sets11px. The source
selector/measurement identifies a bounded presentation defect; it does not justify
changing the required size or claiming visual fidelity. `failure-candidate.png`
is actual and was viewed. The intended normal/hover/keyboard/narrow candidate set,
saved/downloaded v1 report/reader, and observer Stop/post-stop input were **not
executed**. No report file, State Card or passed screenshot was fabricated.

All**3217inputs/17links** matched after cleanup. Chrome1152274/Vite1152206 absent;
helper, browser, Vite, Xephyr and UI/log handles closed. No certificates/IDE GUI or
production changes. Independent saved verification **16negative controls PASS**
with label `PASS_RETAINED_NATIVE6_FONT_FAIL_NOT_ITEM_ACCEPTANCE`; this preserves the
partial successes and literal font failure, not a whole-item pass. It and the clean
pre-font-change checkpoint are in that output's `verification/` directory. Both
old cases/results/archives and original ten criteria remain intact.

## Task3c font correction and retained-mechanism proof

The new paragraph has a dedicated scoped `sp-atom-native-state` class with
`font-size:var(--sp-font-size-body)`. Shared tokens/components and other Evidence
text remain unchanged. A controlled rendering of the actual source template/CSS
with copied historical summary text first measured11px and failed, then passed at
**440/360px** with paragraph13px, parent11px, adjacent host16px and no paragraph
overflow. These are source-render candidates, not native acquisition or full
fidelity proof. RED/GREEN outputs:
`.artifacts/a02/react19-font/2026-10-24T08-40-18-157Z` and
`.artifacts/a02/react19-font/2026-10-24T08-41-07-626Z`. Both browsers closed.

Atom76 immutable handoff:
`.artifacts/atom/2026-10-24T08-43-51-780Z/atom-handoff.json`, tarballSHA256
**681df733ca4ccfb1865b53ffd457c2907f6572a19260e52fa42da0422d7831c6**.
UI2 and plugin7 are unchanged. Full source **2915PASS/0FAIL/0SKIP**,93.34s on this
product code; then two more remaining-driver refusal controls were added and pass
in the final **79 focused controls**. The2915 run is not relabelled2917. Packed
NodeNext/browser types **2PASS**, admission **9PASS**. Old75 archives/results stay
untouched; no unchanged helper VSIX or plugin was rebuilt.

The exact75→76 proof verifies **five source changes**: one template class, one
scoped CSS rule, package/lock candidate version and added changelog entry. Raw
historical Git blobs, current sources and payloads are checked, not just filenames.
The complete UI JS bundle differs by that single class literal; CSS differs by that
single token rule. All remaining runtime/platform/transport/worker/reader payloads
and unchanged host files match byte-for-byte. Plugin/acquisition/observer, source
helper, app and installed tooling are unchanged. The first proof attempt used the
wrong escaping for the generated HTML literal and failed; correction matched the
actual generated literal without relaxing the single-change predicate.

Final proof/preparation:
`.artifacts/a02/react19-remaining/2026-10-24T09-10-56-113Z/mechanism-credit.json`
and `prepared.json`. No app/tooling reinstall or old native scenario was repeated.
The recorded75 semantic cases are retained at their original node/revision; they
are **not** labelled newly executed on76. Any new76 witness must be fresh and use
a different actual page/occurrence. Both original partial runs remain INCOMPLETE.

`react19-remaining-case.json` freezes one six-check remaining run and explicitly
maps all ten original criteria: fresh76 artifacts/attach, retained75 four semantics
under the exact proof, fresh76 font/normal/narrow/hover/keyboard, actual v1 saved/
downloaded omission+reader, Stop/post-stop input, and exact inputs/cleanup. This
preserves every original criterion without re-running unaffected semantics or
copying old IDs. Preflight includes the original28-file identity check and passes
**3219inputs/17links**, no browser/server started. Native run requires a clean code
commit. One fresh whole-item review still follows the completed evidence.

## Remaining work in this same item

Next bounded step: **commit76 source/case, then execute the one frozen remaining
native run and independently verify literal results and the ten-row evidence table.**
No native76 UI/report/stop success is claimed yet. Full A02/V03/V02/L02/C09 remain
open;20/29 unchanged. Historical V03 failures/Unknowns and deferred native Node
Minor stay intact. No input guard, Live/production policy, SDK, publication, other
repository or redesign changed.
