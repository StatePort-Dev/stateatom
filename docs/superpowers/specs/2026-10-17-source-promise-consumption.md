# Bounded promise-consumption experiment

The exact-fetch acquisition probe is **not accepted yet**. Review reproduced an
ancestor-callframe false association and identified an existing observer semantic
problem: extra `.then` rejection handlers suppress the application's original
unhandledrejection events. Returning the original promise does not prevent that.
Retain both failures. Do not bypass CSP or dismiss these as successful limitations.

Keep this new mode opt-in until its controls pass. The subsequent native gate
passed; the served plugin now uses it by default, with explicit legacy opt-out
for the retained counterexample and a reload error for active mode mismatch. Stop adding observer reactions
to fetch/json promises. Retain their exact original promise identities in WeakMaps
only. Observe successful consumption where the application itself performs an
instrumented `await` or calls the actual native Promise.prototype.then with its own
fulfillment callback. Do not add a callback for a missing/nonfunction handler.

Rewrite `await expression` in place as a call receiving its actual fulfilled result
and an invocation-local temporary containing the original operand. Keep the same
await, same operand evaluation, same rejection path, source scope and suspension.
Never move it into another async function or attach a new promise reaction. Observe
only known fetch/json promises; tag parsed JSON once, before application consumption.

For explicit `.then`, capture receiver and its method once before arguments, and
only wrap an existing application fulfillment callback for a known promise and the
captured native then function. Preserve receiver/arguments, callback this, returned
derived promise and errors. Opaque/custom/optional calls pass through unmodified.
Uninstrumented consumers, native Promise.all and opaque returned-promise adoption
remain unsupported until separately observed; do not infer an origin from values.

Primary/control: unchanged original P2/P1 use nested await and must retain their raw
object/field fragments. Controls: simultaneous nested awaits, getter/call/error
identity, no extra `.then` lookup, explicit then, missing fulfillment callback,
custom method receiver, ignored rejected fetch and JSON promises (original event
promise identity), stop and repeated JSON-promise consumption after a local write.
Compare off/on actual browser behavior. Do not turn this into general async/state
history or rewrite historical P6 criteria. FullPath stays false.

Only after this gate passes should exact CDP binding be added: immediate synchronous
callframe, exact scriptId/line/column/source/context/main frame, never an ancestor,
URL, time or ordinal. Public runtime evidence still does not authenticate a page.

First JSON tagging requires direct consumption of the original json call by await
or an immediate explicit then fulfillment callback, with the actual captured json
method. Aliased/escaped promises cannot establish a first original-value snapshot:
an earlier unobserved handler may already have mutated the parsed object. Keep them
unknown instead of retagging late. Preserve the parsed snapshot only once. This
does not solve same-value writes after that snapshot; that remains a separate gap.

Current-value ancestry is not established by a parsed snapshot or descriptor
equality. Origin records explicitly describe object/field identity only and carry
Unknown/Unsupported value origin; same-value raw writes remain unexcluded. A
prototype toJSON hook disables inspection without invoking that hook. Descriptor
guards read own data descriptors, not absent fields through inherited getters.
