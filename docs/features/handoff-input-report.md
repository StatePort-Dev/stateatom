# U03.2c.3b — complete input handoff profile, unimported

Working implementation under autonomous U03, not prior scope-interview approval.
Consumes the strict3a packet and existing public v2 files. No runtime/dispatcher/
reader/storage import in this slice. Existing v1/minimal/reviewed/source codecs
keep their exact meaning; neither a private capture nor packet alone becomes a
normal diagnostic by changing a flag.

## Flat profile with explicit component identity

New `stateatom.diagnostic` version2/historical-diagnostic profile
`input-evidence/1`. Keep ordinary public report/reportDigest/additions/privacy/
limitations and any existing source-evidence fields flat, without duplicating
issue text, notes, source bytes or private capture. New root id/createdAt/revision
and lineage belong to the **whole file**. Additional fields:

- inputBaseHeader: original public component profile/id/createdAt/revision/lineage.
  Supported component profiles: minimal-snapshot/1, reviewed-snapshot/1 and
  source-evidence/1 only; no recursive input wrapper.
- inputBaseDigest: SHA256 of the canonical reconstructed public base component.
  This binds its header, report, notes/privacy and source packets. It is not a
  claim about the original whitespace/byte encoding of that component.
- inputEvidence: one validated public3a packet object, or null only after explicit
  whole-packet omission. No raw JSON string, private capture or snapshot clone.
- inputPrivacy: omittedPackets0 or1, never a zero-edit assertion.
- inputEvidenceDigest: canonical checksum of inputEvidence/inputPrivacy.
- inputLimitations: fixed historical/untrusted/no-authority and digest-domain
  limits, separate from the unchanged base limitations.

The component view restores inputBaseHeader onto the shared ordinary fields and
retains source-specific extras only for the source component. The existing strict
codec validates this view. A new component note/source append has a canonical
component parent digest, whereas outer lineage always binds exact full-file
parent bytes. Old notes/source packets retain their recorded parents unchanged.
These two domains must be labelled, never equated or upgraded to authorship.

Packet diagnostic digest/save time/selected time/build/freshness/property must
match the underlying report's exact source reference. Included packet source ID
must match the report source ID. When both retain an original selected value,
they must agree. A replaced/omitted original target is not a new observation;
conservatively omit the overlapping packet selected-observation value. Missing
run/native identity remains missing; no source lookup, refresh or name matching.

One whole-file1MiB/depth16/nodes10000/string16384 budget, unchanged. Refuse excess,
unknown/dangerous keys, invalid headers/digests/lineage or unsupported component;
never truncate a baseline or silently drop evidence to make composition succeed.

## API and immutable lineage

`core/handoff-input-report.mjs` exports:

- composeHandoffInputReport(baseRaw, packetRaw, {expectedParentDigest,now}):
  validate existing supported public base plus public packet, exact base bytes,
  source correspondence and safe revision+1. Create a new outer artifact with
  input-evidence-attachment lineage; base fields/header stay identical. No v1
  reinterpretation and no fresh capture may attach to another saved occurrence.
- parseHandoffInputReport(raw,{parentRaw}): frozen historical-untrusted record,
  not-checked without parent; with exact parent validate permitted whole-file and
  component changes and say content-matched only. No parent/network lookup.
- handoffInputReportComponents(raw): return validated canonical baseRaw and
  inputEvidenceRaw (or null). These are explicit public component views, not raw
  original files or executable state.
- advanceHandoffInputReport(raw, childBaseRaw, {expectedParentDigest,now}): accept
  only a strict existing-codec developer-addition child of that canonical base
  component. Used after ordinary unverified note or existing source-file comparison
  creation. Preserve reporter, old notes/source packets, input packet/privacy and
  source reference; whole-file parent/revision/ID update independently. This API
  consumes completed JSON, never file callbacks/buffers or implicit acquisition.
- redactHandoffInputReport(raw, {baseReview?,inputReview?,omitInputEvidence?},
  {expectedParentDigest,now}): snapshot inert own review/options before await;
  reuse existing base privacy and3a input privacy, then create one new full-file
  privacy derivative. Whole-input omission cannot be undone. Minimal component
  coarse privacy still requires explicit omission of all its retained notes;
  never silently discard unselected notes or weaken old source privacy.

All descendants preserve the exact original bytes and previous records. New IDs,
safe revisions and parent hashes distinguish forks; stale expected parents refuse.
Component children are validated against canonical parent components, not fabricated
full-file hashes. Parentless/self-consistent/rehashed data always remains untrusted.

## Overlapping privacy

Base and input sections have explicit separate review controls. An explicit base
field/category omission or replacement also removes overlapping input data, so
the old field is not retained as an unnoticed packet copy:

- changed original selected value: packet selected-observation value;
- changed selectionDetails: inputIdentities and inputLocations;
- changed networkLocations/routePaths: inputLocations;
- changed responseBodies/runtimeValues/interventionValues: inputValues;
- changed diagnosticDetails: inputErrors.

Use actual old/new retained field descriptors, not text equality or guessed source
relationships. Source location/excerpt privacy stays with the existing source codec;
it does not fabricate a join to CSS/native inputs. Issue/note omissions do not
invent an association with unrelated edit values. Packet omissions remain monotone,
statuses/counts/unknowns unchanged. Parser parent checks enforce these rules even
for a deliberately rehashed child. No implicit re-inclusion or packet replacement.

Initial composition also honours explicit omission/replacement markers already in
the supplied base component. Default exclusions stay scoped to their component;
they are not invented historical user decisions. Explicit overlapping exclusions
must not be undone by attaching a packet. An editor observation retains the same
property type as the original selection (boolean disabled or string text); it is
not an arbitrary scalar resource value. This tightens a packet/consumer boundary
without changing legitimate25 captures or reinterpreting old recorded results.

## Verification

RED/GREEN minimal/reviewed/source components, exact-source mismatch/clock/property/
selected value, outer exact-byte versus canonical component lineage, unverified
note/source append retaining previous data, independent privacy and automatic
overlap removal, whole omission, stale/fork/malformed/rehashed inputs and budgets.
No getters or async review mutation; no actions, permissions, file/source fetch.
Full source and exact unchanged25 executable/archive/hosts. Historical native
inputs may be processed as source-only checks, never fresh browser or normal saved
U02 evidence. Installed dispatch/storage/normal review/download remains next.
