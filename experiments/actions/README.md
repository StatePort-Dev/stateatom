# Bounded Action Trace mechanism experiments

Original new code: Apache-2.0. These synthetic, agent-operated protocol results
are not Atom product/UI acceptance, a shipped trace, or complete invocation proof.
The original mandatory A05/O02 acceptance gate remains unchanged.

## Native listener/return experiment

```sh
node experiments/actions/native-boundary.mjs
```

Run only for a changed mechanism or a concrete new question. Preregistration:
docs/superpowers/plans/2026-10-21-a05-native-boundary.md. No added npm script is
implied. One isolated Chrome/CDP session per observer-off/on mode performs trusted
Input clicks on the original synthetic HTML fixture, with no extension, Runtime
app evaluation, wrappers, Promise instrumentation or scope/argument inspection.
Pauses are explicit and can change timing. Only synthetic DOM output and minimal
native pause/frame/target metadata are retained. Own breakpoints/object groups and
Chrome are cleaned independently, including on failure.

Initial2026-10-21 result:17 native listener-entry pauses,14 return-point pauses,
17 off/on scenarios with equal outputs/order/original error identity, disabled
control and disarmed click. Native `this` can identify an ordinary listener's
currentTarget, not its original event target; arrow/bound this is unavailable.
Try/finally/throw controls expose no return break locations. A breakpoint on
registered closure A also fires closure B from the same source. Event object
identity and completed exit are not established; async effects remain unlinked.
Result is PARTIAL, never a new Action Trace feature claim.

See docs/completion/38-a05-native-mechanism-boundary.md for exact paths, versions,
failed harness run, verified controls and the one bounded next implementation.
The historical beforeScriptExecution rejection is not rerun or reinterpreted.
