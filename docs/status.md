# Project status

Active delivery scope: approved **`scope-review-1`** on 2026-10-19; see the
[completion contract](completion/02-release-scope.md) and
[current reconciliation](completion/13-scope-reconciliation.md). This supersedes
earlier delivery exclusions and independent-human gates, not historical evidence.
The source-exploration increment is complete within its original boundary;
P01–P03 remain partial. The subsequent
[F01 implementation](completion/14-f01-capability-contracts.md) consolidates
capability policy and checks packed declarations on candidate `.20261019.3`:
586 unit, 48 contract, 34 two-host, 26 Basic, 32 Actions and 19 source-map checks
pass, with separate strict type and controlled-client UI checks. These are scoped,
agent-operated results; no Action Trace, Live/Draft, production edit grant, SDK or
real-model inference is added. F02 is next; no release or human-study claim follows.

Current checkpoint: **2026-10-18**, [closed first-read developer preview](roadmap/2026-10-18-closed-first-read.md).
The maintainer accepted the demonstrated scope as an **alpha** after the live
demonstration of revision `2958d2b`. This records maintainer acceptance of that
scope, with the following verification and limits.


A later **2026-10-19 production source-mapping candidate** adds offline/map URL
source exploration for scripts loaded in the selected tab, strong per-artifact
matching, explicit read-only HTTPS site access and private-content-free map
diagnostics. Manual generated-position lookup is **not linked to the element**;
no production UI/property producer anchor or runtime lineage is claimed. See the
[verification record and remaining gates](testing/production-source-mapping.md).

Original P2 and the distinct destructuring P1 now pass a scoped complete HTTP
exchange/field trace in the controlled first-read configuration. The actual
installed VSIX passed 17 panel/IDE/export/fresh-reader UI checks. Separate native
Query/React and session controls passed 15 and 5 checks; the retained short loop
has 106 checks, 20 PASS / 10 expected PARTIAL. All three preregistered independent
application questions retain useful source/value fragments. Clean-source install,
491 tests and build passed; all 34 outputs match. A fresh 17-check installed-VSIX
UI pass and a separate 26-check IDE-free UI pass confirm this candidate. Local
review artifacts and exact manifests are recorded in the linked checkpoint.

The finite proof needs owned compilation, a fresh controlled browser, exact pinned
sources and the original first eligible read region. Ordinary dev instrumentation,
later regions, Vue and historical six-family A/B results are not upgraded.
Reproducibility/UI acceptance checks were agent-operated at the user's request.
Independent developer installation/usability remains unverified. Source was pushed
in `2958d2b`; no release or Store submission is established.
Older entries below retain their original evidence, versions and criteria.
The later [repository layout](repository-layout.md) relocation preserves those
results; its [verification record](testing/repository-layout-validation.md) includes
new short-loop and installed-helper UI runs rather than rewriting historical hashes.

Last recorded baseline: **2026-10-17**.

StateAtom is an experimental project. The latest available prototype summary records **NARROW SCOPE** for the technical result and **NOT READY** for a public OSS alpha.

## Basis of this record

This snapshot records a maintainer-provided summary of Phase 2. The underlying source revision, individual case reports, and raw evidence are not included in this documentation baseline. These are reported observations, not an independent verification by the documentation package. A later result should include the revision and reproducible commands that support it.

## Reported observations

| Area | Reported result | Limit of the result |
| --- | --- | --- |
| Independent project-connected workflow | Browser and IDE builds and a narrow scenario ran without Desktop or a closed resolver in a fresh temporary directory | The offline dependency installation used an existing environment; a public-source build procedure has not been established here |
| Local interventions | The scenario exercised two API sources, repeated interventions, rollback, and Restore with a stale state | This does not establish every deep provenance path or a general restore guarantee |
| Extension-only entry | The attempt encountered an IDE-pairing requirement | The intended basic browser workflow was not available in that attempt |
| Complete deep paths | The reported result remains **0/6** | The summary does not establish the exact configuration and first unproven edge for each case |
| Diagnostic handoff | A harness created a bundle readable without IDE or Desktop | User-facing creation and export are not established by that result; the bundle is not a State Card |
| StatePort integration | A boundary and contract were described | The contract remains proposed and unverified |

The historical matrix used labels whose definitions differ from the intended extension-only mode: a previous A configuration allowed an IDE. Do not attach the 0/6 result to extension-only operation without inspecting the per-case conditions. Source access and runtime instrumentation must also be recorded separately.

Phase 1 remains recorded as partial and inconclusive. No later result is supplied by this baseline. The report did not establish a public release or integration into the main StatePort product.

## Next technical gate

Resolve the six deep-case results into explicit configurations, confirmed edges, first unproven boundaries, and causes supported by code or observations. Use existing evidence before rerunning cases.

If a bounded fix is justified, verify it on the original case and a control chosen before implementation. Otherwise, define the missing mechanism and the experiment needed to assess it. Do not infer infeasibility solely from missing implementation.

