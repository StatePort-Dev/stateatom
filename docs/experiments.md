# Local experiments

StateAtom's target experiment design tests a bounded question about a selected UI property by changing an explicitly supported local input and observing the result. It is not a confirmed intervention API. Current implementation evidence and its limits are recorded in [status](status.md); system boundaries are described in [architecture](architecture.md).

An experiment supports an **Experimentally verified** claim only within its recorded baseline, intervention, observation window, and controls. It does not prove production behavior, backend correctness, or the root cause of a bug. See the [evidence model](evidence-model.md) for the distinction between evidence types, freshness, and coverage.

## Choose a bounded question

Consider a property produced by `disabled = creditHold || !canConfirm`. If the baseline has `creditHold` true and `canConfirm` false, both conditions can block confirmation. Changing only `creditHold` to false can leave the button disabled. Changing only `canConfirm` to true can also leave it disabled. Neither unchanged outcome establishes independence from the changed input.

JavaScript's logical OR evaluates its left operand first and can return without evaluating its right operand. Thus `!canConfirm` may not execute in this baseline. Separate observations may establish both stored values, but the diagnosis must not claim that both operands were read during that execution. The language semantics are specified in [ECMAScript's binary logical operators](https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html#sec-binary-logical-operators).

Where the question and adapters justify it, individual interventions followed by a joint intervention can distinguish this masked effect. Each trial needs a verified baseline reset. A negative control can test whether the capture procedure or an unrelated supported input changes the outcome. A joint result remains specific to the tested combination; it does not establish a complete dependency graph.

The design should choose the smallest justified set of trials. It must not search every input combination, repeatedly evaluate application expressions, or incur unbounded capture cost merely to fill a graph. If an intervention produces no failure or no visible change, report that outcome within its observation window. Do not translate it into “no dependency.”

## Eligibility and execution

An experiment plan is scoped to the user-authorized investigation, which may include an authorized automated run. Before application, the plan identifies the question, selected property, target identity and revision, proposed local values, supported adapter, expected observation, limits, and cleanup method. Authorization for a local experiment does not include backend writes.

Only explicit adapters may expose intervention targets. They must define target eligibility, supported changes, affected scope, cleanup behavior, and failure reporting. The design does not blindly mutate props, store internals, or arbitrary objects, and it does not evaluate arbitrary source expressions to obtain targets. An unavailable adapter means that intervention is unsupported.

Before applying a change, verify the target's session, navigation, frame, instance where applicable, and relevant data revision, together with source or build identity where available and required by the adapter. Missing source identity must remain explicit and limits source-related claims; it does not by itself prohibit an otherwise supported runtime-only intervention. Navigation, hot module replacement, replacement instances, or revision changes can invalidate eligibility. Reject the old patch when its target is stale. Re-identifying a visually similar button is not sufficient to revive it.

Baseline capture must be limited to what the adapter can safely observe and verify. Serialization must not evaluate getters to make a more complete snapshot. The design does not require an immutable copy of an arbitrary JavaScript heap. If the baseline is partial, record its limits and restrict conclusions accordingly.

## Preserve the execution being inspected

Instrumentation must preserve the original evaluation order, receivers, returned values, and error behavior. It must not repeat expressions, getters, or function calls to collect values, or force a branch that the application did not take. These are project requirements for probes and adapters, not claims that an available implementation already satisfies them.

Probes add work and may alter timing. Validation must measure that overhead and check relevant ordering and asynchronous behavior, with and without probes. An experiment affected by capture timing must disclose the limitation. Instrumentation cannot claim transparent execution merely because the final displayed value matched once. The required gates are described in [validation](validation.md).

## Lifecycle and cleanup

The lifecycle terms below describe required behavior, not stable status identifiers.

| Stage | Required meaning |
| --- | --- |
| Baseline | Record and verify the relevant starting context and supported local values. State what cannot be verified. |
| Apply | Recheck eligibility and apply the supported local intervention. Record what actually changed. |
| Observe | Capture the selected outcome, relevant effects, and observation window. Record errors and interrupted observation. |
| Undo | Remove or revert the local intervention using the adapter's supported cleanup. Observe and report the cleanup result. |

Undo does not mean that all application history has been reversed. It cannot claim to undo a server write, an already dispatched asynchronous effect, or unrelated application activity. An adapter must state the scope of what it can remove or revert. If an effect escapes that scope, record it and avoid claiming a complete rollback.

Restore is a separate attempt to re-establish a verified baseline after cleanup. It may require a supported reset or a new capture. Undo can succeed while restoration remains stale or incomplete. If the full relevant baseline cannot be verified, label it unknown and do not use it as a verified reset for another trial.

A canceled, timed-out, or failed experiment must attempt supported cleanup and report its outcome explicitly. The record must distinguish completed cleanup, incomplete cleanup, and cleanup whose result could not be observed. A request to undo is not evidence that undo succeeded. Stale identity can prevent safe application of an old patch and can also limit cleanup; the record must retain that unresolved state.

For a batch, atomic application is available only when the adapter explicitly guarantees it. Otherwise, record each attempted change and any partial result, then attempt supported cleanup for applied changes. There is no assumed global transaction across a component, store, query cache, network activity, and browser state.

## Reviewable results

Retain the plan, target identity, eligibility decision, capture and adapter versions, baseline limits, applied changes, observed outcomes, controls, effect records, and cleanup and restoration results. Bind the record to the relevant code and data revisions so a later reviewer can determine what would need to be reproduced. Record omitted or redacted data rather than treating an export as complete capture.

A read-only diagnosis may carry these results to QA or a product reviewer through the same evidence model. Sharing does not grant the recipient permission to intervene, and a saved result does not authorize applying its old patch to a new session. See [security](../SECURITY.md) and [StatePort integration](stateport-integration.md) for access and sharing boundaries.
