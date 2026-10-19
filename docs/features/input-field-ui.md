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