Browser-only access and user-facing save/export remain separate readiness work. Completing them must not silently upgrade the tracing result. Conversely, an IDE-connected success does not establish the same capability without an IDE.

## Updating this document

Add the revision, configuration, criterion, and evidence reference when changing a support claim. Preserve the old result or link to its retained record. Documentation changes alone do not move a case or release gate to pass.

## Repository import verification — 2026-10-17

The original documentation snapshot above remains a record of the earlier Phase 2 report.
The imported current source also includes later basic/diagnostic and Vue regression work;
the old browser-only `Pair IDE first` result does not describe this newer source.

Verified source baseline: `ad018c0d740f320f8dd55cdb0d2ddbff8673e7fd` (local source commit). No upstream Git revision
is claimed for the supplied directory snapshot; see [provenance](provenance.md).
The source commit was checked in a separate clean directory using only publication inputs,
fresh online public-registry `npm ci`, empty npm configurations and a new dependency cache.
No old build outputs, node_modules, vendor code, Desktop or closed resolver were copied.

| Check | Actual result and boundary |
| --- | --- |
| Install / build | 432 public packages installed; full browser/IDE/reader/fixture build and extensions-only build pass. All 490 non-root lock entries retained. |
| Existing unit/regression suite | 87 pass, 0 fail, 0 skipped; includes original suites, diagnostic lifecycle and Vue provenance regressions. No inherited lint/typecheck script exists. |
| Source-connected React P4 | Automated real Chromium MV3 picker and real VS Code Extension Host. Exact source selection confirmed through VS Code API. Three repetitions of left/right/joint interventions yield `[true, true, false]`; all are consumed and rolled back. Separate Restore returns `true`, panel shows Stale. |
| Current browser-only basic flow | 16 checks pass without IDE or SDK: DOM/property selection with Unknown source/deep provenance, local Save, reload/restart persistence, JSON Export, offline reader, hostile HTML as inert text, State Card rejection and Delete. These modules already existed before import. |
| Packaging / origin | Source licenses copied to each usable output; 26 actual IDE bundled dependency license texts retained. No symlink or binary source payload, private registry or external source path. |

Host configuration: Linux, Node 24.19.0, npm 11.17.0, Playwright 1.63.0 / installed
Chromium 153.0.8010.12 revision 1243 with sandbox enabled, VS Code 1.141.0,
open helper 0.1.0 and the included Vite/Babel development plugin. The IDE-free check
used an unchanged synthetic app without the plugin. No host browser or IDE binaries
are distributed. Network installation was verified; fresh OS provisioning was not.

These are automated UI checks, with harness setup/RPC explicitly separated in
[validation](validation.md). Raw temporary artifacts and credentials are intentionally
not published. The runtime bundle hashes before and after packaging edits match;
the build/notice changes do not alter the runtime checked by those workflows.
Manual Chrome UI installation, installed VSIX, Store, other IDEs/platforms, GitHub-hosted
CI execution and a repeat of the full deep matrix were not tested here.

**Product scope: NARROW SCOPE. OSS alpha: NOT READY.** The historical full deep-path
result remains **0/6**; synchronous observed fragments do not establish framework
commit, cache-version, async or complete provenance. Basic/export success does not
upgrade that result. Desktop integration remains proposed/unverified, and diagnostic
JSON is an evidence record, not a State Card or Replay. The original next technical
gate above remains separate work, not part of this repository import.

## Short developer inspector — 2026-10-17

The immediate task is now the bounded short developer workflow. The earlier full
deep-path gate is deferred, not reclassified or passed. The historical short-loop
experiment reported **GO WITH CONSTRAINTS** and 20 PASS / 10 PARTIAL in 30 inspections;
its original reports and artifacts remain unchanged outside this repository.

The current panel groups the selected property, code-linked expressions, available
scalar operand reads and corresponding Open in IDE actions. Trace/independent data,
raw JSON, diagnostics and response experiments are expandable. Each observation is
a **snapshot, not live**. **Inspect again** makes a new selection observation and reads
retained execution evidence without rerunning user expressions. Starting the picker and changing property/tab clear the prior view, including
independent observations. Navigation/reload automatically marks the old snapshot
Stale; reinspection records a new observation in the new run/page context. Configuration is shown as
Basic, Source-linked or Instrumented; the last does not promise supported values
for every selected expression. Vue aggregate text and implicit template operands
retain their unsupported/partial boundaries.

Validation used the working tree on `main` above
`bcde3d0f1572878df662db6bab79e65bc66dd6d0`, not a new committed release.
The executed source, extension build and optional TodoMVC fixture hashes are recorded
in local `.runtime/short-loop-runs/react-loop-accepted-20261017/results.json` and stayed identical
from startup through teardown (51 source inputs, 14 build inputs, 28 fixture inputs).
Executed `browser-extension/panel.js` source SHA256:
`6bde567a745db9d32c27226448d4ce1bbba6832e5c7ff27e12c25dad8d75d6b7`.

