# U03.2a — minimal historical format candidate

New working implementation decision, 2026-10-20; follows the
[U06 journey](qa-pm-handoff-journey.md). This is a **source-only, unimported codec**
slice of U03.2. It does not complete granular privacy/storage, connect a reader,
implement the normal UI, collect P04 observations or pass C07/handoff acceptance.
The current issued `.20261020.9` continues to use strict v1 unchanged.

## Bounded profile

Add `core/handoff-report.mjs`, tested without browser/storage/network APIs.
Explicit candidate envelope: `schema: stateatom.diagnostic`, `version: 2`,
`kind: historical-diagnostic`, `profile: minimal-snapshot/1`. Unknown profile or
version rejects visibly. Keep legacy v1 readable through a dispatcher; do not
silently upgrade it. This minimal profile includes reporter statements and the
selected disabled boolean or an explicit omitted text value. All technical
source/network/body/runtime fragments are **omitted with counts/reasons**, not
recast as Unknown, lost without notice or globally verified. Rich category review
and version-aware storage remain U03.2b; do not call this all evidence export.

Normal content is explicit reporter title/actual/expected/steps/question, minimal
source snapshot UUID/raw-byte digest/time/build/freshness, selected property and
an explicit `not-recorded` observation window. No original notes, selector, source
paths/text, bodies, route/path/query, component/form values or arbitrary runtime
payload is copied. User-entered words can still contain private information;
this is not complete sanitisation. Reader presentation must say historical,
untrusted and not reverified. No hash grants action authority or proves authorship.

## Exact candidate layout

| Member | Contract |
|---|---|
| Root | `schema`, `version`, `kind`, `profile`, unique artifact `id`, canonical UTC `createdAt`, safe-integer `revision`, `report`, `reportDigest`, `lineage`, `additions`, `privacy`, fixed `limitations` |
| `report` | Immutable baseline `id`, canonical `createdAt`, `derivedFrom` (null or report ID/digest), `sourceDiagnostic`, `target`, `issue`, `observationWindow`, `technicalEvidence` |
| Source | Exact v1 UUID/raw-byte SHA-256/version, canonical save timestamp, finite captured time or null, exact build hash or null, Recorded/Stale, `untrusted-historical-reference` |
| Target | `property: disabled` with included boolean, or `property: text` with `omitted/private-content-default`; this profile has no selected-text opt-in |
| Issue | Reporter attribution; title≤160 or explicitly redacted null; nullable actual/expected/question≤1024; steps≤8×512; no root-cause/evidence label inferred |
| Window | Only `{status: not-recorded}`; no inferred start/stop from capturedAt. P04 adds its separately verified profile later |
| Technical evidence | `omitted/minimal-profile` and counts for source locations≤32, exchanges≤32, runtime nodes≤120, actions≤24, maps≤128, experiment metadata≤1 |
| Additions | ≤8 Developer notes, each UUID/time/text≤4096, build/null, exact hash relation, `unverified-note`, and exact parent-artifact digest; never Observed/Verified |
| Lineage | `from-v1-snapshot`, `developer-addition` or `privacy-derivative`; exact parent-artifact and parent-report digest, null for the initial artifact |
| Privacy | Fixed excluded categories, explicit omitted issue-field names and count of omitted developer notes; no hidden raw copy |

All text bounds are JavaScript UTF-16 units. Whole UTF-8 file≤1 MiB; depth≤16,
≤10000 tree nodes; dangerous/unknown keys, malformed types/IDs/dates/hashes,
duplicate notes and unsupported shapes reject. JSON input only at record/baseline
boundaries; external option/finding objects require own data descriptors, not
getters. Canonical JSON sorts object keys lexically, preserves array order and
contains only validated JSON data. `reportDigest` is SHA-256 of canonical report;
artifact parent digest binds **exact imported bytes**, including whitespace.
Checksums detect different data, not a trusted observation or trusted sender.

## Operations and lineage

- `createHandoffReport(legacyRaw, baselineRaw, review, {now})` returns canonical
  JSON. `baselineRaw` is the frozen Task1 baseline, not a live object. Require its
  source reference/target to match the exact supplied v1 bytes. Copy no private
  v1 fragment. Initial review supports omitting whole reporter issue fields only;
  remaining granular controls belong to U03.2b. The actor and original v1 remain
  unchanged. New artifact/report identity is not an adopted runtime session.
- `parseHandoffReport(raw, {parentRaw})` returns `{record, trust, parentStatus}`.
  Validate own report checksum. Without the parent, say `not-checked`; with exact
  supplied parent, validate hash, revision and allowed baseline/addition changes,
  then say `content-matched`, always historical/untrusted. No remote parent lookup.
- `readHandoffFile(raw)` explicitly dispatches old v1 versus this v2 profile.
  V1 remains version1 with its original semantics, not a fabricated v2 window.
- `appendHandoffFinding(raw, finding, {expectedParentDigest, now})` creates a new
  artifact linked to those exact bytes. Baseline/report digest and prior notes
  remain identical, note role stays unverified, revision increments. A stale
  expected parent rejects. Two children may fork the same immutable parent with
  different artifact IDs; neither overwrites history. Store conflict UI is later.
- `omitHandoffFields(raw, fields, {now})` creates an explicit privacy derivative,
  never rewrites the imported file. New report ID/digest points to old report;
  target/source/window/counts stay unchanged, omitted issue values become null
  (steps empty). This coarse profile drops previous developer notes with an
  explicit count so their private text does not survive nested. Per-note/category
  review belongs to U03.2b. A derivative cannot pretend it is an unchanged baseline.

Cross-device wall-clock order is not assumed; times are actual supplied host
clock readings and revision/parent identity determines lineage. Clock values must
be finite/nonnegative/valid dates. No fetch, source resolution, Chrome operation,
HTML execution, permission or experimental action occurs during any operation.

## Verification boundary

RED/GREEN original v1 control; no legacy private fields/default text leaks;
source/target mismatch, unknown window, omission versus fake values; strict bounds
and malformed hostile data; report tampering versus deliberately rehashed untrusted
claims; exact parent bytes/whitespace; immutable append, wrong build, forks/stale
parent; privacy derivative/new identity/no nested notes; zero network/actions.
Full existing source suite plus Task1 and old v1 diagnostic controls remain green.
Check exact `.9` executable sources/hosts remain unchanged. No new package/native
run or H01–H09 credit for this unimported data codec. U03.2 as a whole stays open.
