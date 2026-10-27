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
Full21/29 remains72.41%. Implementation plan/registration next; not implemented yet.
