# V03.3 — retained handoff diagnosis and bounded structure correction

Base65dea62; scope-review-1. One bounded source correction for the detailed report
failure discovered by V03.2, not whole V03 acceptance. Existing app/picker/reader
results remain historical at their exact65/UI2 bytes. No UI redesign, SDK, source
resolver, other repository, publication, model, certificate or dependency changes.

## Actual cause, not a guessed application dependency

Reuse the already registered/executed private probe in
`.artifacts/v03/handoff-limit-diagnosis/2026-10-23/`. Do not repeat it unmodified.
The exact original before-Cart diagnostic is32437B/61 source-map records, a
different occurrence from the lost current1Cart private capture. Its default
projection has778 fields,312658B and12529 nodes:9440 object members plus3088 array
entries plus root. Draft/projection and minimal codec pass; reviewed emit/decode
fails the generic10000-node guard. Controlled inert0/20 map derivatives pass;
40 fails. These derivatives are never new runtime evidence.

The same generic guard exists in minimal/reviewed/source/input and shared action/
observation JSON decoders. Fixing only reviewed would leave composition/import
inconsistent. The lexical duplicate-key guard separately caps10000 object members;
row/packet/group limits and1MiB remain additional independent bounds.

## Implementation decision and limits

This is a new bounded implementation decision, not a claim that the user approved
these exact parser numbers. Replace the mixed10000-node limit for explicit v2
handoff codecs with **at most10000 object members and9999 total array entries**,
giving at most20000 total nodes including root. The aggregate node ceiling thus
explicitly changes10000→20000. The separate array-entry bound preserves the old
worst-case flat-array ceiling. No unbounded parser is introduced.

Preserve1MiB bytes, depth16, string16384, duplicate/decoded-member refusal,
forbidden keys, number rules, exact schema/IDs/digests/lineage/privacy/row limits.
Keep the original legacy-v1 read path's10000-node guard. No metadata truncation,
automatic simple fallback, evidence-kind promotion or invented ownership.
Old small files remain readable. Old65 readers can still reject newly supported
larger mixed structures; native acceptance needs a newly packed matching reader.

Use a small shared parsed-JSON array-budget helper plus one exported aggregate
constant, consumed by all six decoder implementations. The existing lexical guard
still independently enforces its10000 object members. Parsed JSON only: the helper
is not a safe general app-object inspector or an authenticated import boundary.

## RED → GREEN and verification

1. Before product edits, add shareable synthetic metadata regression reflecting
   the actual shape, not upstream source/assets. Watch creation/composition fail
   HANDOFF_LIMIT. Include full exact property/source kinds and default omissions.
2. Add budget controls: aggregate nested-array entries, member cap, exact flat-array
   boundary, depth/text/byte/duplicate/unsafe numbers/keys and legacy path retention.
   Assert known structural refusals remain refusals, not merely any thrown error.
3. Implement the shared bound and all six callers. Run focused handoff family
   tests, retaining original negative controls. Test reviewed creation/import,
   input/source/action/observation composition/reparse and exact parent linkage.
4. Apply the corrected codec to the exact retained diagnostic in a **new** output
   directory. Preserve all778 rows, joins, omissions and original digest; roundtrip
   all actual data without reclassifying it. Retain the old probe failure unchanged.
5. Run the actual full source suite appropriate to shared import behavior and
   git diff --check. Do not rebuild/claim old65 runtime as corrected or rerun old
   browser matrices. Packing plus targeted native report acceptance is the next
   bounded item after the source correction if checks/review pass.
6. ONE fresh whole-increment review over this base and final diff, at most one
   correction pass/no re-review. Local commit, exact source/check receipts, update
   current index and next item. Keep fullV03/A02/L02/V02 and20/29 unchanged.

The intended result is a detailed report with retained evidence and bounded
parsing. A successful simple fallback alone cannot complete this correction.
