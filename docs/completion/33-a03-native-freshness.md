# A03.3 — native metadata and action occurrence freshness

Status: current source/native/affected-regression matrix passed; subsequent ONE
whole-A03 review/closure is recorded in34-a03-whole-item-review.md. Dirty BASE98edc45bec553f934bd412cb1cccc623c8d9e7cc, exact local
candidate0.1.0-candidate.20261021.5. Plan:
../superpowers/plans/2026-10-21-a03-native-freshness.md. Supported rows/boundaries:
[action matrix](../testing/actions-supported.md). No Action Trace/invocation,
SDK, publication or new runtime framework adapter.

## Scope and missing native parent input

One preregistered finite metadata probe on a real owned Chrome153.0.8010.12/.3
host/light-DOM fixture returned only the selected BUTTON with parentId null:
.artifacts/a03/native-context-probe/2026-10-21T01-08-08-675Z/result.json,
PARENT_ID_UNAVAILABLE_IN_FINITE_PROBE, application callback count0.
The optional primary protocol field was not assumed available. No parent path,
Runtime evaluation primitive, broad tree crawler or permission expansion was added.
Selected/document/html/body lookup remains the bounded actual capability; other
ancestors, window, shadow/portal/logical propagation remain explicit gaps.

Each native scan now checks native document/backend node and an expected selected
render marker before/after acquisition. It uses existing admitted DOM.describeNode
metadata, not an application expression/getter/function call. Metadata rows retain
a scoped snapshotId and per-target readAt (metadata-read time, not registration or
dispatch time). Equal source coordinates do not become callback identity.
Remote object groups are still released; handler descriptions/bodies/closures are
not read or retained. Registration, event reach and invocation remain distinct.

Explicit deep refresh replaces native metadata AND its graph proof atomically.
Old own native graph entries disappear when removed; recycled local native:0 IDs
are scoped by the new metadata snapshot, not treated as persistent function IDs.
Acquisition rechecks tab/selection/analysis/generation/run/attachment after awaits.
Late disconnect cannot publish into the old context. Source edges remain separate.

A changed render marker on the same node/value expires the selected occurrence;
explicit reinspection obtains new occurrence/clock. If revalidation is unavailable,
action freshness expires while the independently observed property snapshot remains.
No missing check becomes a known DOM change. Active input editors retain their path.
Pending picking freezes retained history; Cancel/Escape/delayed picker notifications
restore without deep refresh. A later explicit refresh/action source check still
revalidates current context. Original saved bytes are not rewritten.

V1 diagnostic registration.snapshotId/readAt are optional additive fields. New
valid clocks survive review/import; missing legacy clocks remain missing. Times
are bounded to valid Date range. Advanced native details show read time, not raw
UUIDs. The passive reader shows the clock only when retained and keeps both source
symbol and its missing-transfer reason. No wire/API version break, shared token,
CSS/layout redesign or new publication authority.

## Failing/control cases retained

- Baseline27PASS. Native/diagnostic RED8/3 then GREEN8: missing read IDs/time,
  marker/document/node correspondence and legacy clock preservation.
- Worker RED19/2: refresh reused old listener metadata and same-DOM/value new
  render marker did not stale the old occurrence. Intermediate19/1 failure was a
  NEW test's incorrect field expectation: existing recordStale keeps analysisAt in
  stale.at, not selection.observedAt in stale.target. The test now checks that exact
  existing timestamp contract plus saved raw capturedAt/bytes; recordStale is unchanged.
- Mounted Cancel RED1/1→GREEN; delayed/Escape notification RED1/1→GREEN. Current
  tests retain native IDs/clocks/graph through picking and require explicit refresh
  to revalidate. Original picker criteria were preserved, not replaced by a new clock.
- .4 native run FAIL52:
  .artifacts/a03/actions-native/2026-10-21T01-43-36-478Z/results.json.
  All52 earlier source/IDE/native/prop/staleness controls passed with stable inputs
  and errors[]; fresh reader then hid entry.reason when a source symbol existed.
  The actual export contained the missing-transfer reason. This was a PRODUCT
  reader omission, not a setup failure. Immutable .4 archive/full1648/types2/
  admission7 and failed record remain unchanged. Reader now displays both fields
  in a new immutable .5; no assertion was removed to make it pass.

