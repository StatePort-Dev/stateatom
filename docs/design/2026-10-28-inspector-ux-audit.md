# Inspector screens: UX and visual audit, 28 October 2026

Scope: the current Atom inspector, from connection through element selection,
Inputs, Actions, Data & source and Evidence. The maintainer requested actual
separate screens inside the extension, then clarified that element selection must
use the existing header icon, without a duplicate large button or explanatory block.

## Observed problems and changes

| Step | Before | Implemented and checked |
| --- | --- | --- |
| 1. Open and connect | Connection below multiple technical sections; disabled input/Undo controls before any selection. | Page connection at the top. First-open guidance only before connection. Advanced site permissions stay collapsed. Native Connect succeeds. |
| 2. Select and read | UI suggests selection but competes with unrelated controls. | Existing header picker only; no duplicate Select page element CTA. CSS selection and Property remain accessible after connection, before any result. Picker progress remains visible. |
| 3. Explore the four screens | Tab-looking buttons are scroll anchors; all sections remain visible and keyboard-accessible. | Exactly one mounted panel visible. Persistent navigation, arrow/Home/End keys, selected state, prefixed ARIA relations, restored per-screen scroll. Refresh retains the active screen. |
| 4. Go deeper or keep a report | Source setup, experiments, diagnostics and raw evidence share a long tools region. | Sources/setup/experiments belong to Data & source; diagnostics/raw records/trace to Evidence. Shortcuts reveal the destination before focus. Typed notes survive navigation; native diagnostic save succeeds. |

Inputs editing and interaction recording remain available in explicit disclosures.
They do not acquire permission or start work merely because the screen is opened.
Unknown/Unsupported, Code-linked, Observed and Stale meanings remain unchanged.
The UI does not add a source association to DOM-only inspection.

## Design reference and intentional deviations

Read the supplied `packages/extension-ui/design/README_RU.md`, handoff and screen
index. Visually compared the actual renderer against `screens/atom/01-inputs.png`;
retained the 440px sheet, Inter, existing brand asset, white surfaces, blue primary,
neutral status treatment and scoped shared controls. Shared token sources and
package contract are unchanged.

Intentional deviations: persistent real tabs instead of anchor navigation; top
connection flow; advanced disclosures; slightly larger first-use/help typography.
No simulated prototype integrations or capabilities were copied into the product.
The draft used a large selection CTA; it was removed following maintainer feedback.

## Evidence and verification

Baseline source checkout at start: `f2b726e`. Worktree also contained concurrent
engine changes, which were left untouched. No package publication or host intake.

- Browser connector: actual source renderer with explicitly synthetic transport at
  `http://127.0.0.1:4179/`; preserved before build at `/before`.
  Checked first open, connection, CSS as first selection, each tab, cross-screen
  source/report shortcuts, unsaved note preservation and 360px layout.
  The optional source connection shortcut is scoped to Inputs rather than repeated on every screen.
  Keyboard End selected Evidence with a visible 2px blue outline. Exactly one
  visible panel, no horizontal document overflow at 360px. This is renderer evidence,
  not native transport proof.
- Native Chromium: `/tmp/stateatom-ux-review/smoke-1793189862069/result.json`.
  **16 checks PASS**, actual packaged runtime candidate90 plus freshly bundled
  source UI, isolated profile and synthetic application. DOM-driven native controls
  exercised Connect, CSS selection, all panels, Inspect again, report saving,
  project/diagnostic shortcuts, draft retention, 360px and picker start/cancel.
  Original package90 artifacts and its runtime bytes were not changed.
- Targeted Node checks: **115 passed** (111 behavior checks plus 4 shared visual-base checks). `node --test --test-isolation=none
  tests/atom/section-navigation.test.mjs tests/atom/inspector-ui.test.mjs
  tests/atom/native-source-ui.test.mjs tests/atom/input-ui.test.mjs
  tests/extension-ui.test.mjs`; `npm run check:ui`; `git diff --check`.
