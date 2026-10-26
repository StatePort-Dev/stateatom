# A02.36 — supplied props reference on the selected committed ancestor

Continue afa3d63 on current main under autonomous local-commit authorization.
The existing createReact19Acquisition already traverses registered root.current,
child/sibling and exact host stateNode. Reuse that traversal, not DOM private fields,
return pointers, names, nearest components or equal-value guesses.

Add matchCommittedProps(node, props, component) to this internal collector. It returns
a JSON-safe scoped observation only when exactly one tag0 function-component ancestor
of the exact selected host has memoizedProps === supplied props and type === supplied
function. All references are compared opaquely. No reflection on props/component/node,
getter invocation, component call, expression re-execution or retained strong app graph.
This API does not attest that its supplied references came from source instrumentation.
sourceElementIdentity, selectedPropertyOrigin, fieldOwnership and stateToProp remain
Unknown/Unsupported, suppliedReferenceOnly:true and fullPath:false. Same props/type can
describe multiple JSX elements. Matching a selected ancestor never proves element identity.

Factor the existing exact committed-tree selector into one private function used by
snapshot and this method. Preserve every existing snapshot shape/guard/reason and native
state ancestor predicate. Props matching is independent of eligible state hooks.
Limit tree512/ancestor64 and semantic events4096 as before; no partial positive on
cycles, capacity, duplicate hosts, multiple matching ancestors, missing registered tree
edges, stale root, multiple roots, stopped/unsupported collector or metadata failure.
No ancestor match for forwardRef/memo/class/host tags in this bounded method.
Page/root/commit/node/fiber/props/component opaque IDs describe query-time identity,
not immutable props history, origin or a source revision. Old observations stay historical.

Only product source acquisition file and its existing construction API-list test change;
one new focused test file plus own docs/status/index. Register all current tracked bytes
before edits, verify all undeclared old files unchanged. Prior raw/cases/readers and
experimental modules remain byte-identical. Existing package80 is historical for this
changed collector, not a new installed candidate. No build/package/native/browser/model,
GC/retention campaign, cert/trust/profile, UI/SDK/otherrepo/publication work here.
20of29/fullA02 and15deferred minors unchanged.

Source-only controls: strict identity versus equal props/type name, exact sibling and
current alternate, two matching ancestors ambiguity, no-hook positive, changed props/
root/unmount, malformed/unregistered edges, stale return pointer, capacities/cycles,
multiple roots, stop/WeakRef absence, opaque proxies/accessors and primitive-only output.
One fresh final whole-item review, one tested Important/Critical pass, minors deferred.
Next distinct item: decide how actual source references are admitted to this method;
do not infer that caller-supplied references establish source-to-instance provenance.
