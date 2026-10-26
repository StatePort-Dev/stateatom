# A02.40 — pinned memo branch-return source observations

Continue6f10664/main/local commits. Retained Item is React.memo; tag0 association is
not its support. Primary pinned ReactDOM19.2.5 updateSimpleMemoComponent chooses
updateFunctionComponent(current,workInProgress,Component,nextProps,renderLanes) or
bailoutOnAlreadyFinishedWork(current,workInProgress,renderLanes). Before bailout or
scheduled equal-props update it may replace pendingProps/nextProps with prevProps.
Public React memo docs retrieved viaContext7 confirm optimization/skipping/own-state
distinction; exact internal semantics come from this byte-pinned primary source.

ONE additive source recipe observes only an original selected native branch CALLEE
RETURN, preserving its exact returned value. It records original workInProgress,
Component and actual local nextProps references after that call. No props comparison,
wrapper.type getter/read, forced function call, skipped branch, substitute incoming
props or expression reevaluation. No event when native call throws. Function-update
role does not claim arbitrary user/subtree render count; bailout role does not claim
whole subtree skipped. These are provisional call-return facts, not committed identity.

Closed owner updateSimpleMemoComponent/5 exact parameters/2 unique original calls,
callee binding outside owner and exact operand identities. Reject malformed/duplicate/
missing/shadowed/dynamic/helper-colliding/oversize shapes. Unpinned grammar always
nativeVersionAdmitted:false. Pinned entry requires existing exact19.2.5 digest/base
recipe and composes unchanged native-return+element-fiber grammars then new memo2sites.
Record all chain digests/policies/counts. Real retained source transformed/parsed only,
not evaluated. Original helpers and all old research/product/raw/cases/readers unchanged.

Private own-data __STATEATOM_MEMO_BRANCH_TAP__ optional function; captured descriptor/
apply; opaque refs only, no inspection/serialization/strong collector/global installation.
Callback throws isolated, original result/error preserved; arbitrary callback purity,
pre-poisoned realm and zero overhead not claimed. Helper runs after original call.

Three NEW files: experiments/react19-reducer/memo-branch-transform.mjs;
tests/helpers/react19-memo-branch-grammar.mjs; tests/engine/react19-memo-branch.test.mjs.
Owned synthetic grammar exercises mount/update, bailout previous-props identity,
scheduled update with retained old props, original errors/getter counts/receiver/order,
opaque refs, missing/accessor/throwing observer, closed grammar/pins and actual source
compile-only chain. No new React/App/browser/native/model/GC/package/UI/SDK/otherrepo/
cert/trust/publication or oldcase/weak/install experiment.20of29/fullA02/15minors unchanged.
retainedMemoItemQualified:false until separate consumer and actual qualification.

ONE whole review/one tested I/C pass/minors defer. NextONE consumer observes tag14→15
and these actual outcomes without reading memo wrapper.type. Incoming props ignored
in bailout remain distinct from observed retained previous props; no causal upgrade.
