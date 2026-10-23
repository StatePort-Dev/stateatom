# V03.6 — installed Vue profile, source/native phase in progress

2026-10-23, scope-review-1, base df68377. **In progress.** Source/profile admission
passes, but the first actual candidate3 application startup **failed** before the
IDE/source-positive gate. Its exact failure is retained; the bounded DOM-parser
correction passed61 focused/full2517 source checks. Candidate4 then exposed a
separate ordinary ESM export-linkage defect before IDE. That minimal correction
passes270 focused/full2521. Installed5 then renders the original page in its
diagnostic retry but fails Attach at guardian64 pending RPCs. Necessary source-read
backpressure correction and new Atom67 qualification are in progress. No full V03/C09 or new Vue runtime acceptance.
20/29 whole tasks unchanged.

[Executor design](../superpowers/specs/2026-10-23-v03-installed-vue-profile-design.md),
[plan](../superpowers/plans/2026-10-23-v03-installed-vue-profile.md),
[preregistered source question](../testing/independent-vue-source-case.json).

## Implemented boundary and actual checks

Installed wrapper adds explicit experimental `profile:'vue3'` for exact
Node18.18.2/Vite4.4.9/Vue3.3.4/@vitejs/plugin-vue4.3.2. It checks app and plugin
resolved Vite metadata, original Vue plugin presence and rejects mixed React,
Query, writes, fetch initiators and Action Trace flags. Unknown profiles fail.
Default installed profile retains Node24/Vite7.3.7 and existing React/classic
conflict/controlled-first-read refusals; npm's expanded peer range alone must not
admit the cross product. Disabled mode remains transparent; plugin remains serve-only.
At initial profile admission, transformer/observer and326 Atom66 inputs were
unchanged. The later compiler corrections and new Atom67 prerequisite below have
separate identities; original Atom66 evidence remains historical.
This is a new bounded engineering profile, not a previously user-approved version
matrix or new Live/production/handoff product parameters.

Actual source checks, logs in `.artifacts/v03/installed-vue-profile/2026-10-23/`:

- Original wrapper RED16:14FAIL/2PASS; extended matrix RED17:15FAIL/2PASS.
- Initial focused56:55PASS/1FAIL was a fixture assumption about Node walking to a
  parent's node_modules. Corrected fixture removes the actual metadata file;
  focused56/full2512 PASS. Original failed log retained.
- First actual installed candidate2 exposed package exports: compiler plugin4.3.2
  does not export `package.json`. Direct metadata lookup failed before app startup.
- Exact regression RED19:18PASS/1FAIL. Corrected lookup resolves the public entry
  **without loading/executing it**, bounded-walks to the matching package's metadata
  and keeps name/version checks. Throwing entry fixture proves it is not executed.
- Corrected focused57 and full **2513 PASS**, no skips/failures; full source command
  is existing `npm test`. No previous React/native matrix was repeated.
- `node --check` for preparation and the isolated-IDE helper harness; `git diff --check`.

Context7 Vite/npm/Node APIs were checked; official Vite4 documentation supplements
the current index. Source tests do not establish a running installed Vue application. The retained
`source-and-admission-checkpoint.json` seals the actual current source/package/log
identities, with native application execution and review explicitly pending.

## Immutable packages and private consumer admission

Original plugin1/helper and failed candidate2 remain unchanged. Candidate2 strict
Node18/npm9 installation succeeded, then its actual wrapper metadata probe failed:
`.artifacts/v03/installed-vue-consumer/2026-10-23T17-58-02-443Z/result.json` remains
**FAIL**. No application/browser ran for that failure. No tarball was patched in place.

Corrected candidate3 handoff:
`.artifacts/development/2026-10-23T18-07-11-697Z/handoff.json`.

| Artifact | Identity |
| --- | --- |
| Plugin3 |`3377285825741edb4d2bb2c78af5146f8596b5c277c2dd7fc2b5b0eac8131c51` |
| Companion helper0.1.3 |`a0e94647c9f3c143a16bb47d66cec8aa9f8fc0ba3eb5c74413c247c01a61b307` |
| Producer |134f936 plus pending profile/package/test edits; sourceDirty true |
| Plugin source manifest |19 exact inputs, unchanged transform and observer |

Existing `npm run pack:development` builds the plugin and packages the present
helper output; its original BUILT_NOT_VERIFIED marker stays unchanged. The helper
has the same version string but a **different extension.cjs payload** from the old
21Oct VSIX. An initial equality assertion failed; actual per-entry diff is retained.
Do not inherit the old helper's source/build or installed-workflow qualification.
The new actual payload requires its own installed-host checks. Package version or
plugin-only source manifest does not establish current-source provenance for it.

Command:
`node tests/helpers/prepare-installed-vue-consumer.mjs .artifacts/development/2026-10-23T18-07-11-697Z/handoff.json .artifacts/v03/dependency-prep/2026-10-23T15-48-05-165Z/results.json`

