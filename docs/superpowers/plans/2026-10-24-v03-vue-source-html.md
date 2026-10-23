# Vue source-template HTML parsing implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans inline, task-by-task. No implementer agents; ONE fresh whole-increment review at the end.

**Goal:** Parse the unchanged original selected Vue SFC with HTML rules while
preserving exact source/marker/evidence boundaries and original native criteria.

**Architecture:** Existing vueSourceUnit uses the locked DOM compiler parse export
instead of generic baseParse. No new resolver, schema, authority or source rewrite.

**Tech Stack:** @vue/compiler-dom/SFC3.5.44 source helper; existing Node24 source
checks/build. Original Node18.18.2/Vite4.4.9/Vue3.3.4/plugin5 tuple unchanged.

**Spec:** ../specs/2026-10-24-v03-vue-source-html-design.md

## Global Constraints

- Main/base3ff130a, local commits only; no branch/worktree switch or publication.
- Same original app/selected textarea/disabled=false/scalar/digest/range/IDE/input/export gates.
- Missing/unsupported/ambiguous/stale stays explicit; no source execution or target substitution.
- Source160/256000B/2000000B acquisition limits and trust/path fences unchanged.
- Keep historical FAILs immutable; no fresh installed/runtime proof from source tests.
- SDK, UI, accounts/certificates/user profiles/other repository outside this task.

## Review Focus

- HTML rules accept ordinary void tags without changing original offsets or swallowing adjacent selected targets.
- Namespaces, raw text, v-pre and encoded expressions cannot invent target or handler evidence.
- Malformed nonvoid markup and wrong/inherited/ambiguous markers still refuse or remain Unknown.
- Exact helper packaging uses current bytes; Atom/plugin reused only with unchanged full recorded inputs.
- Original source/scalar/IDE/input/export criteria and historical failures are preserved; partial proof is not full V03/C09.

### Task 1: DOM source parsing and exact original installed workflow

**Files:** modify core/vue-source.mjs; create tests/vue/source-html.test.mjs;
create completion123/spec/plan and exact new helper case; update current routing
and append actual outcomes to independent-apps.json after native execution.

**Interface:** vueSourceUnit(file,text) return schema and refusal behavior stay
unchanged; parse existing template content through compiler-dom parse.

- [x] Add source HTML regression tests before implementation; run node --test --test-isolation=none tests/vue/source-html.test.mjs, retain actual RED assertions.
- [x] Switch the existing locked DOM parser call without changing source text, marker, span or evidence validation.
- [x] Run node --test --test-isolation=none tests/vue/source-html.test.mjs tests/vue/source-actions.test.mjs tests/vue/void-template.test.mjs tests/workspace-sources.test.mjs tests/bridge-source-priority.test.mjs, expect PASS; run full npm test once.
- [x] Replay actual retained original selection via actual reader/analyzer: exact SFC/expression/digest/range, retain original FAIL; no browser/IDE credit.
- [x] Commit tested source, spec/plan and record before helper build.
- [x] npm run build:extensions; npm run pack:development; reproduce exact new helper bytes/input hashes/warnings/licenses.
- [x] Verify unchanged Atom70/UI2 archives/327 inputs and plugin5 archive/19 inputs/14 installed files; derive explicit inherited unchanged-plugin receipt with original verified appRoot/dependencyFile.
- [x] Preregister only required new helper/development/consumer identities in original case, unchanged question/criteria; commit before native execution.
- [x] Run unchanged independent-vue-source-native.mjs on exact70/new helper and original dependency receipt; inspect actual output/screenshots/IDE range or retain exact FAIL.
- [x] Record123/current routing/corpus append-only with actual outcome, source/native/historical boundaries and one next dependency-valid unresolved item.
- [x] ONE fresh review base3ff130a..current head; rule declined boundaries, at most one RED→GREEN correction pass/full suite; no re-review.
- [x] Final read-only integrity aggregate from actual receipts, task-done, local commit/clean tree. Preserve ledger/evidence; whole-count changes only after complete original gates, goal remains active until deadline.
