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

Closed bounded source-only. Initial RED retained one new-test helper mistake
(deferred fixture had no reject method); corrected before implementation. Corrected
RED31PASS/8FAIL→GREEN39; affected93PASS, full `npm test`5892PASS0FAIL0SKIP,
163437.159813ms. Syntax/diffPASS. Exactly two product source files plus their two
existing test files and AtomCHANGELOG; no timer/options/activation/privilege change.

Absent API/explicit unavailable/four native states preserved. Exception/missing
method/unrecognized response→internalunknown; even explicit allowDownload Explain
returns exact template with neutral Unknown/no create/progress/downloading phase.
Metadata rejects no longer claim unsupported device. Private error text never shown;
owned notice/late request/opt-out/obsolete guards retain their original semantics.

One final read-only review /root/l0226_review:0Critical/0Important/0Minor, no fix or
re-review pass. Reviewer read code/diff/controls, did not rerun suites/native/model.
Source-rendered actual browser before/after390/1100 with explicitly fake document/
provider shows unavailable→Unknown, same template/root13px/controls/geometry/local
Inter, actual Tab/Space/focus outline and opt-out, no overflow. Images viewed against
supplied shared foundation; placeholders/fakeclient are not native product/evidence
or human fidelity acceptance. Real model calls0; no model API override in a real
extension. Actual native readiness/usefulness/quality remain unqualified.

Artifacts .artifacts/l02/availability-unknown/2026-10-27/ contain before source,
registration, all RED/GREEN/full/render/review logs/results/source-checkpoint and
own six-file workspace.zip (CRC/everybyte checked before this result append).
Current85manifest delta:2of270source and3of327build (adds changelog), exactly registered
changes. Old85tarball/consumer/official host and all native results unchanged; this
source fix is not shipped by85. Existing 30s notice is not an API abort/deadline.

Original model corpus/no useful new meaning, pending API Unknown, exhausted native
campaigns and84original10%overhead MISS remain. Full21/29/L02/I02/V02 still open.
Next ONE **L02.27** local immutable86 packaging/type/admission for this changed UI/
provider source; preserve exact85/history/UI2, no new native/model/performance/CA or
publication within that package-preparation item.