| Check | Actual result and boundary |
| --- | --- |
| `npm test` | 96 pass, no failures/skips. Includes five unchanged marker regressions and four new compact-view tests; existing semantics/lifecycle tests retained. |
| `npm run build` | Full browser/IDE/reader/minified-fixture build and final `npm run build:extensions` pass. Root dependencies/lockfile unchanged. |
| `SHORT_TAG=react-loop-accepted-20261017 npm run verify:short-loop` | 30 scored native inspections: **20 PASS / 10 PARTIAL / 0 ERROR**, plus 106 passing UI/configuration/lifecycle checks. Explicit expected T/E/V/I combinations retained. |
| Form reinspection | React and Vue `'' → 'Alex' → ''` yield `disabled: true → false → true`; later observations use the actual Inspect again button. Before reinspection the prior snapshot remains labelled Not live. |
| Selection/lifecycle | Distinct Row scopes for 12/77 on both frameworks; source and operand data clear on property/tab switches. 390×844 and 1280×900 screenshots inspected, no horizontal overflow at 390px. |
| Real IDE navigation | A new exact file/range VS Code API audit follows every scored Open in IDE click. The isolated test host first closes editors so repeated identical ranges cannot reuse an old event. This is test setup, not product behavior. |
| `npm run verify:browser` | All 16 existing browser-only checks pass, including Save, persistence/restart, Export, offline reader, inert hostile HTML, State Card rejection and Delete after moving controls into details. `diagnostic-v1` implementation/contract unchanged. |
| `npm run verify:ide` | Existing advanced-controls regression passes: three repetitions retain left/right/joint `[true, true, false]`, consumption/rollback, then Restore `true` and Stale UI. Host asserts success, the isolated IDE quits and runner exits 0. This does not verify a complete HTTP path. |
| Preservation/guards | All 241 files in the old short-loop directory retain their initial SHA256; copied marker tests are byte-identical. Existing run tags, traversal tags and an existing prepared-fixture destination are rejected without overwriting them. |

Mechanism/harness evidence is separate from UI evidence: the five marker tests
check source range matching, wrong tag/digest rejection, same-line disambiguation
and column offsets; four presentation tests check evidence modes, unavailable/stale
values and omission of independent/repeated/expression-total values. Startup and
teardown hashes identify the inputs actually used. The 106 checks accompany real
MV3/app interactions and fresh VS Code API samples, rather than replacing them.

Through the UI, React P4 links the marker's digest-checked JSX range containing
`creditHold || !canConfirm`, shows the actual `creditHold=true` read, and leaves the
skipped `canConfirm` operand unavailable. React form changes and two Row instances
remain distinguishable; independent React TodoMVC exposes the respective task titles
and `activeTodos.length=1`. A marker alone identifies a source element/range, not a
unique property producer or an executed branch. Runtime values need their separately
validated selected-computation observations. Unknown or ambiguous bindings remain
boundaries, including the preserved Vue PARTIAL cases. Passing their negative-control
expectations does not establish Vue support.

Host: Linux, Node 24.19.0, npm 11.17.0, Playwright 1.63.0, Chromium 153.0.8010.12 with
sandbox enabled, actual VS Code 1.141.0 Extension Host. Synthetic fixtures use root
React 18.3.1 / Vue 3.5.22. Independent TodoMVC revision
`ff43b02e59dfa604386bb382034b2cd07c2bcd8a` uses locked React 19.2.5, React Router 7.14.2,
Vue 3.5.33 and Vue Router 4.6.4. Preparation read a local Git mirror and installed the
upstream locked production dependencies; the remote-clone preparation branch and
fresh OS provisioning were not exercised. No product dependency was added.

The final short-loop run had no page exceptions or Vite overlays and no cleanup
errors. Console health is **not clean**: eight resource-404 console entries remain,
with two HTTP 404s attributed to TodoMVC `learn.json`; the others are not attributed.
These remain recorded, not hidden or treated as proof of broader console acceptance.
The 52.060-second campaign time includes IDE/browser setup, lifecycle checks and
screenshots; it is not inspector latency or measured human productivity.

Independent code review found and prompted fixes for stale detail text, reuse of
old IDE audit entries, missing executed-build/fixture identity, failure propagation,
and an atomic-request race in the test host. Later UI controls exposed missing
automatic navigation invalidation and delayed clearing at picker start; both were
fixed without changing the analyzer, observer or expression semantics. A cleanup-only
failure retained its successful UI checks but was not counted as a successful harness
run. The isolated IDE now uses its own Quit command after host assertions; completion
and exit code 0 are required. A port-conflict run was excluded from mechanism evidence;
a separate setup control confirmed Vite closes on listen failure. The native failing/control runs were
preserved in separate local directories before the final acceptance run.

