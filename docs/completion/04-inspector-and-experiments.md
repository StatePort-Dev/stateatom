# Inspector experience and controlled changes — implementation plan

**Goal:** select an application element visually, understand its supported behavior, change eligible inputs without a research console and preserve an intelligible investigation.

**Architecture:** evolve the existing `mountAtom` view, picker, evidence and shared CSS foundation. One public implementation serves standalone and embedded hosts. Observation, editing authority and inferred relationships remain separate.

**Tech stack:** current native HTML/ESM inspector, extension-ui and existing browser/IDE harnesses.  
**Spec:** [approved scope](02-release-scope.md), [shared design contract][R22], current inspector [R28].

## U05 — Visual element picker

**Scope:** mandatory C11, added during scope approval.  
**Depends on:** F01/F02. Can be implemented before the broader U01 composition.  
**Produces:** a usable hover/select/refine/cancel flow, without CSS selectors, DevTools, IDE or Desktop.  
**Files:** existing `browser-extension/picker.mjs`, `content.js`, Atom platform/runtime/transport and `ui.mjs`; shared tokens only if an actual new primitive is needed. Add picker behavior tests and a real native picker scenario. Inspect the current picker before adding or replacing code.

Work:

- Start selection from the actual extension entrypoint. On hover, draw an outline and concise target label. Clicking the highlighted target opens its inspection with exact tab/document/instance identity. Keep direct CSS selection as an advanced fallback.
- Make nested targets selectable without repeated pixel hunting: expose a concise ancestry/breadcrumb control or equivalent refinement from an icon/text node to its button or container. A refinement selects that actual node; it must not imply a framework/component association that was not found.
- Escape cancels. Reselecting replaces the target. Scrolling, layout movement and viewport changes keep the preview aligned or clear it when no longer valid. Repeated list items must remain distinct.
- The picker gesture selects for Atom, not for the application. For the declared supported event paths, prevent selection-induced app clicks, submits and navigation. Test pointer/capture/bubble sequences and relevant earlier listeners; do not claim universal suppression on hostile or inaccessible pages. Unsupported paths must be exposed rather than silently selecting a different element.
- Use removable, owned overlay/listeners, with no page reparenting or permanent style changes. Ignore the picker's own UI as a target. Page messages carry observations only and must satisfy the existing short-lived picker identity checks.
- Show inaccessible frames/closed roots or denied origins as limitations. Do not expand permissions or add universal cross-frame support solely to make the picker appear complete.
- Keep keyboard operation and visible focus. Use the existing visual foundation, not a second inspector or an unreviewed clone of another tool.

**Test cycle:** nested icon/button, two identical rows, small target, disabled button, moving/removed target, scroll/reflow, Escape, cancel/restart, app click/submit counters, navigation during selection, revoked permission, inaccessible frame/root and cleanup. Run in Basic without IDE and in both packed hosts. A harness-supplied selector alone does not pass the picker criterion.

**Done:** a user can select and refine a real target directly on the page, inspect that instance and cancel without leaving active overlays or causing an application action in supported cases. Exact source resolution remains a separate capability.

## U01 — One selected-element workspace

**Depends on:** F01; final visual-selection acceptance uses U05.  
**Produces:** the normal inspector flow, consistent capability/freshness presentation and reference-aligned views.  
**Files:** `packages/atom/src/ui.mjs`, `template.mjs`, `atom.css`, `action-ui.mjs`, `source-map-ui.mjs`, `browser-extension/inspection-view.mjs`; extend current UI/native tests.

Work:

- Keep the selected page and element as context. Offer useful supported properties; retain Text/Disabled initially rather than exposing unimplemented controls.
- Present four task-oriented entry points: current condition/inputs, action handler, data/source origin and supporting evidence. Reuse the existing composition; headings/disclosures are sufficient.
- Put a short useful result first. Raw graph records, compiler journals, selectors, generated coordinates and raw intervention JSON stay advanced.
- Show a concrete next step for each capability gap: connect a project, import this release's sources, start observation, inspect again or accept an unsupported boundary. An available Basic action must not ask for IDE installation.
- Snapshots remain the default. Show time and target, invalidate stale source/selection records and clear unrelated explanation/model output immediately. Live editing from U02 must show a newly observed effect or pending state, not relabel the old snapshot as fresh.
- Follow the adopted 440px inspector and shared primitives. No replacement design or simulated tabs without real operations. Keep keyboard focus, long paths/labels, non-colour status meaning, reduced motion, zoom and narrow layouts.
- Fix the passive-reader font/CSP issue at the correct asset/CSP boundary without relaxing script security. Use the embedded host's selected-tab context, never accidentally select the inspector itself.