- Full `npm test`: **6139 passed, 2 failed** of 6141 at that worktree state.
  Both failures were in first-read profile/channel checks: `Owned compiler recipe
  or tool differs: src/engine/plugin.mjs`, a concurrent modified engine file.
  No test threshold or compiler receipt was changed to bypass those failures.
- Independent source review identified hidden native-source navigation and hidden
  initial CSS/picker status. Both were corrected; source shortcut regression went
  RED → GREEN. Updated shared integration helpers for nested manual/site permissions
  and source screens; input-fields/browser flows use the new visible entry points.

## Accepted screenshot set

Native screenshots were saved by the browser harness and visually inspected:

1. `/tmp/stateatom-ux-review/smoke-1793189862069/01-start.png`: first connection.
2. `/tmp/stateatom-ux-review/smoke-1793189862069/02-inputs.png`: selected element.
3. `/tmp/stateatom-ux-review/smoke-1793189862069/03-actions.png`: separate Actions.
4. `/tmp/stateatom-ux-review/smoke-1793189862069/03-source.png`: separate Data & source.
5. `/tmp/stateatom-ux-review/smoke-1793189862069/03-evidence.png`: separate Evidence.
6. `/tmp/stateatom-ux-review/smoke-1793189862069/04-actions-narrow.png`: 360px layout.

These local files are temporary review artifacts, not release evidence. Screenshots
are agent-reviewed candidates. Independent novice task completion, expert workflow
usefulness, full installed IDE workflow and the complete legacy browser matrix were
not established by this bounded audit. The active extension preview is a source UI
preview over the retained runtime, not a new packaged release.

## Complete workflow pass after maintainer feedback

The initial split still hid Atom's useful answer. The second pass uses the existing
product workflow: selected property → recorded expression and inputs → optional
controlled editing → scoped evidence and local report.

- Source locations, expressions and observed input rows now remain outside the
  supporting-record disclosure. They appear only when the existing inspection
  projection supplies them; stale snapshots clear these current-result surfaces.
- Inputs owns its answer and next step. Other screens retain compact selected
  element/property context, without repeating project setup calls to action.
- Eligible editing opens on a new target. Idle modes/undo/baseline tools are hidden.
  A new dirty draft is revealed; passive refresh respects a user's collapsed editor.
  Read-only keeps one permission disclosure and hides inactive editing machinery.
  Local HTTP routes to Page connection / Advanced site permissions; HTTPS routes
  to the existing temporary permission flow. Neither shortcut grants permission.
- Atom-specific icons live in the Atom row, outside the shared brand header.
  Connected page setup stays hidden until requested. Page selection is automatic
  from a trusted host tab when available; attach remains explicit.
- Actions presents available handlers and a plain unknown-binding message without
  claiming that no handlers exist. Metadata/model options remain secondary.
- Evidence starts with recorded property, available operand/source counts and the
  data-origin limit. Detailed trace coverage is collapsed. Save report opens the
  existing local diagnostic flow; export review is preserved.

These are composition deviations from the UX prototype, preserving its tokens,
Inter typography, white sheet, code panel and existing control geometry. The
reference's simulated dependencies do not become production capabilities.

### Latest verification

Worktree HEAD during this pass: `91763b3` plus the UI changes and unrelated concurrent
engine work. The final source UI was rebuilt into the isolated extension with
unchanged runtime candidate90; this is not a new packaged runtime release.

- 123 focused behavior checks pass with `node --test --test-isolation=none
  tests/atom/section-navigation.test.mjs tests/atom/inspector-ui.test.mjs
  tests/atom/input-ui.test.mjs tests/atom/inspection-explanation-ui.test.mjs
  tests/atom/native-source-ui.test.mjs`. Four shared UI checks and `npm run check:ui`
  also passed. The prior full-suite engine failures above remain separate evidence.
- Native Chromium: `/tmp/stateatom-ux-review/smoke-1793191086693/result.json`,
  20 PASS checks, including actual attachment, selection, report save, picker,
  navigation, connected-settings hiding, contextual toolbar, read-only controls
  and the HTTP permission shortcut. Agent-operated synthetic application.
