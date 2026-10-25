# A02.11 — source callback interval to native copy input

Executor-selected next finite slice under autonomous work, not an approved general
product policy. BASE d57c022. Existing A02.6 emits yielded only at callback return;
A02.10 captures exact native copy input/element but has no callback interval.
Two independent ID namespaces or a nearby element cannot supply that missing edge.

Approaches: joining snapshots by object label/order is rejected (reused elements
can have the same item/value/output). Wrapping the callback is rejected because
A02.5 changed stack-sensitive getters. Chosen: a separate post-transform for the
exact admitted A02.6 grammar, adding entry/returned/exit metadata in the SAME arrow
body, plus a composer of the existing copy recorder. Old modules remain unchanged.

Goal: source-only history that one original map callback received object X, an
original native classic todo copy used X while that callback was active, and the
same callback returned that exact new React element. This is interval/identity
correspondence, not field storage, causal ownership, selected DOM or state lineage.
Prototype setters may swallow the copy; stronger claims must remain Unknown.

New files: callback-copy-observer.mjs, callback-copy-transform.mjs,
callback-copy-source-run.mjs under experiments/react19-reducer; matching observer/
transform test files and tests/helpers/react19-callback-copy-controls.mjs. No product
importer/old source edits. New modules reuse old array transform and prop recorder.

Observer API createCallbackCopyObserver({page,enabled=true}) -> arrayRuntime and
enter(token,site,item,index,array),
returned(frame,result), exit(frame), tap(kind,value,props,key), snapshot/lookup,
sealWindow/startWindow/stop/retention. enter returns opaque frame; all values remain
weak identities/WeakRefs. No app fields/getters/Proxy traps/scalars enter DTOs.
arrayRuntime exposes captured apply/begin/yielded/finish/abort for the existing
wrapperless expression recipe, with64call cap and genuine weak pending call tokens.
It does not reuse legacy array telemetry: new RED controls show late WeakMap.get or
Array.push replacements execute app callbacks through that old recorder. The narrow
new runtime fixes this source path without changing the old module or historical
claims. Map call must complete; an aborted call cannot promote prior callbacks.
Only map frames with exact nonnegative index/source metadata, original same frame
creation/copy/element-return AND callback return can qualify after seal. Old props,
other frame, wrong object, reused returned element, pending/aborted frame, late
signals/window/Stop/capacity refuse. Nesting is stack-scoped, source-token metadata
is not hostile-origin attestation. Limit512frames/4096interval events plus inherited
64props/4096copy-event limits. Captured metadata intrinsics, no app callbacks.

Post-transform consumes original source via existing instrumentArrayCallsites, then
recognizes its exact generated begin/yielded/conditional-arrow bindings. Every admitted
arrow keeps its identity/length1/lexical this/arguments; prepend metadata enter and
use try/finally exit, wrap only yielded's value argument after original evaluation.
No callback wrapper or app-expression repeat. Reject reserved binding/dynamic grammar,
wrong generated binding/site or coverage mismatch; never partially instrument.
Existing unsupported finalizers/async/generators/nested array profiles remain so;
any underlying unsupported array site refuses this entire new file profile.

Qualification: source synthetic controls first; then one new registered retained
React19.2.5 CJS NodeVM matrix with authored filter/map source and configs. Both factories
and native array callbacks share the VM realm. Original/off/on compare original
outputs/exception identities/sideeffects; positive interval and before-frame reuse,
sibling/nested frame, wrong equal object, swallowed setter, getter/Proxy/stack,
throw/Stop/seal/window controls. Retained recipe pin unchanged. No component render,
ReactDOM/browser/native writer/model/install/cert/security/SDK/release/otherrepo.
Preserve old raw/source pins, original criteria and all exhausted native cases.

Completion: focused+full suite, actual registered source matrix and source-free saved
reader, ONE fresh final review/ONE tested Critical-Important pass/no re-review/native.
Whole A02/20of29 remain open; next missing dependency selected from actual result.
