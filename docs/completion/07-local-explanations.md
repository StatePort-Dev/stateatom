# Local explanations — implementation plan

**Goal:** deliver short explanations from existing evidence, including the required locally evaluated AI option, while model use stays optional and introduces no new provenance claims.

**Architecture:** one deterministic fact projection and template renderer; a separate optional on-device provider may improve presentation. Neither output can write evidence edges, choose permissions or execute application actions.

**Tech stack:** existing `core/action-explanations.mjs`, extension-page provider, native UI and Chrome Prompt API.  
**Spec:** [release scope](02-release-scope.md), Actions/AI feature specification [R27].

## Current baseline

Templates work. The current model provider sees only generic action facts and can select from a finite literal sentence vocabulary. It does not yet explain condition inputs or discover causes. Its last recorded native run found `LanguageModel` unavailable; mocks exercised states and fallback, not real inference. [R09][R11]

Do not present this as a completed local-AI user benefit. Do not replace the current strict result validation with arbitrary prose merely to make the output look more impressive.

## L01 — Useful deterministic answers for supported findings

**Depends on:** U01; consume A01/A03 results as available.  
**Produces:** bounded `ExplanationFacts` and a template summary for the selected question.  
**Files:** `core/action-explanations.mjs`, `packages/atom/src/action-ui.mjs`, `ui.mjs`, current diagnostic/reader integration; add a property/source fact-projection module and tests rather than a second evidence engine.

Work:

- Extend the fact model to the selected property condition, available operands, handler/source path, data-origin fragment and missing boundary. Each fact refers to existing evidence IDs and the exact snapshot identity.
- Default to one or two sentences and a short next action. Put the original values, expressions and evidence behind an expander; they remain the source of truth.
- For supported boolean conditions, explain only what the observed inputs and source expression establish. A skipped operand is unavailable, not false. A value from an earlier render is not a current input.
- Static logical consequences may be calculated over already copied primitive facts using a pure, bounded expression model; do not execute the application's expression, getters or functions. Label hypothetical changes as hypothetical until a real intervention verifies them.
- Explain masking: if both known conditions independently block the action, removing one is insufficient. If one input is unknown, do not invent the second blocker.
- Keep application meaning separate from identifiers. `creditHold` is a source label, not proof that a particular financial/business rule is correct. Use an explicitly supplied public reason label only as app-reported metadata.
- Create the same facts for developer and QA/PM presentations. The simpler view may omit technical detail but not limitations or uncertainty.
- Invalidate explanations on target/source/evidence changes. No summary from a previous tab, build or model request may become current.

**Test cycle:** short-circuit unknown, two blockers, one blocker, local form state without API, an action binding never invoked, a native registration without source, mismatched source map, stale report and source-containing injection strings. Expected sentences/facts must be derived from test evidence, not a whole application dump.

**Run:** existing unit suite and Actions/Basic/map UI checks. Add targeted summary and stale-result tests. Compare the summary's factual meaning to the underlying evidence for every registered case.

**Done:** a user can understand the supported result without reading raw JSON. Templates complete L01, not the separately mandatory L02 local-AI deliverable.

## L02 — Required local-model delivery; user opt-in provider

**Scope:** O01 is mandatory for the completed baseline; choosing to use a model remains optional for the user.  
**Depends on:** L01. An unavailable or unhelpful provider keeps this requirement open; it does not silently reduce approved scope. A clearly narrower preview may ship meanwhile.

**Produces:** a useful, device-tested local explanation provider with explicit opt-in and an intact template path. A documented unavailable/not-beneficial run is a valid test result but not completion of L02.

**Files:** existing provider and explanation UI, provider tests, a local evaluation corpus/results format under `tests/fixtures/` and `docs/testing/`. No cloud provider, account flow or model download service is added.

Work:

- Recheck the official Prompt API contract when implementing. Invoke it from the extension document, not the MV3 service worker. Feature-detect the API and call availability with the intended language/input/output options. The current documented API is not exposed to Web Workers. [X01]
- Keep unavailable, downloadable, downloading and available distinct. Ask for explicit download initiation; show progress/cancel and release sessions. Cancelling initialization may not remove browser-managed model files, so do not promise that it does.
- No inference on every selection. Use an explicit Explain action after the facts exist; cache only within the same evidence identity/provider/options, in bounded memory.
- Compare model assistance with L01 templates on 20–30 fixed inspection results, including unknowns and short-circuit cases. Measure factual correctness, concision, usefulness and cold/warm latency. Do not use successful JSON formatting as semantic validation.
- The current finite-sentence mode should not become default merely because it runs: if it only selects wording equivalent to a template, the latency/resource cost needs a demonstrated benefit.
- Any freer wording must be a separately versioned **derived annotation**, clearly distinguishable from evidence, with exact fact references and immutable deterministic limitations. Validate structure, IDs and allowed actions, then evaluate factual entailment in the corpus. Natural-language correctness is not guaranteed by a JSON schema or by an allowlist of evidence IDs.
- Default model input remains bounded non-sensitive facts. Do not send whole source maps, response bodies, comments, page text or arbitrary application values. A later opt-in richer input policy requires explicit privacy review; it is not silently enabled by selecting a model.
- English is the first evaluation language. Do not promise additional languages or particular hardware until their exact configuration is checked. Record actual Chrome version, device, availability/options and whether a real session ran; do not invent a model build identifier the API does not expose.
- No remote fallback. Timeout, rejected output, stale snapshot, policy denial, missing API and unsupported device all render the deterministic result.

**Native acceptance:** use a supported Google Chrome installation with a real available local model. Record initial consent/download, successful inference, cancel, stale target, offline inference after installation and cleanup. Keep an unavailable-device run as a fallback test, not a positive model result. Do not disable browser security or require experimental developer flags for a claimed stable user workflow.

**Quality gate:** no incorrect factual or action claim in the fixed acceptance corpus; output remains short and preserves unknowns. This is bounded evidence, not a universal hallucination guarantee. A documented comparative evaluation must show actual usefulness beyond templates before making the provider prominent; an agent may perform it against the fixed evidence corpus, with method and limitations recorded. A second human participant is not required. A model that cannot pass stays experimental or hidden, and a narrower preview may ship, but the completed baseline still owes O01.

**Run:** existing Actions/Basic native checks plus the new actual-model evaluation. Mock provider tests continue to cover API-state handling separately.

**Done:** the exact tested local model route is useful and accurately described, with real supported-device inference and correct fallback elsewhere. Otherwise L02 remains incomplete. Never report “AI passed” because templates handled every unavailable result. No requirement is placed on every user device to support a model.

[R09]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/testing/action-inspector-validation.md "Action Inspector validation"
[R11]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/core/action-explanations.mjs "Current template and local-model provider"
[R27]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/features/STATEATOM_ACTION_INSPECTOR_LOCAL_AI.md "Action Inspector feature specification"
[X01]: https://developer.chrome.com/docs/ai/prompt-api "Chrome Prompt API"

## 2026-10-21 execution update (historical baseline above retained)

L01 accepted after ONE review; see [56](56-l01-whole-item-review.md). Actual Chrome155
.26 baseline24 is [57](57-l02-real-device-baseline.md); .27 exact-metadata correction
and real30-case controls are [58](58-l02-exact-metadata-controls.md). The old API-
unavailable outcome is historical, not current device status. All30 latest corpus
outputs passed strict validation, with6 incomplete/5 untrusted cases; no added
usefulness over templates. Mandatory L02 remains open. Next actual installed Atom
controls; neither corpus counts nor this document completes O01.
