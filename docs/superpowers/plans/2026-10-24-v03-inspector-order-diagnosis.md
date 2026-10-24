# Inspector input ordering diagnosis implementation plan

> **For agentic workers:** REQUIRED superpowers:executing-plans inline; ONE final fresh read-only review, no implementer agents.

**Goal:** Record missing native inspector model order and per-row refusal facts.
**Architecture:** Exact-source inspector-only false conditional breakpoints; bounded projection, independent cleanup and preserved old FAILs. Product remains unchanged.
**Tech Stack:** Existing Node24/Chrome153/CDP/native UI helpers and Atom76.
**Spec:** ../specs/2026-10-24-v03-inspector-order-diagnosis-design.md

## Global Constraints

- main843a648/local only/latestOct25evening/scope-review-1/20of29; full V03/A02/V02/L02/C09 open; SDK outside, A05/L02 mandatory, human nonblocker.
- Test-only observer, no product/app source change, no app target debugger/expression/getter/setter/callback work, no pause or timer/guard change.
- Exact76/UI2/65 original commerce files; old results unchanged. No new certificate/IDE/user profile/other repo/publication/redesign.
- Six before/after sites;256 events/raw128/revision2048; missing/ambiguous/overflow/paused means incomplete. Independent cleanup of breakpoints/probe/Debugger.
- One source-browser technique control before one frozen native diagnostic. No old guide/mutation/Undo/Draft/baseline campaigns repeated.

## Review Focus

- Resolved executable locations must stay inside the intended exact statement and actual script; a moved/duplicate source cannot silently collect a different call.
- The observer must retain only projected inspector metadata, never opaque app refs or credentials, and always remain false even on collection failure.
- Async accepted receive and late settle must preserve their actual order and expose the pre/post model state without relabelling synthetic controls as native.
- Partial install/unexpected pause/capacity/cleanup failure must retain a literal incomplete result and attempt every owned cleanup independently.
- A visible generic error cannot substitute for the actual row message/model order, and new diagnostics cannot waive original guide FAIL or revision guards.

### Task 1: Bounded observer and independent technique control

**Files:** new tests/helpers/inspector-input-order.mjs; tests/atom/inspector-input-order.test.mjs; tests/integration/inspector-input-order-control.mjs; record142/current metadata.
**Interfaces:** serializable inputOrderProbe({action,phase,draft,incoming,planId,raw}); inputOrderSites(source,layout) returns six exact source ranges/condition bindings; installInputOrderTrace(session,{sourceURL,source,expectedHash,layout}) returns registration/read/stop, owns only inspector target debug domain.

- [ ] Write actual serialized probe tests before helper: start/read/record/stop, existing-slot refusal, before/after sequence, projection excluding extra data, missing/duplicate row, raw/revision/event caps. Run node --test --test-isolation=none tests/atom/inspector-input-order.test.mjs; Expected missing-module RED.
- [ ] Implement minimal bounded projection/anchor/false-condition helper; test exact packed76 and source anchors, duplicate/missing/hash mismatch, rejected location and independent partial-cleanup paths. Expected GREEN.
- [ ] Build one source-controller browser control using actual source controller/draft, fake backend and explicit synthetic10/20 edits; bind actual script/source/Node/Chrome; assert six sites, pre/post state changes, false conditions/no pause and all cleanup. This is source-browser technique evidence only.
- [ ] Record literal results and immutable control inputs; meaningful focused source checks, diffcheck, local commit, task-done. No native commerce case before successful technique control.

### Task 2: One registered native question, saved verification and review

**Files:** new tests/integration/inspector-input-order-native.mjs; tests/atom/inspector-input-order-harness.test.mjs; docs/testing/inspector-input-order-case76.json; record142/current metadata.
**Interfaces:** consume Task1 observer and exact unchanged76 artifact/current commerce prerequisites; output ordered native trace + actual row UI and cached backend samples, full literal status/cleanup/hash receipt.

- [ ] Write driver admission/classifier/cleanup source controls first: reject undeclared options and actualNode mismatch, refuse incomplete/overflow/paused trace and missing row, preserve original FAILs. Observe RED then implement GREEN; no production policy/recovery change.
- [ ] Freeze exact source/case/archives/original/dependency/tool inputs, actualNode/Vite executable admission, synthetic API and two native Live inserts/windows before clean source commit; original criteria never waived.
- [ ] Execute max1 case, poll same handle and preserve literal result; no blind restart. Validate exact incoming/row/revision/transaction joins from actual trace, record missing facts as Unknown/incomplete.
- [ ] Save independent verifier and negative controls; compare actual findings to V03.18 orders without promoting source controls into native proof. Run final focused controls/task-done, local commit, ONE fresh final review/one tested Important-Critical pass only if needed, final aggregate/clean commit. Full V03 stays open; name one next dependency item.
