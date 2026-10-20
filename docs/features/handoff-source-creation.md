# U03.2b.4c.2 — explicit local source comparison creation

New working UX under U03/H05/U06, not prior scope-interview approval. Reuse the
supplied Settings/native form foundations and current13px body/12px controls;
no shared tokens/primitives or broad redesign. First reader viewport stays the
reporter account; optional source tools remain below Developer note.

Add a collapsed Compare local source files disclosure. Reuse the existing Developer
note text, with separate Review source revision / Download source revision /
Cancel source comparison actions. Existing note-only review/manual build remains
separate; its build label says note-only. Source comparison derives its build
from the selected Developer diagnostic, never the manual note-build field.

Explicit inputs: one saved Developer diagnostic (strict v1 JSON, exact bounded
UTF8≤1MiB) and1..8 local source files (≤256KiB each/≤512KiB total). Check all sizes
before reading bytes. No source lookup/fetch, filesystem traversal, app request,
permission adoption, IDE pairing or file save occurs from choosing them. Source
bytes are read only on Review; diagnostic bytes on explicit selection.

Each native file row shows a filtered plain filename/size, an exact recorded-path
select from the Developer diagnostic, and Include comparison metadata checkbox
defaultOFF. No path or consent is inferred from filename/basename. A new diagnostic
resets all mappings/consent; a new file selection resets rows. Missing source paths
keeps comparison unavailable with a useful reason; the existing note-only workflow
stays usable without source forever. Unknown source kind/digest/build and stale
snapshots can produce explicit unjoined comparisons, never invented evidence.

One path per selected file, all unique; require mapping before Review even if
excluded. Only included checks enter the new packet; excluded files leave a count.
Known-secret paths cannot be included under the existing filter; leave them
excluded rather than silently changing path identity. No source text/raw diagnostic/
body or local buffer is embedded. Main note still requires explicit privacy review.

## Input controller

New packages/atom/src/handoff-source-inputs.mjs:
createHandoffSourceInputs({document,$,onChange,onState}) returns
setParent(key), reset(), ready(), prepare(), state(). It owns only local file/path/
consent inputs, native row rendering, budgets and async diagnostic loading. It
has no RPC, capture, download, permission, app or source-resolution adapter.
Rows use data-sp-source-path / data-sp-source-include ordinal attributes; IDs
never become normal labels. All dynamic text uses textContent.

A private diagnostic generation is tied to diagnostic choice and parent, not note
typing: editing note invalidates prepared outputs but need not discard the chosen
diagnostic while it loads. Parent/reset/new diagnostic prevents stale diagnostic
reply adoption. File bytes/mapping/consent are snapshotted before prepare awaits.
Double-check actual buffer lengths against selected sizes; cancellation discards
results, not the original files. Keep private data only in memory until reset.

## Reader owner

The existing reader epoch invalidates note/privacy/source prepared outputs on any
relevant edit. Starting any review clears the other prepared files. Source Review
requires a valid note, available note slot and ready inputs, then calls the actual
appendHandoffSourceEvidence with exact parent bytes/digest. Preview readable scoped
comparison data and unverified note; only explicit Download writes a new file.

Inputs remain editable during hashing/reads so edits invalidate stale output.
Cancel source clears source inputs/mappings/consent and all prepared outputs,
preserving original report and typed note. Parent file/reset/pagehide clears
private source state. Normal note/privacy controls preserve existing behavior.
No new code or imported file is executed.

## Actual H05 gate

After source/coupled checks, fresh immutable package/native ordinary controls.
Use REAL existing development app/open IDE source analysis, actual U05 selection
and normal reporter Save/Prepare with explicit source-location review/download.
A separate Developer inspection saves a fresh actual diagnostic for the same
recorded source context. Close app/source/IDE; clean recipient selects the actual
downloaded report/Developer diagnostic and real local file, maps path explicitly,
opts metadata in, reviews/downloads source revision and reopens original/child.

Assert actual file hash equals retained source digest, exact recorded collected-
sample build relation, immutable reporter baseline/prior notes/parent bytes.
Same filename/wrong actual bytes and actually different recorded build remain
unjoined. A missing-hash legacy negative may be explicitly derived/labelled, never
presented as a fresh actual capture. Keep no-source/IDE/model recipient, no HTTP
with positive CDP control, keyboard/440/390/zoom/reduced-motion and existing safety.
This proves local content comparison only, not selected-occurrence execution,
full-app build attestation, current ancestry, fix verification, P04 or whole U03.
