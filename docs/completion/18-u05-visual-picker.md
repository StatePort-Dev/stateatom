# U05 — visual page-element picker

Date: 2026-10-19. Source base `1aa4b24`, bounded working overlay on main.
Scope: [U05](04-inspector-and-experiments.md#u05--visual-element-picker), approved
`scope-review-1`. Status: **complete within the U05 brief on the declared supported paths**.
Execution ledger: [plan and decisions](../superpowers/plans/2026-10-19-visual-picker.md).

## Implementation and retained work

F01–F04 remain complete on their recorded candidates; no specialised F03/native experiment is
restarted or upgraded. U05 replaces the inherited late page-event picker, whose
native control showed early window capture/bubble and release handlers running.
The existing inspector, CSS fallback, DOM observation, source analysis, evidence
labels, shared UI peer and owned debugger broker are reused.

The new picker uses Chrome's native Overlay hover/label/inspection mode through
the already attached, owned debugger lease. No extra browser permission, page
listener, injected picker overlay, reparenting or permanent style change is added.
Native metadata supplies the exact document/backend node and at most 12 actual
ancestor choices, including scoped open-shadow paths. Repeated/duplicate-ID nodes
stay distinct; structural selectors are checked against the same native identity.
An equal-looking replacement, missing path, inaccessible frame/closed root or
budget overflow is refused or explicitly bounded to the actual accessible host.
A nearby component is never substituted or claimed as a producer.

The existing inspector exposes status, keyboard-operable ancestor buttons and
Cancel/restart. Requests, sessions and choices are ID-bound. Navigation, permission
loss, removal, timeout, cancellation and view disposal invalidate owned work.
Pending admission is aborted before a session exists; a superseded refinement
cannot poison its successor, and abort invalidates only its own inspection,
including during the final storage write. Host disposal awaits native cleanup
before client disposal. Legacy page `selected` messages cannot activate a native
session. `native-picker-v1`, `basic.pick-refine`, `cancel-pick` and `refine-pick`
are additive discovery/wire-v1 contracts; picking now requires attachment.

Two measured native constraints drove narrow implementation changes:

- `Overlay.disable` releases a held mouse gesture's pointerup/mouseup into the
  app. Cleanup uses inspect mode `none` plus `hideHighlight`; the passive Overlay
  domain ends with the owned lease. No active highlight or inspect mode remains.
- `DOM.getDocument` resets frontend node IDs while backend IDs remain stable.
  Selection identity, action registration metadata and picker path reads now share
  a bounded per-tab transaction queue. The browser engine and dev plugin bytes
  are unchanged; their proof/evidence thresholds are not relaxed.

## Declared support and limits

Supported evidence concerns the recorded Chromium primary pointer/mouse paths:
real hover/press/release/click, earlier window capture/bubble listeners, app click,
submit and link navigation, including nested/tiny/disabled/repeated/moving targets.
This is not universal event suppression. Touch, secondary/multi-click and other
browser versions remain unverified. Frame and closed-shadow internals remain
Unsupported; an accessible frame/host element is identified as that element only.

Escape cancels native selection but Chrome can also deliver its keydown to page
handlers. **Exclusive Escape-key suppression is Unsupported**, not PASS. The UI
states this boundary; inspector Cancel avoids page keys. The U05 brief requires
Escape cancellation and suppression for declared supported paths, not universal
keyboard suppression. Fresh review confirmed this reading without a scope waiver.
Do not describe cancellation in general as incapable of application actions.

Basic uses no IDE/helper/SDK/account/model. It preserves Unknown/Unsupported for
source/runtime provenance. Selection alone establishes neither a producer nor a
causal trace; snapshots remain snapshots. The 30-second native session lifetime
only bounds picker identity retention. It decides no Live timing, production grant
scope/lifetime or reporter handoff UX. Those remain U02, F05 and U06 respectively.

## Exact candidate

| Identity | Value |
| --- | --- |
| Atom | `@stateport/atom@0.1.0-candidate.20261019.10` |
| Atom SHA-256 | `db62fa82c9bdbeb9c6750445e8ef31a7a21ed56e0d13aa628a1706dc011d566d` |
| UI | `@stateport/extension-ui@0.2.0-candidate.20261018.2` |
| UI SHA-256 | `2bfc8229a45e02f775bb563f27d9a803d51dd977145f46843c45a884e07289e5` |
| API / wire / visual contract | `1` / `1` / `2.1.0` |
| Build-source digest | `aff1303ff82981cc6dd9e176a175abac048f9ad2c69a3ef29499dd06c61db005` |

Handoff: `.artifacts/atom/2026-10-19T15-52-17-616Z/atom-handoff.json`.
Both hosts are built from the clean consumer's installed tarballs. Build-source,
installed-file and host-output manifests are retained in that immutable handoff.
Its status is still `BUILT_NOT_VERIFIED`; acceptance evidence is separate in
`u05-acceptance.json` beside it. Issued `.9` bytes and failures are preserved;
`.10` contains the final storage-cancellation fix. No package publication follows.

## Verification

| Command / check | Actual result | Local evidence |
| --- | --- | --- |
| `npm test` | 649/649 PASS, no skips/failures | `.artifacts/u05/tests-candidate10-final.log` |
| Focused review regressions | 49/49 PASS | `.artifacts/u05/review-storage-green.log` |
| `npm run pack:atom` | PASS, exact twice-packed tarballs and installed hosts | `.artifacts/u05/pack-candidate10-final.log`, final handoff above |
| `npm run verify:atom-types` | 2 strict packed consumers PASS | candidate `type-consumer-result.json`, `.artifacts/u05/types-candidate10-final.log` |
| `npm run verify:atom-package` | 7/7 installed admission/refusal controls PASS | `.artifacts/atom/compatibility/2026-10-19T15-52-48-162Z/result.json` |
| `npm run check:ui` | PASS, same UI .2 bytes | `.artifacts/u05/ui-final.log` |
| `npm run verify:picker` | 33/33 PASS across both packed hosts; separately retained Unsupported boundaries | `.artifacts/u05/picker-runs/2026-10-19T16-00-09-603Z/results.json` |
| `npm run verify:embedding` | 35/35 PASS, both packed hosts and real IDE | `.artifacts/atom/verification/2026-10-19T15-55-37-042Z/results.json` |
| `npm run verify:browser` | 26/26 PASS, actual packed standalone, Basic/ABA/export/reader | `.runtime/browser-runs/u05-candidate10-basic-ready/native-A.json` |
| `npm run verify:actions` | 32/32 PASS, actual packed standalone and real IDE | `.runtime/action-runs/u05-candidate10-actions-final/results.json` |
| `npm run demo:picker -- --smoke <handoff>` | PASS_SMOKE, 3 actual UI stages | `.artifacts/u05/demo/2026-10-19T15-56-36-397Z/demo.json` |

Native picker uses Chromium **153.0.8010.12**. Both host manifests and executed
picker driver/fixture/harness hashes match before/after. Old specialised F03
first-read/short-loop native campaigns were not rerun; engine/plugin and their
acceptance criteria remain byte-preserved. Basic retains the original repeated baseline/intervention/rollback/irrelevant-control
criteria. Actions checks existing source/native-registration semantics; they do not
complete required A05 actual Action Trace. Basic and Actions use
`ATOM_EXTENSION_PATH=<candidate>/standalone`, with unique `BROWSER_TAG` /
`ACTION_TAG` directories named above. They run sequentially after embedding
because they share the fixture/helper ports.

 Agent-operated Linux,
Node 24.19.0, npm 11.17.0, strict TypeScript 5.9.3, repository Playwright MV3 with
sandbox enabled. Browser plugin was unavailable. Native picker controls use an
ordinary synthetic HTTP page at an ephemeral loopback port, real early handlers,
actual extension UI, and actual Chrome permission withdrawal; no IDE/helper.

## Retained controls and review

Original `.8` native negative control:
`.artifacts/u05/picker-runs/2026-10-19T15-24-38-534Z/results.json`.
Intermediate failures remain in `15-25-17-061Z` (full Overlay disable release),
`15-27-35-786Z` (frontend IDs), `15-33-04-394Z` and `15-36-25-910Z` (Escape
exclusivity assumption). Standalone development `15-39-48-366Z` passed 16 controls;
it is not the final packed acceptance. The `.9` packed run at
`15-48-55-750Z` passed 31 controls, then stopped on a stale Busy UI after the
fixture's foreign broker release. The driver now explicitly refreshes availability
following that host-only release; ownership and no-detach assertions are retained.

The first `.10` run at `15-52-48-746Z` passed 22 controls then checked UI text
before its cancellation refresh arrived. The final driver waits for that actual
text without relaxing the Escape assertion. An existing embedding regression at
`2026-10-19T15-54-23-893Z` clicked before native picker admission completed; its
screenshot retained the still-picking state. Its driver now waits for `picking`
before the real pointer gesture; all 35 original acceptance checks then pass. The first Basic run retained at
`.runtime/browser-runs/u05-candidate10-basic-final/native-A.json` passed two
controls, then exposed the same missing admission wait in shared `select()`.
Only that readiness wait was added; the substantive Basic/ABA assertions remain.
The final picker run repeats all 33 with this final harness hash. Earlier `.10`
`15-54-25-830Z` also passed 33 before that unused-by-picker helper changed.

One fresh review found overlapping-refinement, uncancelled-refinement and
pre-session tab-switch races. The fixes have scoped regression controls.
`.artifacts/u05/review-controls/overlap-red.log` preserves the old unconditional
catch failure using an isolated copy; `ui-admission-red.log` preserves the actual
pre-fix UI failure. `refine-storage-red.log` preserves the additionally reproduced
late storage-write cancellation failure; `review-storage-green.log` passes 49
focused controls after the fix. Earlier full-suite failure also retains the two
stale test harness APIs (missing native imports / DOM `contains`), then 648 pass;
final suite adds the storage race control. None of these failures is erased.

## Visual comparison and demonstration

Reference: supplied `README_RU.md`, `docs/HANDOFF_RU.md`,
`design/SCREEN_INDEX.md`, Figma manifest and `screens/atom/01-inputs.png` under
`packages/extension-ui/design/`. Current rendering keeps the 440px inspector,
Inter/shared typography, aligned header/footer, native shared buttons, dark source
card and local scroll composition. Final native screenshots `standalone-refinement-960.png`,
`standalone-refinement-360.png`, `embedding-refinement-360.png` and
`standalone-native-hover.png` are under the final picker run above; the demo
retains the same real selected/refined viewport. At 360px ancestor controls and long target text
wrap without horizontal overflow; keyboard-refinement focus remains visible.
No shared tokens/CSS/primitives or reference artifacts changed.

Necessary deviations: Chrome owns the native page highlight and tooltip, rather
than copying the simulated blue prototype overlay. Real ancestor choices/status
occupy a compact area below the exact target. Basic shows source unavailable and
read-only values instead of the prototype's simulated code/Live/Draft data. Those
future workflows are not fabricated to match a screenshot. Rendered screenshots
are agent-reviewed candidates; human visual acceptance is not claimed or blocking.

The [demo guide](../testing/visual-picker-demo.md) runs the actual accepted packed
standalone with a shareable synthetic page and visible app click/submit counters.
It covers nested selection, keyboard ancestor refinement and UI Cancel, followed
by an ordinary app click. A finite `--smoke` prepares this route; it does not mean
a demonstration has already been shown to a person.

## Scope and next item

Approved scope remains unchanged: L02/A05 mandatory, SDK outside Atom, U02 owns
Live plus Draft/Apply, F05 owns two-confirmation production enablement, U06 owns
handoff UX, and an independent human is not a blocker. Original 02/12, audit,
historical experiment results and evidence criteria are preserved. Other tasks
are not silently completed by this document or package.

U05 is accepted within the recorded bounded paths. The one next unfinished item is **U01 — selected-element
inspector experience**, following completed F01 and U05. No U01 implementation,
redesign, SDK, publication or other repository change belongs to this increment.
