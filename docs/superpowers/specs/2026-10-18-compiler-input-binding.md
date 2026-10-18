# Native compiler-input binding acquisition

Continue original P2/P1 toward the unchanged full-path criterion. This experiment
asks whether the actual Vite 7.1.9 client pipeline can bind exact workspace input,
StateAtom stage, native final TransformResult object, server bytes and CDP compiled
source without a source map, sourceURL or nearby timestamp supplying that link.
It remains acquisition-only; product journal authority is unchanged.

Observe original invocations with private AsyncLocalStorage contexts and WeakMap
result-object identities. Capture strings already passed to the compiler; do not
rerun compilation or application expressions. Support only a unique observed
StateAtom stage inside the same module/pipeline, matching the frozen workspace
input digest. Keep cache hits only through the same previously sealed native
result object. Soft invalidation without a new observed stage is unsupported.

The trusted HTTP recorder accepts either exact final code or exact final code
followed by the single inert Vite inline-sourcemap comment. It never strips or
normalizes executable bytes. The browser source must match the entire actual
response bytes, including that footer. No map-to-source claim is made. Unknown,
competing, late, substituted, uninstrumented, unsafe map/footer, wrong-context and
budget cases must refuse the binding. The response is not proven to be the creator
of the compiled script; invocation/effects/ownership/fullPath remain unknown/false.

Bounds: 128 known-workspace pipelines, 256 sealed results/receipts, 2 MiB per string,
8 MiB total retained source-processing budget. Retain metadata/digests only in
review artifacts. The hook is pinned to actual Vite source hash and restored on
cleanup. The old experiment and frozen candidates are immutable.

Native acceptance: original P1=13/P2=false and semantic counters preserved off/on;
actual App.tsx and shared/logic.ts get the supported binding. Cache reuse retains
the same observed pipeline; a fabricated equal result object, same-URL substituted
bytes, changed stage input, anonymous/sourceURL code, missing dependency inputs,
invalidation and budgets remain unsupported. This supplies no product UI or
complete dependency-input coverage claim. Reuse existing unchanged UI evidence.
