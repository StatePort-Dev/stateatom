# First-data-render effect derivation

This is the reviewed finite derivation for the closed-project first-read profile.
The composed product verifier now checks the acquisition and closed-code premises
before issuing a scoped **Supported finite trace** for original P2 or P1. See the
[acceptance checkpoint](2026-10-18-closed-first-read.md) for actual UI evidence and
limits. Source hashes bind versions; they do not replace this argument. The pure
model and serialized join remain conditional and always return `fullPath:false`.

## Scope and alias interval

Original App.tsx is unchanged. Its effect consumes the account JSON into a local
immutable binding, passes that same object to the fresh QueryClient and direct
React setter, then awaits the races. The loading guard prevents quota reads until
data, permission and race are present. The first successful render performs P1's
nested destructuring into allowance, computes shown, and invokes the imported
calculateEligibility(data), which reads the same rules/quota for P2. The interval
ends at each particular original read, not at a later inspector checkpoint.

Before those first reads, the account/rules graph is reachable through the effect
binding, observer-owned origin metadata, Query retention, React pending/current
state/Fiber, and framework scheduling closures. Source proof must cover each
retainer, including DOM Fiber expandos. Merely finding no DevTools hook is not an
ownership proof. No unreviewed callback or other script may use these aliases.

getQueryData/selectAllowance, structuredClone, semanticCheck and Row props are
later in the successful App body. Their effects/escapes cannot rewrite the earlier
scalar read. They do prevent borrowing this first-read proof for arbitrary later
renders. Partial/aborted/StrictMode/retried renders require refusal unless their
separate read/commit history is established.

## Query derivation and acquisition

The open profile requires the exact eight 5.90.3 inputs pinned in
stateatom-field-revision/query-contracts.mjs. No installed package is edited.

| Site | Source derivation | Runtime premise that must be acquired |
| --- | --- | --- |
| QueryClient constructor | A new client with no arguments creates a fresh QueryCache, empty defaults and maps; no custom callbacks introduced | Actual constructor argument count zero, actual client/cache identities, complete admitted module graph |
| setQueryData | A non-function updater passes through functionalUpdate; no previous query makes prevData undefined | The actual original updater object, original query/prevData undefined, matching native call/return/assignment identity |
| replaceData | No structuralSharing callback; replaceEqualDeep(undefined, account) returns account without traversing or mutating its fields | Original first sharing-property read kind and direct previous-data operand; ordinary pinned options/branch and callee premises |
| QueryCache added/updated notify | notifyManager.batch invokes original closure; an empty listeners iteration calls no external listener | Original callback count zero in both notifications; actual instance, ordinary fresh Set and unchanged forEach premise |
| Query dispatch observers | Empty fresh observers iteration calls no external observer | Original callback count zero, actual instance/array and unchanged method premise |
| notifyManager | Default manager batch/flush/schedule functions provide no foreign callback when loops/queue are empty | No configuration mutation, prior scheduling/queue callback or unknown callback/history in interval |
| Subscribable | No subscription attaches a callback to an admitted cache/query instance | No relevant subscription events and closed source/instance history |
| Removable/timeoutManager | No GC callback or custom timeout provider occurs before the admitted read | Timer/GC/configuration history; an unknown event denies this initial profile |

The new branch taps preserve the original notification member-call expression and
property lookup. They count actual callbacks rather than invoking listeners for
inspection. **Native forEach identity is Unknown**, not inferred from zero count.
The model must not accept callback absence until the separate method/source/shape
premise is checked. A first Reflect.apply rewrite was rejected after it changed
noncallable TypeError messages; the literal original calls are now retained.

The telemetry bus is module-owned, bounded and metadata-only. It does not adopt a
public page callback or serialize application objects. Object IDs are weak identity
labels, not object-field inspection or cross-context authority. Malformed kinds,
retention loss and unavailable records must remain explicit refusals. Captured
intrinsics protect against later replacement; they do not attest pristine bootstrap.

## React and expression derivation

The selected state hook begins at null. A direct account object action follows the
pinned basicStateReducer direct-action branch; pending update, hook result, actual
returned array/binding and committed ancestor must agree. Functional/rebased/unknown
updates do not inherit this certificate. Eager state must be tied to its actual
original action/result branch, not merely a matching result value.

P1 requires its own original destructuring receipt. P2 requires its own original
member receipt and the helper invocation's actual dependency context. The existing
source fragment for calculateEligibility establishes the straight-line operations
only conditionally on ordinary JSON data and numeric leaves. The profile must bind
the actual compiler output to that reviewed source/instrumentation and those
runtime operands; it must not erase opaque calls from a compiled body to force a
readonly summary.

The committed host target, selected DOM property, state/read/transform events,
consumption and exact browser exchange must share compatible page/frame/run/build/
update identities. The finite model currently checks a **conditional premise set**
with an explicit shared sequence domain. It always returns fullPath:false because
consistency of supplied records is not acquisition of those premises.

## Closed-code boundary

A source allowlist alone is insufficient. The actual final compiled graph and
closed compiler configuration must correspond to the reviewed bodies/configuration.
Unknown post-stage transforms, scripts, callbacks, frames, pending source requests,
late attach or context/event loss deny the profile. Browser-owned collection must
complete its event/source drain before acceptance. Page-supplied booleans and
fullPath fields do not authorize claims. The compiled-content and existing compiler
acquisitions retain their original limited meanings. Composition authority belongs
only to the product verifier, using the private independently recomputed compiler
capability, the actual controlled-browser session and the drained native journal.

## Required refusals

Preserve pre-read literal writes through direct, cache and Fiber aliases, including
same-value writes; custom sharing and notifications; callback/method substitutions;
non-direct/rebased updates; different parse/context/read/commit/exchange; malformed
or missing sequence domains; unknown compiled code and incomplete history. Later
writes must not replace the original scalar receipt or be called an earlier writer.
No test count or successful branch snapshot may substitute for these proof gates.