**Test cycle:** Basic without source; supported property with skipped operand; handler not executed; model absent; HMR/stale source; changed tab during pending response; no eligible edit; imported historical report; actual U05 selection/refinement. Compare both hosts with the same fixtures and dimensions.

**Run:** existing `verify:extension-ui`, `verify:browser`, `verify:react-host-ui`, `verify:actions`, `verify:embedding` as affected; add the U05 native scenario before reporting it run.

**Done:** the normal workflow needs no generated coordinates, JSON editor or internal case names. Agent-operated reference comparison and any human review are recorded separately; a second person is not required. Both hosts use the same inspector implementation.

## U02 — Live and Draft/Apply input editor

**Scope:** mandatory C05 with both modes.  
**Depends on:** F02, U01, U05. F05 later enables these same operations on an intentionally unlocked production site.  
**Produces:** typed editable targets, two editing modes, undo/baseline restoration and a readable effect record.  
**Files:** current UI/template/runtime, `core/diagnostic.mjs`, `core/evidence.mjs`, `src/engine/browser.mjs`; add `core/experiment-plan.mjs` and focused editor/adapter tests. Do not replace the existing causal-proof mechanism.

Work:

- Define an `ExperimentPlan` with exact target snapshot, resource kind, original value/revision, proposed patch, admitted operations, effect/refresh path and cleanup policy. Runtime validates the current plan immediately before use.
- Define the editable-input catalogue from ordinary supported project cases. Target **Live for most inputs in that declared scope**, not a few hand-selected booleans. Register the catalogue and counting method before acceptance; report unsupported resource kinds and why. Do not quietly narrow the denominator after implementation.
- Reuse type-appropriate response-field controls, then add other input adapters required by that catalogue. An observed prop/state/hook value is not automatically writable. A direct adapter needs an actual supported update path, revision guards and tested undo; response overrides and local state edits remain different resource kinds. Source-code fixes and generic eval are not added.
- **Live:** apply valid edits without a separate Apply button. Boolean changes commit immediately; text/number controls wait for a valid value and a documented short delay/commit event. Coalesce pending edits by target, prevent stale acknowledgments from winning and keep intermediate invalid text local. A deliberate edit in Live mode is the operation request; do not add an Apply-equivalent confirmation to every normal field update.
- **Draft / Apply:** stage several edits, show original/proposed values and affected resources, then apply the requested group. State whether the adapter can apply atomically. Partial application must identify what changed and which compensating cleanup succeeded. Switching modes must not silently submit an outstanding draft.
- Show prepared, installed/applied, waiting for the next request/update, consumed, effect observed, failed and restored states. A network rule is not yet consumed data. Do not silently trigger backend requests or clear storage on every keystroke to make Live look immediate. Any required refresh/reload/reset consequence must be visible and covered by the selected operation's permission.
- Capture one baseline per investigation and an ordered edit history. Provide undo-last and return-to-baseline in both modes. Preserve an explicit new external state revision rather than overwriting it blindly during undo. Cancel/pending-edit behavior must leave the current baseline and active rules understandable.
- Default read-only production refuses mutations. F05's two-confirmation Settings grant is the only production override in this plan. It does not bypass type, revision, lease or adapter support checks, and it does not guarantee reversal of server consequences.
- Keep causal verification separate from quick editing. Live success does not become `Experimentally verified`. Preserve the original repeated baseline/intervention/rollback/control criteria and two-blocker single/joint tests for that label.
- Keep legacy advanced controls during migration until equivalent supported operations exist. Their presence does not complete the new Live/Draft user workflow.

**Test cycle:** boolean/valid number/text, rapid typing, invalid intermediate input, delayed/out-of-order reply, mode switch with a draft, already-consumed and future response, external state revision, repeated edits, grouped partial failure, undo-last, baseline return, masked two-blocker effect, irrelevant field, tab switch and worker/debugger interruption. Separately test default production refusal and the F05-enabled path. Denied operations must not mutate before refusing.

**Run:** existing browser/IDE experiment regressions, affected unit/contract suites and a new real Live/Draft native scenario from a packed host. Declare a new command before claiming it ran. Keep original repeated-trial assertions intact.

**Done:** both modes operate through field controls; the declared majority-of-inputs target is met or explicitly remains unmet. Undo and baseline restoration reflect actual supported local state. A failed, pending or inconclusive edit is visible, with no hidden active rule. A staged draft or successful rule installation alone is insufficient.

