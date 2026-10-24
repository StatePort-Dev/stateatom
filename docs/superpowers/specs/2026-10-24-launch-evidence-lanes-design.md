# A02.9 — claim-scoped annotation of retained launch evidence

Autonomous bounded continuation from0c6963d, latest through Oct25 evening,
main/local/scope-review-1/20of29. Executor choice. No replacement acceptance model
was approved by A02.8 review. All four prior cases remain exhausted and immutable.

Goal: describe separately the supported original-owner metadata, independent
browser-displayed metadata and their observed textual difference. This is a
versioned post-run description of retained data, not a new runtime, a waiver or
a rewrite of the legacy strict refusal. Follow docs/evidence-model.md: evidence
belongs to individual claims; historical observed facts do not become live state.

Alternatives considered by executor: remove METADATA_ARGUMENTS from old guard
(rejected); rerun Chrome under a relaxed criterion (rejected); add a separate
read-only annotation preserving all old statuses/unknowns (chosen).

No browser, application, extension/helper/IDE, model/provider, product/UI/SDK,
otherrepo, account/trust, dependency/publication or old source/result changes.
Only new research classifier/tests/finite artifact reader and current metadata.

## Output contract

New schema `stateatom.launch-evidence-lanes/1`, annotationKind
`PostRunClaimScopedDescription`, sourceOnlyAnalysistrue/nativeReexecutedfalse/
fullA02false. Observation provenance: exact raw/case SHA, original registered
source revision and finished timestamp. Analysis revision is separate. Freshness
`HistoricalClosedRun`; current process/UI/executable recovery remain Unknown.

Validate the unchanged strict guard against the actual record: old status must be
INCOMPLETE_ORIGINAL_LAUNCH_WITNESS_NO_APP and failure exactly METADATA_ARGUMENTS;
owner/identity/exe/profile/document fields still satisfy their original predicates.
Require actual displayed-text digest/length available and different; do not turn
missing text into an observed difference. Closed resources/input integrity and
no-app/product flags remain mandatory. Any invalid/extra failure refuses annotation
with no Observed claims; no optimistic partial promotion.

Three claim records, each explicitly historical:
1. OriginalOwnerInvocationMetadata — Observed PID/start/executable digest, original
   vector digest/count and recorded requested headless/profile/forbidden-option
   facts. Full argv/ChildProcess object were not retained for privacy; no recovery.
2. BrowserDisplayedMetadata — Observed metadata URL/frame/loader/target, executable/
   profile/display digests and lengths; text markers remain text, not parsed argv.
3. DifferentFlattenedText — deterministic comparison of retained observed digests/
   lengths, derivation version1. No cause, timing contribution, modified-switch
   list or argv-boundary reconstruction inferred.

Legacy protocol status/refusal/failure list remain unchanged and acceptedfalse.
Unknowns include current parsed argument vector, exact cause/code of display change,
old-run root causes, effective sandbox/active mode beyond recorded invocation,
app/selected producer/state revision/ownership/React props and fullA02. No confidence
ladder or new "Experimentally verified" label from a read-only comparison.

## Source and retained-data verification

New experiments/launch-evidence-lanes.mjs pure JSON DTO classifier, importing only
unchanged strict helper; new experiments/launch-evidence-lanes-run.mjs reads the
known case/registration/raw and writes a fresh wx annotation directory. No
Playwright/Chrome launcher or application import. CLI CASE OUT only; other options
refuse before resource/output access.

Verify exact raw2801aa6c5b535573a094974485094be921915fee411b48cbc116e099319889b9,
case hash/registration and every380 frozen input. Current377 physical and3 exact
Git blobs are separate: only driver/test-driver/plan may resolve at the registered
revision, with exact frozen SHA. No generic Git fallback, new expected digest or
old case edit. Preserve prior source327product/9old/12research and raw4 hashes.
Writer records both original observation revision and current analysis revision;
output cannot be called a fresh native result or original protocol Pass.

TDD actual retained-record copy controls for scope/status/extra failures/missing
fields/identity/metadata/current-display/source revision/hash/cleanup; immutable
input/no private strings; source fixture records explicitly synthetic. Actual
post-run analysis gets independent output/provenance/negative verification; no
new native call. ONE final fresh read-only review, one tested I/C pass maximum,
no rereview, explicit Minors/rulings, local commits and one next dependency.