Actual new result:
`.artifacts/v03/installed-vue-consumer/2026-10-23T18-08-27-909Z/result.json`:
**PASS_INSTALLED_PROFILE_ADMISSION_NOT_APP_ACCEPTANCE**. Node18.18.2/npm9.8.1,
engine-strict install0/null with ignore-scripts/no-audit/no-fund, empty private npm
configs/cache and explicit public registry. No force/legacy-peer bypass, account or
global manager change. Original prepared1308 Vue dependencies were not reinstalled.
14 installed plugin payload files/source-manifest/notices checked; actual wrapper
under Node18 passes six probe groups (exact tuple plus unsupported configurations).
Those metadata fixtures execute no application code and do not stand in for the
real original Vue compiler, source observations or native browser flow.

## First actual native startup and bounded correction

Preregistered driver commit efe4949 runs the original application under exact3.
`.artifacts/v03/independent-vue-source/2026-10-23T18-24-16-171Z/results.json` is
**FAIL** after120s readiness,2 prior checks PASS.377 inputs stable before/after;
all498 immutable originals exact, working497 plus the same generated declaration.
Vite/browser stopped, Vite0/null; IDE was not started. The Vite overlay/log identifies
`Element is missing end tag` in original c-input-text, c-select and c-file-upload.
This is an instrumentation defect, not a reason to edit/remove the original app.

The transformer used compiler-core baseParse without DOM parser options. Replacing
only its import/call with compiler-dom parse preserves valid native HTML void tags.
Synthetic regression4 was3FAIL/1PASS before correction, now4PASS; nonvoid malformed
markup still refuses, self-closing controls and exact source columns remain.
An intermediate3/4 checker mistook inert macro source words for executable macro
calls; actual AST showed none. Corrected AST assertion retains the intended macro
removal check. Three unchanged original SFCs also pass the actual original Vue
compiler3.3.4 under Node18, separately from installed/native qualification.

The first full source run correctly rejected changed recipe bytes:2509PASS/2FAIL
of2511 reached tests; six nested owned tests were not reached. Following the existing
[A04 pin transition](35-a04-vue-source-adapter.md), only the plugin recipe hash and
builder self hash changed. Byte-normalized comparison proves every other builder
byte, tool/native binary pin, finite verifier/effect threshold unchanged. Original
FAIL is retained. Affected owned source9 PASS; corrected focused61/full2517 PASS.
The four original owned native acquisition/refusal controls PASS sequentially:
`.runtime/first-profile-runs/2026-10-23T18-45-50-672Z/results.json`, source inputs
stable/errors empty. This affected regression is not full HTTP/product acceptance.

Logs, original-SFC reproduction, exact before/after pin transition and original
compiler roundtrip are in `.artifacts/v03/vue-dom-parser/2026-10-23/`.
Atom66's326 inputs remain unchanged. The changed builder is a helper input, so the
helper must be rebuilt before the new candidate4 packet. The pack receipt now
measures sourceDirty from actual Git status rather than hardcoding true; actual
packing verifies this metadata change. The existing shared
`build:extensions` also regenerates local Atom/UI outputs; there is no helper-only
command. This incidental regeneration will not replace the immutable66/UI2 kit or
supply new Atom/native qualification. No UI source/tokens/redesign change is made.

Before repinning, an in-memory reproduction of the exact existing helper build
recipe matched packaged bundle751bba40 across222 current inputs. It changed no
artifact. Two existing CJS empty-import-meta warnings in specialised first-read
paths remain recorded; this Vue route does not qualify those installed paths.
The new helper needs a new exact source/payload/installed-host check, not merely
the unchanged0.1.3 version string.

## Candidate4 packet and second startup defect

After source fix5a3b5f0, existing build:extensions rebuilt the current helper;
pack4 receipt measures clean sourceDirty false. Exact4 packet is
`.artifacts/development/2026-10-23T18-51-27-348Z/handoff.json`:
plugin SHA4c46092f / helper SHA562bdf21, helper bundlef5f4760c. Its strict consumer
`.artifacts/v03/installed-vue-consumer/2026-10-23T18-52-32-269Z/result.json` passed
installation/profile admission. Helper's exact output also reproduces in memory
from222 source inputs; both existing CJS warnings are retained. These are source/
package results, not inherited old helper or application acceptance.

Case4 committed1037a27 changes only five artifact-identity fields, preserving the
source question, scalar read, exact selected marker/IDE and original budgets.
Actual native `.artifacts/v03/independent-vue-source/2026-10-23T18-56-18-484Z/results.json`
is **FAIL**,2 prior checks/377 stable inputs; original app remains497+known generated
working files/498 immutable originals. It progresses past the DOM-parser failure,
but ordinary `src/utils/random.ts` named exports trigger Babel's ExportSpecifier
local-Identifier validation. Browser/Vite stop0/null, IDE/source gate not reached.
No source/lock/dependency or source-question criterion is changed to bypass it.

