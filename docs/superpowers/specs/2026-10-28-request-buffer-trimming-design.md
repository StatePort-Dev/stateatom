# Exact private request retention with one serialization

V02.31, record256. Existing runtime cap owns a dense array of captured extension
JSON records; it filters5minutes and keeps32rows, then repeatedly serializes each
remaining suffix to enforce256000UTF16characters. It also serializes empty arrays.

Keep the complete original serialization as the authority. A private helper scans
that primitive JSON text, tracks string/escape/nesting state, and counts top-level
commas until the first remaining suffix fits. Suffix length is text.length-index
at its preceding comma; a replacement opening bracket has the comma's length.
No fitting nonempty suffix means drop all. Runtime retains the same original row
references/order with slice(drop). Empty requests skip serialization. This avoids
cached mutable sizes, application property reads and repeated serialization.

Internal helper accepts only JSON.stringify's array output, not arbitrary source
or a general JSON parser. It does not replace validation or change capture limits,
source/field freshness, network permissions, readonly body policy, persistence or
public interfaces. No source acquisition or Live/production policy changes.

Source controls execute the actual runtime cap/helper declarations in an owned VM
with deterministic time and counted JSON serialization, compare exact results to
the old bounded trim for owned JSON records, and preserve time/count/budget edges,
escaped/nested/Unicode syntax, oversized newest rows and original object identities.
Real runtime synthetic-CDP privacy/input/history suites cover integration. No app
browser/GC/model/certificate/performance acceptance or native campaign retry here.
The old84MISS stays literal; operation counts are not elapsed-time speedup or cause.

Only packages/atom/src/runtime.mjs product source plus one test file may change.
Current86 remains immutable and byte-historical for this source afterward; package/
host adoption is a separate bounded prerequisite. Main/local commits only.
