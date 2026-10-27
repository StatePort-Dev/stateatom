# L02.26 — preserve Unknown for availability errors

Bounded source correctness after246/host2eb98f35, public baseac5cedd plus docs only.
core/action-explanations.mjs:36 currently maps an API exception or any unexpected
availability value to explicit unavailable; action UI repeats that device verdict.
This is a concrete source finding, not the cause of I02.25/30's actually pending API.
The latter remains Unknown; no old model/loader/readiness/certificate run is reopened.

Current official Chrome docs fetched via Context7 resolve→query on2026-10-27:
[Get started](https://developer.chrome.com/docs/ai/get-started) defines four native
availability results: available,downloadable,downloading,unavailable; explicit
unavailable describes unsupported device/options. [Prompt API](https://developer.chrome.com/docs/ai/prompt-api)
checks metadata before create with matching language/modalities. Project inference:
an exception or unrecognized result does not establish that explicit verdict.
Unknown is an internal fail-closed wrapper state, not a fifth Chrome API enum.

Only core/action-explanations.mjs,packages/atom/src/action-ui.mjs, their two existing
source test files and AtomCHANGELOG. Keep absent API and explicit unavailable as
unavailable; preserve the three supported available/download states unchanged.
Rejected/throwing/missing availability method/unrecognized result becomes unknown.
Explicit Explain on unknown keeps exact template with a neutral Unknown reason and
must not call create/prompt or request download, even with userActivation+allowDownload.
Metadata UI reuses existing Unknown/template notice, no private error message leak.
Current epoch/nonce/owned30snotice/late settlement/opt-out/dispose guards unchanged.
No new retry/API deadline/activation/download/120s generation policy or API options.

TDD: retain provider+UI failures before code, controls for sync throw/rejectedPromise/
invalid results, explicit unavailable/absent API/supported routes, template and zero
create/progress/phases. UI current+late/obsolete rejection, opt-out/Explain behavior,
30snotice retirement. Source fakes are declared, not real device/model qualification.
Run focused source and relevant full suite, syntax/diff; controlled before/after
rendered source status comparison if needed, reusing shared reference/type/geometry.
No shared tokens/primitives or new design; changelog records changed status meaning.
One scoped final review, one tested necessary correction pass; no review loop.

No package reissue/host refresh/native/model/inference/download/CA/performance within
this item. Official85/UI2 remains immutable; current source will intentionally differ
from85 in these registered files until a separate local package task. Original real
quality corpus/rejections/usefulness0, historical failed campaigns and10%MISS retained.
No L02/fullI02/C07/release acceptance; full21/29 unchanged, no independent-human gate.

## Result

Pending RED, bounded implementation and source-only verification.
