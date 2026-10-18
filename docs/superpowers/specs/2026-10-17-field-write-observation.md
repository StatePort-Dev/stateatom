# Next probe: field write occurrence without changing JavaScript references

The state handoff probe makes the remaining value-version gap concrete: raw and
equal-value writes can preserve a parsed object's identity while changing the
meaning of a field's current value. Never promote identity-only origin to a
current-value claim from equality or a missing write record.

The smallest next experiment is source-level occurrence observation for existing
plain noncomputed member writes. Retain the ORIGINAL assignment/update/delete in
place, in its original strictness and control flow, with invocation-local receiver
and result temporaries. Observe completion afterward, without reading the property
again or coercing a computed key again. A setter/getter/Proxy is executed only by
the original operation. Record invalidation when the actual property operation
completed; this is not proof of a data-property write if an accessor/proxy consumed
it. Do not wrap the operation in a new arrow or callback: that can change await,
yield, direct eval, super or lexical semantics. Explicitly skip unsupported forms.

Compare original and transformed behavior for receiver/key/RHS order, abrupt
completion, setter/getter counts, prefix/postfix/compound result, skipped branch,
async RHS and strict read-only failures. Preserve the raw failing/control cases.
One member-write observation can invalidate parsed-field authority, including an
equal-value assignment. It does not prove complete write coverage. Native
Object.assign/defineProperty/Reflect.set, computed keys, opaque escapes and external
code remain boundaries until separately observed or excluded with evidence.

Original P2/P1 are still unchanged; this probe must not rewrite them or set
fullPath:true. Before product integration, determine whether their complete path
can actually exclude opaque/raw writes. If it cannot, retain Unknown and record the
exact gap; do not claim that a finite set of observed writes covers all JavaScript.


Review reproduced a reentrant class-initializer receiver mixup and invalidation
loss after 128-key eviction; both counterexamples are retained in RED logs.
Class field/private/static initializer contexts are excluded. Receiver temporaries
now contain weak tokens; the original reference is resolved before the original
operation. Successful completion clears receiver/result temps while returning the
exact original result; an abrupt path leaves only a weak token. Without WeakRef,
the original operation still runs but no receiver observation is claimed. Known
parsed descriptor invalidation is sticky and independent of evictable event IDs.
Computed/logical/native/opaque/earlier writes remain incomplete coverage.

Following bounded coverage increment: observe statically named direct
Object.assign/defineProperty/defineProperties/setPrototypeOf and
Reflect.set/defineProperty/deleteProperty calls only when the actual callee is the
captured native function. Read the method once before evaluating original args;
pass receiver, original arguments/result/error unchanged. In finally, invalidate
all known parsed descriptors of the target (and Reflect.set receiver), including
on partial failure. Do not inspect keys/sources/descriptor objects or assert an
individual write: record an observed native call and conservative invalidation.
Alias calls, computed names and opaque libraries remain unsupported. Compare
original native/getter/descriptor/error behavior and keep incomplete coverage.
