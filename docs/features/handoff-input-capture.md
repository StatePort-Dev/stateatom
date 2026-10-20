# U03.2c.2 — atomic runtime input snapshot

Working implementation decision under the existing autonomous U03 task, not an
additional scope-interview approval. Consumes the U03.2c.1 model and actual editor
ownership. No public file schema, persistence, reporter UI or saved-U02 acceptance.

## Read boundary

Add `inputs-capture` with tabId and required ownerId, optional includeContent
(boolean), notes (string <=1024), includeCategories (the four outcome categories,
unique, default empty). Optional investigationId and expectedRevision must occur
together and match the existing full editor. Reject extra fields, snapshots,
rules, permissions and caller-supplied capture contexts. Existing 64KiB request
budget applies. Require a live inspector connection, including at the dispatcher;
legacy requests cannot acquire this operation. Existing full editor, including a
closed editor, must belong to the same session/client/owner. Busy legacy trials
still refuse capture. An absent editor is explicitly not-recorded.

Capture is local historical metadata. Admission and execution must not call the
browser target authority refresh, editor.read, identifySelection, attach, app CDP,
helper, fetch, storage or grant APIs. It neither refreshes browser permission nor
attests that the selected node/value still exists. Existing lifecycle events may
invalidate its context. This choice avoids a nominal read implicitly closing
rules or creating a new observation. Normal capabilities queries retain their
existing refresh behavior.

## Atomicity and identity

At editor construction, retain actual selected native document/node, main native
frame ID, origin/run, original selected observedAt, inspection/source/lease
generations and investigation ID beside the private owner; never restore this
context from storage or reconstruct it from v1. Missing actual context stays null.

In one synchronous section, read existing selection (or historical target), make a
fresh strict v1 diagnostic with a single capturedAt clock, and take editor.snapshot
or the retained compact runtime summary. Use the model's inert copy before its
first await. Original selected time/value and later editor observation remain
separate. `build:null` for inputs remains distinct from the diagnostic sample hash.
After hashing reject cancellation, disconnected/replaced inspector, changed owner,
editor identity, selection/stale target identity/content, origin/run/frame,
inspection/source/lease generations or snapshot content. Revision alone is
insufficient: pending, cleanup and acknowledgements can change without revision.
Do not block edits while hashing. A retry takes a fresh snapshot; never retry by
replaying an edit or silently accepting a newer investigation. Missing/changed
context in an otherwise stable historical capture stays unjoined; compact worker
summaries remain incomplete and never recover transaction details.

Return deeply frozen `stateatom.input-outcome-capture/1`, exportable:false,
executable:false, capturedAt, diagnosticRaw, outcomes and fixed acquisition
limitations. <=2MiB total UTF8, reject excess. This internal reply is not accepted
by public report parsers or storage. It contains no raw snapshot, active rules,
plan, grant, writer or undo capability. The model's content consistency plus the
runtime guard establishes only the acquisition boundary of this stored snapshot,
not original-occurrence execution, causal dependency or successful restoration.

## Verification

RED/GREEN strict transport, policy and owner gates; actual runtime/editor APIs in
the source harness with missing/closed/summary, explicit expected revision,
Live/Draft/Apply/undo/baseline, per-resource unknown/error phases, privacy, exact
before/after side-effect counters and hash races (selection, editor, revision,
pending/cleanup, disconnect and cancel). Synthetic CDP/ACK tests stay labelled.
Fresh immutable Atom package, strict packed consumers, admission and bounded real
both-host capture using real input operations, with honest backend-vs-normal-UI
scope. Old majority, expiry and legacy evidence is retained, not renamed fresh.
Normal public format, persistence and granular reporter/recipient review follow.
