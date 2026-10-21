# Action Inspector local validation — 2026-10-18

Implementation candidate above `6c2c053e98f6775e1a7fa876c7ea9b9cc7380422` on the
checked-out branch, with uncommitted working-tree changes. No release, publication,
Store acceptance or StatePort/Capture integration is established.

Spec: [Action Inspector and Local Explanations](../features/STATEATOM_ACTION_INSPECTOR_LOCAL_AI.md).
Plan: [implementation record](../features/STATEATOM_ACTION_INSPECTOR_PLAN.md).

## Implemented boundary

The existing analyzer returns `actionBindings` and evidence edges in its existing
graph. Digest-bound native JSX markers now include a column and must belong to the
selected DOM node; inherited markers and indistinguishable siblings cannot acquire
an action. Existing three-part markers remain readable, with same-line ambiguity
left unresolved. Exact markers also support the existing property workflow for
dynamic element IDs.

Supported source patterns are lexical direct functions, constant aliases, same-project
named/default function imports, inline possible calls, conditional candidates,
React-imported `useCallback`, and a synchronous custom hook's single top-level
object return of a callback. Each link carries source ranges/digests and its own
Code-linked/Candidate evidence reference. Import aliases and mutable exports are
checked separately. Factories, prop/member callbacks, opaque imports, async/generator
hook results, conditional returns, dynamic dispatch, cycles and spread overrides
retain an explicit Unknown/Unsupported boundary. No handler, hook, expression or
getter is invoked to discover action evidence.

Runtime-owned context includes schema version, tab, main CDP frame, navigation run,
inspection generation, isolated-world document/node identity, source generation,
build digest and source revisions. Changing source during acquisition rejects the
result. HMR/served-source changes, navigation, selection changes and debugger detach
invalidate records. DOM and workspace-source checks also run on refresh and before
handler navigation; these are snapshots, not a continuous DOM/listener monitor.
The complete compilation journal remains separate: inspector helper compilation
alone does not invalidate a source-linked action. Original first-read criteria stay
unchanged; only the exact marker-transform recipe/self receipts were refreshed.

Native metadata uses an already-attached debugger lease. Only the selected node,
document, html and body are queried, with at most 12 registrations; other propagation
ancestors, window and shadow-root lookup are not covered. Actual registration targets,
capture/passive/once flags and generated-script coordinates remain explicit.
Framework delegation registrations never become named application handlers. No
function descriptions, bodies, closures or new broad permissions are retained;
CDP object groups are released. Registration and source links both retain
`execution: not-observed`.

The Actions section uses the existing Atom UI package, three initial application
entries, native disclosures, source navigation and optional excerpts under the
existing historical diagnostic schema. The offline reader shows historical action
claims, with no action authority. Relevant hook relations are `creates-callback`
and `returns-handler`; general `provides-value`/`reads-hook-output` analysis and
executed-action/async/network causality are not implemented by this increment.

## Optional explanations

Templates require no model. The extension-page-only Chrome provider is opt-in and
experimental. Only a bounded allowlist of generic facts/evidence IDs enters prompts:
no page text, source expressions/comments, filenames, arbitrary values or requests.
Output is independently validated against a finite set of grounded sentences, exact
IDs and limitations. Thus the current model can choose equivalent wording; it cannot
produce unrestricted paraphrases. Missing APIs, unavailable/download states, malformed
output, invented claims/IDs, errors, timeout and cancellation fall back to templates.
Download initialization requires a user click; progress, cancellation and session
cleanup are implemented. There is no remote provider, account or paid API fallback.

