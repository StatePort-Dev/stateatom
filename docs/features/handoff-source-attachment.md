# U03.2b.4b — source comparison attachment candidate

New working format under U03/H05, not prior scope-interview approval. Split the
unimported codec into4b.1 append/parse/consent/lineage and4b.2 monotone privacy before
installed4c. No new native capability or H05 completion from source-only checks.
Original strict v1/minimal/reviewed parsers keep their meaning and reject this
profile until an explicit dispatcher integration.

## Flat explicit envelope

Use `stateatom.diagnostic` version2/historical-diagnostic, profile
`source-evidence/1`. Preserve the existing report, reportDigest, privacy, additions,
lineage, id/revision/time and base limitations without rewriting the reporter.
`baseProfile` names `minimal-snapshot/1` or `reviewed-snapshot/1`. A base view removes
only the attachment-specific root keys and restores this profile; the original
strict base codec validates all its original structure and evidence semantics.

Additional root fields:

- `baseProfile`: exact supported underlying profile, never inferred from shape.
- `sourceEvidence`: at most8 packets tied to retained Developer-note IDs.
- `evidencePrivacy`: `{omittedAttachments: nonnegative safe integer}` for cumulative
  omission history, without omitted identities/content.
- `sourceEvidenceDigest`: SHA256 of canonical `{sourceEvidence,evidencePrivacy}`.
  This is self-integrity, not authorship/native-capture verification.
- `evidenceLimitations`: fixed local-content comparison/untrusted/no-authority and
  no exact-occurrence/execution/fix/full-app-build-attestation limits.

Same whole UTF8≤1MiB/depth16/tree10000/string16384 budgets and dangerous-key rules.
Existing note≤8×4096 and all old source/issue bounds stay unchanged. No raw source,
file buffers, hidden original record/catalogue or path/URL resolution is embedded.

## Public packet and file consent

A packet has kind `local-source-byte-comparison`, findingId, createdAt, exact
parentArtifactDigest/parentReportDigest, Developer diagnostic reference,
buildComparison, selected `files`, `omittedFiles` and a fixed historical scope.
Its findingId/time/parent digest must match its associated unverified Developer
note. That note's build is derived from the actual supplied Developer diagnostic,
not a manual label. The report and previous notes remain identical.

Developer reference uses the existing exact v1 source-reference layout: UUID/raw
SHA256/schema/version/time/build/freshness/trust. Build comparison retains the
model's recorded-collected-source-sample-hash domain and explicit same/different/
unknown relation. It is not a full application build attestation.

Each selected file has the internal model's safe relative path, byte count/actual
SHA256, reporter/developer digest-or-null, reporter/developer indices, status and
ordered reasons. Add `developerKind` (`Code-linked`, `unavailable`, `ambiguous` or
`missing`) to make the recorded source-kind condition explicit. No source text is
included. A path changed by the existing known-secret text filter cannot be
exported as a file identity: reject that opt-in rather than leak it or silently
change the matching path. It can stay omitted. Public validation checks reporter anchors against the actual retained
base fields, deterministic build/freshness/path/digest/kind/reason consistency,
unique indices/paths and all byte/count bounds. No nearby/basename fallback.

`includeFiles` is an explicit own-data list of chosen full relative paths; default
empty. Only these computed file checks enter the packet. Excluded checks leave
only a count; no hidden path/digest/indices. Metadata and selected files must be
shown by a later review UI before a separate download. An imported self-consistent
packet remains historical/untrusted; without original Developer/source bytes it
cannot independently attest the claimed comparison. Rehashing can create a new
untrusted claim, never native verification.

##4b.1 API and lineage

`core/handoff-source-attachment.mjs` exports:

- `appendHandoffSourceEvidence(parentRaw, developerDiagnosticRaw, files, {text},
  {includeFiles,expectedParentDigest,now})`: snapshot own finding/review inputs and
  actual file buffers before the first await; compute the4a model from the base
  view, then validate the complete parent. Append one unverified note plus one
  packet, preserving baseline, previous notes/packets and privacy. Bind the actual
  raw parent digest (not a synthetic base-view digest). Reject stale expected hash.
