# L02.2 — exact metadata constraints and real30-case controls

2026-10-21; source base9ec72d5 with the recorded dirty inputs, exact Atom
0.1.0-candidate.20261021.27 / unchanged UI0.2.0-candidate.20261018.2.
This bounded correction is complete. Mandatory L02/O01 remains in-progress.

## Change and unchanged boundary

The actual .26 baseline had4 omitted evidence-ID outputs, correctly rejected by
validation. The response JSON schema now constrains evidenceIds and limitations
to their exact copied arrays with const. Existing item enums/bounds and the strict
response validator are unchanged. No missing ID is filled, reordered or accepted
on the caller's behalf. The regression includes empty and multi-ID arrays and
still rejects omitted/reordered metadata. RED assertion and GREEN are retained.

The new separately versioned30-case acceptance corpus preserves all24 historical
facts unchanged and adds6 cases:5 untrusted source/name/scalar/handler/reference
strings and one stale property. It includes6 incomplete cases. This satisfies the
historical >=25/5incomplete/5untrusted COUNT requirements and the approved20–30
range, without replacing the baseline denominator or completing the usefulness gate.
Arbitrary rich strings remain excluded; an adversarial reference ID stays exact
inert JSON data, never an instruction or permission. No richer input policy.

The explicit verify:local-model command uses installed stable Google Chrome155,
owned authenticated Xephyr/private D-Bus, standard native Extensions directory
drop, and the browser-managed cached model. No experimental/security bypass flags,
profile preference patches, cloud provider or account. It records a real API prompt
and responseConstraint argument at the forwarding boundary, plus raw actual output.
The evaluation adapter delegates availability/create/prompt/destroy to the real API;
it is not a mock. This is still a declared derivative with exactly2 extra test-page
files and all original .27 host bytes unchanged, NOT installed Atom UX acceptance.

## Actual results

-30 unique actual corpus inferences:30 strict accepted,0 rejected/fallback.
-All displayed summaries equal their deterministic templates: added benefit0/30.
 No incorrect additional factual/action claims were accepted in this finite corpus;
 this is not a general hallucination guarantee or usefulness proof.
-Native explicit Start/Cancel aborted actual API initialization; no fabricated reject.
-One ADDITIONAL real inference passed with navigator.onLine=false in the extension
 document's CDP offline context. Not an OS airgap/process-global network capture.
-31 resolved sessions received31 destroy calls. Scoped API cleanup, not heap/leak
 or deletion of browser-managed weight files, and not the separate V02 gate.
-Corpus latency median4.67s,range2.58–9.81s, with already downloaded weights;
 the first call includes initialization. .26's original download timings remain
 historical, not a fresh .27 cold-download measurement. Model build ID unknown.
-Source1850 PASS, focused12 PASS, strict packed consumers2 PASS, package admission7
 PASS, git diff --check PASS. The actual source/driver/corpus hashes were registered
 before model requests and unchanged afterward; verifier checks actual forwarded
 prompt/schema, strict raw response validation, exact refs/limits and run boundaries.

First .27 driver attempt stopped BEFORE model calls: a stale DevToolsActivePort
from the CLOSED owned profile was read. Its receipt/screenshot remain separate.
The driver now preserves/removes that stale endpoint file before relaunch and
records non-Error exceptions explicitly. No Chrome preferences/model files changed.
The new evaluation page also counts whitespace-separated words correctly; this
makes no retroactive change to the original baseline receipts.

## Reproduce and evidence

Exact handoff:.artifacts/atom/2026-10-21T15-21-34-695Z/atom-handoff.json.
Actual run:.artifacts/l02/model-native/2026-10-21T15-25-30-755Z/results.json.
Registration/host provenance/probe and screenshots are beside results.json.
Aggregate:.artifacts/l02/metadata-fix/verification27.json; replay verifier verify27.mjs.
Pre-inference driver failure:.artifacts/l02/model-native/2026-10-21T15-24-25-656Z/.
Source/focused/type/admission/pack logs:.artifacts/l02/metadata-fix/.

Run npm run verify:local-model -- <exact atom-handoff.json> for a new owned profile
(explicit native Run may download weights), or supply --cached-profile with an owned
L02 model-native profile whose launch receipt matches AND --previous-result naming
its latest successful owned evaluation. The CLI requires the matching profile/ID
so it can disable that prior test extension before installing the next candidate.
This explicit reuse guard was added after the sealed run; its original driver is
retained as probe.mjs. The metadata/provider/corpus/helper inputs are unchanged. Every run gets a unique
output directory. Never replace sealed historical host/corpus/raw outputs.

Next bounded step:L02.3 actual unchanged installed Atom Explain/opt-in/Cancel,
late target-change discard and controlled document-offline inference. The30-case
finite-provider success does not prove that product flow or useful AI assistance.
A separately versioned useful derived annotation and final ONE whole-L02 review
remain later acceptance work.15/29 full items complete(~52% equal item count),
not weighted release readiness. No publication/SDK/other-repository/redesign.
