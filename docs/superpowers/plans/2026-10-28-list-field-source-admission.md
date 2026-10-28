# A02 finite list-field source admission

> **For agentic workers:** Use superpowers:executing-plans inline under approved282 and autonomous execution.

**Goal:** Account for the original state-list and row references across the admitted reducer/component source graph, rejecting writes and opaque escapes instead of treating names or final values as proof.
**Architecture:** A bounded structural checker follows lexical aliases, original filter/map/every/concat callbacks, useMemo dependencies, JSX prop-to-destructured-parameter edges and scalar-field reads. It derives module/component edges from imports and lexical bindings. It produces conditional source obligations only. Actual ordinary object/scalar reads, original native methods/species, exact applied/selected identities and complete-code/lifecycle admission must separately discharge those obligations before ownership can be claimed.
**Tech Stack:** Existing Babel parser/traverse and source hashes; no browser or model.
**Spec:**282; source/runtime receipts285–286. New source-use inventory under .artifacts/a02/finite-alias-admission/2026-10-28/source-uses.json covers actual five participating modules; existing sourceUses correctly leaves native calls/props/container edges incomplete.

## Scope
One immutable object-list reducer, explicit action-derived field creation, React useReducer/useMemo/memo and ordinary direct JSX props through local modules. No arbitrary library summaries, global ownership framework, heap traversal or whole-app graph. Unknown syntax/escape/native behavior refuses the source admission. Application names, selectors, field values and coordinates are not matching rules.

## Task 1
- [x] Freeze actual retained-source manifest and independent renamed/restructured control; write RED tests before checker implementation.
- [x] Add src/engine/list-field-source-admission.mjs. Input files+root component export+selected field. Follow both root state and selected-field object creations, all relevant local aliases/callbacks/components; retain exact source locations and explicit runtime premises. Do not return fieldOwnership Observed/fullPathtrue.
- [x] Verify actual original five-source graph and held-out positive; same-value alias writer, delayed callback writer, global/opaque/container escape, missing module, computed/default props, unexpected callback/return forms and budgets must refuse. Source mutation invalidates digest. Reuse existing sourceUses characterization unchanged.
- [x] Focused/full checks, one read-only review and required single correction pass, local commit. No native209/276 replay, no package/host publication or model work.

## Review focus
No writable or escaping row alias omitted, including a fresh object before it reaches state and a nested deferred callback. Scalar-field use is CONDITIONAL on actual primitive/ordinary read evidence, never a static assertion. Module/import aliases and component props must resolve lexically, not by spelling. Native methods and source closure are external runtime gates, not inferred from syntax. Missing source or unsupported shape refuses.

## Execution ledger
BASE7fd7e24. Full6095PASS belongs to286. This task has not implemented a checker or executed new tests yet. Mac installation is separately non-blocking/unverified per287; all other release gates retained.

19initial RED→19GREEN;71recipe/receipt/admission checks and9separate existing
sourceUses checks PASS. Initial affected command named an absent engine/sourceUses
path; corrected actual root path supplied the9checks, not the absent path.
Initial full6114PASS/0fail/cancel/skip,184906.668655ms,exit0.
ONEreview0C/5I/0M reproduced11regressions19PASS/11FAIL. One correction pass yields
91affectedPASS; final full pending. Findings: pattern/loop writes, implicit
arguments aliases, opaque concat input, missing bridge hash, dynamic eval scope.
Final: Ruling: actual scalar/native/closed-world execution excluded from source
review — explicit unproved runtime premises retained — cost if ignored: source
syntax misrepresented as no-writer runtime authority.
Final: Ruling: state/row/commit/public/package/release integration excluded from
this prerequisite — remains unfinished next work — cost if ignored: unsupported
complete-lineage/release claim.
Final: Ruling: full-suite outcome belongs to executor, not reviewer — retain actual
exit/log below — cost if ignored: test count promoted without completed execution.

Final: fixed all five Important findings —11regressions19PASS/11FAIL→91affectedPASS;
full6125PASS/0fail/cancel/skip,228528.836638ms,exit0. No rereview. Final source-only
original five-module result retained as admission.json. Runtime premises remain
unproved; Task1 complete only as finite conditional source admission.
Ruling: arguments/eval and untracked concat inputs refuse conservatively instead
of adding general dynamic alias analysis. Cost: some valid but unsupported programs
receive Unknown; no source-effects guarantee is relaxed.
