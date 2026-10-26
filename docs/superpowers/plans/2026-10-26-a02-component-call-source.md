# Native Component Call Interval Implementation Plan

> REQUIRED superpowers:executing-plans inline; ONE fresh final whole-item reviewer.

**Goal:** Emit an exact synchronous bracket around two original native component calls.
**Architecture:** Inline try/catch/finally keeps original calls in native owners; optional
captured hook/opaque token, original result/error identity; compose unchanged pinned memo chain.
**Tech Stack:** Existing Node24/Babel parser/traverse/types/generator/esbuild/VM; no deps.
**Spec:** ../specs/2026-10-26-a02-component-call-source-design.md

## Global Constraints
Current main/localcommits.3NEWcodefiles only; old product/research/cases/raw/readers unchanged.
No actualReact/App/browser/native/model/newAppGCcampaign/package/UI/SDK/otherrepo/cert/trust/publish.
Original expressions/getters/branches/receiver/caller/return/throw preserved; no original-call wrapper.
Source admission only/runtimeQualifiedfalse;20of29/fullA02/16historicaldeferred unchanged.

## Review Focus
- Inline bracket must preserve original var/call/operand evaluation, reentrant getters and throw identity.
- Hook capture/lifecycle faults cannot invoke getters, cross collectors, force branches or change app behavior.
- Lexical shadow/escaped names/eval/ambiguous call shapes must refuse source admission.
- Pinned composition must retain old base/native-return/element/memo sites/digests/policies.
- Owned VM/compile-only evidence never becomes actual invocation/commit/parameter/property proof.

### Task 1: Component-call source recipe and semantic controls
**Files:** NEW experiments/react19-reducer/component-call-transform.mjs;
NEW tests/helpers/react19-component-call-grammar.mjs;
NEW tests/engine/react19-component-call.test.mjs;docs/completion/203-a02-component-call-source.md;
docs/status.md;docs/completion/task-index.json.
**Interfaces:** instrumentComponentCallGrammar(source,file,{originalSource})->source-only result;
transformPinnedComponentCall(source,file?)->pinned full chain+2call-source sites;
optional captured __STATEATOM_COMPONENT_CALL_TAP__ begin/outcome/end with opaque token.
- [x] task-start/read brief/register tracked/currentNative46 inputs and exact historical plan before edits.
- [x] RED owned original/off/on semantics and faults/reentrancy/unsupported admission; missing recipe fails.
- [x] Implement minimal AST inline bracket/captured hook helpers and pinned chain, no old file edits.
- [x] GREEN new+related/full/source syntax/diff/hashes; actual retained source compile ONLY. Expected
same original calls/results/throws/getters and source-only2sites, no new native execution.
- [ ] Save logs/hashes/checkpoint/binder/localcommit/task-done, ONE whole review/one tested I/Cpass/
minorsdefer/norereview; verified archive/remove own workspace/close localcommit.
NextONE bounded reentrant frame consumer before Item parameter binding, not a native repeat.