## Current actual results

- Final npm test1649PASS, zero fail/skipped; focused106PASS, including native,
  runtime, diagnostic/reader, marker failure, late disconnect, pending picker,
  Cancel/Escape and native DOM identity controls. Logs under
  .artifacts/a03/native-freshness/, final full-source5-final.log/focused5.log.
  Intermediate full-source4/full-source5 counts1648 remain separately scoped.
- npm run build:extensions and pack:atom completed; retained CJS/import.meta
  warnings unchanged. Exact handoff:
  .artifacts/atom/2026-10-21T01-53-43-451Z/atom-handoff.json.
  Strict consumers2PASS, admission7PASS, exact archives/installed pair/entire hosts.
- `node tests/integration/actions-native.mjs <exact .5 handoff>` passes105 in
  both immutable native hosts/current actual contributor IDE:
  .artifacts/a03/actions-native/2026-10-21T01-55-11-952Z/results.json.
  All166 source/build/native inputs are stable; analyzer/built IDE are separately
  sealed, not included in the Atom tarball. No fresh installed VSIX acceptance.
- `node tests/integration/ordinary-react-hmr.mjs <exact .5 handoff> --picker-view-only`
  passes16 on the changed runtime/UI:
  .artifacts/a01/ordinary-picker-view-native/2026-10-21T01-58-47-984Z/results.json.
  Actual UI Cancel, real application Escape, trusted Enter guidance, background
  picking refresh, exact old selected/read IDs/clocks/save and equal-row control
  retain original predicates. No whole-A01 re-audit or old frozen verifier rerun.

The105 action checks preserve original/source/object/forwarded/relevant-hook cases,
actual exact IDE ranges, three distinct instance pairs and off/on normal effects.
New native cases observe registration capture/bubble/passive/once, actual fixture
stopPropagation with document-bubble still merely registered, same-coordinate
closure replacement/new metadata IDs, phase replacement/removal/current graph,
and same-DOM/value React callback replacement→stale→current reinspection. Another
row and saved v1 bytes remain unchanged. Application event logs are off/on semantic
controls, not an Atom-observed invocation or causal trace.

Both fresh passive readers run after app server/IDE close. Current payload preserves
source caveat/metadata clocks; exact retained .2 payload remains unchanged and has no
new clock. Reader page requests are file-only, not an all-browser traffic assertion.
Current390/1100px retain13px Inter/no overflow; native advanced details and reader
candidates show the new recorded time/reason using existing controls/type/layout.
Prototype deviations from31-a03 remain; screenshots are human-review candidates.

Affected U03 current reporter also passes33 on exact .5, stable127 inputs/errors[]:
.artifacts/u03/input-reporter-native/2026-10-21T01-59-40-096Z/results.json,
`node tests/integration/handoff-input-reporter.mjs <exact .5 handoff>`.
This checks the changed runtime/reader against the original reporter predicates;
it does not rerun or upgrade the whole U03 historical acceptance.

Final aggregate: `node .artifacts/a03/native-freshness/verify5.mjs` →
.artifacts/a03/native-freshness/verification5.json,
PASS_CURRENT_A03_MATRIX_WHOLE_REVIEW_PENDING. It verifies actual current source/
build/archives/installed pair/entire hosts, all sealed inputs in the three native
runs, original v1 files/legacy missing clocks, source logs/types/admission and
preserved .4/legacy/probe outcomes. At that matrix checkpoint parent A03 was not yet marked complete. A02 lineage, mandatory A05/L02, P04/C07 and release stay open;
SDK remains outside Atom. No independent human is introduced as a blocker.

Subsequent whole-A03 review passed0 Critical/Important/Minor with no reruns;
[34-a03-whole-item-review.md](34-a03-whole-item-review.md) records parent closure. The original matrix receipt remains unchanged.
