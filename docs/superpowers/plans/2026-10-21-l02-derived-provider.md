# L02.7 Derived Provider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans inline. Review the WHOLE L02 only after useful real-device/product acceptance; no per-probe review.

**Goal:** A separate source-only experimental provider with safe lifecycle/current-snapshot fallback; no product selection or model acceptance yet.
**Architecture:** Consume the genuine-fact/opaque projection contract from856b843, keep deterministic summary separate from the annotation, own one bounded session per explicit request, recheck cached current facts before creation/prompt/validation, and release even late-created sessions exactly once.
**Tech Stack:** Current Chrome Prompt API text/en extension-document route; existing JS and Node tests, no dependencies.
**Spec:** ../specs/2026-10-21-l02-derived-annotation-design.md and completion/07/12.

## Global Constraints

- Existing main/local-commit autonomy until2026-10-22T06:00:00Z; no push/publication/SDK/other repo/redesign.
- Original finite provider/prompt/strict validator and UI selection unchanged. New result.summary remains deterministic; generated text is result.annotation, explicitly entailment-unverified.
- Original30/25+5+5 criteria unchanged; no mock/device-unavailable/JSON/fallback success counted as real inference or usefulness.
- No implicit selection inference/download, remote provider, arbitrary app data/action/permission. Model APIs only from an extension document later; no worker/API bypass flags.
- Same text/en options for availability/create; explicit click required, explicit allowDownload when not available. Timeout bound1–120000ms; default30000ms.

## Review Focus

- Changed facts during availability must prevent create/download; during create must prevent prompt; during prompt must discard annotation and return current deterministic facts.
- Caller abort/timeouts with ignored/late API completion must return promptly and destroy each resolved owned session once, without unhandled rejects.
- Cached-model progress100 and post-generation progress must not overwrite generation/cancel; presentation callback failure must not retain a session.
- Forged/cloned/current-fact getter failures must not serialize private input or call model.create.
- Structurally valid unsupported prose is still unverified; deterministic summary/limits/IDs remain independent and unchanged.

## Task1 — independent provider and lifecycle tests

Files:create core/derived-model-provider.mjs, tests/derived-model-provider.test.mjs; modify core/derived-annotations.mjs/tests/derived-annotations.test.mjs for a pure current-projection check and API constraint adjustment only.

Interfaces:
- isCurrentDerivedProjection(projection,currentFacts):boolean; no reflection on rejected inputs, exact explanationIdentity and genuine-factory membership.
- ChromeDerivedAnnotation(model=globalThis.LanguageModel):{availability,explain}.
- explain(facts,{userActivation=false,allowDownload=false,signal,onProgress,onPhase,timeoutMs=30000,getCurrentFacts=()=>facts}={}):Promise<{provider,summary,evidenceIds,limitations,annotation,reason}>. getCurrentFacts is synchronous and reads only cached locally produced facts, no app/source refresh.
- Successful provider ID chrome-built-in-derived; summary remains TemplateExplanation. annotation is the structural-validator result with factualEntailmentVerified=false. All other outcomes provider=template/annotation=null; current genuine facts drive the template, otherwise normal unavailable facts.

Ruling from current official docs:omit text.maxLength in the GENERATION schema; keep unchanged strict client512UTF16/4096UTF8 limits. Never truncate because it could remove an unknown/limitation. Chrome explicitly warns schema length forcing may compress meaning into nonsensical tokens. [Prompt API](https://developer.chrome.com/docs/ai/prompt-api), [built-in AI guidance](https://developer.chrome.com/docs/ai/built-in-ai-dos-donts). AbortSignal create/prompt + destroy contract rechecked via Context7. General JSON schema docs do not prove every keyword on this device; actual candidate will test separately.

- [x] Add RED lifecycle tests: missing/unknown/downloadable/downloading/available, no opt-in/download consent; matched options; separate result metadata; source privacy/schema; cancellation in availability/create/prompt, deadline and late session; changed cached facts at every async stage; stale/cloned/forged inputs; callback/API/validation errors; warm/late progress; concurrent request cleanup; unsupported prose stays explicitly unverified.
- [x] Watch the new suite and maxLength/current-projection controls fail before implementation.
- [x] Implement pure helper + separate bounded provider. Keep original provider/UI byte-for-byte. Do not cache responses or retain settled sessions. Generic reasons never include model errors/private text.
- [x] Run new+existing derived/factory/provider/UI tests; full npm test once, diff --check; retain commands/output and original30 unchanged proof.
- [x] Record source-only result in completion/63, update parent/index/ledger and local commit. No actual model/candidate/benefit claim.

Next separate task:versioned immutable evaluation candidate and registered real30+body supplement comparison. Do not expose provider until factual/usefulness acceptance supports it.
