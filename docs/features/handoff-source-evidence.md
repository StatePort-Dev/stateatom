# U03.2b.4a — local source evidence comparison model

New working implementation under the existing U03/H05 plan and autonomous task
instruction; not prior scope-interview approval. This bounded increment is an
**unimported internal model**, not a public profile, runtime operation, attachment
UI or completed H05. Do not repack unchanged .21 for an unimported module.

`createHandoffSourceEvidence(reportRaw, developerDiagnosticRaw, files)` accepts an
existing v2 handoff, a separately acquired strict v1 Developer diagnostic and an
explicit dense array of local `{file, bytes}` records. `file` is a safe relative
source path; `bytes` is an ArrayBuffer read explicitly by the caller, never a URL
or filesystem request. One to8 unique paths,256KiB each and512KiB total. Copy
buffers and own data descriptors synchronously before the first await. No getter,
source expression or imported instruction is evaluated. Unknown/decorated/inherited
options and sparse/accessor arrays reject. No fetch, resolution, active HTML,
file writes, app action, permissions or storage occur.

The result is frozen `stateatom.handoff-source-evidence/1`, `exportable:false`.
It contains exact parent artifact/report identity/digests, exact Developer v1
identity/raw digest/time/build/freshness, computed build relation, and per-file
actual byte count/digest plus matching recorded source indices. It contains no
source text, original v1 clone, hidden file buffers or executable data. Local
relative paths are private internal review data, not automatic export consent.
A later explicit public attachment/codec and review UI must preserve that boundary.

Build equality compares the existing recorded `identity.build` domain. Current
Atom computes it from sorted concatenated collected source samples; this is not a
full application build attestation. A manual release name or matching filename
cannot replace bytes/digests. Keep `same-hash`, `different-hash`, `unknown` explicit.

A file is `content-matched` only when (1) both snapshots are Recorded, (2) recorded
build hashes exist and match, (3) reporter retained an included source path and
source digest in the same Code-linked source group, (4) Developer diagnostic has
the identical safe path/digest with explicit Code-linked status, and (5) the actual
selected local file bytes hash to that digest. Multiple reporter or Developer
records for the path are ambiguous, even if names/digests agree. A digest match at
a different path is not a path identity match. Omitted/replaced/filtered/unavailable
reporter paths/digests cannot be restored or used as an anchor. Minimal files have
no retained source anchor and remain usable with explicit unjoined result.

Ordered reasons preserve each missing/mismatched/stale/ambiguous condition; no
nearby source, basename or similarly named component fallback. Additional files
are independent; a matched one cannot certify its siblings. No exact event/frame/
instance or selected occurrence is newly joined. Existing source Code-linked
claims remain historical/untrusted. Local byte comparison is scoped content
comparison only, not source compilation/execution, current value ancestry, trust,
authorship, a successful fix or production action authority.

Tests cover real temp-file bytes, actual hash equality/difference, missing/different
build and same-name controls, stale/ambiguous/omitted anchors, minimal fallback,
exact raw source/parent digest, pre-await file mutation, no getter reads, input
budgets and inert hostile bytes. Source-only/focused/full checks and exact unchanged
.21 producer/package/entire-host identity bind this increment. H05 remains open
until a versioned public attachment, normal recipient controls and actual native
matched-source workflow have passed.
