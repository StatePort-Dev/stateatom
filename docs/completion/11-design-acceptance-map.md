# Design-to-runtime acceptance map

The supplied screen index is the baseline for composition, not a list of shipped capabilities. Its HTML uses simulated states and demo controls. The production view must use actual runtime responses for every status and action. This map assigns implementation/verification ownership without claiming a fresh live Figma review. [R22][R31]

## Required mapping

| Reference screen/state | Real behavior required | Owner / task |
| --- | --- | --- |
| 00 Start here | Documentation/navigation only; not another runtime screen | Documentation |
| 01.1 Atom / Inputs | Selected property, expression, available original reads, explicit unknown/freshness | U01, A01/A02 |
| 01.2 Atom / Draft | Multiple staged valid edits, baseline/diff, grouped Apply, partial-application semantics and mode switch behavior | U02 |
| 01.3 Atom / Applied | Actual admitted Live or grouped edit, consumption/result and undo; no success before acknowledgment | U02, F05 |
| 01.4 Atom / Restored | Actual cleanup and observed baseline outcome; Stale when fresh analysis is needed | U02 |
| 02.1 API editor / Fields | Typed controls for supported response fields; observed values are not all writable | U02 |
| 02.2 API editor / JSON | Bounded advanced patch editor with validation and scope; no arbitrary execution | U02 |
| 02.3 API editor / Changes | Baseline/proposed/applied diff, exclusions and immutable result | U02, U03 |
| 03.1 Actions / Handlers | Real source-linked handlers/native registrations with precise meaning | A03, P01 |
| 03.2 Actions / Hooks | Only supported relations to the selected action/property; not every component hook | A03/A04 |
| 04.1 Capture / Ready | Actual host readiness, separate from Atom availability | I02 |
| 04.2 Capture / Recording | Real recording state; closing the Atom view does not stop Capture | I02 |
| 04.3 Capture / Interrupted | Actual terminal/partial state and available recovery; no hidden reattach | I02 |
| 04.4 Capture / Review in Desktop | Real review handoff to the existing Desktop capability | I02 |
| 04.5 Capture / Saved receipt | Exact durable save confirmation, not a UI-only success state | I02/I03 |
| 04.6 Capture / Desktop Review | Existing host/Desktop workflow; not reimplemented in public Atom | I02 |
| 04.7 Capture / Floating controls | Existing real Capture controls and cleanup; coordinated debugger ownership | I02 |
| 05.1 Settings / Domains | Separate app/artifact grants; default read-only and scope of deliberately enabled changes | F02, F05, P03 |
| 05.2 Settings / Capture | Host-specific configuration; does not gate Atom Basic | I02 |
| 05.3 Settings / Source maps | Real map connection, acquisition status and current script associations | P02/P03 |
| 05.4 Settings / Build mismatch | Actual artifact mismatch, no stale exact badge or current-source fallback | P01/P02 |
| 05.5 Settings / Local maps | File/bundle import, bounded parse, clear/expiry and no upload | P02 |
| 05.6 Settings / Listeners & hooks | Source relations and explicitly armed required Action Trace; no invented telemetry | A03/A04/A05 |
| 05.7 Settings / Local explanation | Mandatory validated local-AI feature, optional user activation; availability, consent, progress, cancel and full fallback | L01/L02 |
| 05.8 Settings / Connections | Current source/helper/Desktop state, compatible versions and repair | F03, I02 |

The existing source-map disclosure, compact Actions section and experimental local-model provider are partial real implementations, not missing from scratch. The absent guided editing and combined host states must be completed against their actual authority/operation contracts. [R09][R12][R28]

## Approved interactions not fully specified by the screen index

The scope review adds these mandatory interactions; do not invent a claim that the existing Figma screens already implement them:

| Interaction | Required behavior | Owner |
| --- | --- | --- |
| Page picker | Hover outline/label, exact click target, nested refinement, Escape/reselect and no supported selection-induced app action | U05 |
| Live editing | Most declared editable inputs change without Apply; valid commits, pending/consumed/result states and undo | U02 |
| Production enablement | Two sequential Settings warnings/confirmations, target scope, persistent visible enabled indicator and revocation | F05 |
| QA/PM → developer | A separately developed reporter/recipient journey, not just a technical JSON export | U06 then U03/P04 |

Use existing tokens/composition and record any new interaction choices before implementing them. Exact Live debounce, grant lifetime and detailed handoff flow were not decided in the scope interview.

## U04 — Reference journey acceptance

**Depends on:** U02/U03/U05/U06, F05, A05, L02, P03 and I02 for full-baseline acceptance. Review individual screens earlier without waiting for every feature.  
**Produces:** a screen-to-command/result inventory and actual state-transition evidence for the accepted candidate.

**Files:** current Atom UI and shared `packages/extension-ui` only where a demonstrated difference needs repair; official Capture files remain in the host checkout. Add a concise record under `docs/testing/` with screenshots of synthetic data, candidate identities and approved deviations.

- For each enabled control, record the runtime command/event and the corresponding success, unavailable, rejected, busy and interrupted state. A visually present control with no real operation is removed from the released surface or clearly unavailable with a reason.
- Run the journeys from the real entrypoint, without changing demo state in the reference model. Preserve the original design reference as input.
- Verify the first viewport, typography, alignment, scroll ownership, sticky header/footer, narrow/zoom layout, keyboard flow and readable long source labels. Use the same package pair in Atom and the host.
- Source/handler/model unknowns remain neutral and explicit. A disabled-control or unavailable-model state must not imply the whole inspector is broken.
- Changes to shared tokens/primitives return to the public source and changelog. Do not fix official host mismatches by adding a private override stylesheet.
- Record agent reference comparison, geometry/keyboard checks and any human review separately. Another person is not required for acceptance. Do not claim human approval when absent or let automated geometry override a documented rejected design choice.

**Done:** each released screen corresponds to a real, tested product state and the agreed reference; differences are explicitly accepted, not silently replaced by another layout. No simulated Capture or proof data enters runtime tests as implementation.

[R09]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/testing/action-inspector-validation.md "Action Inspector validation"
[R12]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/testing/production-source-mapping.md "Production source mapping validation"
[R22]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/design/extension-ui.md "Shared UI ownership and reference"
[R28]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/packages/atom/src/template.mjs "Current inspector composition"
[R31]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/packages/extension-ui/design/design/SCREEN_INDEX.md "Supplied design screen/source index"
