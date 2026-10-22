# P04.4c.1 normal owned reporter flow

Continues a940653 under scope-review-1. P04/C07 remains in progress:18/29 whole
items (~62% equal count), not release readiness. L02 mandatory/open, A05
mandatory/scoped complete and A02 open are unchanged. No independent-human blocker,
SDK, publication, redesign or other repository.

## Delivered boundary

The existing Prepare current issue dialog offers optional Start window, Read
selected state, Stop and review, and Delete window. Reporter words stay first and
survive Stop/reacquisition. Start only collects bounded post-start metadata; sampled
reads do not click or change the application. Preview/Save/download stay blocked
while recording or changing. Stop is not undo. Original selected state and later
sampled values remain distinct; unknown dependency/mutation time and pending
unobserved outcomes stay explicit. Private fields default off; form/text/body/query/
headers/error message/stack are ineligible.

An inert per-view controller owns one bounded operation/epoch/abort and exact private
window identity. Cancel/context change/disposal fences late replies and stops only
the owned window. Connection loss never reconstructs authority. Failed Stop stays
unconfirmed rather than fabricating a stopped window. Saved/imported reports hide
runtime controls. A separate state.observationOwnerId selects only observation
metadata/decisions; ordinary capabilityPolicy keeps its original owner context.
Observer-only invalidations preserve the dialog through a shallow metadata load;
original generic invalidation/selection freshness remains unchanged.

Stopped capture uses the input controller's exact investigation/revision, preserving
the unchanged nested input capture and independent clocks. It never flushes Live,
applies a Draft or substitutes local draft text. New optional controls are executor
choices within the U06 brief, not newly maintainer-approved detailed UX or parameters.

## Current verification

Aggregate `.artifacts/p04/owned-reporter/verification57.json`:
`PASS_PACKED_OWNED_REPORTER_CSS_ENTRY_NOT_WHOLE_P04`.
Exact57 handoff `.artifacts/atom/2026-10-22T13-53-02-948Z/atom-handoff.json`;
UI0.2.0-candidate.20261018.2, API/wire1/shared contract2.1 unchanged.

- `npm test`:2347/2347 PASS,0fail/skip/cancel,95515.059862ms. All505 input
 fingerprints match before/after/current (`full57-final.log`).
- Focused current controls407/407 PASS (`focused57-final.log`), including late
 Start/read/Stop/clear, synchronous cleanup failure, failing view callback,
 separate policy selector, explicit new point, privacy and unchanged input capture.
- `npm run pack:atom`, two installed strict type consumers and nine admission
 controls PASS (`pack57.log`, `types57.log`, `admission57.log`). Exact archives,
 source/build inputs, installed pair and both host manifests verified.
- `node tests/integration/handoff-observation-reporter.mjs <exact57 handoff>`:
 19 native checks PASS, both packed hosts, Chrome153, no console warning/error or
 inspector/reader page error. Actual trusted-HTTPS/profile CA/site permission and
 existing **manual CSS lookup UI** select the point; no TLS bypass, preapproval or
 parallel app-target CDP. Independent harness sends trusted Input through Atom's
 existing debugger lease for manual fixture reproduction; observer never acts.
- Actual Describe/Start/sampled reads/manual form+network+error/Stop/review/Save/
 exact download/passive reader pass. Stop leaves a pending app request alive;
 after its real completion the stopped row remains unobserved. New text point
 excludes newly sampled text. Cancel stops without saving or restoring app state.
- Current screenshots390/440/200% zoom/reduced motion/no horizontal overflow;
 body13px/control12px retained. Agent inspected first390 and embedding privacy200.
 Existing native controls/classes were reused, no shared CSS/token change. Reference
 set has no observation reporter screen: this is an optional existing-dialog section,
 not a new visual system. Images remain human-review candidates.

## Preserved failures and remaining gates

Native attempts14-00-22,14-06-17 and14-14-09 timed out selecting disabled Confirm via
primary picker before any Start. The third screenshot shows native hover, but no
inspect-node event was recorded by the bounded panel audit. Cause remains unresolved;
CSS entry qualification does **not** repair or requalify picker. All three exact
results/screens/driver snapshots remain in `.artifacts/p04/owned-reporter-native/`.

Source REDs retain missing controller/UI/paired capture, cleanup Promise/view error,
notification scope, separate selector and explicit-point cases. Earlier2346 full /
406 focused results predate the last explicit-point test/fix and are historical;
only final2347/407 with matching505 inputs support current source claims.

No F05 edit during this native window was exercised; input admission stayed read-only.
Native selection entry via picker, interrupted/unowned retention/export, actual H08/
H09, broader budget/performance and ONE whole-P04 review remain open. Existing
historical evidence/acceptance thresholds are unchanged. Next bounded item:
**P04.4c.2 retain/read/delete interrupted metadata without restoring an owner**.
