# P04.4d.2 — same-inspector reporting beside admitted edits

Continues `54b3b47` on main under approved `scope-review-1`. This completes the
bounded H09 coexistence increment, **not whole P04/C07**. Whole tasks remain18/29
(~62% equal count, not readiness); mandatory L02 open/A05 scoped complete/A02 open.
No SDK, publication, other repository, redesign or independent-human blocker.

## Behavior and authority

The existing current-issue dialog now offers **Continue in inspector** during its
owned recording. It closes only that dialog, retaining the original selected point,
reporter words and window. A footer status directs back to Diagnostic. Preparing
that same current issue reopens its retained source without another capture,
Live flush or Draft Apply. Cancel/Escape/context/disposal still stop. Stopped
review reacquires the existing exact same-inspector paired input/window capture;
foreign input owners, including closed editors, cannot be borrowed.

Only an input-history notification carrying the exact current owned window ID
uses a shallow metadata refresh. An actual edit immediately removes old execution
and source analysis while retaining the original historical DOM point. Generic,
foreign and older-window notifications retain ordinary invalidation behavior.
The typed event fields are additive; API/wire1/UI contract2.1 remain unchanged.

Reporting grants no editing authority. Actual edits still require the existing
independent F05 Settings confirmations and U02 input editor. Native acknowledgements,
selected DOM samples, original observation and unknown consumption/effect are
separate. Stop and revoke do not promise application/server restoration.

## Exact verification

Atom `0.1.0-candidate.20261021.59` / UI `0.2.0-candidate.20261018.2`:

- `npm test`:2374/2374 PASS, no skipped/cancelled/failed tests;95200.497176ms.
  All510 source/test input hashes match before/after and current source.
- Focused source157 PASS: real controller/codecs, scoped runtime notices and mounted
  inspector; matching notice clears execution immediately, foreign-window notice
  follows ordinary clearing. RED controls include missing Continue, generic input
  invalidation, missing window binding and stale-notice acceptance.
- `npm run pack:atom`:PASS; `npm run verify:atom-types -- <handoff>`:2 installed
  strict consumers PASS; `npm run verify:atom-package -- <handoff>`:9 PASS.
- `node tests/integration/handoff-observation-input-native.mjs <handoff>`:17 PASS
  across standalone and embedding,0 console warnings/errors. Actual Chrome153,
  isolated headed profiles/nested display, trusted synthetic HTTPS, actual native
  CA import/site Allow, no TLS bypass, permission preapproval or parallel app CDP.
  Existing manual CSS entry is explicit; picker remains unqualified here.

Exact handoff: `.artifacts/atom/2026-10-23T06-57-11-862Z/atom-handoff.json`.
Aggregate: `.artifacts/p04/input-coexistence/2026-10-23/verification59.json` binds
source, logs, archive/install/host hashes and every preserved native attempt.
Final native receipt:
`.artifacts/p04/input-coexistence-native/2026-10-23T07-08-29-231Z/results.json`.

Both hosts exercise Settings' two confirmations without app action; Start/read/
Continue; actual Live edit and retained original point/words/window; an explicit
Undo refusal; separately staged Draft/Apply; a further unapplied local draft;
Stop/review/default-private download/Save; actual file input in the passive reader;
and independent editing revoke without app restoration. Actual input transactions
are `apply`, failed `undo`, `apply`; consumption/effect remain unknown. Private form
values, query marker and raw nested captures stay out of the downloaded report.

The original `AB` is shorter than this fixture's `minlength=3`. Existing native
validation refuses Undo with `INVALID_CONTROL_VALUE` before any write. The failed
transaction and unchanged app value are asserted and carried through the report;
this is **not a positive Undo or whole-app restoration proof**. No validation rule
or historical U02 criterion was changed to make this scenario pass.

Preserved native attempts:06:58/06:59 FAIL1 due driver Home→Text causing an
asynchronous property change before ArrowDown;07:04 FAIL4 at the new driver's
incorrect positive Undo expectation;07:06 FAIL1 before app setup at Certificate
Manager's native file-read error;07:07 FAIL6 because a broad substring assertion
matched allowed `inputCapturedAt`. Final driver awaits actual Attach/dialog close,
changes Property from its current index, preserves the failed Undo and checks exact
forbidden raw keys separately from private-value absence. These corrections change
no product thresholds. Every original receipt/screenshot remains.

## Visual reference and limits

Compared rendered390px first viewport and stopped dialog with supplied
`packages/extension-ui/design/screens/atom/10-narrow-inputs.png`, reference
README/HANDOFF/SCREEN_INDEX and `docs/design/extension-ui.md`. Shared header,
section rhythm, native controls, blue actions and existing13px body/12px controls
remain; there is no token/CSS change. The supplied prototype has no observation
window screen. The optional dialog action and footer hint extend the existing Atom
flow, rather than claiming pixel identity to its simulated API-input panel.
Both hosts'390px/200% screens have no horizontal overflow and retain reduced-motion
support. Native selector keys/text entry and controller focus/pending guards pass;
screenshots are agent-inspected candidates, not human visual/usability approval.

Next single bounded item: **P04.4d.3 remaining H08 embedding deadline review/export
and lifecycle**. Reuse credited historical58 subchecks only with exact unchanged
input proof; any new59 run is labelled fresh. Primary-picker entry diagnosis and
ONE whole-P04 review remain separate gates after that work. Historical93 FAIL29
and94 handoff remain unchanged. Documents alone establish no feature readiness.
