# Original Vue application warning baseline implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans inline, task-by-task. No implementer agents; ONE fresh whole-increment review at the end.

**Goal:** Establish whether the actual original warnings pre-exist instrumentation
and identify any instrumentation delta without changing the failed native gate.

**Architecture:** One bounded owned-browser/Vite comparison reuses immutable app
and installed plugin, captures raw CDP events and compares explicit multisets.

**Tech Stack:** Current Playwright1.63/Chromium, actual original Node18.18.2/Vite4.4.9/
Vue3.3.4/plugin5, existing dependency/artifact receipts; no package upgrades.

**Spec:** ../specs/2026-10-24-v03-warning-baseline-design.md

## Global Constraints

- Main/d40a503 local commits, no branch/push/publication or other repository.
- Original zero-console/native source/scalar/IDE/input/export gates unchanged.
- No app/product/helper/Atom/plugin/dependency edits or warning suppression.
- Four preregistered off/on/on/off startup trials, exact original tuple/route.
- No Atom/IDE mounted; isolated diagnostics do not requalify the whole native route.
- Historical FAILs, Unknown and all raw events/counts remain visible.

## Review Focus

- Off genuinely omits the plugin, On uses exact installed plugin/profile; same original app/config/dependencies/browser and private-cache policy otherwise.
- Raw console, exceptions and Log warnings are collected before app navigation without console replacement; positive control cannot contaminate app evidence.
- Multiset comparison preserves level, multiplicity and every argument, including unknown values; metadata normalization cannot hide application differences.
- Source/generated-file/installed-artifact identities and owned process cleanup actually match recorded receipts; partial runs are not successful comparisons.
- Equal finite startup messages never waive the original zero-console gate or establish full V03/C09, semantic transparency, human or installed UI acceptance.

### Task 1: Preregister and execute original warning comparison

**Files:** add tests/helpers/vue-warning-comparison.mjs,
tests/vue/warning-comparison.test.mjs, tests/integration/independent-vue-warning-baseline.mjs,
docs/testing/independent-vue-warning-case.json, record124/spec/plan; update current
task/status/corpus after actual terminal outcome only.

**Interface:** diagnosticMessages(events) returns complete stable warning/error
descriptors; compareMessages(left,right) returns equal/onlyLeft/onlyRight with
counts, no app side effects or product exports.

- [ ] Write comparator negative/control tests; run node --test --test-isolation=none tests/vue/warning-comparison.test.mjs, retain RED before implementation.
- [ ] Implement the comparator and bounded integration driver with raw capture, source/tuple/treatment checks and owned cleanup.
- [ ] Run focused comparator tests; retain current full2585/product evidence because no product source changes; no rebuild or old full native replay.
- [ ] Preregister exact supplied identities, original case, order/window and diagnostic constraints; commit driver/case/plan before execution.
- [ ] Run node tests/integration/independent-vue-warning-baseline.mjs docs/testing/independent-vue-warning-case.json; inspect actual phase results, raw warnings, artifacts and cleanup. Do not restart a live handle or retry to improve output.
- [ ] Summarize within-condition, cross-condition and original-native differences separately; keep original15-positive/overall-FAIL result unchanged.
- [ ] Update record124/current task routing/corpus append-only, identify one dependency-valid next item from actual result.
- [ ] ONE fresh whole-increment review d40a503..current head; rule declined boundaries, at most one tested correction pass for actual findings, no re-review.
- [ ] Final read-only aggregate from actual receipts, task-done/local commit/clean tree; retain ledger/history, whole20/29 and active goal unless their true gates change.
