# A05.2 — exact Event and synchronous body mechanism

Mandatory A05/O02 stays in progress. This increment supplies a tested, **unbundled**
opt-in development mechanism, not installed Atom trace UI or production authority.
BASE7e5e7d2, dirty new sources; original observer/plugin/property compiler, A04
analyzer and closed first-read recipe are unchanged. No package/API, permission,
SDK, publication, other repository or visual redesign change.
[Preregistration](../superpowers/plans/2026-10-21-a05-development-boundary.md).

## What actually works

core/action-observation.mjs records a bounded dispatch and original synchronous
body entry/leave under a supplied run/build/page/frame context. The separate native
DOM adapter only accepts a trusted click within the exact selected native object,
then the very SAME original Event passed to an instrumented function. Captured
intrinsic target/currentTarget/phase metadata supplies local private node identities;
no argument/property/scope discovery, getters, handler invocation or Promise
reaction is added. Event and DOM references release after the dispatch turn,
timeout, cancellation, Clear, invalidation or stop. Clear does not undo the action.

The separate Babel transform defaults OFF, binds original digest/spans and instruments
supported simple-first-parameter synchronous functions/arrows. Original directives,
receiver, arguments, name/arity and return reference survive. Original statements
run once in try/catch/finally; catch only flags/rethrows THE SAME thrown value, and
finally records body leave. Returned/thrown objects are never inspected or retained.
The marker proves this source body executed with the observed Event, not a unique
registered callback object. Binding/registration/dispatch/body execution remain
different claims. Same-source closures have separate event/activation IDs while
runtime function-object identity remains unavailable.

Async/generator/suspension, destructured/missing first parameter, methods/getters/
constructors, super, direct eval/with and reserved helper names explicitly refuse.
Unknown wrappers/Proxy/SyntheticEvent and later reused Event cannot acquire the
original dispatch. Source reflection changes under explicit instrumentation;
complete listener coverage, opaque/uninstrumented bodies and async/state/network
consequences remain unavailable. Instrumented-page evidence is not hostile-page
attestation. No universal semantic or performance acceptance is inferred.

The initial bubble-listener completion idea was refined BEFORE implementation:
window bubble may be stopped or run before later peers. A single private native
timer finishes after the original Event phase becomes NONE. It adds no Promise
reaction; stopped propagation retains scoped known bodies without claiming full
propagation coverage. The original semantic/cleanup criteria were not waived.

## Actual checks and retained failures

- Focused new source command:
  `node --test --test-isolation=none tests/action-observation.test.mjs tests/engine/action-transform.test.mjs`:
  final10PASS. Initial missing modules produce the preserved RED load failures.
  First GREEN8PASS/1FAIL was only a capitalization mismatch in the new assertion;
  `/unclosed/i` fixes that spelling check, preserving the actual partial-state test.
- A REAL dynamic-scope counterexample was then added before correction:
  a callback closing over `with(Proxy)` produces1 original versus3 instrumented
  `has` traps. RED5PASS/1FAIL retained. Whole eval/with files now remain unchanged,
  including unrelated sibling functions; no helper lookup enters that dynamic scope.
  Final10PASS preserves this exact original/control case.
- `npm test`: final1674PASS,0 fail/skipped (full2.log); earlier1673/source/native
  checkpoint remains historical before that dynamic-scope fix.
- `node experiments/actions/development-boundary.mjs`: final11PASS controls across
  ORIGINAL / transformed-unarmed / transformed-armed,22 scenarios per mode,
  Chrome153.0.8010.12, errors[], stable exact inputs. Final:
  .artifacts/a05/development-native/2026-10-21T03-35-56-925Z/results.json.
  Actual trusted native Input and DOM metadata/output reads in owned profiles;
  Browser plugin unavailable, regular Playwright owns transport only. No app
  Runtime.evaluate, facade, extension, handler invocation or scope read.
- Final armed trace retains20 exact dispatches,21 body entries and21 matching
  leaves from26 compiled sites/7 explicit unsupported sites. Direct/nested/capture/
  bubble/delegation/arrow/bound, original throw/finally/override, two same-source
  closures, actual node/listener replacement and synchronous same-Event helper
  parent all pass. Original values/order/error identity agree across all three modes.
  Promise identity/getter/this/arity also have source execution controls.
- Disabled and earlier stopImmediatePropagation:0 trace events, explicit expiry.
  Async handler:actual dispatch only, no invented body; Proxy and late Event reuse
  are gaps. Unrelated queued work remains unlinked. Timeout/cancel/Clear/stop release
  observation while later actual user actions still happen. No complete async chain.
- `node .artifacts/a05/development-boundary/verify.mjs`: verifies exact current
  driver/source/compiled bytes/site catalog, native controls, immutable input maps,
  unique activation IDs, matched leaves, minimal record fields, failed/control logs
  and unchanged original product sources against the earlier A04 checkpoint.
  Receipt .artifacts/a05/development-boundary/verification.json.
- `node --check` and `git diff --check`:PASS before commit. No reason to rerun
  immutable Atom package/admission/UI tests: no consumed package or existing runtime
  changed. This is not new installed acceptance or a refreshed historical matrix.

All logs under .artifacts/a05/development-boundary/. Earlier native03-33-17 result,
archived original/transformed sources, failed test outputs, A05.1 native PARTIAL
and old beforeScriptExecution rejection remain unchanged. The second new native
run was justified by the changed dynamic-scope admission; no old experiment reran.

Next bounded item A05.3: integrate this tested mechanism into the existing source
plugin/observer/evidence and selected-context, read-only armed Actions UI. The
current F03 installed helper does not yet expose it. Original A05 UI matrix,
production boundary, performance/cleanup checks and ONE whole-item review remain;
no independent human blocks implementation. A02/L02 and broader gates stay open.
