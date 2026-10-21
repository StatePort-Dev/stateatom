# A05.1 — finite native event-listener boundary experiment

Execute inline on current main after A04 closure; use the existing execution,
debugging and verification workflows. This preregistration precedes implementation
and any new experiment. Mandatory A05/O02 remains open until its original UI and
semantic gate is actually supported. Deadline:2026-10-21T05:00UTC.

## Decision and boundary

Test whether the installed Chrome native EventListener breakpoint plus explicit
return locations supplies sufficient synchronous invocation/target evidence for a
bounded trace. The retained beforeScriptExecution experiment in
experiments/execution/entry.mjs already rejected that different instrumentation
pause as an invocation witness; do not repeat it. Native event-listener pauses and
return locations were not tested by that experiment.

Use one isolated synthetic HTML fixture and one owned Chrome/CDP session, no Atom
extension, framework, instrumentation transform, SDK, external server or library
replacement. Native Input performs real trusted clicks. This is a protocol
mechanism experiment, never product/permission/UI acceptance. Debugger pauses are
explicit and can alter timing; no transparent or zero-overhead claim follows.

The exact installed protocol types warn that setBreakpointOnFunctionCall may also
break another closure created from the same source. Treat coordinates and function
object IDs as insufficient to join a previous declaration/registration to a current
activation. No conditional breakpoint/evaluated expression is allowed to fix that.

## Preregistered finite questions and controls

1. Ordinary direct native function listener: record the actual native pause reason,
   exact generated frame/function locations, frame/loader and minimally described
   native `this` node. Does it identify the registered currentTarget? Does it also
   supply original dispatch/event object/target identity, or is that a missing edge?
2. Install only native return-typed break locations restricted to that function.
   Record the actual hit and frame identity. Check ordinary return, finally and
   throwing listeners; a pre-return pause alone is not completed exit evidence.
3. Capture/bubble, nested target, delegated listener, arrow/bound listener, disabled
   native button, two same-source factory closures and replacement: do not borrow
   a nearby target/closure or infer function identity from coordinates. Unknown
   targets and unmatched exits remain explicit gaps.
4. Async listener/Promise continuation and unrelated queued work remain unlinked.
   Compare final synthetic DOM outputs/order/error identity controls off/on. Those
   controls are application assertions, not Atom-observed invocation/effects.
5. Remove every owned breakpoint and verify a later real click has no new pauses;
   cancel/disarm never undoes the user's action. Bound pauses/time, always close
   only the owned process/session, including on acquisition failure.

Privacy: no Runtime.evaluate/evaluateOnCallFrame/getProperties application reads,
arguments, scope contents, function bodies/descriptions, return values, credentials
or closures in the evidence. DOM native metadata and fixture-produced synthetic
output text are permitted. Do not persist raw paused payloads: retain only the
allowlisted minimal metadata above. No extra application expression/callback/getter
execution, wrapper or Promise reaction is introduced by inspection.

## Delivery

Add a narrow experiment under experiments/actions/ with original Apache notice,
uniquely named output directory, exact fixture/driver/protocol/browser identities,
immutable input hashes, raw minimal records and finite outcomes. Run once after
preregistration; repeat only to address a concrete harness defect or changed tested
mechanism, preserving the failed run. Commit the actual bounded result, explicit
missing mechanism and ONE next implementation decision. A05 completion requires
the original event/instance and UI contract and will not follow from this document,
protocol success, counts or fixture logs. Keep production observation independent
of F05 mutation authority; no publication, account, other repo or redesign changes.
