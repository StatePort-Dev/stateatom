# Native disabled controls implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan inline, task-by-task. No implementer agents; ONE fresh whole-increment review at the end.

**Goal:** Read native reflected disabled for button/input/textarea without invoking
application getters, then retry the unchanged independent Vue question.

**Architecture:** Browser-owned DOM attributes supply the Boolean. The existing
MAIN helper retrieves optional trace using that value, followed by native identity
revalidation. Engine and runtime share the picker DOM queue.

**Tech Stack:** Existing Node24 root tests, Chrome153 native MV3, Atom69/UI2;
original Node18.18.2/Vite4.4.9/Vue3.3.4 installed plugin5/helper5 path unchanged.

**Spec:** [design](../specs/2026-10-24-v03-native-disabled-controls-design.md).

## Global constraints

- Main stays checked out; local commits only, no push/publication.
- Scope-review-1,20/29 whole tasks; full V03/C09/A02/L02/V02 stay open.
- Three HTML controls only; reflected own disabled, not effective interactivity.
- No app disabled getter/constructor access, writes or arbitrary evaluation.
- Keep every original FAIL, source/read/IDE criterion and historical artifact.
- Original app/config/lock/dependencies unchanged; known components.d.ts delta.
- SDK/redesign/account/certificate/user-profile/other repositories excluded.
- No new helper build unless its exact222-input proof actually drifts.

## Review focus

- Getter/constructor poisoning and malformed/native namespace lookalikes cannot execute or become known values.
- Concurrent DOM readers and picker refinement use one queue, without nested queue deadlock.
- Replacement/navigation/value changes during trace acquisition cannot lend identity or old Observed trace.
- Own reflected false under a disabled fieldset is not described as proof of effective availability.
- Native synthetic and installed/source-positive evidence remain separate; original question never weakened.

### Task 1: bounded native property prerequisite and exact installed qualification

**Files:** modify src/engine/browser.mjs, packages/atom/src/runtime.mjs,
tests/engine/selection-identity.test.mjs; create
tests/engine/disabled-observation.test.mjs,
tests/fixtures/native-disabled-controls/index.html,
tests/integration/native-disabled-controls.mjs,
docs/testing/native-disabled-controls-case.json;
new Atom metadata/changelog and completion120/current routing.

**Interfaces:** createBrowserEngine(chrome,{readDOM}={}); readDOM(id,read) is the
same trusted native queue used by picker. identifySelection still returns only
{document,node,property,value}|null. observeDeep retains its result/trace schema;
no new browser DTO, evaluator, evidence kind or mutation authority.

- [ ] Write native identity and deep-value/poisoning/race tests before product code.
- [ ] Run node --test --test-isolation=none tests/engine/selection-identity.test.mjs tests/engine/disabled-observation.test.mjs; retain actual RED.
  Expected: new input/textarea identity and no-getter/deep-value controls FAIL;
  original button/text controls retain their original behavior.
- [ ] Implement exact native catalogue, shared queue, Boolean helper argument,
  before/after fences and bounded unavailable-disabled error. Keep text unchanged.
- [ ] Repeat focused source controls. Expected: all PASS; no getter calls or stale
  known value. Run affected engine/Atom/worker controls and full existing npm test.
- [ ] Write/register synthetic native driver/case before app/browser execution.
  Use native-inspector-ui and startNativeBrowser; Basic readonly, no helper,
  exact standalone installed host and own loopback server/profile. Preserve gate
  for zero app actions and zero poisoned getters. Commit source/driver/case.
- [ ] npm run pack:atom; use exact new handoff. Run existing verify:atom-types
  and verify:atom-package with that file. Expected2/9 PASS and exact UI2; no native
  acceptance from these checks. Verify helper222 inputs before reuse.
- [ ] node tests/integration/native-disabled-controls.mjs <exact69 handoff>.
  Expected catalogue matches, negative targets refused, getter/action counts0,
  inputs/archives/install/host stable; screenshots candidates only.
- [ ] Clone independent-vue-source-case68.json changing only expectedAtomVersion
  to69; commit before running unchanged independent-vue-source-native.mjs on69.
  Expected source-positive/IDE gates must actually pass or remain FAIL. Never
  modify app/selector/expression/Observed scalar/digest/range/timeout to pass.
- [ ] Record120 and routing with actual source/native outcomes; read-only seal of
  exact current inputs, original sources and receipts. ONE final fresh review
  c699b25..final implementation head, one tested correction pass at most.
- [ ] Local final commit; preserve evidence/worktree. Name one next dependency-
  valid unresolved item from the actual result. No whole-task credit from docs.