Shared transformer was treating export linkage as an executable Identifier read.
A single early exclusion for ExportSpecifier retains actual runtime reads and
export-default expression semantics. Synthetic regression4 was4FAIL, now4PASS,
including actual ESM live binding update, function alias identity, exact default
object identity and one original getter read. The unchanged original random.ts
also transforms/parses with all seven export links retained, without executing any
of its application code. Expanded affected engine/Vue/profile270 PASS; full2521
PASS includes original owned source controls. Only the shared-transform recipe pin
and builder self hash were rebound; normalized comparison proves all other builder
bytes/tool/binary/verifier criteria unchanged. Four affected owned native controls PASS sequentially at
`.runtime/first-profile-runs/2026-10-23T19-12-31-744Z/results.json`, stable inputs
and empty errors. New5/helper packaging and the unchanged-question native case
remain due.
Evidence: `.artifacts/v03/export-bindings/2026-10-23/`.

## Current next step and retained boundaries

Build and admit corrected5 after the affected owned controls, then register its
exact new packet identities with
the same source question and driver before the affected native retry. Use the
installed corrected plugin and exact rebuilt companion VSIX, isolated
owned helper endpoint/VS Code, native private-receipt connect and exact-origin dev
cache/reload scope. Development collection requires its active inspection mode;
this is separate from production change permission or input editing. No override/
replay grant is requested, and no production confirmation is supplied.

Question: why is the original c-input-text textarea enabled? Require disabled=false
on the exact selected marker, original SFC/expression/digest, an actual selected
scalar read and exact IDE range. Preserve parent/default/consumer/NaiveUI-counter
Unknown boundaries. Keep the original app runtime/lock/config/dependencies exact;
its sole prior generated components.d.ts delta is registered. Config overlay is
named setup assistance. An app, source or helper failure remains a failing gate,
never an excuse to use a nearby fixture or remove original macros/dependencies.

ONE whole-increment review remains due **after** the native phase; no premature
review acceptance or completed V03.6 claim. Full V03/A02/L02/V02, local AI,
production/model/performance/macOS/embedding and Chrome installation UI stay open.
No SDK, new design, push/publication or other repository changes.

## Candidate5 identity preregistration

Source98ca688 produced clean sourceDirty false packet
`.artifacts/development/2026-10-23T19-23-45-661Z/handoff.json`. Plugin5 SHAa6362897;
companion VSIX SHAe90c4b73, bundle4abca6c4. Strict private consumer
`.artifacts/v03/installed-vue-consumer/2026-10-23T19-24-04-566Z/result.json` passes
two checks/six metadata probe groups. Exact VSIX bundle matches dist and the
existing recipe reproduced in memory from222 current inputs; two existing CJS
warnings remain recorded. New case5 changes only the five packet-identity fields
from case4. Neither admission nor source reproduction establishes app/IDE runtime
acceptance. Native execution and ONE whole-increment review remain due.

## Candidate5 actual native failures and bounded source-read prerequisite

Case5 committed394a2b1 ran exact5/66/UI2 with377 stable inputs.
`.artifacts/v03/independent-vue-source/2026-10-23T19-25-02-344Z/results.json` is
FAIL:120s app-ready timeout, empty complete DOM, no Vite overlay/error. Its cause
is not established. No IDE started. Original497+known generated/498 immutable
remain exact. Source/compiler fixes alone were insufficient native acceptance.

Drivercf91ab8 adds only browser stderr logging, without an app CDP sidecar, app
listeners or acceptance/order/budget changes. Diagnostic retry
`.artifacts/v03/independent-vue-source/2026-10-23T19-28-14-996Z/results.json` is
also FAIL with377 stable inputs, but original page actually renders baseline
0/0/0/0Bytes and enabled textarea. It fails next at native Attach: Guardian request
budget reached. IDE/source-positive gate remains unmet. Browser startup stderr
retains original locale/Vue warnings; app-from-attach console collector was not
reached. No clean startup-wide console claim is made.

Runtime model reproduces104 simultaneous getScriptSource calls for96 scriptParsed
events. Journal bounds8 of its own pending reads, but fetch-binding/sample consumers
also acquire code. A minimal source-only queue limits4 active/256 waiting jobs
across the runtime. It preserves guardian64, journal8/256, source/byte/evidence
budgets and control/Fetch/cleanup paths, rechecking exact tab/run/debugger-session
identity before and after each read. Overflow is explicitly unavailable; no cached
body or authorization is reused. This necessary change creates Atom67 input
identity and cannot inherit installed66 qualification.

New3 regression was3FAIL (including peak104), now3PASS: finite drain under an
active session, navigation refusing queued old reads, explicit overflow and
unblocked control/detach. Initial green2/3 had an incorrect test drain assertion
after shutdown; shutdown correctly invalidates work. Corrected test drains before
shutdown, retaining the original failure. Atom973 PASS. Full source first
2502PASS/22FAIL revealed the VM harness missing the new import; adapted harness
then24PASS/1FAIL expected old8 concurrent native reads. It now checks4 native reads
while preserving8 Pending+one Queued journal records, zero old-source acceptance
and zero old queue pumping after eviction. Worker+burst25 PASS; corrected full source2524 PASS, zero failures/skips. All logs retained in `.artifacts/v03/source-burst/2026-10-23/`.

Next: commit/package67 with unchanged UI2, qualify exact
new pair and retry the unchanged original source/IDE question with plugin5/helper5.
ONE whole-increment review remains due. No feature completion from documents/tests.
