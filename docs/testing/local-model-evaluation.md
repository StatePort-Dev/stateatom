# L02 local model evaluation protocol — fixed corpus1

Registered2026-10-21 before any model creation/download/inference in this run.
Plan:../superpowers/plans/2026-10-21-l02-real-local-model.md.
Current baseline source:d3e9b06, exact Atom .20261021.26; model route not yet accepted.

Corpus:tests/fixtures/local-model-corpus.mjs,24 synthetic selected inspections:
10 source events,4 native registrations, unavailable binding, stale action,
short-circuit unknown, one blocker, no blocker, source-literal masking, negated
true/false masking, unknown-left result and local scalar/upstream unknown.
These are presentation inputs, not native application provenance or business claims.

Before inference, seal corpus, generated facts, actual prompt bytes, provider source,
bundled evaluation page and exact consumed host hashes. Any evaluation-only page
added to a disposable host is declared separately; never alter an issued archive.
No arbitrary values, source/comments/names/paths/page text or HTTP bodies enter
actual prompts. Only the existing bounded allowlist may be serialized. Model build
ID is unknown unless exposed by the API; never manufacture one from Chrome version.

Compare actual provider result with the exact deterministic TemplateExplanation.
For EACH case retain actual API availability/options, provider identity, timings,
raw/validated result where the evaluation wrapper can observe it, template, word
counts, immutable limits/reference equality, fallback/rejection and exact verdict.
Count real inference only when LanguageModel.prompt actually returns; classify a
fallback separately. JSON structure alone does not prove factual entailment.

Fixed baseline rubric:
- correctness: summary must be one of the existing allowed literal summaries, refs
  and limitations exactly equal. This finite vocabulary avoids new claims; it does
  not validate freer generated prose or general facts beyond the synthetic corpus.
- unknowns: preserve skipped/missing/stale boundaries and no binding→invocation,
  callback/effect, DOM-producer or HTTP-ancestry promotion.
- concision: compare summary word count and sentence count with deterministic result.
- usefulness: a result identical/equivalent to the already displayed template has
  no demonstrated added user benefit. Latency/resource cost cannot count as benefit.
  Existing L01 facts have one summary; this baseline may therefore fail usefulness
  even with real successful inference. Do not add artificial alternatives to pass it.
- cold/warm: distinguish first session/download/first inference from subsequent
  inference in the same browser-managed installation. Do not call every session cold
  merely because provider destroys its JS session. Record actual measured timings.

Also retain actual explicit initiation/download progress/cancel, offline inference
after installation, stale target/cancel/fallback/session cleanup. Mock lifecycle
checks and device-unavailable checks remain separate. No browser security or
experimental flags for a stable-route claim. Real inference alone cannot complete
L02: all approved lifecycle and comparative usefulness gates must pass. Human review
may be useful but an independent human is not a blocker. No remote fallback.

## Post-run qualifications —2026-10-21

This registered24-case set is an exploratory finite-provider BASELINE, not final
L02 acceptance. Retain the historical feature specification's at-least25 examples,
5 incomplete/ambiguous and5 malicious/untrusted controls. A30-case final set fits
both that criterion and approved07's20–30 range; the old24 are never renamed30.
Builder-produced prompt bytes were registered from frozen facts. The real forwarding
adapter recorded raw output but did not independently capture its prompt argument;
privacy is source-verified, not a claimed runtime wire tap. Offline scope is the
extension-document CDP context, not OS airgap. See57-l02-real-device-baseline.md:
24 actual inferences,20 validated/4 safe fallbacks,0 added-benefit cases. L02 open.
The exact original protocol bytes remain at
.artifacts/l02/evaluation/protocol-before-postrun-notes.md with the registered hash.

## Subsequent exact candidates — preserve the registration above

The separately versioned30 corpus (tests/fixtures/local-model-acceptance-corpus.mjs)
keeps all24 original facts and adds5untrusted/one stale case:6incomplete total.
.27 real30/30 strict outputs with0added benefit and actual API prompt/schema taps
are recorded in completion/58. The original24 registration/raw outputs remain.
Actual unchanged installed product controls are completion/59(.27) and60(.28),
including Cancel/stale and document-offline fetch controls. .28 changes phase
presentation only;30-case model output is not claimed rerun there. Its contract
hash comparison and source1852 preserve prompt/schema/strict validation boundaries.
Use the two explicit verify:local-model / verify:local-model-product commands from
those records; cached product testing requires matching owned profile/latest result.
No unavailable/mock/schema-only outcome or this protocol completes usefulness/O01.