- Supported computation renderer:
  `/tmp/stateatom-ux-review/supported-1793191127942/result.json`, two checks PASS.
  `supported-440.png` and `supported-360.png` are explicitly synthetic data through
  the real renderer, not native provenance evidence. Visually inspected alongside
  the supplied Inputs reference. A manual browser check confirmed Home navigation,
  exactly one visible screen, no 360px overflow and a 2px blue keyboard focus ring.
- `npm run verify:input-fields-ui -- --source --accepted` passed eight controlled
  renderer scenarios: live input/caret, invalid numeric text, Draft/Apply, narrow
  layout, read-only policy, widget changes/conflicting draft and connection loss.
  Latest result: `.artifacts/u02/input-fields-ui/2026-10-28T12-38-59-604Z/results.json`.
  This tests the actual renderer with a controlled ledger, not a native adapter.

Agent visual review is complete for the checked states. Human usability acceptance,
full native source/editor combinations and production capability coverage are not
established by these screenshots or fixtures.

## Five fix-review passes: shared selected element above tabs

Maintainer correction: the four tabs belong below the one selected element. The
shared context now precedes the tablist and remains above independently scrolling
screen content. These passes continue the existing reference-derived composition;
no shared tokens, runtime, evidence acceptance thresholds or permission grants change.

| Pass | Fix | Review result |
| --- | --- | --- |
| 1 · Hierarchy | Shared selection header above tabs, screen-only scroll, bounded details height. | Actual renderer confirms selection bottom equals tablist top; context stays visible while screen content scrolls. 76 initial focused checks pass. |
| 2 · Readability | Compact kind/details row; long observed labels/values stack across full width; 12px expression text and full-label tooltip. | 422-character recorded value retained. No horizontal overflow at360px; expanded details leave tabs/footer accessible at360×560. |
| 3 · Context navigation | Scope saved scroll to tab/run/document/node/property. New element resets scroll; same-target refresh preserves it. | Three RED→GREEN controls; active screen and mounted drafts preserved. 92 checks pass at this stage. |
| 4 · Partial Actions | Scoped Code-linked/DOM/unknown heading; hide unsupported idle recorder and empty/stale explanation controls; source-options link for unknown binding. | 138 stage checks pass. Browser Actions→Data & source preserves element and focuses destination. Historical recorded interactions remain explicitly stale and accessible. |
| 5 · Feedback/accessibility | Connection icon toggles both ways; picker tooltip resets; keyboard connection returns focus to picker; expanded ARIA matches actual connection disclosure. | Four RED→GREEN regressions. Browser Enter→Connect ends focused on picker. Independent review found no confirmed important regression; its focus uncertainty was checked in the browser. |

### Final checks and artifacts

Source worktree HEAD during final check: `a9ac9a9` plus this UI work. Concurrent
engine work was preserved. New UI is bundled only in the isolated demonstration
extension with the unchanged runtime candidate90, not a new official package.

- 167 behavior checks PASS: `node --test --test-isolation=none` with
  `tests/atom/{section-navigation,inspector-ui,input-ui,inspection-explanation-ui,native-source-ui,action-explanation-ui,action-trace-ui}.test.mjs`.
- Four shared UI tests PASS; `npm run check:ui` and `git diff --check` PASS.
- Native Chromium, actual extension runtime: 24 checks PASS,
  `/tmp/stateatom-ux-five/native-1793193600959/result.json`.
  Includes attachment, real DOM selection, common header geometry, pinned context,
  all screens, report saving, local draft retention, permissions navigation, picker
  start/cancel and tooltip, narrow viewport and connection toggle.
- Source renderer with explicitly synthetic transport: 16 checks PASS, zero page
  or console errors, `/tmp/stateatom-ux-five/renderer-1793193684573/result.json`.
  Viewports440×900,360×740,360×560; supported expression, long records, empty Actions,
  expanded details, Home/End keys, focus and connection disclosure ARIA.
