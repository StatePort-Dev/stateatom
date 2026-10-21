# L02.4 — truthful local-model phase status

2026-10-21. Source base5f8da3c plus sealed registered inputs; exact Atom
.20261021.28 / unchanged UI .20261018.2. Bounded fix complete; L02/O01 remains open.

## Observed defect and correction

Actual .27 pending warm Explain displayed Downloading local model:100% although
availability was available. That run/raw UI state and screenshots remain history
(completion/59). Two new tests first reproduced missing provider phases and the
exact wrong UI string; then passed after the correction.

The provider reports checking, initializing, downloading and generating phases.
Already available weights do not forward downloadprogress as an active download;
real downloadable/downloading initialization still forwards progress. Progress is
limited to pending creation and ignored after generation/settlement/cancellation.
UI callbacks retain exact request/epoch/abort guards. Cancel and stale-result
handling keep templates and never revive old answers. Phase text is presentation,
not evidence, model identity, file-removal or a new application action.

Fact projection, template, prompt builder, strict validator and response schema
are unchanged byte-for-byte in their function/schema representations; aggregate
hash proof is retained. No richer model input/output policy, new authority, arbitrary
prose, cloud fallback or model prominence. This still has no demonstrated usefulness
beyond templates and therefore does NOT complete mandatory L02.

## Checks and exact evidence

- Source1852/1852 PASS, focused18 PASS including downloadable/downloading/warm,
  late progress, cancellation and stale UI controls. Original RED2 retained.
- Exact .28 packed NodeNext/browser consumers2 PASS; package admission7 PASS.
- Actual original .28 standalone host installed through standard native Extensions
  directory drop; prior owned candidate disabled, no added host files/API overrides.
- Actual real-model UI reaches Generating local explanation while pending, then
  strict-model terminal result. Cancel retains template with6.5s late guard; changing
  selected target discards old reply with6.5s guard. Document-offline inference passes
  with navigator.onLine=false and online-success/offline-failure fetch controls.
- All6 native product controls PASS, errors0; selected synthetic app invocation0.
  No independent model API wire/session-count instrumentation in this product test.
- Registered driver/source and exact original host/archive hashes unchanged. Native
  screenshots at1100/390 retain13px base/no overflow. Agent inspected the actual390
  pending generation screenshot, compared existing controls/layout with the supplied
  Actions/local-explanation reference and preceding .27 rendering. Only truthful
  phase wording differs; no token/primitive/layout redesign. Screens are still
  human-unreviewed candidates, not human fidelity or general usability acceptance.

Handoff:.artifacts/atom/2026-10-21T15-42-19-029Z/atom-handoff.json.
Native final:.artifacts/l02/product-native/2026-10-21T15-44-48-507Z/results.json.
Aggregate:.artifacts/l02/phases/verification28.json / verify28.mjs.
Contract hashes:.artifacts/l02/phases/contract-unchanged28.json.
RED/source/focused/type/admission/pack logs:.artifacts/l02/phases/.

First .28 UI campaign at2026-10-21T15-42-52-155Z passed the functional predicates,
but its pending screenshot caught a viewport-resize paint transition. Preserved
unchanged; not visual proof. The driver now resizes BEFORE the pending request,
waits animation frames and paint, and captures the stable narrow generation state.
The final native repeat validates that changed driver/candidate, not an unrelated
old campaign. Initial sandbox packaging spawnSync npm EPERM is retained separately;
the same local pack command succeeded with authorized process permissions.

Run npm run verify:local-model-product -- <exact .28 atom-handoff.json>
--cached-profile <owned L02 profile> --previous-result <latest owned results.json>
--expect-generation-phase. Every run writes a unique receipt and closes its own
browser/X server/fixture resources. Never use a personal Chrome profile here.

The30-case actual inference/31destroy campaign remains .27 historical evidence,
not a fresh .28 corpus run; .26 download/timeouts remain their original checkpoint.
No OS airgap, heap/resource/V02 or global traffic proof is added. Whole-L02 review
waits for actual useful delivery; independent human remains no blocker.

Next bounded work:L02.5 define a separately versioned derived-annotation contract,
explicit non-sensitive projection and fixed-corpus usefulness rubric before changing
model behavior. Its implementation and actual comparative evaluation are later
bounded work, not assumed approved/implemented by this record.15/29 full items
complete(~52% equal count), not weighted release readiness. No SDK/publication/
other-repository changes.
