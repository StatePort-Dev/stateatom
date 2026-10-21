# A04.1 — bounded Vue compiler source adapter

Status: source increment complete; full A04/native positive library workflow OPEN.
Base e4dcbac on main. [Plan](../superpowers/plans/2026-10-21-a04-vue-positive.md).
No new capability is accepted solely from this document or source unit counts.

`core/vue-source.mjs` consumes actual installed Vue3.5.44 SFC/template compiler
blocks. Babel receives only the original padded script and original template
expression nodes for lexical source scope, not the whole SFC or fabricated JSX.
Exact original positions/digest and selected own marker identify the source site.
Direct method/import alias/composable return reuse the bounded existing resolver;
`vue-template` source records remain distinct from native registration and invocation.
Runtime function identity and invocation are explicitly unobserved. Source revision
checks, existing Actions controls/template explanation, inert v1 export/import and
reader now retain that source kind. No callback/getter is evaluated for inspection.

Vue transform records an exact original source column and event-only own marker.
This permits useful source actions even where no property expression was evaluated.
It does not manufacture a target value/read/commit for a static event-only node.
Dynamic arguments, modifiers, event-object/onClick overrides, loop/slot scopes,
getters and unsupported callback forms remain Unknown. Compiler v-pre literal
attributes do not become events. Options API/external blocks remain outside this
source adapter; Basic and native registration remain independently available.

Actual source checks:

- `node --test --test-isolation=none tests/vue/source-actions.test.mjs`: initial
  RED retained in .artifacts/a04/source-adapter/red.log; no-Vue-Action exclusion
  reproduced before implementation. Additional :onClick override RED8/1 retained.
- Focused current command (see focused4.log) covers Vue/source-marker/action/
  diagnostic/explanation/plugin/worker/mounted UI:128PASS,0 fail/skipped.
- Current `npm test`:1661PASS,0 fail/skipped, full3.log. Initial full1.log retained
  the actual legacy template-without-scriptSetup/id-class source regression,
  owned-recipe mismatch and sandbox bind/spawn failures. Original legacy source
  test restored; no old criterion changed. New explanation unit's missing local
  import was a test error, corrected without changing a product assertion.
- The changed Vue-only plugin bytes require a new exact recipe pin; normalized
  owned builder differs only in that pin and its self hash. No finite verifier,
  compiler tool pin, observer, React/Query transform, effect argument or acceptance
  threshold was changed. Current `npm run verify:first-read-profile` passes its4
  original native owned-compilation/acquisition/refusal checks at
  .runtime/first-profile-runs/2026-10-21T02-18-22-096Z/results.json. This is not full
  HTTP/product-UI acceptance. Initial02-17 run collided with npm test's channel
  server on4173; sequential unchanged command passed. Failure remains unchanged.
- Source aggregate: `node .artifacts/a04/source-adapter/verify-source.mjs`,
  .artifacts/a04/source-adapter/verification-source.json,
  PASS_SCOPED_VUE_SOURCE_ADAPTER_NOT_NATIVE_A04. Exact source/log hashes and pin-only
  builder comparison retained. Sandbox restriction required host process access
  for actual bind/spawn checks; no approval rejection or foreign process cleanup.

Candidate version .6 is being prepared, not yet issued/accepted by this increment.
No native Vue UI/real-library positive gate, installed product, callback identity,
Action Trace, ordinary lineage, visual human fidelity or release claim follows.
Old Vue Row/independent labels/aggregate PARTIAL records remain unchanged. Next
A04.2 registers a real-library positive scenario, actual native UI/source workflow,
repeated updates/two instances and unchanged original controls. Parent A04 stays
open until its complete matrix and ONE whole-item review. A05/L02 remain mandatory;
SDK/publication/other repository work remains outside scope.