- `npm run verify:input-fields-ui -- --source --accepted`: eight controlled-ledger
  UI scenarios PASS, `.artifacts/u02/input-fields-ui/2026-10-28T13-18-07-683Z/results.json`.
  Typing/caret, invalid numerical input, Draft/Apply, narrow view, permission changes,
  conflicting draft/widget replacement and disconnect remain covered.

Preserved failed harness runs: native `native-1793193485043` checked Cancel before
its asynchronous completion; the corrected run records pressed=true/Working before
waiting, then passes after settlement. Renderer `renderer-1793193561135` recorded
favicon404 on the temporary HTTP preview; adding a preview-only empty favicon
removed it. Neither fix changed product runtime or weakened an assertion.

Rendered first viewports were visually inspected against the supplied Atom Inputs
reference, including typography, alignment, code and value controls. Deliberate
reference deviations: shared pinned selected context, real tabs, dynamic capability
visibility and bounded scrolling in unusually short windows. These remain agent-
reviewed screenshot candidates; synthetic renderer records are not native lineage
proof or human usability acceptance. Five-pass work ledger: `/tmp/stateatom-ux-five/plan.md`.

## Element results follow-up · 28 October

User-approved change: remove the global Property selector. Text and applicable native
Disabled state are separate sections under one selected element. Each has its own
value, source, observed operands, explanation and evidence. Shared editor and Actions
remain mounted once. Advanced response experiments alone expose an explicit outcome
choice; selecting a non-disableable element falls back to Text instead of blocking
ordinary inspection. This resets only that explicit legacy experiment context.

The additive `elementProperties` opt-in acquires properties independently using the
existing native document/node/value guards. It does not flip the primary property to
collect a second result. Separately acquired times are retained; this is not an atomic
snapshot. Missing native secondary data stays local. Native disabled means the own
attribute, not effective clickability or all ancestor constraints. No new engine or
framework support is claimed. Legacy clients retain single-property behavior.

Source/UI/transport/platform/reader were bundled into a new isolated extension at
`/tmp/stateatom-element-properties/extension`; candidate90 static assets and notices
were retained. Unlike the earlier five-pass preview, this follow-up runs the modified
source runtime. Build inputs are recorded in `build-inputs.json` alongside it. Neither
the frozen package intake nor the official StatePort host was modified.

Independent review found and drove regression controls for unavailable secondary
acquisition, secondary changes with an open editor, a prior Disabled experiment followed
by a paragraph, and nested report budget omissions. Imported property records also
reject conflicting tab/run/page identities. The VM worker harness now supplies the new
pure helper import instead of losing it while stripping imports.

Visual comparison uses the supplied `design/screens/atom/01-inputs.png`: same shared
font, brand, module row, spacing vocabulary, code surface and control primitives.
Approved deviations: element-level rather than property-level header, simultaneous
property sections, separate evidence groups, one shared editor, no global selector.
The Basic screenshots intentionally show unavailable source/inputs, not prototype
simulated dependencies. Narrow 360px and keyboard focus were checked in actual Chromium.

Follow-up verification (source HEAD `a9ac9a9` plus the scoped changes; shared engine
work may coexist and is excluded from the UI commit):

- `npm test`: 6245 PASS, zero failures. Initial sandbox run could not spawn some
  required child processes; the authorized run exposed the missing VM dependency,
  which was fixed, followed by the green full run. Log:
  `/tmp/stateatom-element-properties/full-tests-final.log`.
- Final targeted renderer checks: 79 PASS; new per-property renderer controls 3 PASS
  after the final source badge change. Source types (`tsc --noEmit --strict`, transport
  declarations), `npm run check:ui`, and `git diff --check` PASS.
- Actual source-runtime Chromium: 19 PASS in
  `/tmp/stateatom-element-properties/check-1793200352410/result.json`.
  Includes separate values, real save/report content, secondary-only change,
  replacement, paragraph, empty text, 360px, long values, expanded evidence,
  tab keyboard focus and draft retention.