Publication blockers remain separate: no published extension/SDK/release, manual
installation and installed-VSIX acceptance, first-developer usability/onboarding,
other hosts/platforms, fresh public bootstrap and final publication/license review
are not established by this work. No Store, Desktop or main StatePort integration
was performed. The old full-chain **0/6** remains historical and is not this workflow's
acceptance criterion. **Product scope: NARROW SCOPE. OSS alpha: NOT READY.**

See [short-loop setup and criteria](testing/short-loop.md) for reproduction.

## Autonomous roadmap follow-up — 2026-10-17

The six-family baseline has been reconciled and unchanged React P2/P1 selected.
An earlier ref/Profiler producer probe was **not accepted**. The opt-in pinned React
18.3.1 final immutable host-props probe now has bounded native and actual panel/IDE
verification. It closes one committed host-property edge, not full HTTP provenance
or runtime attestation. Parsed object/field identity is distinct from current value
origin, which stays explicitly Unknown/Unsupported.

The ordinary served dev plugin now observes existing source Promise consumption;
it adds no fetch/JSON Promise reactions. Native off/on controls preserve original
unhandled rejection promise identities and app getter/callback/receiver/error
behavior. Opaque consumers, custom Promise paths and prototype serialization hooks
retain explicit limitations. The browser-only local experiment/save/review/export/
fresh offline reader workflow and all three preregistered questions on two public
applications have separate actual UI evidence. Vue PARTIALs remain negative controls.

Earlier source-consumption candidate: 129 unit tests PASS, clean public-dependency install
and full build PASS, 20/10 short-loop matrix unchanged, bounded host mechanism and
actual panel checks PASS. See [exact commands, input identities and remaining gates](roadmap/2026-10-17-progress.md).
No old experiment was changed. No release, Store/VSIX install or publication occurred.
The complete historical path remains 0/6; full selected HTTP lineage and independent
human installation/usability acceptance remain uncompleted. Product scope remains
**NARROW SCOPE; OSS alpha NOT READY**.


A later opt-in worker increment now displays exact browser exchange identities
for the selected supported P2/P1 traces and retains them through reviewed export
and offline reading. This uses compiled script/context/frame/callsite and completed
request identity, never URL/time/value matching. Its static-document preflight
rejects CSP/report-only policies before Function attempts; known head/context
replacement controls remain unsupported with no fabricated transport binding.
Pre-bootstrap dynamic policy history and global semantic equivalence are not
proved. Current value/state/async/write ancestry remains Unknown; fullPath is false.
The bounded transport result does not pass milestone 1 or the original deep cases.
See the [worker integration contract](superpowers/specs/2026-10-17-worker-fetch-binding.md).


The later frozen worker candidate passes 147 unit tests and a clean public-dependency
install/full build, with all 27 distribution outputs matching this checkout.
Its restricted transport mechanism has 14 passing native controls and 16 passing
actual panel/IDE/export/offline checks, recorded separately in the execution report.
A blocked-constructor CSP side-effect failure remains preserved; the accepted gate
avoids attempts for observed CSP and binds permission to an exact current context.
Agent fallback acceptance is labelled explicitly and does not satisfy independent
human installation/usability. The private security-report route and publication
remain uncompleted distribution gates.


## 2026-10-18 state/write checkpoint

The later opt-in React state/write experiment confirms exact native JSON consumption
→ queue/update → actual bound state → retained hook on committed host ancestry.
Supported ordinary writes and recognized native Object/Reflect calls invalidate
parsed identities, including same-value writes. Coverage remains incomplete and
current field ancestry stays Unknown; fullPath is false and historical deep 0/6
is unchanged. The frozen candidate passed 174 unit tests, 14 native controls and
19 actual panel/IDE/export/offline checks. The short loop retained 20 PASS/10 expected
PARTIAL plus 106 UI checks; browser-only and IDE intervention regressions also passed.
A clean public-dependency source archive passed build/tests and 19 UI checks after
correcting a lost executable mode in the archive constructor. Acceptance is
agent-operated, not independent human. Exact commands, warnings, manifests and
remaining boundaries: [state/write checkpoint](roadmap/2026-10-18-state-write-progress.md).

A separate compiled-script inventory acquisition experiment is in progress. It does
not establish executable closure, readonly effects, full HTTP provenance or alpha
readiness. No public release or repository administrative change has occurred.

The separate compiled-content acquisition now passed 7 native checks: 14 matched
main-default compiled sources, one isolated source, zero unknown/pending at its
checkpoint. Substituted dependency bytes, anonymous/sourceURL code, reload history
and late attachment stay Unknown. Compilation is not execution or ownership proof.
A separate 4-check native devtools counterexample retained host/state correspondence
despite a same-value writer before P1 appeared; current field ancestry correctly
remained Unknown. The latest root unit suite is 188 PASS and full build PASS.
See [execution experiments](roadmap/2026-10-18-execution-progress.md) for the exact
claims, commands and remaining ownership/alias-lifetime gate. These native probes
add no new product UI support or public-alpha readiness claim.

