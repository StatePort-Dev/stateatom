# Bounded React commit-binding experiment

## Purpose and authorization

Execute the first roadmap mechanism experiment under the user's autonomous roadmap
instruction. Reuse the existing open plugin/observer; keep the current checkout and
all preceding verified work. No publication, resolver replacement or Vue expansion
belongs to this experiment. The selected original path/control and historical table
are in `docs/roadmap/deep-baseline.md`.

## Claim to test

For the tested React dev root shape, associate an actual selected DOM element and
property with a specific target execution observed at a React commit. Distinguish
committed evaluation from a later speculative evaluation with the same value.
Failure remains explicit Unknown. A commit observation alone is not a complete path.

## Mechanism and alternatives

Use an opt-in React Profiler wrapper at a statically identified `createRoot().render`
entry, preserving original container/element evaluation exactly once and the original
render call receiver/order. The documented Profiler callback observes a commit; the
callback scans only the recorded root container. A callback ref on eligible intrinsic
JSX supplies the actual DOM element (WeakMap) and IDs captured while producing that
specific JSX occurrence, not the latest IDs for its site. Existing user refs and JSX
spreads are excluded; their original ref behavior remains unchanged. Do not inject hooks into app
components or depend on private Fiber internals. Do not wrap every dependency as if
it were the selected property's cause. Root container expressions are evaluated once.

Reject dynamic/unresolved roots and keep existing fragment behavior. Support only
named `createRoot` imports (aliases allowed), direct render or a constant root binding.
The development option stays off by default until this probe is accepted. Production
instrumentation exclusion is unchanged. Both 18.3.1 and the optional independent
19.2.5 fixture versions need their own recorded evidence before any version claim.

Public API basis: https://react.dev/reference/react/Profiler and React's documented
render/commit distinction. The callback supplies commit evidence, not state writes or
HTTP identity. Instrumentation may affect timing and must not claim zero overhead.

## Acquisition and identity

Retain root source file/digest/range, root instance, page, commit serial/time, actual
DOM element association, marker, property and exact target node ID. Snapshot receives
the selected DOM element within the page realm. Use the committed target ID even if
an uncommitted same-instance target was subsequently evaluated. An unmatched element,
changed marker/value, dropped target, invalidated source/page or unavailable callback
leaves commit evidence Unknown. Native DOM reads do not evaluate app expressions or
user getters. Root maps and exported records stay bounded; stop clears root tracking.
Mutation records invalidate older ref associations, including same-value writes;
an unrelated later commit cannot legitimize an inserted/copied marker without a ref.

Review correction before acceptance: the initial Profiler-only implementation could
misbind a retained-first/discarded-second JSX loop occurrence with equal values. Its
early passing probe is superseded, not accepted as commit evidence. The per-JSX
context and callback-ref mechanism is tested against that original counterexample.

## Acceptance fixed before implementation

1. Actual unchanged original React P2 and P1 produce distinct commit and evaluation
   IDs in a real browser; target values/source digests are retained.
2. Two Row elements have distinct target/evaluation associations under one root.
3. Same-value speculative/abandoned execution is not substituted for a committed one.
4. Another root cannot claim a selected element outside its container.
5. Missing callback, removed/replaced node, changed DOM value/marker, source invalidation
   and retention loss never produce a committed claim.
6. Compare actual app/getter/branch/call behavior with the adapter off/on; do not force
   untaken branches. Record added records/time/code size as scoped measurements.
7. Keep the short-loop/IDE/restore workflow and Vue PARTIAL controls intact when this
   becomes enabled for a declared product configuration.

Native adapter checks are a mechanism probe, not yet a product UI/full-HTTP acceptance.
A positive probe permits only a bounded integration and the next missing-edge decision.
