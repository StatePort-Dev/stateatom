# P01 — whole-item review and one bounded correction pass

2026-10-22 (Mauritius). Approved scope: `scope-review-1`; reviewed range
`63c4173..0b015fcaa376d8d0a3c5f677c9f0ad17477e5401` on main.
Historical checkpoints 69–74, immutable packages and failed runs remain unchanged.
This record concerns selected native/own-host handler source mapping, not C06 as
a whole, production readiness, invocation or property/HTTP provenance.

## One whole-P01 review

The read-only reviewer inspected the approved P01 brief, current code, exact .38
package/host identities and retained native evidence. No Critical issue or Minor
actionable issue was established. One Important issue prevented closure:

`core/source-maps.mjs::sourceExcerpt` recognized only LF. A correct mapped original
line 2 containing CR-only, U+2028 or U+2029 therefore returned no excerpt. The map
session treated that as an invalid original position and suppressed analysisInput,
although the shared analyzer correctly resolved the same source function. LF and
CRLF were positive session controls. This was a P01 defect in the promised path,
not a request for additional P02 functionality.

Reviewer verification:94 focused source checks,305 current .38 source/build hashes,
exact tarballs/installed pair/both complete host payloads,172 exact Worker inputs,
unchanged normal browser allowlist and12 immutable Node bindings/graph parity cases.
The retained HTTP Worker6, packed analysis46, native49, own-host65 and Node/IDE105
results were inspected, not rerun by the reviewer. Narrow screenshots remained
candidates; no independent human visual acceptance was claimed.

## Correction and failing/control cases

The executor independently ran the retained reproduction before changing product
code. It reproduced the three Unavailable cases and two successful controls through
the actual session → ZIP import → private anchor lookup path. This is source/session
evidence, not a browser run. Files:

- `.artifacts/p01/review-fix/reviewer-reproduction.mjs`
- `.artifacts/p01/review-fix/reviewer-results-0b015fc.json`
- `.artifacts/p01/review-fix/root-reproduction-before.json`

One bounded fix makes preview line boundaries agree with JavaScript and the shared
analyzer:CRLF counts once; CR, LF, U+2028 and U+2029 delimit lines. Columns remain
UTF-16 offsets. No parser, callback collection, authority or evidence rule changes.

Six new tests produced a RED run on the old implementation (three session cases and
the excerpt case failed; LF/CRLF session controls already passed), then all26 affected tests
passed. Each of the five session variants exercises both native and own-host anchors
through the real provider and shared analysis, with no source body in the snapshot.
The excerpt control covers mixed separators, UTF-16/surrogate offsets, trailing empty
lines and out-of-range columns/lines. Existing invalid-position refusal is retained.
RED/GREEN logs are `red-line-separators.log` / `green-line-separators.log` in that
directory. The post-fix raw reproduction keeps the script's hardcoded baseline
revision label; it was run on dirty corrected source, not on clean 0b015fc.

Candidate .39 is a new immutable artifact; .36/.37/.38 are not overwritten. Exact
packed verification and final acceptance are recorded below.

## Executor scope rulings

The reviewer explicitly declined the following broader judgments; executor rulings:

| Considered scope | Ruling |
| --- | --- |
| Concurrent campaign failure root causes | Unknown, retained as negative evidence. Do not claim environment attribution, correction or concurrent reliability. |
| Renderer/version authentication and callback-object equality | Not established. Current own-host slot/native location is the finite claim; no additional P01 gate is invented. |
| Invocation, branch selection, state/props/HTTP ancestry and A02 | Separate evidence/tasks. Handler source does not close these gaps. |
| Full listener census, delegated app-handler recovery, inaccessible roots, portals or other frameworks | Outside the declared finite collector profile; explicit Unsupported remains. |
| Browser Vue SFC parsing | First browser grammar remains JS/TS/JSX; existing Node Vue adapter is preserved. No new browser SFC claim. |
| P02 bundle preparation/bulk matching/companions/corpus/indexed maps | Next task; existing provider/Worker is credited only as foundation. |
| P03 actual HTTPS permissions, SSO and corporate artifacts | Separate task; loopback minified P01 controls do not establish it. |
| Global p95/overhead and independent-application acceptance | V02/V03 remain open; finite P01 measurements do not waive targets. |
| L02 model usefulness, SDK, official StatePort consumer and publication | L02/I01 and release work remain separate; SDK/other repository/publication excluded from this run. |
| Independent-human acceptance | Not a blocker under approved scope; no human acceptance is asserted. |
| Entire-UI pixel fidelity | No redesign/full UI audit. Existing supplied references and bounded source-view deviations remain recorded; screenshots are candidates. |
| Historical model/native campaigns | Preserved at their exact checkpoints, not rerun or upgraded into current proof. |

