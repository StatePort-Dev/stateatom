# A05.2 — finite development event/body-entry/body-leave mechanism

Execute inline on current main, bounded task then local commit. This plan precedes
implementation and the new experiment. Original mandatory A05/O02, F02 read-only
policy, original semantic controls and historical native PARTIAL remain unchanged.
Deadline2026-10-21T05:00UTC; no SDK/publication/other-repo/redesign work.

## Mechanism selected after A05.1

Native currentTarget/entry cannot supply event identity or finally/throw exits.
Use explicit opt-in ORIGINAL-source instrumentation for development, first outside
the installed product. Add a small dedicated Babel transform with original source
digests/spans and a bounded event observation primitive; do not modify the existing
property observer/closed first-read compiler recipe until this mechanism works.
This is instrumented-page evidence, not hostile-page runtime attestation.

- Transform only synchronous ordinary functions/arrows with a simple first
  identifier parameter and no async/generator/await/yield/eval/with/super/hoisted
  nested function-declaration boundary. Preserve directives, receiver, parameter
  arity, inferred name, original return value and thrown value. Reject reserved
  helper binding collisions. Concise arrows return their original expression once.
- Insert entry, then original statements in try/catch/finally. Catch flags abrupt
  completion and rethrows THE SAME value; final helper records body leave without
  reading/retaining returned/thrown objects. Never add a Promise reaction or await.
- A private arm installs bounded native capture/bubble listeners for one click on
  a supplied exact native selected DOM object (or its native descendant). It assigns
  an event ID to that original Event object. Body entry is accepted only when its
  original first argument is that exact native object and the original dispatch
  is active. Unknown wrapper/SyntheticEvent, missing parameter, later reuse, nested
  different event or timeout cannot acquire an inferred causal link.
- Read only captured intrinsic Event target/currentTarget/phase/trusted fields and
  native Node containment. Do not inspect arguments, proxy properties, arbitrary
  getters, scopes or source callbacks. Private metadata uses compiler site strings;
  never coerce an application argument. Own observation methods must not throw into
  the application. Retain no event/DOM references after disarm/timeout/Clear/stop.
- Record distinct dispatch, body activation and normal/throw body leave, with own
  event/activation IDs, selected/currentTarget identity, original source digest and
  bounded scope. Source binding/registration/runtime closure identity remain separate.
  Function entered with the observed Event is not automatically the registered
  listener; same-source closures are distinct activations, not identified objects.
- Capture/bubble observation adds explicit instrumentation; time overhead is not
  declared zero. Propagation stopped before our capture yields no event; stopped
  before our final bubble yields an explicit collection gap/timeout. Async helpers,
  background requests and state effects remain unlinked. Function source reflection
  and unsupported grammar remain explicit limitations, never global semantic proof.

## Preregistered RED/control suite

Pure/compiler cases: no default transform, simple function/alias/arrow positive;
original this/arguments/name/length/return reference/error identity/finally return
override/primitive throw/Promise reference and existing reactions; no getter re-read;
reserved names, missing/simple-vs-destructured parameter, async/generator/eval/nested
declaration/super refusal; no duplicate event parameter evaluation. Test exact
digests/ranges. Do not replace old suites or lower any original acceptance criterion.

Native synthetic experiment: original vs transformed-unarmed vs transformed-armed,
trusted Input only, direct/nested/capture/bubble/delegation/arrow/bound/disabled,
same-source two closures, actual replacement, throw/finally/async gap/unrelated work,
cancel/Clear/timeout and stopped propagation. Fixture output/error/scheduling is only
a semantic control, not a trace oracle. Positive entries/exits must come from the
new primitive and exact Event carrier; observed trace cannot borrow fixture answers.
No Atom extension or production/native permission acceptance is inferred.

## Deliverable and next boundary

New core/action-observation.mjs, small source transform, focused tests and narrow
experiment/fixtures with archived inputs/results. Run RED then meaningful source
and real browser controls, preserving every failure. Commit the actual scope and
explicit unsupported controls. If successful, ONE next item is A05.3: integrate this
tested mechanism into existing source plugin/observer/evidence and the armed UI
under the existing selected-context/permission/cleanup model. Do not call A05 complete
from the mechanism, fixture UI, documents or counts. Whole-item review waits for the
original complete A05 matrix, rather than each intermediate mechanism commit.

Pre-implementation refinement: a window bubble listener can run before later peer
listeners or never run after stopped propagation. Finish at one private native
timer after the original Event phase becomes NONE; add no Promise reaction. Accept
entries only while the exact original Event has an active native currentTarget.
This does not certify complete listener coverage. Stopped propagation retains its
known entries and an explicit coverage boundary. Add src/engine/action-observer.mjs
as the narrow DOM adapter around the pure core and action-transform.mjs as the
standalone source transform; existing observer/plugin remain untouched in A05.2.
