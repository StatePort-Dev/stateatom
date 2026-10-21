# L02.7 — separate derived-provider lifecycle, source only

2026-10-21, base856b843 plus tested source. Bounded source item complete. No real
new inference, product selection or L02/O01 usefulness/whole-item acceptance.

core/derived-model-provider.mjs adds ChromeDerivedAnnotation without replacing the
original finite provider. Its summary/limits/evidence IDs always remain deterministic;
model text is a separate derived annotation with factualEntailmentVerified=false.
Only genuine eligible facts, explicit activation and (if needed) allowDownload can
start it. Availability/create use identical text/en options. No per-selection call,
remote provider, raw application content, account/API key, persistent cache or UI
change. getCurrentFacts is explicitly synchronous/cached, not an app/source refresh.

Actual source lifecycle controls:
- Missing API/unsupported state/absent activation/already aborted/forged/cloned/stale
  facts never initialize automatically. Downloadable/downloading need explicit allow.
- Recheck genuine exact cached identity after availability, after creation and before
  prompt/validation. Source/target/evidence replacement discards old annotation and
  renders the current deterministic template; callback failure uses normal unavailable
  facts without reflecting private getters/errors.
- Abort/deadline races return templates promptly; each resolved owned session receives
  at most one destroy call, including a session resolving after cancellation. Concurrent
  explicit requests keep independent ownership. These are mock boundary checks, not
  real-browser heap/leak measurements or deletion of downloaded files.
- Warm progress100 and late progress cannot overwrite generation/cancel; presentation
  callback failure does not retain a session or expose its error text.
- Invalid JSON/unknown tokens/old schema/oversized text/extra fields retain templates.
  A structurally valid unsupported sentence is still UNVERIFIED data and cannot
  replace the deterministic summary. No runtime natural-language entailment guarantee.

The current official Chrome documentation was checked via Context7:Prompt API
create/prompt AbortSignal + destroy lifecycle and matched language options. Its
[built-in AI guidance](https://developer.chrome.com/docs/ai/built-in-ai-dos-donts)
warns strict generation-schema maxLength can produce compressed nonsensical output.
Therefore only that generation keyword is omitted from the NEW schema. The client
512UTF16/text4096UTF8 response gates are unchanged, and text is NEVER truncated.
This is a technical adjustment before first new inference, not a weaker acceptance
criterion. Actual keyword/device support remains a separate real-model question.

## Actual checks

Initial RED:new module/helper unavailable and schema keyword expectation, retained.
Initial34 GREEN followed by5 deliberate race REDs:phase callback abort/stale change,
error coinciding with target change, abort in the first cached read, and synchronous
prompt success/abort. Promise.race alone could select an already-settled success
before a rejected stop. Explicit live checks around API boundaries, immediate handled
stop rejection and current-fact refresh on error fixed them. Original failures remain.

Final:22 provider tests +17 contract tests; focused85 PASS; full npm test1891/1891
PASS,0fail/skip/cancel. git diff --check PASS. Exact git diff against856b843 for the
original action provider/UI, fact factory and condition model is empty. Original30
facts/corpus files and old registration/archives are unchanged. Model calls0.
Evidence:.artifacts/l02/derived-provider/{red.log,races-red.log,races-red-final.log,
green.log,focused.log,full.log}. Plan:../superpowers/plans/2026-10-21-l02-derived-provider.md;
inline ledger:.superpowers/sdd/2026-10-21-l02-derived-provider/.

No fresh package/native run is claimed. Last installed .28 controls stay historical;
new provider is source-only and unselected. No whole-L02 review at this partial
slice; ONE review remains after useful real-device/product delivery.15/29 full
items complete, mandatory L02/open. No SDK/publication/other-repository changes.

Next ONE bounded step:L02.8 create/register an immutable evaluation derivative for
the unchanged30 main cases plus a separately named positive/negative body-count
supplement, run the real local provider, and grade each actual output for factual
entailment/unknowns/concision/usefulness against templates. Keep model outputs,
structural rejects, unavailable/stale deterministic cases and usefulness separate.
No UI exposure until this evidence supports it; no relabelling fallbacks or JSON
format success as model usefulness.