- `parseHandoffSourceEvidence(raw,{parentRaw})`: strict bounded schema/integrity;
  return frozen historical-untrusted record and explicit content-matched or
  not-checked parent state. Supplied undefined parent is invalid, not absent.
- `appendSourceEvidenceNote(raw,{text,build},{expectedParentDigest,now})`: append a
  normal unverified note to an existing attachment-profile file while preserving
  all packets. It cannot create an attachment profile from a base-only file.

4b.1 creates developer-addition lineage only. A supplied parent may be either a
strict supported base file or this profile; require exact raw parent/report digest,
revision+1/new artifact identity, same base profile/report/baseline/old privacy,
unchanged previous notes and exact prior packets. New packet only for the newly
appended note; note-only child preserves the packet list. No dropped/rewritten
packet or earlier note through append. Clock order is not revision authority.

##4b.2 privacy and later integration (still pending)

Before installed UI, implement a separately tested privacy derivative: retain
notes as an identical ordered subsequence; removing a note removes its packet.
Explicit file omission removes actual serialized metadata with cumulative counts.
Omitting sourceLocations or reporter anchors must remove affected packet file
metadata too; no hidden retention of a path the user removed from source fields.
No packet/file/check can be restored or rewritten. Bind exact original parent,
preserve identity/source and label every retained comparison historical/untrusted.
Only then wire dispatcher/store/readers, actual local file selection/review and
both-host H05. No source fetching, account/model, SDK, app mutation or publication.

##4b.2 concrete privacy contract

`redactHandoffSourceEvidence(raw,review,{expectedParentDigest,now})` supports the
underlying rich review choices plus `omitEvidence:[findingId]` and
`omitEvidenceFiles:[{findingId,files:[safeRelativePath]}]`. Snapshot all own data
before awaits. A packet may be omitted while keeping its unverified note; omitting
a note always omits its packet. Retained packets and files remain identical
ordered subsequences; only their omittedFiles/cumulative omittedAttachments counts
increase. No retained reference/build/status/reason/file descriptor is rewritten.

The unchanged base codec validates its privacy semantics through temporary base
views; exact public parent bytes are checked separately. Reporter baseline
receives the existing explicit privacy derivative identity, and source identity
stays unchanged. Packets retain their original parentReportDigest: this is their
historical creation baseline, not rewritten to a later privacy baseline. Packet
validation checks remaining file anchors against the current retained source fields.

Omitting sourceLocations drops all packet file checks, including unjoined files
whose paths were never root anchors. Changing/omitting/replacing a reporter source
path or sourceDigest drops affected file checks, identified by recorded indices
or the previously visible same path. This includes an originally missing digest:
no duplicate path remains hidden in a packet after its source field is removed.
Other explicit file omission removes only that packet's selected file metadata.
Omitted data leaves counts only; no omitted path/note/finding-ID index is retained.

For minimal-snapshot/1 base, preserve its existing privacy derivative rule: no
retained Developer notes. Require an explicit omitNotes list containing every
current note; partial/empty selection when notes exist rejects visibly. Do not
silently remove unchosen notes. Rich-only field/category/replacement requests on
minimal base reject rather than being ignored. This is a disclosed compatibility
limit, not a reduced per-note requirement for the normal reviewed profile.

Parsing and exact-parent validation accept developer-addition or privacy-derivative
lineage. Append still cannot rewrite/drop prior packets. A privacy child cannot
restore packets/files/notes, alter retained data, decrease omission counts, change
source/build identity or introduce evidence for a new note. A checksum without a
supplied parent remains untrusted and continuity not-checked. No permission,
resolution, network or application effect follows from redaction/import.


At the integer boundary, validate actual omission counters as old+(removed count)
before delegating. Temporary base views use a zero prior counter plus the bounded
removed-note delta, avoiding the existing add-before-subtract rounding in a base
checker. Actual public counters/raw-parent binding are checked independently and
never rewritten. This preserves valid no-note-removal copies at MAX_SAFE_INTEGER
and refuses real overflow/forged undercount; it does not modify the old profiles.
