# A02.47 — exact synchronous native component-call interval, source only

A02.46 acquired current Memo props/selected-ancestor references, not the exact user
component invocation or its destructured parameters. Existing renderer entry markers
cannot by themselves distinguish a reentrant parameter getter. Add ONE bounded
source recipe around the original callComponentInDEV calls in retained React19
renderWithHooks and renderWithHooksAgain. No consumer, Item rewrite, actual browser/
App run, property-origin promotion or fullA02 qualification in this item.

Original native call expressions must remain inside their original native owner
functions. Bracket the single direct `var children=callComponentInDEV(Component,
props,secondArg)` statement and direct loop-body `children=callComponentInDEV(...)`
statement with inline try/catch/finally and fresh compiler bindings. Preserve the
original call, receiver, operands/evaluation once, result and thrown-object identity;
no call wrapper/Reflect.apply for the original native callee. Keep var children
hoisting/binding. Native receiver/caller chains stay unchanged; generated line/stack
format is not qualified. Refuse dynamic eval/with, ambiguous owners/calls, changed
bindings/operands, unsupported statement forms and helper collisions including
escaped identifiers. No skipped branch may execute because instrumentation exists.

Before the original call, capture the optional OWN DATA global
__STATEATOM_COMPONENT_CALL_TAP__ once without invoking a getter. Send
('component-call-begin',fiber,Component,props,siteID)→opaque token. Use that SAME
captured hook for ('component-call-return',token,originalResult,siteID) OR
('component-call-throw',token,originalError,siteID), then always
('component-call-end',token,siteID). Observer faults must not change the original
return/throw or execute an expression/getter again. Missing/accessor/nonfunction hook
is inert. No spread/iteration of arguments. A private null-prototype local receipt
holds only hook/token/site during the call. Begin-hook failure forwards undefined
opaque token; future consumer must refuse malformed/missing tokens, never infer a
valid frame. This recipe alone does not guarantee a collector's lifecycle.

API `instrumentComponentCallGrammar(source,file,{originalSource=source})`: closed
source-file/size/owner/parameter/binding grammar, two sites/initial+again counts,
source-only/nativeVersionAdmittedfalse/runtimeQualifiedfalse. Original source node
positions/digest generate IDs. `transformPinnedComponentCall(source,file?)` composes
existing full memo branch chain, preserves base/native-return/element/memo policies,
counts and output digests, then adds2call sites. Only exact pinned rawSHA806b25cf...
ReactDOM19.2.5 obtains SOURCE admission. Runtime component-invocation qualification
remains false until a later finite case.

Three new files only: transform, OWNED grammar fixture, tests. TDD controls original
return/throw identity/undefined/Promise/iterator/no forced reads; call/argument/getter
order and count; original receiver/caller; early skip; nested/reentrant getter;
rerender iterations; captured-hook swap; telemetry throw/absent/accessor; malformed
and shadowed bindings/escaped collisions. Actual retained code parses/compiles only,
all original recipe policies/counts/intermediate digests preserved. No actual React/
App/native/browser/model/newGCcampaign/package/UI/SDK/otherrepo/cert/trust/publish.
Existing source suite may include its old ownedNodeGC fixture, no historical cause.

Current main/localcommits; preserve old source/cases/raw/readers/criteria. In particular
old46native1724current inputs+1exactGitplan stay separate; 4positive/4boundary proof
cannot qualify these new interval events.20of29/fullA02/16historicaldeferred unchanged.
ONE final fresh review/one tested I/Cpass/minorsdefer/no rereview. NextONE consumer
for exact reentrant synchronous frame tokens before Item parameter binding.
