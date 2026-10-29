# L02 — focused derived annotation, executor design under autonomous scope

29 October2026, after bounded A02 completion324. The maintainer delegated remaining
release work; the choices here are new executor decisions, not earlier approved
implementation details. Current finite product output and closed v1/v2 pilots stay
unchanged.267's4scoped/6rejected results and268lifecycle remain historical.

Problem: the v2 model inferred missing inputs/logic reliability from a large mixed
fact projection and generic limitations. Its JSON/reference gate did not establish
sentence entailment. Repeating that campaign or selecting the old provider cannot
complete L02. More context or arbitrary page/source text is not an acceptable fix.

Chosen bounded mechanism: separately versioned focused derived annotation/3.
Project only current locally constructed Supported facts, one question at a time:
recorded boolean versus hypothetical copied result and exact unavailable-input
count; or copied scalar-read boundary; or action finding versus independent body
observation count. Exclude application values, source/handler/reference labels and
unrelated condition metadata. Preserve original exact evidence IDs/identity/limits
locally in the derived result, never ask the model to generate them or actions.
Missing/stale/historical/forged projections retain deterministic fallback.

Use short fixed English instructions, existing local Prompt API/options/cancel/
timeout/session ownership and strict duplicate-key/schema/token/length validation.
Free text is still derived, structure-only validated: no claim of universal semantic
verification. The provider remains unselected/unpackaged until actual corpus quality
and user-facing acceptance; source tests cannot make it useful or factual.

Alternatives considered: merely retry/tune v2 on its ten answers has no changed
mechanism and is rejected. A deterministic sentence chooser is safer but repeats
the existing usefulness gap. A second general model/verifier/cloud API expands
scope and is rejected. This focused projection changes the semantic task/input
boundary; whether it improves actual answers is unknown until measured.

Sequence: TDD focused projection/privacy/current identity and mock lifecycle;
freeze unchanged original30 main cases (6incomplete/5untrusted) plus separately
labelled existing4body controls, prompts/options/expected interpretation and exact
new source before a bounded real-device evaluation. At least25 actual model answers
in the main cohort are required; fallbacks never substitute. Preserve the original
zero incorrect factual/action claims, shortness/usefulness and latency criteria.
Do not select a convenient subset, call wording differences useful automatically,
or turn JSON/reference validity into entailment. Do not overwrite old model runs.

The exact native collection mechanism/profile/one-run budget will be frozen after
source preparation and before browser/model work. Reuse an owned clone of already
proved cached local model context; no new trust/CA/profile permissions, prompt
search, paid API or personal profile. Source-only first step does not completeL02.
After actual quality: wire the accepted provider to current UI only if justified,
then final current lifecycle/offline/fallback and one wholeL02 review. Whole22/29.

## Source preparation and frozen native method

Focused projection/provider/controller/record validation:70PASS with
`node --test --test-isolation=none tests/focused-evaluation-qualification.test.mjs tests/local-focused-evaluation-page.test.mjs tests/focused-annotations.test.mjs tests/focused-model-provider.test.mjs tests/comparison-model-provider.test.mjs tests/derived-model-provider.test.mjs tests/derived-availability-unknown.test.mjs`.
These are mocks/data/privacy/lifecycle checks, not actual inference or quality.

The original30main cases yield27eligible and3template-only; the unchanged4body
supplement is separately eligible. Fixed request timeout30s, observation35s,
collection600s, at most31prompts/one native launch; no tuning/retry after outcome.
All34 registered rows are visited in original order. Collection qualification
requires all31actual returns and original strict options/raw/identity/limit and
once-destroy checks; quality is a separate clause assessment of every actual
answer against fixed typed inputs and original evidence/limitations. Require no
incorrect factual/action claims, at most two sentences and meaningful concise
clarification beyond templates; report length and usefulness per row, not merely
lexical difference. No minimum useful percentage is invented. Original>=25main
coverage/6incomplete/5untrusted stays unchanged;3fallbacks cannot count as model
responses. Warm request timing is separate from historical initial download/cold
initialization; no new cold or offline claim from this collection.

Use a new labelled test-only copy of corrected official91/UI2 dist, with only
`l02-eval.html/js` added. Actual GoogleChrome156, exact existing adapter, owned
nested display and602-file copy of the cached266profile. Originals604files/3links
and official build are rehashed before/after. `Extensions.loadUnpacked` is explicitly
test-only setup, not a normal installation/support claim. The driver verifies the
loaded addon bytes and disables its Debugger before trusted per-row Run. No changed
security/model flags, personal profile, new certificates or download. One exclusive
attempt marker is created before browser resources. Clean source commit and case
SHA are required. Existing closed cases/readers and their budgets are untouched.

Prompt API lifecycle contract rechecked using Context7 against official
https://developer.chrome.com/docs/ai/prompt-api and /docs/ai/get-started:
language/modalities in availability/create, abortable session, structured prompt.
The existing provider lifecycle is reused; schema is not semantic verification.

Frozen case: `docs/testing/focused-annotation-case.json`, SHA256
`f07c455b06f125aa76c04e42450e3880788d39026de5d488dab955955ed765b7`.
42source/tool/corpus/history bindings;36original/38prepared host files; official
host revision `079a5fb20f72787a6b29948ce5e3870bbd44706b`. Preparation initially
stopped before copying at sandbox child-process restriction; allowed local read/copy
retry succeeded, zero browser/model calls. Execute the new driver once after clean
commit with `--case docs/testing/focused-annotation-case.json --case-sha <above>
--revision <clean source HEAD>`. Preserve full raw/exit and assess every actual answer.
