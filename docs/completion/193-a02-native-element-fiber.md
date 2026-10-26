# A02.37 — exact native element/fiber source recipe

Continue3156a4e/current main. Three NEW codefiles only: native-element-fiber-transform
research module, owned minimal grammar fixture and source tests. Old product and
research modules/raw/cases/readers remain byte-identical. This recipe emits
provisional render references; no committed/selected-instance association is acquired.

Existing pinned ReactDOM19.2.5 has three sites: created fiber return from
createFiberFromElement, useFiber(current,element.props) in updateElement and
useFiber(currentFirstChild,newChild.props) in reconcileChildFibersImpl. The transform
wraps the already-executed expression and passes its exact returned fiber, the actual
element argument and a closed site ID. It does not read element.props/type again.
Closed source grammar checks owner count/parameters, original creation operands,
callee and parameter binding identity, assignment/return shape, unsafe mutation/eval,
helper collisions and source bounds. Unknown/malformed shapes return original code
with skipped:true; the pinned entry refuses changed bytes before admission.

Optional private __STATEATOM_ELEMENT_FIBER_TAP__ must be an own data function.
Captured descriptor/apply isolate callback errors; helper returns the exact fiber,
does not inspect or serialize app refs and installs no callback/collector itself.
Callback purity, timing overhead and general app retention are not established.
Creation/reuse expressions still run once, retain getter/argument/call/error traces
and take their original branches. A reuse event may precede a later original error;
the later-error control preserves both provisional observation and exact thrown error.
Events never attest successful commit or native function completion.

Owned grammar nativeVersionAdmitted:false. Exact pinned compilation first runs the
unchanged original base transform, then adds3source sites/digests/spans and marks only
that recipe byte-admitted. Actual retained source is parsed/transformed/parsed only;
no real ReactDOM/App evaluation, native browser or current version support claim.

Initial RED22 missing-module cases. First22GREEN1699.786189ms; additional semantic/
refusal controls bring33new/97focusedPASS1705.408336ms. Full5150PASS133405.569014ms, exit0. Syntax and
diff checks passed. Artifacts `.artifacts/a02/native-element-fiber-source/2026-10-26/`.
Baseline1796tracked and1642current prior-native dependency bytes registered; these
are current preservation bindings, not renewed qualification of the historical case.
20of29/fullA02/15deferred unchanged. ONE final review pending.

NextONE separate item: consume actual native element/fiber refs and invalidate stale,
reused and ambiguous associations against the selected committed tree. Neither this
document nor event emission supplies source-to-commit or selected-property provenance.
No old native/retention/install/model/cert campaign, package/UI/SDK/otherrepo/publish work.