The source-only all-reference prerequisite now follows the exact account/data
lexical candidate and records its cache/function/props/native boundaries. The
original source remains incomplete with Unknown ownership; this adds neither a
resolver nor runtime provenance. The evidence and commands are in the execution
progress report above.

## Later descriptor-fix candidate

A concrete late-intrinsic regression was fixed with captured descriptor/apply
functions. The refreshed candidate passed 204 unit checks, full build, 8 browser
semantic controls, 21 host and 14 state/write controls, the original short loop,
browser/IDE/independent scenarios, and 19 actual UI checks. A clean 193-file public
npm installation reproduced all 27 outputs and passed 19 agent-operated UI checks.
Exact commands, failed controls, warnings and limits:
[descriptor checkpoint](roadmap/2026-10-18-descriptor-checkpoint.md).
This does not establish current-field ancestry, independent human acceptance or
publication. The separate script-entry experiment is PARTIAL and cannot certify
Function invocation history. Native Query handoff acquisition is the next bounded
design, not implemented support.

## Native Query handoff checkpoint

The later opt-in Query acquisition passed 29 native checks and 15 focused reviewed
model/bundle checks. The full unit suite passed 220 checks and full build passed.
Exact native storage/read/assignment/return objects are observed; structural
sharing retains older origins, and reentrant return/current-state occurrences stay
separate. Proxy/accessor/substitution/competing/budget controls refuse unsupported
associations. The concrete Map/Array/call-error semantic regressions found during
acquisition were fixed with retained controls. No blanket intrinsic transparency
claim is made. The existing React panel separately passed 19 UI checks after the
shared observer fix; the Query ledger is not a panel/full-path capability.
See [Query acquisition evidence](roadmap/2026-10-18-query-handoff-progress.md).
Readonly alias lifetime and product-owned code history remain prerequisites to
current-field ancestry. Historical deep 0/6 and the uncompleted release gates are
unchanged.

## Two-site native Query census

A later default-off acquisition matches the native cache.build and following
query.setData call sites to exact body/argument occurrences, retaining Unknown
through wrappers/getters and pre-ready reentry. Both ordinary and Query-only
configurations passed 16 native checks apiece; focused model/bundle review passed.
The existing UI separately passed 19 checks, prior handoffs 29 and source semantics 8.
Custom sharing and later aliases still demonstrate equal-value writes despite
observed native calls. Thus effects/lifetime/current-field ancestry and fullPath
remain unknown/false; no panel cache provenance or full deep-case support is added.
See [two-site evidence](roadmap/2026-10-18-query-calls-progress.md).

## Source-only potential write-access checkpoint

A default-off receiver guard preserves original property operations and invalidates
known parsed fields before eligible source accesses. Skipped logical, failing and
suspended assignments are explicitly potential, not completed writes. Lvalue and
parameter-scope semantic regressions were fixed with retained negative controls.
Native acquisition and actual panel/IDE/reinspection/export checks are reported
separately in the [checkpoint](roadmap/2026-10-18-write-access-progress.md).
Implicit/native/opaque/history and private vendor-input coverage remain incomplete;
no readonly certificate, current-field ancestry or full trace support is added.

The frozen source-only candidate passed 285 unit tests/build with 34 matching
outputs, 19 native acquisition checks and separately 21 real UI checks, including
computed/skipped-logical reinspection and reviewed exports. Original short-loop
results retained 20 PASS / 10 expected PARTIAL. Clean acceptance is agent-operated;
private vendor-input guarding remains a following bounded result.

## Three private Query input receiver guards

A later opt-in extends potential accesses to three pinned adapter-generated Query
inputs, without changing installed dependencies. Root tests/build passed (290),
separate native acquisition passed 10 checks, guarded handoffs/census 29/16, and
actual panel/IDE passed 22. The concrete false-Stale private-source regression was
fixed without accepting private source as verified workspace code. App source
remains current; the auxiliary private notice is Unknown with no value/producer
authority. See [evidence and limits](roadmap/2026-10-18-query-write-progress.md).
This is no complete writer history, readonly or full HTTP provenance claim.

That Query checkpoint also passed clean 231-file agent-operated acceptance: fresh
locked public-cache installation, 290 tests/build, 34 identical outputs, separately
10 native and 22 actual UI checks. Private staged source remains Unknown; exact
app IDE navigation and passive historical reading were exercised.

## Four private React input receiver guards

A later opt-in applies the same potential-access guard to four pinned React/DOM
18.3.1 dev adapter inputs. Root 297 tests/build, 8 native acquisition checks,
21 host / 14 state-write / 7 inventory regressions and separately 23 actual
panel/IDE/export/offline checks passed. The actual object-ref assignment leaves
the previous read historical and conservatively clears field identity on the
following read. App source stays current; private staged source remains Unknown.
Concrete JSX-class and inherited-descriptor getter regressions retain negative
controls. [Evidence and commands](roadmap/2026-10-18-react-write-progress.md).
No complete writer history, readonly, current-field ancestry or full HTTP path is
accepted; historical deep 0/6 and separate release gates remain unchanged.

