# A02.5 — bounded array callback identity-transfer technique

Autonomous bounded task/check/localcommit work on main through Oct25 evening.
Scope-review-1/20of29. A02.4 product acquisition is complete; full A02 remains open.
V03 input reply correction is complete on77, but original Undo is still excluded
by actual external revisions and unchanged guards. No repeat native guide now.

## Question and executor choice

Original TodoMVC Main obtains visibleTodos with native todos.filter and returns
Item elements from visibleTodos.map. Item receives an object todo and destructures
its fields. Native reducer ancestors do not supply these transfers. Investigate
only whether original native callback arguments/results can establish the narrow
object-identity filter→map segment without additional reads of the object/state.
This is an executor-selected finite research technique, not an approved solution
to complete lineage, field ownership, Item parameter binding or selected producer.

Add isolated `experiments/react19-reducer/array-transfer.mjs`; it is not imported
by product, plugin, old experiments or runtime. No compiler/app transform, React
vendor change, native/browser run, packaging or UI in this item. Source/Node tests
call the technique explicitly and therefore use synthetic fixture identities;
their output is not independent-app execution or product evidence.

## Semantics and interface

`createArrayTransferObserver()` returns `call(method, receiver, args)`,
`snapshot({source,filtered,mapped,item,element})`, `stop()`, `retention()`.
Observe only exact captured native Array.prototype.filter/map with function first
argument. Pass foreign methods the original callback identity unchanged. For native
calls, a wrapper invokes the original callback with Reflect.apply, same this/three
native arguments, once, returning/rethrowing the same value/error. Original native
array operations perform all property/getter/proxy accesses; the observer never
enumerates or reads application arrays/items/results. Record refs through WeakRef
and opaque IDs, not serialized fields. Builtin/host integrity is a declared trusted
experimental environment, not hostile-page attestation.

This prototype adds wrapper stack frames. It is not a transparent observer for
stack/reflection-dependent callbacks and must not be installed generically. The
declared original Main callbacks contain no such reflection. Any later source
bridge must establish its own semantic admission; these Node controls do not
authorize arbitrary callback wrapping in Atom or claim all JavaScript equivalence.

Record only successful calls and actual yields. Filter truthiness uses the already
returned value, without re-evaluating a predicate. Join exact source/filter-result/
map-receiver/result/item/element identities and original callback indices. Require
one unique yield per edge; equal values, copied objects, repeated alias slots,
foreign/non-native methods, failed/unfinished calls and absent observations remain
Unknown. A result is a historical observed transfer only: subsequent mutation,
ownership, writer exclusion, current membership and React/selected-property origin
remain Unknown/fullPathfalse. No synthetic consumer oracle in a product API.

Source counterexample refinement: a species Proxy can substitute its stored value
and separately yield the original item to map. Therefore Observed means the actual
ordered callbacks received/returned identical references with matching array call
boundaries. It does **not** prove causal filter storage→map input. Preserve explicit
causalTransfer/resultStorage Unknown even in a positive identity link. This narrows
the research claim; it does not waive any original A02 ownership/lineage criterion.

Limits64 observed calls/512 callback yields; overflow disables evidence but leaves
original calls running normally. Stop clears retained records and evidence and
does not disable application execution. Observer bookkeeping errors cannot replace
application return/throw behavior. Nested calls keep their own receivers/results.

## Required controls and stopping rule

TDD: exact object handoff; equal but distinct rows; same-value fresh arrays/rows;
wrong/copy/detached query refs; duplicate alias ambiguity; original sparse-array and
mutation-during-callback behavior; getters/proxies have exactly original native
counts; callback this/arguments/return/throw preserved; foreign methods see original
callback identity; callback side effects run once; nested/failed calls; stop/caps;
opaque objects with throwing getters never inspected. No field/producer promotion.

One source-only task, focused and full source checks, local commit and ONE final
fresh read-only review; at most one tested Important/Critical correction, no rereview.
Do not expand into general ownership or automatic app instrumentation. If technique
passes, one next item may preregister an exact source call-site bridge and actual
independent app evidence; it is not accepted or executed by this design.
