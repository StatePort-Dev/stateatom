# Next decision: actual native Query call effects

Status: TWO-SITE ACQUISITION IMPLEMENTED/REVIEWED, not an accepted readonly contract. Native Query handoff
acquisition is complete and separately checked through clean source and product
regressions. Current field ancestry remains Unknown.

## Concrete remaining gap

The original account object is handed to cache.setQueryData before React state
replacement. Exact cache storage/return identity does not show what nested methods,
structuralSharing, functional updater or listeners did to it. A one-time public
method/empty-entry check already has retained equal-write counterexamples. An
alias also remains reachable after the call. These facts must not be renamed as a
complete field revision or readonly lifetime.

## Proposed bounded acquisition

Observe actual native setQueryData and setData invocation frames and **actual
nested method-call eligibility**, using the pinned private-copy mechanism already
reviewed. Keep original member-call syntax and evaluation once, including getters,
noncallable errors, key evaluation and reentrancy. A pre-call descriptor eligibility
check may examine only branded ordinary native instances/exact native prototypes;
unknown/Proxy/accessor objects are rejected without a second method lookup.

Record opaque frame/instance IDs, parent invocation identity, known/unknown callee
classification and parsed object references. Never export keys, callbacks, payloads
or arbitrary argument objects. Retention/missing frame/competing invocation and
unsupported source must fail closed. Observe calls; never reexecute a callback,
getter or updater. Do not inject Proxy/freeze into application data.

Preselect original P2/P1 and generic controls before implementation: a nested
Query.setData wrapper that preserves public setQueryData and return identity while
writing the same field; custom sharing; functional updater; synchronous listener
reentry; getter/throw/noncallable method; equal objects across clients; native
query substitution; later alias writer after the outer invocation; budget loss.
The exact original failure/control is retained. A callee census must distinguish
the nested wrapper from the native method even when a nested native call is seen.

## Decision before implementation

First audit exact call sites and review whether a small call census can supply
useful prerequisites without pretending it covers all effects. It is insufficient
for a readonly certificate by itself: imported/native helpers, callback effects,
React/props/cache lifetime and compatible product-owned compiled history remain
explicit gates. Do not integrate an ownership/fullPath claim merely because an
initial first-store native invocation has no detected write. If complete nested
coverage needs a whole-program engine or framework expansion, stop that expansion
and retain the concrete boundary instead of implementing a parallel resolver.

## Reviewed restricted implementation scope

Implement **two monitored call sites only**: Client.setQueryData's native Cache.build
and the subsequent Query.setData. Body frames cover those native methods. Parent
means nearest observed native frame, not immediate JS caller. Preflight is not an
invocation. Preserve the original callee chain; wrap only the already evaluated
options argument with fixed-arity pass-through. Match build entry/return and the
args-ready marker to exact owner/Query/data/options. A call inside spread getters
must not consume the later original invocation token. Unknown historical callee
eligibility never becomes Observed because a wrapper calls native with equal or
identical args. Getter/throw/noncallable paths clear every token. All other callees,
effects and full alias lifetime stay unknown. No readonly/fullPath upgrade.

Results: docs/roadmap/2026-10-18-query-calls-progress.md.