## U06 — QA/PM-to-developer journey design

**Scope:** mandatory UX work under C07; its outcome is approved. The new working
journey is now selected in [the U06 specification](../features/qa-pm-handoff-journey.md)
and [execution record](23-u06-handoff-journey.md); it is a design deliverable, not
U03/P04 runtime acceptance.
**Depends on:** U01 and U05.  
**Produces:** a concrete reporter/recipient journey, mapped to existing capabilities and an implementation-ready handoff specification.  
**Files:** add `docs/features/qa-pm-handoff-journey.md`; use existing design reference, diagnostic schema and passive-reader behavior. Add a small synthetic clickable/reference flow only where needed to settle interactions; label all simulated behavior.

Work:

- Develop one complete case: reporter selects the problem, states expected behavior, chooses an observation window, sees findings/unknowns, reviews/redacts, exports and passes the file; the recipient opens it, understands the issue and optionally enriches it with matching sources.
- Specify what the reporter must enter, what Atom fills from evidence and what the recipient sees first. Avoid asking PM/QA to interpret an AST, compiler journal or raw JSON. Do not invent a root cause or estimate effort.
- Include no-source/no-IDE, unavailable source map, expired session, sensitive data omitted and wrong-build recipient variants. State precisely how sharing works through an existing channel without introducing an Atom cloud service.
- Keep the original report immutable; new developer findings reference it as an added revision. Reading never grants mutation or Capture authority.
- Identify gaps that U03/P04 must implement and reuse what already exists. Record the selected workflow and unresolved product choices before claiming the handoff finished. Approval of C07 is not approval of the current technical export UI.
- Walk both roles using synthetic data; an agent may perform this design/usability check. Another person is not a prerequisite. A mockup validates a proposed interaction, not runtime implementation.

**Done:** one explicit end-to-end flow and its failure states are documented, with a field/control-to-runtime mapping and testable U03/P04 acceptance. The chosen flow remains distinguished from features already implemented.

## U03 — Readable investigation and handoff implementation

**Depends on:** U01 and U06; integrates P04 observations without a dependency cycle. Basic local-save plumbing may be preserved before U06, but the finished C07 journey follows its selected UX.  
**Produces:** a self-contained historical report usable without the original page, IDE, Desktop or model.  
**Files:** current `core/diagnostic.mjs`, Atom UI, passive reader and diagnostic tests. Extend the schema compatibly or version it explicitly; never reinterpret old records silently.

Work:

- Implement the U06 flow: selected question, symptom, expected behavior, exact observations, environment/build identity, unknown boundaries and editing/action outcomes where actually collected.
- Generate the short deterministic summary from the same evidence. QA/PM view is a presentation of those facts, not a new inference engine or effort estimate.
- Preview before export. Source text, response bodies, private URLs, component values and secrets have separate inclusion rules. Importing source maps is not consent to export their contents.
- Record redaction omissions and broken links. A sanitised record does not prove a chain whose evidence was removed. Live edits and user actions include their scope and rollback/irreversibility limitations.
- Save/reopen across browser sessions and read the exported file without a source connection. Content is historical, untrusted and non-executable. Opening the report never resumes an experiment, enables production changes or grants Capture access.
- Let a developer append analysis as a new revision for the matching build. Preserve original QA observations when code or conclusions differ.
- Keep local save/export/reader free. No new cloud sharing, login or ticketing backend. Production SDK is not a prerequisite.

**Test cycle:** real create/preview/download/open, no-IDE reporter, stale/mismatched source, omissions, hostile HTML/links, duplicate record ID, old-schema migration, deletion, separate recipient session and appended analysis. Include Live/Draft outcomes and Action Trace when integrated. A harness-generated ZIP alone does not pass.

**Run:** current `verify:browser`, Actions/map export regressions and the packed host; extend a real two-role workflow test. The agent may operate both roles in separate clean sessions.

**Done:** the reporter can prepare and transfer the issue and the recipient can state what happened, what is uncertain and what to inspect next, through the agreed UI. The artifact is a diagnostic investigation, not a State Card.

## Review focus

Keep target identity, evidence and action authority separate. Do not label snapshots live, unconsumed edits applied-to-app, a cleared rule a complete rollback, or a design simulation implemented. Model/SDK availability and human participant recruitment must not block basic operation. Mandatory model delivery is evaluated separately in L02.

[R22]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/design/extension-ui.md "Shared UI ownership and reference"
[R28]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/packages/atom/src/template.mjs "Current inspector composition"
