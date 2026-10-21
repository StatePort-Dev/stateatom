# A02.2 isolated pinned React19 reducer identity experiment

> Inline superpowers:executing-plans. No reviewer per source slice; no whole-A02 acceptance implied.

Base f4e40fc/main; user autonomy through2026-10-22T06:00Z. A02.1/completion30 already
registered this finite next experiment. Do not rerun its old29/16/14/19 checks or edit
historical artifacts. Current product React18 adapter MUST remain unchanged and
continue to reject19. This is experiment code under experiments/react19-reducer,
not an Atom adapter/SDK export or an independent-app modification.

## Exact inputs and source contract (before implementation)

Use existing read-only .runtime/todomvc/examples/react/node_modules React/react-dom
19.2.5, installed for the retained pinned TodoMVC ff43b02e59dfa604386bb382034b2cd07c2bcd8a.
No package install/source edits. Pinned development inputs:

- react/cjs/react.development.js SHA2564325e6263375459503858c0982d50bbc25bc33e66676954698c67221d2ee8b72
- react-dom/cjs/react-dom-client.development.js SHA256806b25cf84808a5ae0104e81633caabb1aa11fce71e72ef7afe4c1f8d2ebec08

Resolve package versions/hash ALL bundled dependency inputs; fail before execution
on unknown/missing versions or changed vendor bytes/site counts. Keep vendor notices.
Build unique derivative bundles in .artifacts/a02/react19-reducer/<timestamp>, never
modify node_modules. Original fixture bundle plus transformed observer-off/on modes.
Synthetic VM transformer checks remain distinct from actual pinned browser execution.
No original TodoMVC app/other repository changes, public support or API stability claim.

Official React documentation via Context7 confirms purity/StrictMode repeated calls;
private source above defines this version-specific acquisition, not a public contract.
Do not re-invoke a reducer/getter, reconstruct inputs from later values or treat an
ignored StrictMode result, old equal object/primitive or pending render as committed.

## Finite acquisition architecture

Files:vendor.mjs (AST transform+pin/profile), observer.mjs (self-contained experiment
ledger), fixture.mjs (declared synthetic two-row useReducer/consumer oracle), run.mjs
(actual browser/receipts), tests/engine/react19-reducer.test.mjs, package command.

Native taps wrap ONLY original returned values/calls or insert statements after
native construction/commit sites. Original reducer call expression stays a direct
call and executes exactly once. A post-return tap returns that SAME result; if the
original throws, no successful result tap occurs and original exception propagates.
Callbacks/errors in observation cannot change the returned object or exception.
Capture native dispatch/update object BEFORE enqueue overwrites the local variable.
Tag ignored StrictMode reducer calls separately from the actually applied call.

Expected bounded sites:ReactElement return1; ReactDOM createFiber/createFiberRoot
return1each; mountReducer/updateReducerImpl/rerenderReducer result1each;
updateReducerImpl begin1, ignored reducer call1, applied reducer call1;
rerenderReducer render-phase result1 (explicitly unresolved/invalidate prior revision);
dispatchReducerAction update construction1; root.current=finishedWork1 in
flushMutationEffects; setInitialProperties tail1/commitUpdate tail1. Early-return
special host tags unsupported; fixture uses span/button/div normal completion only.
Reject structural/count/hash drift. Guard against helper identifier collision.

Observer admits original native Fiber/root/React props identities from these taps;
reads only own DATA descriptors of those objects. Never enumerate/read app state,
action fields, proxies or getters:retain WeakMap IDs/WeakRefs and copied primitive
fixture outputs. Queue/hook/update/reducer/input/result identity and revisions are
per exact event. Native update clones/rebased pointers without dispatch observation
keep updateOrigin Unknown; equal action/result is NOT a replacement identity.
Cap events4096/committed traversal512/hooks64; overflow/refusal explicit. A stopped/
disabled observer has no current witness. No persistent or whole-app capture.

The synthetic fixture ALSO supplies a declared oracle at its ORIGINAL reducer
return, map replacement and consumer render points. It passes existing local refs/
copied title (no reread), and returned React element props identity. This is NOT
ordinary prop/field ownership inference. Join selected native committed host props
and ancestor hook result with these EXACT explicit oracle identities, never nearest
render/name/value. Require native host-applied props and current root.current tree.
Even success reports field ownership, escaped-alias exclusion, general prop transfer,
HTTP/query ancestry and fullPath as Unknown/false. No second evidence engine added
to product. Ignore discarded consumer props even when text equals committed text.

## Registered browser controls

All use original19.2.5 execution in a localhost synthetic fixture, separate from
Atom/MV3/IDE/native-user-workflow acceptance. Original, transformed observer-off,
transformed observer-on application semantics compared. No security/experimental
browser bypass; exact launch/browser configuration recorded. No model runs needed.

1. Two equal-title rows:distinct actual row/props/DOM occurrence IDs; initial state
   has no replacement update origin. Native initial queue/result identity only.
2. Same-value immutable row1 replacement:primitive title unchanged, new state/row/
   applied reducer result/revision/update identity. Selected row2 remains the old
   object and must not acquire row1 replacement provenance.
3. Different row1 title and unchanged row2:exact selected committed native host props
   map to actual applied result and fixture consumer; no same-value/nearest join.
4. StrictMode:original ignored probe result recorded separately, never used as the
   committed applied result; actual reducer/getter counts agree with original/off
   controls for synchronous cases. Dispatch identity is stable; no observer calls.
5. Suspended transition:actual pending reducer result cannot become current selected
   consumer; old committed target retained or explicit Unknown if host is hidden/
   detached. Release real gate, require actual later committed result identity;
   discard pre-commit equal/new results. No forced skipped branch or extra reducer.
6. Low-priority plus urgent update:record actual native rebase/clone if obtained;
   cloned update without observed dispatch pointer remains Unknown, never joined by
   action equality. If scheduling does not exercise it, report not-exercised, no pass.
7. Original thrown reducer error:ErrorBoundary/native error callback observes the
   SAME sentinel exception, no successful result fabricated; off/on semantics.
8. Stop:current experiment witness gone; application dispatch/render still works.

## Tasks and stopping rule

- [x] TDD synthetic AST/VM original single-call/getter/return/exception/receiver/order
  controls and structural/count/pin rejection. These are source checks only.
- [x] Implement bounded transform/ledger/oracle/driver; register all exact source,
  vendor/lock/bundle/config/protocol hashes BEFORE browser calls; keep failed attempts.
- [x] Run focused/full source checks, then ONE finite actual browser campaign with
  the controls above. Fix only identified acquisition bugs; never relax identity or
  acceptance criteria. Source changes during a run invalidate that run.
- [x] Inspect raw per-control IDs/events/original/off/on counts and committed tree;
  report controls not exercised and exact remaining gap. No synthetic oracle becomes
  an independent-app/full-field-lineage claim. No useReducer19 product support.
- [x] Completion68 record/index/status/ledger and local commit. Stop this experiment
  with exact missing identity if acquisition fails. Do NOT build a general proof
  framework or declare A02 done. Choose one dependency-ready next bounded work item.

No SDK, other repository, redesign, publication, Live/production permission/handoff
policy decisions, changed criteria/history, independent-human blocker or push.

Execution:completion/68; source1902/new4 and actual14checks PASS in Chromium153.
Finite experiment complete, not product19/A02/full lineage. Source primitive-state
false positive reproduced then refused; actual clone origin Unknown. Original
registered plan bytes retained with the run; this progress note is post-run.
Next P01.1 native selected-listener anchor/source-provider boundary.