The .38 concurrent failures (picker timeout after4 Action checks; Guardian startup
failure after26 source checks) remain unresolved. Unchanged sequential49/105 controls
establish the finite workflows, not a cause for those failures. The reviewer and
executor agree that separate-browser concurrent harness execution is not the P01
supported workflow or a new P01 completion gate. This is a scope ruling, not a waiver
of a discovered failure in the claimed sequential handler/source path.

## Final verification and acceptance

Exact candidate **Atom .20261021.39 / UI .20261018.2**:
`.artifacts/atom/2026-10-21T21-35-58-182Z/atom-handoff.json`.
It was built from0b015fc plus dirty corrected source; no clean-HEAD build claim.
The complete305 source/build hashes, exact tarballs/installed pair/both complete
host payloads match the correction. The Worker and UI tarball are byte-identical
to .38. API/wire1, UI2.1 and the separate172-input Worker gate remain unchanged.

| Verification | Result | Actual scope |
| --- | --- | --- |
| RED → GREEN affected source/session |4 intended failures →26 PASS | Five separators, both anchor kinds, exact provider/analyzer and invalid/UTF-16 controls |
| Focused source |146 PASS | Source maps/anchors/provider, legacy/shared actions and Worker/runtime/UI |
| Full `npm test` |2004 PASS;0fail/skip/cancel | Approved local process/loopback execution |
| `npm run build` |PASS | Browser/IDE/minified fixture outputs; existing CJS import.meta warnings retained |
| Immutable Node parity |12 PASS | Original bindings and complete graph unchanged |
| Packed source-analysis |56 PASS |1pair +27 standalone +28 embedding;10 new real separator controls |
| Native source regression |49 PASS | Original criteria; actual .39, sequential |
| Own-host source regression |65 PASS | Original criteria; actual .39, sequential |
| Node/IDE Actions regression |105 PASS | Actual current IDE and both exact .39 hosts, sequential |
| Packed strict TS consumers |2 PASS | NodeNext and browser Bundler |
| Package admission |8 PASS | Includes missing Worker asset and retained historical contract controls |

Fresh actual results:

- Source analysis:`.artifacts/p01/source-analysis-native/2026-10-21T21-36-15-655Z/results.json`
- Native source:`.artifacts/p01/native-source/2026-10-21T21-37-33-408Z/results.json`
- Own-host source:`.artifacts/p01/react-source-native/2026-10-21T21-38-26-165Z/results.json`
- Actions/IDE:`.artifacts/a03/actions-native/2026-10-21T21-39-29-039Z/results.json`
- Package admission:`.artifacts/atom/compatibility/2026-10-21T21-36-33-274Z/result.json`

All four current native campaigns have stable before/after registered inputs,
zero recorded errors and exact .39 handoff binding. Actual source-analysis controls
retain zero application callback/effect counters and distinguish the two loaded
JS/script/DOM anchors even where original/map/provider identities agree. Current
440/390/keyboard samples preserve the recorded typography/layout; no new visual
design was introduced. Screenshots remain candidates.

The first sandbox `npm test` attempt retained1994 PASS/4 FAIL: child spawn and
loopback listen EPERM prevented the four owning tests and six child cases. The
unchanged approved execution then passed all2004. This known permission failure is
separate from the .38 concurrent native failures whose cause remains Unknown.
Historical actual HTTP Worker6 is reused only by exact Worker-byte identity;
it is not called a new .39 HTTP run. Current .39 MV3 execution is independently
covered by56 actual product controls.

Reproducible aggregate:
`node .artifacts/p01/review-fix/verify39.mjs` →
`PASS_BOUNDED_P01_AFTER_ONE_REVIEW_AND_FIX_PASS 2004 56 49 65 105`.
The JSON receipt, raw logs and input/output hashes are in the same directory.
No second whole review or repeated historical model/experiment campaign was run.

**P01 complete within its own approved brief**, after one whole review and one
verified Important correction pass. Implemented/native-verified are established;
official-host integration/release/human approval are not.16/29 original full tasks
are complete (~55% equal item count, not weighted release readiness). Mandatory
L02 usefulness and A02 lineage gaps remain. One next dependency-ready item:
**P02.1 — explicit local release-bundle preparation**, then P02's own bulk/parse/
companion/corpus acceptance. P01 does not complete C06/P02/P03 by itself.
