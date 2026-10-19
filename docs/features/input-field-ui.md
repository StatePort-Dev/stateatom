# U02.4 field editor — working implementation mapping

This continues the existing U02 plan on base `3e7f370`. These are new working
implementation choices under the autonomous task, not earlier scope approvals.
Production lifetime/scope belongs to F05; handoff UX belongs to U06.

The required reference is the supplied extension-ui `design/` bundle:
`README_RU.md`, `docs/HANDOFF_RU.md`, `docs/ATOM_EDITORS_UX_RU.md`,
`design/SCREEN_INDEX.md` and recorded `design/figma-current.json`.
Atom Inputs/Draft/Applied/Restored screenshots and `source/app.js` govern the
440px composition, first-screen rows, native controls and short explicit statuses.
Shared tokens and primitives stay unchanged; reference files are preserved.
The prototype's synthetic adapters and historical tests supply no runtime proof.

## Bounded sequence

1. **4a — inert draft/ack model.** `input-draft.mjs` prepares existing data plans;
   it has no writer, transport, timers or UI importer. Unit models prove only its
   scoped state transitions. There is no new archive or field readiness claim.
2. **4b — actual inspector ownership.** Bind an editor to a live inspector
   connection, close only owned resources on view/tab/context loss, preserve
   foreign consumers, and test real close/reopen in packed hosts. Backend
   cancellation and historical receipts must remain intact.
3. **4c — rendered fields and timing.** Compose the existing Inputs region with
   source-family selection, Live/Draft, typed fields, explicit Apply/Discard,
   undo/baseline, refresh/status and guarded scheduling. Verify actual keyboard,
   narrow viewport, font sizing, acknowledgement races and reference differences.

Task 4 and U02 remain open until all required pieces are verified. Task 5 retains
both-mode catalogue/majority criteria and the separate legacy causal experiment
criteria. Backend plan modes do not count as field-mode acceptance.

## Field and acknowledgement mapping

| Reference intent | Working Atom mapping and limit |
| --- | --- |
| Values above editors | Keep the current selected-property/expression workspace and existing passive-reader font policy |
| Received → Draft | Native rows use observed value → local draft. JSON rows distinguish prospective rule value from received/consumed application data; a waiting rule is never labelled delivered |
| Boolean, number, string, enum | Explicit true/false; complete finite numeric text; literal string; native select's observed enabled options only. Never infer enums from names |
| Source labels | Derive short labels from recorded resource identities; expose complete locators on demand. No invented source/provenance edges |
| One draft | Keep raw text, validity, resource revision and local edit version together. Both modes share the same ExperimentPlan contract |
| Apply and statuses | A local opaque ticket binds one submitted version per field to its own backend transaction. New typing survives a late acknowledgement; only confirmed own revisions can rebase it |
| Mode switch | Switching a dirty Draft to Live preserves all raw drafts and pauses automatic commits until explicit Apply or Discard. Invalid text stays visible and local |
| Partial application | Clear confirmed submitted versions; retain failed/unattempted drafts and actual errors. Unknown receipts never clear a draft as successful |
| Refresh and undo | Preserve unknown consumption/effect, external-revision refusal and adapter-specific restoration. No implicit reload/request/storage reset |

The supported backend exposes response scalar leaves and native form controls.
Prototype-only arbitrary local state/props writers, full JSON root replacement,
HTTP status/delay editing and cross-adapter atomic groups are not introduced.
These deviations preserve the real adapter/permission boundary and do not alter
the fixed catalogue denominator or acceptance thresholds.

The draft model rejects older observations of the same investigation and late
replies from another investigation. Closing/replacing a context invalidates its
local tickets. That local invalidation is not native cleanup; 4b supplies the
actual resource lifetime guarantee. Invalid intermediate numeric text, empty
strings and UTF-8 byte limits remain explicit, without restoring a previous
valid value or silently converting blank input to zero.

## 4b inspector ownership contract

Input ownership is the envelope's client session, its optional live runtime token
and optional bounded per-view `ownerId`. Another client/view receives BUSY rather
than adopting or closing an active editor. Reusing a client across unmount/mount
does not make an old view's cleanup authority applicable to a new view. Cleanup
must retain the owner and current investigation. A closed investigation is not
fresh authority for reopening.

The local host explicitly registers `createInspectorConnections(...).acceptPort`
and passes that registry to its trusted dispatcher. The opted-in Chrome transport
waits for a private native Port admission before owned requests. Disconnect marks
runtime ownership inactive synchronously, cancels only its pending jobs and closes
only its editors. Startup refusal/loss has no unowned fallback, heartbeat or saved
metadata adoption. Older custom hosts retain the default opt-out transport.
Native sender metadata is checked when supplied; missing optional document data
is not invented. A per-client connection callback reports loss, not completed
native cleanup.

A stale background editor read can finish after another inspector has started a
fresh inspection. Its failure may invalidate only its captured tab record,
run/generation, selection and editor. It cannot invalidate the new generation;
selected native node/property/value freshness checks remain mandatory.

Page closure is distinct from disposing one mounted view while keeping a client
alive. The actual page-close/reopen backend is checked in 4b; 4c must still wire
per-view close/cancellation, keyboard actions, fields and timing. Connection loss
requires explicit reopening/recovery guidance; the backend does not silently
reconnect a stale writer. Removal of response rules/observers never promises
application or server rollback.


## 4c.1 queue/controller boundary

The unbundled controller has one per-view owner and one in-flight operation.
Text/number changes coalesce for the current working 250ms interval; invalid
latest text cancels older timers, while boolean/select values flush immediately.
Blur/Enter can explicitly flush a valid field once. Mode changes cancel queued
automatic work and preserve held drafts until explicit Apply/Discard. Already
sent work remains an acknowledged or uncertain application effect, not cancelled
merely by deleting a local draft. Refresh reads runtime inputs only; undo reads a
fresh runtime revision before requesting guarded restoration.

Failed opening replies still trigger scoped cleanup. Late old replies cannot
publish into a new context and close only their old investigation. Connection
loss performs no unowned fallback. Context loss retains one read-only old draft;
starting another scope requires explicit discard rather than silent migration.
These are source/controller choices, not installed field behavior. 18 models,
88 focused and 948 full tests pass; actual view/timing/native/visual checks remain.