- Controlled source UI and input ledger: eight scenarios PASS, now with both result
  sections and navigation during an unapplied draft:
  `.artifacts/u02/input-fields-ui/2026-10-28T15-07-41-998Z/results.json`.

These are agent-operated checks and screenshot candidates. They do not establish
human usability acceptance, new framework support, or new finite-trace capabilities.
The runtime and inspection source files were compiled locally; no public package was
published and no official host was updated.

## Editing and permission recovery · 28 October

The reported Save → Previous element/Page connection failure was reproduced with
native Chromium against the preceding source candidate. Saving invalidated runtime
scope but the UI only loaded the cleared state. Control screenshots:
`/tmp/stateatom-editing-ux/before-1793201232144/03-after-save.png`.
The preceding attempt lacked a trusted permission gesture; it is not product evidence.

Changes follow the supplied Atom Inputs reference: shared font, white canvas, blue
primary action, selected context and separated value rows. User-directed deviations
are simultaneous native properties, real screens under the selected element and a
progressively disclosed editor. Canonical HTTP loopback development has automatic
supported edit capabilities, without cache/storage/reload grants. Explicit read-only
configuration is respected; arbitrary remote sites are not inferred to be development.
HTTPS remains read-only until the existing two scoped confirmations.

Save and production enable now reconnect and re-inspect the same native document/node.
Tab/epoch/origin changes and replacement reject recovery. Independent review found a
stale-target tab-switch race and a delayed editing warning; both have regression tests.
Values/Actions/Source/Details use ordinary language. CSS selection lives in Element
details. Page fields and On Apply are defaults; alternate source, live mode and reset
controls are under Editing options. Apply/Discard stay visible during scrolling.

The native Apply check exposed a second defect: the real page changed Confirm→Ready,
but the UI showed Previous element and old values. The new editor refresh records
separate timed native values under `latestObservation`. It never refreshes the old
source analysis, occurrence or causal claim. Replacement and detachment clear these
updates. Details retain both the original value and the subsequent native read; saved
v1 diagnostics deliberately retain the original historical record, not a new trace.
Control evidence: `/tmp/stateatom-editing-ux/native-1793202202180/04-applied.png`.

Final source-runtime checks (isolated extension from current source; frozen candidate90
static assets/notices retained, no official host mutation):

- Local native flow, 8 checks: `/tmp/stateatom-editing-ux/native-1793202956005/result.json`.
  Default editing, exact-node settings recovery, inert draft, real Apply, current
  native values, hidden setup, 360px overflow and keyboard tabs. Screens 01–05.
- Synthetic HTTPS native flow, 9 checks:
  `/tmp/stateatom-editing-ux/production-1793202990292/result.json`.
  Two-step production enable returns directly to the same selected node and opens
  fields; draft/Apply and narrow keyboard flow pass. Test-only TLS certificate and
  browser-host preapproval are used; ordinary Chrome permission acceptance is not claimed.
  The first driver attempt expected an obsolete button label and timed out; corrected
  to the current label without changing product policy.
- `npm test`: 6290 PASS, zero failures, final log
  `/tmp/stateatom-editing-ux/full-final.log` (223.7 seconds, source HEAD `bc5bf5c`
  plus scoped changes and pre-existing unrelated engine work).
- Focused property/inspector regressions: 92 PASS; review regressions: 110 PASS.
- Controlled editor renderer: 8 scenarios PASS, retained in
  `.artifacts/u02/input-fields-ui/2026-10-28T15-41-18-908Z/results.json`.
- Shared UI generated-source check, source transport declarations and diff check pass.

440×900 and 360×800 renderings were inspected for hierarchy, spacing, value alignment,
control visibility and retained reference typography. These are agent-operated native
checks and screenshot candidates, not human usability acceptance. The long packaged
production expiry matrix is not rerun by these bounded source-runtime checks.
