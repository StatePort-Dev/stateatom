# Exact selected native/source callback isolation

A02.52 source-only scope, dependent on reviewed51. A selected element already has an
exact callback row in the current window's private `elements` WeakMap. The composite
currently evaluates every callback's native subproof before filtering by element.
An unrelated native fiber loss therefore can veto an otherwise exact selected query.
Demonstrate that case before changing behavior; do not diagnose A02.50 or actual GC.

Use the existing private WeakMap to select the exact row before per-callback checks.
Preserve all global flags/stacks and every selected row/Main/App/element/source/native
conjunct. Global snapshot still validates all callbacks, base App/Main source subproof
keeps its existing all-row gates. Unknown/foreign/stale/lost selected elements remain
Unknown; no neighboring or equal-content substitute. No new indices, strong pins,
getter/Proxy access, expression replay, transforms, browser/native/model/GC campaigns.
No claim that all lower-layer scoped lookups are isolated. DTO/schema unchanged.

Completion: synthetic loss/order/identity/lifecycle/global-negative controls RED→GREEN,
focused/full checks, source-byte guard and current327/archives/old50/19 preservation;
local sourcecommit, ONE final fresh review, one testedI/Cpass/minorsdefer/no rereview,
archive/remove own workspace, close bounded52. 20/29 and fullA02/L02 unchanged.
