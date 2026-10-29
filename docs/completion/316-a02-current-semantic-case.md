# A02 — current compiled semantic parity

29 October2026, after3064070. Frozen before native collection. This satisfies a
remaining282 criterion for the current full list compilation, not a rerun of the
partial receipt-only290/291 mechanism or closed209/276/89.

Two source families: unchanged original TodoMVC and the frozen313 renamed/relocated
control. For each, run Original / installed plugin Off / On in separate temporary
browser profiles. On uses the exact saved JS/CSS from installed native312/315,
with hashes checked before launch. Original uses the same esbuild version/options
and untouched source/dependency bytes without Atom transforms/bootstrap. Off uses
the same source build and the actual installed plugin with enabled:false; it must
start no selected session and have no browser observer. No application function
is called by the driver to read its state or establish a count.

Fixed real UI actions: create two equal labels; change first label; repeat same
value; toggle first, filter Active, return All, remove first, clear completed.
Compare visible labels/checkboxes and empty/error state after each action.
Acquire original function invocation counts with native V8 precise coverage,
enabled before navigation and reset at each sample: reducer, App/Main/Item/Footer,
Header/Input and their named editing callbacks and memo callbacks. Identify their
actual compiled function ranges structurally; no changed function is treated as
matching solely by text/value/nearest location. Require unique source function
range and native coverage range identity, then compare count maps per action.
Exception lists must be empty for these UI paths. Existing source-level original
getter/callback/throw controls remain separate evidence for unsupported/error paths.

Profiler precise coverage prevents optimized execution and resets counters when
read; this is declared semantic measurement, not performance or general timing
parity. DOM reads in this separate harness acquire outputs only; they do not grant
lineage or constitute product source access. No native/browser fullPath proof is
issued here. No weak-reference retention or GC flags are added.

Budget: one six-phase collection after input preparation; save each failure and
stop. A concrete instrumentation/setup correction must be separately recorded.
Do not silently repeat phases, relax function counts, discard a mismatch or omit
a callback that fails. Installed package/native positive evidence remains312/315.