The React checkpoint also passed clean **236-file** agent-operated acceptance:
fresh locked cache installation, 297 tests/build, 34 identical outputs, separately
8 native and 23 UI checks. The frozen source manifest and nine safe reviewed
exports are recorded in that checkpoint. This does not claim independent human
acceptance, full trace or publication.

## Product-owned compilation journal

The extension now records bounded digest-only CDP compilation facts, including
dependencies and inspection helpers, and exposes them independently in the panel
and passive diagnostic export/reader. Late attachment, interrupted collection and
newer events remain visible; a journal snapshot does not supply execution, source
equivalence, readonly effects or field ancestry.
[Mechanism and evidence](roadmap/2026-10-18-code-journal-progress.md).

The reviewed native checkpoint passed 26 actual UI checks with 49/49 hashes and
zero pending/queued at its export checkpoint. Separate browser-only 26, short-loop
20 PASS/10 expected PARTIAL+106 UI, IDE Restore and three independent fragments
passed. Final current-tab-record lifecycle corrections have dedicated failure
controls and receive a separate clean UI acceptance record. Original complete
P2/P1 and historical deep 0/6 remain uncompleted.

Final successor acceptance is **320 unit checks/build**, a clean **241-file** locked
installation with **34 matching outputs**, and **26 actual UI checks** including
ten reviewed exports/fresh offline reading. The clean compilation checkpoint has
49/49 hashes and no pending/queued records; anonymous/isolated limitations remain.
All current-record/source/hash/storage/refresh lifecycle fixes have retained RED
controls and final read-only review. This is authorized agent-operated acceptance.
Exact artifacts and unchanged full-field gap are in the linked journal checkpoint.
At that acceptance checkpoint, the private security-report route was disabled.
It was subsequently enabled as recorded below; publication and independent human
usability have not occurred.

## Private vulnerability reporting enabled — 2026-10-18

With explicit user authorization, the repository setting for
`StatePort-Dev/stateatom` was changed using
`PUT /repos/StatePort-Dev/stateatom/private-vulnerability-reporting`.
A fresh GET confirmed `enabled:true` at 2026-10-18T10:51:13.516963+04:00.
The previous check returned `enabled:false`. No vulnerability report was submitted;
this enables the private reporting route without testing report delivery or setting
a response deadline. The local verification record is
`.runtime/security-private-reporting-20261018.json`. SECURITY.md and the roadmap gate
now reflect the enabled route. No source publication or release occurred.

## Bounded compiler-input acquisition — 2026-10-18

The separate native probe now connects four frozen workspace inputs through one
actual StateAtom stage, exact returned Vite result object and completed HTTP/CDP
content. Root **343 tests/build**, **23 focused controls** and **9 native checks**
pass; source/dependency manifests stayed stable. Cache identity, invalidation,
changed inputs, substituted wire bytes and a delayed real-plugin cache clone have
explicit controls. A post-stage operator rewrite demonstrates that this compiler
fact cannot establish source semantics or readonly effects.

This is acquisition-only and has no new UI acceptance claim. Product journal,
actual React/IDE/export acceptance and Vue negative controls retain their separately
recorded boundaries. Source equivalence, complete inputs/invocations/effects,
response creator and current-field ancestry remain Unknown/Unsupported; fullPath
is false. Original selected full HTTP remains NOT MET; historical deep 0/6 remains
unchanged. [Reproduction and exact evidence](roadmap/2026-10-18-compiler-input-progress.md).


The following [compiled-effect assessment](roadmap/2026-10-18-compiled-effects-progress.md)
adds 12-check native refusal/control coverage: original helper-source syntax is
conditional, actual compiled helpers stop at opaque observer calls, and two
post-stage same-value writers execute with unchanged selected UI and compiler
correspondence. No readonly/current-field authority is issued. This is harness
evidence with unchanged product UI, not a complete effect mechanism or deep-case pass.


## Observer factory identity and cleanup — 2026-10-18

The factory now reuses only privately retained same-module instances, avoids public
global getter reads, freezes inspector-owned method slots and rolls back failed
publication. Independent descriptor-only restoration preserves application hook
replacements and original exceptions. Application data remains mutable.

Root **353 tests/build**, **31 focused controls**, **16 native identity/compiler/
effect controls**, and separately **26 actual panel/IDE/export/reader checks** pass.
The native changed-body control still writes behind frozen slots; no readonly,
current-field or full HTTP authority is issued. Actual compiled body, closure and
transitive telemetry/intrinsic effects remain open. The existing strict grammar
keeps observer calls Unsupported. Historical deep 0/6 is unchanged.
[Exact revisions, failures, commands and UI scope](roadmap/2026-10-18-observer-identity-progress.md).


