# L01 Selected-question Explanations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans inline. The user authorized autonomous task/check/local-commit iterations on the current branch until20:00; no implementation subagents or repeated technical approvals.

**Goal:** make supported selected-property/action findings understandable in one or two sentences, with their exact evidence and limits available locally.

**Architecture:** a bounded pure projection of existing inert snapshot records, plus a tiny boolean condition model over copied booleans/source literals. Reuse existing templates/provider and Atom/reader controls; do not add an evidence engine or app evaluation. Rich local details never enter the generic model prompt.

**Tech Stack:** existing ES modules/Node24/native MV3/Chrome/IDE harness and shared extension UI; no new dependencies.

**Spec:** docs/completion/07-local-explanations.md L01,02-release-scope.md,12-scope-decisions.md; docs/evidence-model.md. L02 remains separate and mandatory.

## Global constraints

No app expression/getter/function invocation, eval, skipped-branch execution, inferred business meaning, new effect/origin edge or stale-instance reuse. Models remain opt-in; default model input excludes source/comments/names/paths/arbitrary values. No publication/SDK/other repo/redesign. Human screenshots remain candidates, not a blocker.

## Review focus

- Same expression/name/value in another render or independent observation cannot fill a skipped operand: require exact target closure/page/source span and available scope.
- Copied computation evidence is not necessarily the committed DOM producer or HTTP value ancestry; preserve that missing boundary in the short answer/limits.
- Two known masking terms may include a source boolean literal; distinguish Code-linked constants from actual Observed reads. Never pretend a skipped dynamic read is known.
- Action binding/registration and separately observed body trace cannot become callback-object equality or effect causality.
- Saved diagnostics omit dependency/occurrence details: a passive summary must refuse reconstruction when exact links are absent, and must never become current on import.

## Task1 — bounded local fact/model projection (source-only increment)

Files: add core/explanation-condition.mjs,core/inspection-explanations.mjs,
tests/explanation-condition.test.mjs,tests/inspection-explanations.test.mjs;
modify core/action-explanations.mjs only to project an explicit safe prompt allowlist.

Interfaces:
- parseExplanationCondition(expression): bounded AST for boolean literals, identifier/member labels, !, &&, || and grouping; unsupported grammar returns null, never eval.
- evaluateExplanationCondition(model,inputs): pure three-valued boolean result/masking over copied booleans; unknown stays unknown. Static consequences are derived, not interventions.
- inspectionExplanationFacts(state,{question='property',historical=false}={}): frozen schema2 local facts, exact identity, summary alternatives, evidenceIds, deterministic limitations, nextAction and rich local details. Facts are presentation only.
- diagnosticExplanationFacts(record): passive historical fallback from the existing parsed v1 diagnostic; no invented missing dependency/target fields.
- buildExplanationPrompt keeps only schema/property/disabled/evidenceIds/limitations/summaries, not arbitrary added fields.

Steps:
- [x] RED actual current-format closure/identity controls: short-circuit unknown, source boolean masking, one term, local form/no HTTP, foreign source/span/scope/page/root, duplicate/retention/stale records, injection strings/accessors and passive report omissions.
- [x] Implement minimal bounded parser/projector and non-sensitive prompt projection; preserve action/provider compatibility.
- [x] GREEN focused/full suite; consume selected retained native records as source inputs without claiming fresh native/UI support.
- [x] Commit source-only increment with evidence record; L01 remains in-progress.

## Task2 — current Atom and passive reader integration/acceptance

Files: packages/atom/src/ui.mjs,template.mjs; action-ui.mjs where necessary;
browser-extension/reader.mjs; new narrow explanation UI module/tests/native entry.

Reuse the existing selected-property summary/Inputs section and Actions Explain
control. Add one collapsed local details disclosure and concise next-action label;
no shared CSS/token/primitives. Render strings with textContent. Show same facts to
technical/nontechnical readers, with details optional. Key async presentation by
exact projected identity/evidence; invalidate on tab/selection/source/evidence changes.
No source/body/value is sent to the existing optional finite-vocabulary provider.
Historical reader has no model, live source navigation or runtime authority.

- [x] RED mounted details, next action, stale/model race, exact same facts and passive-reader controls.
- [x] Wire templates/details with existing layouts; changelog and immutable package/strict consumers/admission.
- [x] Native Actions/Basic/maps regressions and exact synthetic condition/property cases on both installed hosts, real getter/non-invocation controls,390/1100/keyboard/zoom candidate comparison.
- [x] One fresh read-only whole-L01 review, one TDD fix pass if needed, no per-task review loop.
- [x] Update plan/task-index/status/evidence; local commit. Next L02 real device/provider usefulness gate; templates/mocks do not complete it.

Ruling: this is a bounded implementation of approved L01, not a new product architecture. The source-only increment is explicitly not rendered capability evidence. Existing user autonomy supersedes repeated skill approval menus; unknown L02/device behavior is not preapproved or assumed.

Final: ONE review(Critical0/Important1/Minor1), both findings fixed in one TDD pass.
Exact .26 source1846/focused87/native24/consumers2/admission7 PASS. L01 complete
within the documented bounded scope; mandatory real-model L02 remains open.
