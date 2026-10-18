# Next bounded mechanism: native Query cache handoff observations

Status: BOUNDED ACQUISITION IMPLEMENTED AND VERIFIED, not a readonly or full-path capability. The source-use audit's first opaque boundary is the unchanged
App's cache.setQueryData(['account'], account). Existing state identities and
compiled-source matching do not cover that alias lifetime. This experiment observes
actual native cache/query identities and revisions in the already pinned Query
5.90.3 fixture, without claiming readonly effects, new framework/store support or
current-field ancestry. It does not add a resolver.

## Acquisition

Use the existing private esbuild input-copy approach, with exact upstream hashes
and native AST site-count guards. Never modify installed packages. Add an opt-in
flag, default false. Require sourceConsumption for parsed object identities.

Brand actual native QueryClient/QueryCache/Query instances in their constructors.
Observe actual QueryCache storage/get results and actual Query state assignment
completion, preserving each original getter/method lookup and RHS evaluation once.
Do not reread this.state or query.queryHash through a possible getter; capture
existing operands in invocation-local temporaries. Verify stored own-data slots
through captured descriptor intrinsics only. A known native Map can be checked
with captured native Map.get without calling a subsequently replaced method.
Unknown/accessor/custom storage remains unsupported.

For getQueryData, use a bounded native invocation frame and the actual nested
QueryCache.get result; never join by equal result/key/URL/time/latest value. A
read needs the exact client/cache/query frame, compatible native state revision
and original returned object. Reentrancy, errors and multiple competing native
gets must not leak a frame or fabricate a unique association. Preserve original
return values/errors, setter/updater/callback counts and this/arguments.

Keep raw objects only behind WeakMaps/WeakRefs and temporary frames. Export opaque
IDs and bounded parsed consumption/exchange references. Never export query keys,
queryHash, callbacks, client/state objects or payloads. Budget/retention loss is
Unknown. Raw/equal-value external field writes remain unobserved and current-field
ancestry always Unknown; a cache handoff is not a readonly lifetime certificate.

## Cases and criteria

Keep original P2/P1 unchanged, with the same supported/unknown distinctions. Add
generic controls for two clients/keys with equal values, structural-sharing reuse
of an older object after equal response, repeated revisions, functional updater,
custom structuralSharing, listener/observer escape, nested reads, throwing getter,
method replacement and budget/stop. Preserve all returned identities/errors and
callback/getter counts off/on. Unsupported controls are not cache support successes.

First verify native acquisition separately. Do not integrate a full-path claim or
rename pinned byte identity as verified transitive effects. Product UI integration
requires its own reviewed model and actual interface checks later. The compiled /
source / realm closure and React/cache lifetime ownership gates remain separate.

## Reviewed mandatory safeguards

Capture the **actual Query result operand in getQueryData**, and the actual state
and returned data from that same original read, once. A unique nested native
Cache.get tap alone is insufficient: an overridden get can call native get(A)
and return B when both queries hold the same parsed object. Mismatch is Unknown.
The native optional-chain null/undefined behavior must be preserved exactly.

Only descriptor-inspect state objects branded at actual native ordinary
object-literal completion in reducer/default-state paths. Constructor config.state
and later query.state can be Proxy; even a captured descriptor function triggers
Proxy traps. Unknown states are rejected without inspection. Native client/query
branding does not by itself brand their mutable state.

A revision ID is an adapter-issued ordinal of one **observed native assignment**,
not dataUpdateCount/dataUpdatedAt or a complete/current cache version. Keep the
assignment, outer setData return, and later read separately: a listener can replace
state synchronously before the outer setter returns. Structural sharing can retain
older A after equal response B; the stored A retains A's origin, never newest B.

Implementation/results: docs/roadmap/2026-10-18-query-handoff-progress.md.
Original member-call syntax is retained. Pre-call eligibility reads only branded
ordinary instance/prototype data descriptors; accessors/replacements deny the
association without a repeated method getter. Fixed-arity telemetry avoids app
Array iterators; private ledger array operations are captured.
