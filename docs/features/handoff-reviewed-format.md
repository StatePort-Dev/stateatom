# U03.2b.3b — reviewed historical profile

New working implementation choice under U03/U06, 2026-10-20; not a scope-interview
approval or installed feature. First implement `core/handoff-reviewed.mjs` as an
unimported codec beside the unchanged strict minimal module. Later integrate an
explicit file dispatcher, browser storage and both readable UIs together. Do not
reinterpret the existing minimal/v1 profiles or repack unchanged `.17` now.

The explicit `stateatom.diagnostic` version2/historical-diagnostic profile is
`reviewed-snapshot/1`. Root/common source, issue, time, revision, digest, lineage
and unverified Developer-note semantics follow the minimal format. Creation takes
an exact v1 source and frozen baseline; reuse the existing minimal factory for
its exact-source/baseline/issue binding, then create the separate reviewed report.
The new profile includes the allowlisted projection from
[content review](handoff-content-review.md), never the catalogue or original JSON.

`createReviewedHandoffReport(sourceRaw, baselineRaw, {omitIssueFields, content},
{now})` creates a new canonical file. `content` is the model's explicit choices.
The report retains baseline identity/issue/source/not-recorded window; its target
is the projected condition with typed state/attribution. `technicalEvidence` is
`reviewed-projection/1`: configuration, fields, joins, omissions, counts,
omittedSourceFragments, absentCapabilities and fixed limitations. Same source
reference appears only at report level. The internal model/cat schemas and
exportable markers are not a public-profile backdoor.

`parseReviewedHandoffReport(raw,{parentRaw})` validates the bounded exact schema,
canonical report digest, field states/types/categories/IDs, joins/omission index,
source/target identity and Developer notes, returning frozen historical-untrusted
record/parent status. A valid self-checksum is data integrity, not verified capture.
No source/raw parent lookup or execution occurs. A supplied parent must have this
same profile and exact raw digest, revision and permitted changes. A missing
parent stays unchecked. Explicit undefined is not a missing parent option.

`appendReviewedHandoffFinding(raw,{text,build},{expectedParentDigest,now})` retains
the full report, privacy and previous notes, creates a new artifact and appends
one unverified note with exact build-hash relation. A hash match alone is not the
H05 actual matched-build evidence enrichment; that remains separate implementation
and native acceptance. No free-text finding becomes Observed or fix verification.

`redactReviewedHandoff(raw,{omitIssueFields,omitCategories,omitFields,
replaceFields:[{id,text}],omitNotes:[noteUUID]},{expectedParentDigest,now})` creates
a new privacy derivative with a new artifact/report ID/digest. Choices refer only
to existing rows/notes; omission overrides category inclusion. Retained notes are
an unchanged ordered subsequence; only their omission count is added. Prior
reporter issue omissions cannot be undone. Existing field descriptors/evidence
kinds/source identity/counts/configuration stay unchanged. Only surviving included,
filtered or previously replaced content can become reviewer replacement text;
omitted/unavailable content cannot be restored or invented. Replacement is filtered
and labelled reviewer-redaction, never a newly observed value. Recompute broken
context joins and omission indices. Original raw input and parent stay immutable.

Privacy removes actual serialized bytes, not just displayed controls. No hidden
original text, omitted-note IDs/text, catalogue or v1 raw snapshot is embedded.
Source-map category consent remains independent. Hostile strings remain inert,
URLs lose credentials/query/fragment, known secret patterns/keys remain filtered,
and PII review remains explicit. This policy covers eligible saved-v1 content;
explicit reporter/Developer words still require review as in the minimal profile. Default private data stays excluded. Actual false
booleans and unknown/unavailable/truncated states retain their meaning.

Same public1MiB/depth16/tree10000/text16384 limits; same issue160/1024/8x512 and
notes8x4096 bounds. Internal projection row2048 bound does not override the public
file/tree limit: reject oversized output rather than drop content. Consent/finding inputs are snapshotted before the first asynchronous hash. Own
descriptors, dense canonical arrays, duplicate/conflicting/unknown choices, unexpected public
keys and malformed types reject without getter reads. Limits/lineage/common data
are fixed allowlists, not imported authority. Wall-clock skew remains possible;
exact parent/revision orders artifacts, not assumed clock chronology.

Verify source/default exact bytes, opted-in projection, per-note/field/category
removal, immutable retained notes, monotone privacy, source/parent whitespace,
wrong/missing build, tampering versus rehashed-untrusted claims, omitted context,
malformed/inert/oversized input and no network/actions. Full source suite plus exact
unchanged `.17` source/archive/installed hosts. This bounded source codec does not
complete Task2/3, H01–H06, whole U03, C07, P04 or actual evidence enrichment.