The identity/cleanup successor also passes clean **255-file** agent-operated
acceptance: fresh locked public-cache install, **353 tests/build**, **34 matching
outputs**, **16 native controls** and **26 actual panel/IDE/export/reader checks**
with ten exports. Root short loop remains **20 PASS / 10 expected PARTIAL + 106 UI
checks**, stable hashes. Eight known resource-404 console messages remain; no page
exceptions or overlay. Historical files and earlier frozen candidates are preserved.
No readonly/full-field/HTTP, independent human, installed-VSIX or release claim is
added. The linked checkpoint records the precise remaining transitive-effect task.

## Bounded telemetry intrinsic effects — 2026-10-18

Selected private capture/read/member/add operations now use module-captured
clock/collection/formatting references, avoiding the extra callbacks reproduced
by post-bootstrap replacements. At more than 80 unique dependencies, snapshot and
passive export explicitly retain an incomplete/Unknown boundary. Application
expressions/getters are not replayed and application prototypes remain unchanged.

Root **375 tests/build**, **48 focused controls**, **38 native compiler/identity/
telemetry checks**, and separately **26 actual panel/IDE/export/reader checks** pass.
Read-only review found no blocker in this bounded delta. Native and UI source
hashes stayed stable. Captured references do not establish pristine bootstrap,
actual compiled callee/closure identity, complete transitive effects or readonly
authority. Original full HTTP remains NOT MET and historical deep 0/6 unchanged.
[Failures, scope, commands and final acceptance](roadmap/2026-10-18-observer-intrinsics-progress.md).

Final agent-operated clean acceptance uses **259 source files**, a fresh locked
offline install from the public-verified cache, **375 tests/build**, **34 matching
outputs**, **38 native controls** and **26 actual UI checks** with ten fresh-reader
exports. Root short-loop remains **20 PASS / 10 expected PARTIAL + 106 checks**,
stable source/build/fixture hashes. Initial stale-NOTICE comparison and its
reconciliation are retained separately. Known resource 404s remain explicit;
old experiment and prior frozen candidates are unchanged. The next bounded task
is actual observer body/callee/closure acquisition, not acceptance of readonly
wrappers. No full HTTP, human-usability or publication gate is marked complete.

The follow-on [same-body closure experiment](roadmap/2026-10-18-observer-closure-progress.md)
passes **41 native checks** and final **375 tests**. Identical runtime/helper bytes
and an already restored public clock coexist with a captured pre-bootstrap wrapper
that makes three synthetic writes/calls while the original result stays 12.
No exact executed observer callee/closure history is acquired; readonly and field
ancestry stay Unknown. This successor changes only harness/package/docs; all 34
product outputs and product runtime inputs match the frozen accepted candidate,
so its 26 actual UI checks are explicitly reused. This is a refusal result and
identified missing capability, not completion of the original full HTTP milestone.

## Call-specific entry/reference acquisition — 2026-10-18

A separate declared post-transform probe now retains the entered member function
reference by its original returned observation ID, then uses DOM handles and native
own-data/scope reads to obtain function/body and captured-clock metadata. Original
P2 has two scoped member links; original P1's destructuring trace has none and is
explicitly unlinked. Two genuine factories share a FunctionLocation but retain
separate event/owner pages. A native RED exposed cross-observer copied-marker
adoption; final marker/root/event/callee owner checks reject it.

**384 tests/build**, **9 focused entry/owner controls**, and **13 native acquisition
checks** pass with stable inputs and no errors/pauses. No Runtime.evaluate,
callFunctionOn, application getter replay or heap snapshot is used. Proxy/accessor,
retention, context replacement and React repaint reject invalid checkpoints.
Captured pre-bootstrap and bound clocks remain refusal controls: missing a JS
location is not builtin/readonly attestation.

Product source and all 34 build outputs are unchanged. The previous 26 actual
panel/IDE/export/reader checks and short-loop 20 PASS/10 expected PARTIAL+106 checks
are explicitly reused; no new UI integration is claimed. The acquisition combines
an instrumented entry record with a later native closure snapshot, not independent
native invocation or earlier-state attestation. Strong-reference lifetime/privacy
and transitive effects remain open. Original full P2/P1 HTTP is NOT MET; historical
deep 0/6, Vue limits, human usability and publication gates remain unchanged.
[Mechanism, failures, commands and exact evidence](roadmap/2026-10-18-entry-references-progress.md).

## Entry-bound captured-helper frontier — 2026-10-18

The original P2 quota member entry now carries a declared finite frontier of
25 native captured-function references: 18 exact checkpoint JS body digests and
seven opaque leaves. A bound-clock control adds a 26th target reference. Changed
add-helper and captured Map.set writer controls demonstrate why equal root/helper
bodies and restored public methods cannot certify readonly. Edges remain candidate
references with execution Unknown; complete:false and fullPath:false are explicit.

