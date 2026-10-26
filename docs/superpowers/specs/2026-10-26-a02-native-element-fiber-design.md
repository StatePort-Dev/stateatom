# A02.37 — native element/fiber source events

Continue3156a4e/current main/local commits. A02.36 matches supplied props only and
intentionally cannot identify a source JSX element. Exact retained ReactDOM19.2.5
primary source has three useful points: createFiberFromElement return mode;
updateElement useFiber(current, element.props); reconcileChildFibersImpl
useFiber(currentFirstChild, newChild.props). Observe each already-produced fiber
and that native function's element argument, without reading element properties again.

ONE additive research source recipe, not product/native integration. New transform
wraps those three original expressions in an inert optional tap returning the exact
fiber. Native props getters/callee evaluation/errors/receiver/argument order remain
the original execution. Call/return occurs once. Observer errors cannot replace the
native result/error; no event if original expression throws. Reuse source parser,
generator and pinned base profile; do not edit old recipes or collector.

Closed ownership/params/binding/expression/site counts; reject changed/missing/
duplicate/unsafe owners, helper collision or malformed input before admission.
Unpinned owned grammar always nativeVersionAdmitted:false. Pinned wrapper requires
exact existing19.2.5 byte digest and original base recipe, then records three
source spans/recipe/output digest and original base counts. Compile/parse only;
no execution of real ReactDOM/App or new version claim.

Native function return/call events are provisional render references, not commits.
Tap payload: kind element-fiber, actual fiber, actual element, closed source-site ID.
Optional private global __STATEATOM_ELEMENT_FIBER_TAP__ must be an own data function;
no accessor/global user code lookup. Captured descriptor/apply; do not serialize
or inspect element/fiber/props in the helper. A hostile observer can deliberately
affect app state; error isolation does not promise arbitrary callback purity or zero
timing effects. Normal absent tap is inert. No strong collector/lifetime policy here.

Three NEW codefiles: experiments/react19-reducer/native-element-fiber-transform.mjs,
tests/helpers/react19-element-fiber-grammar.mjs, tests/engine/react19-element-fiber.test.mjs.
Own docs/status/index only; all existing product/research/raw/cases/readers preserved.
Source controls cover original/observed exact references and returns, getter/call/error
traces, both reuse paths, no forced branches, observer failures, accessor hook refusal,
closed syntax/bindings/counts/pins, actual retained source compile-only receipt.
20of29/fullA02/15deferred unchanged. No native/browser/model/package/GC/cert/trust/
profile/UI/SDK/otherrepo/publication or oldcase rerun.

One fresh whole-item review/one tested I/C pass/minors deferred. Next separate item:
consume these actual native element/fiber references and refuse stale/reused/ambiguous
committed-instance association; do not infer it from event emission or props equality.
