# L02.6 Derived Projection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans inline. One whole-L02 review after all acceptance gates; no per-slice reviewer loop.

**Goal:** Source-only genuine-fact admission, non-sensitive projection and structural derived-annotation validation.
**Architecture:** Brand exact immutable factory results in an internal WeakSet. A separate core module owns opaque projections in a WeakMap, serializes only explicit abstract facts, and attaches original local limits/refs after structural validation against the current genuine snapshot.
**Tech Stack:** Existing JavaScript modules and Node test runner; no dependencies or model API calls.
**Spec:** ../specs/2026-10-21-l02-derived-annotation-design.md; completion/07 and12 remain scope authority.

## Global Constraints

- Stay on main under existing user authorization; local commits only, no push/publication/SDK/other repository.
- No UI/provider selection or original prompt/strict-validator changes. No model inference/benefit/L02 claim from source checks.
- Original30 and historical >=25/5incomplete/5untrusted criteria unchanged. Positive body controls are source fixtures here, not new model outcomes.
- Preserve unknown/skipped/hypothetical, same-snapshot refs and immutable limitations. No application expression/getter re-execution.
- Existing exact .28 native proof remains historical; this is not an installed new candidate.

## Review Focus

- Frozen forged/cloned/imported/proxy facts: reject before reading private fields or accessor hooks.
- Legitimate unknown-left/short-circuit conditions: null stays unknown, not false; compound consequence remains hypothetical.
- Rich private source/scalar/origin/handler/reference strings: no prompt inclusion; opaque local snapshot identity/IDs stay local.
- Escaped duplicate JSON members, unknown/duplicate tokens, Unicode byte budgets: reject, never silently repair.
- A valid JSON statement can still invent an HTTP/effect claim: structure-valid must retain factualEntailmentVerified=false.

## Task1 — factory admission and projection/structure deliverable

Files:modify core/inspection-explanations.mjs; create core/derived-annotations.mjs and tests/derived-annotations.test.mjs.

Interfaces:
- isLocalExplanationFacts(value):boolean; WeakSet membership only, no reflection on rejected objects.
- projectDerivedAnnotation(facts):opaque frozen projection|null; only genuine Supported facts.
- buildDerivedAnnotationPrompt(projection):string; serialize explicit model input only.
- derivedAnnotationResponseConstraint(projection):frozen JSON schema for the new output only.
- validateDerivedAnnotationStructure(raw,projection,currentFacts):frozen derived annotation; requires matching genuine explanationIdentity. Structural validation is not entailment.

Proposed fixed technical bounds declared BEFORE any new inference:raw UTF-8<=4096bytes; text<=512UTF-16code units/nonblank; input JSON<=6000UTF-8bytes; existing64-node/record and24-reference/8-limit ceilings. Reject or omit unsupported input, never clamp unknown into a known value. Output schema stateatom.local-derived-annotation/1; input stateatom.local-derived-facts/1. Original provider unchanged.

- [x] Write focused tests: genuine/forged/cloned/accessor/proxy admission; exact input allowlist; all30 frozen facts privacy; unknown/null and hypothetical counts; positive/separate/wrong-identity body fixtures; snapshot drift; duplicate/escaped JSON keys and malformed/extra/oversized/unknown-token outputs; immutable local refs/limits; explicit lack of semantic validation.
- [x] Run node --test --test-isolation=none tests/derived-annotations.test.mjs; watch missing-function/import RED.
- [x] Add WeakSet registration at the existing factory's three returns without changing serialized fields. Implement separate pure module and reuse the unchanged internal lexical duplicate-member checker from core/handoff-json.mjs; catch/relabel its errors, no handoff decoding/authority.
- [x] Run focused new+existing explanation/UI tests; fix only actual failures. Run npm test once; git diff --check.
- [x] Record exact source/commands/results/limitations in completion/62, update index and ledger, local commit.

Later provider/real model corpus/product exposure remain separate bounded tasks. No review/acceptance shortcut from this source-only deliverable.
