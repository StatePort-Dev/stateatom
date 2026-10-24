# Original array call-site bridge implementation plan

> **For agentic workers:** REQUIRED superpowers:executing-plans inline; ONE final fresh read-only whole-item review, no implementer/per-task reviewers.

**Goal:** Observe original source-bound filter/map callback identities without persistent JS wrapper frames.
**Architecture:** Separate research-only frame recorder and Babel call-site rewrite; direct native Reflect.apply, inline callback taps and per-owner cleanup. After semantic gates, one frozen original/off/on independent source experiment.
**Tech Stack:** Existing Node24/Babel7/esbuild0.25.12/Playwright1.63/Chrome153; no dependency upgrade.
**Spec:** ../specs/2026-10-24-a02-array-callsite-bridge-design.md

## Global Constraints

- main/local/latestOct25evening/scope-review-1/20of29; fullA02/V03/V02/L02 remain open.
- Research only: no product/plugin/old experiment/app/vendor/UI/SDK/otherrepo/publication changes.
- No extra app field read, duplicate original expression/getter, skipped branch or altered receiver/argument/callback behavior.
- 64calls/512yields per declared window; weak identities; Stop permanent/old tokens invalid.
- Causal storage/current membership/ownership/state revision/React props/selected producer Unknown/fullPathfalse.
- Max1 per immutable case after source gate/clean frozen commit; original case exhausted before app phases. One separately frozen process-case after the tested collector fix, at most TWO native attempts total; no third attempt or blind retry. See spec prerequisite correction.

## Review Focus

- Exceptions, early returns, implicit undefined, owner cleanup and argument Stop cannot leave live evidence or replace original effects.
- Foreign/unsupported/short-circuited calls preserve original callback/evaluation behavior and cannot masquerade as native sites.
- Inline callback lexical this/arguments/length and nested scope must not be changed by generated bindings/cleanup.
- Window rotation, repeated equal objects and species/Proxy storage must not revive or overstate a callback identity link.
- Native saved evidence must bind real source/bundle/page/window/calls and original UI parity, never a producer/full-lineage claim.

### Task 1: Frame API and semantically admitted source transform

**Files:** new experiments/react19-reducer/array-callsite-observer.mjs, array-callsite-transform.mjs; new tests/engine/array-callsite-observer.test.mjs, array-callsite-transform.test.mjs; record147/current metadata.
**Interfaces:** createArrayCallsiteObserver({page,enabled}) -> apply/begin/yielded/finish/abort/startWindow/snapshot/stop/retention; instrumentArrayCallsites(source,file,{enabled,sourceType}) -> code/sites/unsupported/sourceDigest. Source binding __sa_array_calls, no imports.

- [x] TDD frame recorder before implementation: exact links/copy/alias/ordering/no fields, lifecycle/old tokens/windows/caps; preserve original returned values. Observe missing module RED.
- [x] TDD transformer before implementation: execution baselines/counterexamples and exclusions in spec; emitted original Main grammar. Observe missing module RED; fix actual semantic failures individually RED→GREEN.
- [x] Focused aggregate/full npm test, syntax/diff and327+old7 integrity; local source commit and task-done. No native or delivered feature credit yet.

### Task 2: One finite original-app source acquisition experiment

**Files:** new experiments/react19-reducer/array-callsite-run.mjs; new source driver controls as needed; docs/testing/array-callsite-case.json and record147/current metadata; new unique ignored output.
**Interfaces:** consume Task1 source APIs, original TodoMVC source/dependencies and existing owned browser primitives; emit immutable registration/results/source-site/phase window reports, no product/package delivery.

- [x] Implement finite source-engine driver/admission/classification/independent cleanup controls with RED→GREEN. Preserve original/off/on phases and measured original28-file TodoMVC source manifest. Bind actual Node/Chrome and declared no extension/helper/IDE route.
- [x] Build/freeze initial original/transformed case; one attempt stopped at gated Chrome identity command before app phases. Preserve case/result/checkpoint unchanged.
- [x] Test corrected process collector, full source checks/clean commit; freeze separate process-case with prior failure pinned and unchanged launch/app criteria before its max1 attempt.
- [x] Run corrected case once/poll same handle: literal Incomplete/profile mismatch before app phases. Saved independent413-input verification/11 partial controls/exact-owned-profile scan; positive-window questions unexecuted, PID remains Unknown. No third native attempt.
- [x] Relevant aggregate112/full3150 passed; local commit then task-done. Bounded engineering/partial record only, no native acquisition or fullA02 completion. Final review remains below.

## Final closeout

- [x] ONE fresh final review; regrade by actual effects; one tested Important/Critical pass maximum/no rereview. Record all declined rulings/deferred Minors, local clean final checkpoint and ONE next dependency item.