The API integration was checked against the official [Chrome Prompt API documentation](https://developer.chrome.com/docs/ai/prompt-api).
Mocked model states test integration logic only. Real model quality, cold/warm latency,
resource consumption and offline operation with an installed model remain unverified.
The optional AI acceptance gate is **not passed**; model-assisted UI remains experimental.

## Verification record

`npm test` completed with **544 pass, 0 fail, 0 skipped** on the final product inputs.
`npm run build` completed, including browser, IDE, offline reader and minified fixtures.
The IDE CJS build emits esbuild `import.meta` warnings for optional first-read
modules; these warnings are not an assertion of that route working in CJS.
`ACTION_TAG=actions-20261018-final npm run verify:actions` completed with **32 PASS**.
Raw local results and source/build SHA-256 manifests are retained in
`.runtime/action-runs/actions-20261018-final/results.json`; before/after hashes match
for all 20 recorded source/build inputs. The run used Chromium **153.0.8010.12**,
React **18.3.1**, Node **24.19.0**, npm **11.17.0**, and the real VS Code host.
Its health list is empty: no recorded app/panel page errors or console errors.
The browser reported local `LanguageModel.availability()` **unavailable**; no Nano
session or download was run.

Twelve UI-to-completed-inspection samples took **1544–5267 ms**, median **2440 ms**.
These include bridge, browser and harness/polling work; they are not isolated observer
overhead or model latency. No before/after incremental CPU, memory or battery
measurement was made. No manifest permission or host-permission change was introduced.

`BROWSER_TAG=actions-regression-20261018 npm run verify:browser` completed with
**26 PASS**, without IDE/Desktop. This covers existing experiments, ABA/control/
rollback, Save, panel/browser persistence, reviewed JSON Export, inert hostile input,
offline reader and State Card rejection. Retained result:
`.runtime/browser-runs/actions-regression-20261018/native-A.json`.

`IDE_TAG=actions-regression-20261018 npm run verify:ide` completed **PASS**. The real
IDE document/range was audited; three left/right/joint intervention repetitions
retain `[true, true, false]`, consumption/rollback and a separate Restore returning
`true` with Stale UI. Retained result:
`.runtime/ide-runs/actions-regression-20261018/demo-provenance.json`.
Cleanup errors: none. This is property/experiment regression evidence, not action tracing.

`npm run check:ui` and `git diff --check` completed successfully. No dependency or
manifest permission change was made. Product files were unchanged after these runs.

The Actions harness specifically checked source/direct/inline/factory/member bindings,
relevant custom hooks, distinct instances, disabled-control non-invocation, real IDE
navigation, 390px reflow, keyboard template activation, reviewed action diagnostic
preview, native fallback without IDE and stale replacement/navigation/detach. HMR and
workspace-source races were checked through analyzer/worker harness controls; a live
HMR source-edit run and a full ancestor propagation tree were not independently
accepted here. Existing Vue unit controls passed, but this increment adds no Vue event
binding support or new real Vue UI acceptance. Earlier failed runs remain retained, including two
freshness bugs caught by real UI checks and a test-port collision from running the
unit suite concurrently with the UI harness. They are not counted as successful proof.

The action harness uses real sandboxed Playwright Chromium and a real VS Code
Extension Host. Browser plugin is not available in this session. Pairing and source
root are test setup; selection, Open handler, keyboard explanation, reviewed Save/Export
and lifecycle actions use the actual panel. Editor navigation requires a fresh
`window.activeTextEditor` document/range audit, not a mocked callback.

## Visual comparison

Reference: supplied `packages/extension-ui/design/screens/extension/13-actions-handlers.png`,
`15-actions-hooks.png` and their HTML sources. Candidate screenshots: the final action
run's desktop and 390×844 first viewports. The implementation retains Inter typography,
compact source rows, section headings, white cards, shared control sizing and native
expanders. The existing Inputs view stays primary and Actions navigation scrolls to
its compact section. Intentional deviations: hooks/call candidates expand inline;
there is no simulated Trace/POST chain, Observe button, callback execution or editable
hook state. Metadata stays neutral and uncertain links are labelled explicitly.
Automated geometry/keyboard checks and agent visual inspection are not human approval;
screenshots remain candidates for human review.

## Recorded synthetic example

This is copied from the final real MV3/IDE result, not a fabricated run. The
source relationship remains Code-linked and execution remains unobserved.

```json
{
  "selector": "#hook-one",
  "identity": {
    "schema": 1,
    "tabId": 1321918001,
    "frameId": "E0B7805927F15EC2F76A8C5D251B7D3D",
    "run": "9fb2a576-d3f3-43c0-a7e6-4682b641a1a2",
    "inspection": 5,
    "sourceGeneration": 24,
    "document": "cb67c6ab-2b16-4e1c-88f1-8991b18972ad",
    "instance": "7ba60da9-7f1a-4d30-9069-dcca771573bd",
    "build": "d890f69059a0d67575f231de2e396e03cfa56986c0c8b6a2b74c172d3ae31456",
    "observedAt": 1792351761599
  },
  "binding": {
    "expression": "confirmOrder",
    "source": {
      "file": "tests/fixtures/inspection/react/actions.tsx",
      "line": 16,
      "column": 52,
      "endLine": 16,
      "endColumn": 64,
      "sourceDigest": "9892e14a5b6ea6d29469f3c220a0aa98774169388f7d3160e45aa2a5d1bf4793"
    },
    "evidenceIds": [
      "action-evidence:0"
    ]
  },
  "entry": {
    "symbol": "confirmOrder",
    "status": "Code-linked",
    "source": {
      "file": "tests/fixtures/inspection/react/action-hooks.ts",
      "line": 4,
      "column": 8,
      "endLine": 4,
      "endColumn": 20,
      "sourceDigest": "92168f42a43644b43bf83b166e1c8db39297e9c5a9b3230e8151ee69d2a8fd4d"
    },
    "evidenceIds": [
      "action-evidence:1"
    ]
  },
  "hookRelations": [
    {
      "hook": "useOrders",
      "relation": "returns-handler",
      "status": "Code-linked",
      "source": {
        "file": "tests/fixtures/inspection/react/action-hooks.ts",
        "line": 3,
        "column": 17,
        "endLine": 3,
        "endColumn": 26,
        "sourceDigest": "92168f42a43644b43bf83b166e1c8db39297e9c5a9b3230e8151ee69d2a8fd4d"
      },
      "evidenceIds": [
        "action-evidence:2"
      ]
    }
  ],
  "execution": {
    "status": "not-observed"
  }
}
```

## Review resolutions

An independent read-only reviewer reported three Important issues. Failing tests
were added and then passed for export alias overwriting, async/generator immediate
hook returns and source-generation changes during acquisition. No Critical issue
or deferred minor was established. The earlier final-storage first-read control
retains its original error priority and passes in the full suite.

Implementation decisions: use the relocated Atom package instead of parallel panel/
worker logic; keep source/registration/invocation evidence distinct; conservatively
stop complex hook/member/factory resolution; limit native propagation coverage; keep
model wording finite and experimental until real device quality testing is possible.
These cost coverage and AI expressiveness, not hidden execution or elevated evidence.

## Subsequent A03.1 source increment — 2026-10-21

The record above remains historical. Current bounded object declarations are
documented in [31-a03-object-handlers](../completion/31-a03-object-handlers.md).
A constant local object method/data callback with only supported JSX event reads
can now acquire Code-linked source/evidence, while getter/spread/computed/duplicate/
prototype, write/escape/export/global-script/dynamic receiver forms remain Unknown.
Anonymous functions retain their expression range and no invented function name.

Current source1629/focused38, exact .2 consumers2/admission7 and native59 pass in
both immutable hosts. The current real IDE/analyzer is sealed separately: it is
not part of the Atom tarball and this is not a new installed VSIX acceptance.
Original direct/inline/hook/factory/prop/native/snapshot controls are retained with
actual native Input; the legacy parallel app-debugger Attach failure stays failed.
Method/source relations do not establish invocation or runtime callback identity.
Parent A03, A02 lineage and mandatory A05 remain open; only A03.1 is complete.

## Subsequent A03.2 private source forwarding — 2026-10-21

See [32-a03-forwarded-handlers](../completion/32-a03-forwarded-handlers.md).
One explicit untransformed JSX source supply to a private same-file component can
link named/aliased/member callback parameters and a bounded wrapper chain. Current
UI/export explicitly say that transfer to the selected instance and runtime
function identity were not observed. Multiple supplies, writes/escapes, spreads,
clone/factory/stored JSX/composite children and unsupported parameters refuse.
This is a source declaration relationship, not runtime prop ancestry or invocation.

Current source1639/focused48/types2/admission7/native89 pass across .3 hosts; original
action/object/hook controls remain, with exact current analyzer/IDE166-input proof
separate from the Atom tarball. .2 records stay historical and unchanged. Parent
A03 native event-context/replacement matrix and ONE whole review remain open.