**398 tests/build**, **14 focused tests**, **17 native controls** pass. Independent
review's line-terminator false binding and repeated oversized-source downloads have
retained REDs and fixes. The byte budget is explicitly a post-response stop, not a
transport cap. No product source/UI behavior changed: 82 source files and 36 build
outputs match the frozen candidate, so 26 actual panel/IDE/export/reader checks and
ten exports are reused, not rerun. Short-loop evidence remains 20 PASS / 10 expected
PARTIAL + 106 checks. All 1,527 historical and 241 original short-loop hashes match.

Receiver/key/metadata entry premises, event-time closure/descriptor history,
opaque builtin authority and alias lifetime remain unavailable. This experimental
inventory does not grant product integration or readonly/current-field ancestry.
Original complete P2/P1 HTTP remains NOT MET; deep 0/6, Vue PARTIAL, independent
human and publication boundaries remain. [Details, commands, failures and next
bounded decision](roadmap/2026-10-18-effect-frontier-progress.md).

## Consolidated roadmap attempt and original read operands — 2026-10-18

The experimental journal now retains original receiver/key references and a bounded
scalar immediately after the application's one property read. Native inspection
separately acquires a later own-data descriptor; it rejects getter/proxy receivers
and object-key coercion. Per-owner stop cleanup, inactive refusal, 256-entry
admission cap and a 20-second disposable-context deadline are checked. This is
not product retention, an event-time descriptor snapshot or field-revision proof.

408 unit tests/build, 15 focused entry/operand tests and 23 native checks pass.
The retained inherited-readValue-setter regression is fixed with an own data slot.
Post-read 99 preserves the original captured 12; pre-read literal 12 remains
indistinguishable by checkpoint/value matching, with ancestry Unknown. Product
source/UI behavior remains unchanged. Original complete P2/P1 remains NOT MET.

The next required capability is a bounded parse-to-read revision/dataflow verifier
for both member and destructuring, exercised through product UI with competing
pre-read writers. It does not require eternal readonly after the read or recursive
attestation of every telemetry helper. [Mechanisms, retained failures, commands and
roadmap accounting](roadmap/2026-10-18-roadmap-closeout.md).

## Dependency-repair candidate — 2026-10-18

Release preparation found 15 known dependency advisory records (13 high); exact
pins were updated and the complete repeat npm audit reports zero known advisories.
Vite is now 7.3.7, Vue compilers/runtime 3.5.44, Babel core 7.29.7, Angular 20.3.34,
Svelte 5.57.2 and vsce 4.0.0. React/ReactDOM 18.3.1 dev remains unchanged. The 413
unit tests and root build pass; older version-specific evidence remains historical.

The compiler acquisition pin verifies all 15 new Vite node JS inputs. It explicitly
requires cold acquisition with preTransformRequests:false; native warmup/cache-only
and normalized timestamp requests remain Unknown. A rejected warmup admission and
its false-positive clone RED are preserved; no native-return criterion was relaxed.
The effective helper bundle license is mixed MIT/Apache-2.0, preserving origins.
[Updated candidate, checks and limits](roadmap/2026-10-18-dependency-candidate.md).

## Embeddable local candidate — 2026-10-18

One local `@stateport/atom` tarball now backs both the public standalone extension
and a separate genuine MV3 embedding example, using the existing shared UI peer.
The [validation record](testing/atom-embedding-validation.md) records 509 unit tests,
30 dual-host native checks, 26 IDE-free checks, the unchanged 106-check short loop
(20 PASS / 10 expected PARTIAL), 16 first-read UI checks and 22 shared-UI checks.
These were agent-operated on the recorded working-tree bytes and actual IDE;
no registry release, official StatePort/Capture integration or human usability
acceptance is implied. Analyzer/evidence criteria and earlier results above remain
unchanged. The local package and exact commands are in
`.artifacts/atom/atom-handoff.json`; see [embedding](embedding.md) and the
[separate official-host task](tasks/stateport-host-atom-integration.md).


## Action Inspector local candidate — 2026-10-18

Source-linked React JSX actions, bounded relevant callback/hook relations, separate
native CDP registration metadata and optional template/local explanation providers
are implemented above `6c2c053e98f6775e1a7fa876c7ea9b9cc7380422` in the working tree.
The [validation record](testing/action-inspector-validation.md) records 544 passing
unit/harness tests, the full build, 32 real MV3/IDE Actions checks, 26 existing
browser-only checks and the existing real IDE property/intervention/Restore regression.
Source, registration and invocation remain distinct; every retained execution status
is not-observed. The Actions run's source/build hashes match before and after.

Chrome 153 on the tested device reports local model availability unavailable.
The optional AI UI stays experimental; no real Nano quality, latency, resource or
offline acceptance is claimed. Vue event binding support, executed action tracing
and complete causal paths are not added. Screenshots are candidates for human review.
No release, publication or public compatibility expansion follows from these checks.
