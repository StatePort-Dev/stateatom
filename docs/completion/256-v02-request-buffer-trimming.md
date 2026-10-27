# V02.31 — bounded private request-buffer trimming

Source-only next item after255. Existing runtime cap filters5minutes, takes last32,
then repeatedly JSON.stringify+shift until<=256000UTF16characters. Empty requests
also serialize. Proposed finite scope: one serialization of the retained private
array, lexical offsets within that exact serialization for prefix deletion, and
an empty-array fast path. Preserve retained object identity/order, exact limits,
time/count filters and all evidence/permission/mode/public interfaces.

No cached mutable record sizes, source-body/journal acquisition widening, observer
mode change or retention reduction. The helper reads only its already serialized
JSON string, not application properties. It does not parse/evaluate application
code, run getters or change source expressions. No new request/data capture.

Register exact current runtime/package86dist/history/current10source/raw before
edits. RED/GREEN controls compare exact retained suffix with legacy trim over
owned JSON records, including escaped strings/nested arrays/objects/Unicode/budget
edges and empty/oversized records. Count actual serialization calls in the runtime
cap, not elapsed-time benchmarks. Run affected runtime/cap/privacy/source suites;
full suite only if product change warrants it. ONE bounded source review, at most
one testedI/C correction, no rereview. Current86package remains historical if source
changes; any future package/candidate qualification is a separate item.

This source work does not establish why the original198row active median overhead
was20.54356509/27.05667272%, does not show a real speedup and cannot satisfy10%target.
Old84raw/case/readers/failed criteria/exhausted run budget stay unchanged. No native,
model, GC, CA/TLS/trust, old experiment, package rebuild, host/SDK/publication here.
Full21/29 remains72.41%. Design ../superpowers/specs/2026-10-28-request-buffer-trimming-design.md;
plan ../superpowers/plans/2026-10-28-request-buffer-trimming.md. Registered24inputs/
327product/full36officialdist/current10payload before edits. First registration
spawnSyncgitEPERM before any source/before-runtime/registration writes; rerun with
subprocess permission succeeds. No browser/model/server.

## Source result

Implementation6580a46 changes only runtime.mjs plus one new source test file.
Private scanner consumes the original complete JSON.stringify output; string
escape/nesting depth identifies only outer array commas. The first fitting suffix
uses the same UTF16length and preserves exact row identities/order. Empty lists
skip serialization. Original5minute/32row/256000character criteria stay exact.
No cached record lengths or additional request/app/source reads.

Initial8controls4PASS4FAIL: all four failures are operation counts (empty1instead0,
worst overflow33instead1, escaped21instead1, Unicode3instead1), after semantic
legacy comparisons passed. GREEN8PASS. Two added actual source-runtime/synthetic
CDP cases retain the correct newest fitting response and drop an oversized escaped
newest response. Focused118PASS; full `npm test`5937PASS0FAIL0cancel0SKIP,
164916.945448ms, exit0. Syntax/diff and reversible-source binder PASS.
These are source/owned VM/synthetic protocol checks, not actual app/browser proof.

Preservation:23registered inputs and326other Atom build inputs unchanged;
runtime.mjs is the sole declared product difference. Current10payload15/full
current official86dist36 and historical archives/raw/cases/readers remain exact.
Artifact `.artifacts/v02/request-buffer-trimming/2026-10-28/` retains original runtime,
registration/RED/GREEN/focused/full logs and executable exact-reverse-source binder.
Runtime SHA25668905788a58c6f64ad0e0b1275f02dfc83ba67bb4a42216c78bbcf19d03b1de5;
test SHA2566031bd7ad9ddf3d92e67ade06b9b8dce55818f8f3c4965cf3c0458f3a0e9a749.
ONE final source review0Critical/0Important/1Minor; no correction/rereview.
M1nonblocking test gap deferred: exact256000-character suffix after deleting first
row is not separately checked (single-row exact boundary is covered). Current
formula is correct; no product defect or requirement exception was identified.
No native/model/performance run or target waiver.

Closeout archive own9files passed CRC/everybyte/planidentity before ownworkspace
removal: `.artifacts/v02/request-buffer-trimming-review/2026-10-28/workspace.zip`,
SHA256139dc07e39d30493bb545a2eb73fd6111349933d45bb1efea3313056abdb2657.
Current official86/archives unchanged; full21/29remains72.41%.
One next bounded **V02.32 local87package prerequisite**: unique local candidate87
for the reviewed runtime change, same exactUI2/API1/wire1/exports/permissions;
clean producer/complete input+payload delta/types/admission, no native/host/model/
performance/publication. Do not claim87exists or is accepted before those checks.
