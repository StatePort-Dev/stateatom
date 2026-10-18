# Next bounded writer observation: in-place receiver access guard

Status: source-only implementation verified; private vendor integration remains a following result. The Query census deliberately retains Unknown effects/lifetime.
Existing sourceWrites completion taps exclude computed/logical/class/await forms.
The next experiment addresses those concrete coverage gaps, not full ownership.

## Mechanism and claim

Add a separate default-off flag requiring sourceWrites/sourceConsumption. At an
original property-write target, replace **only its receiver expression** with a
fixed-arity pass-through guard. It receives that already evaluated receiver and
metadata, returns it unchanged, and invalidates private parsed descriptors only
when this exact object is a known parsed object. Do not evaluate the key/RHS,
read a descriptor on an arbitrary app receiver or introduce a function/suspension.
Keep original key conversion, short circuit, this/super/private binding, await,
getters, setters and errors. No application's object is frozen or proxied.

The event means **potential write access before the original operation**, not a
completed write. An RHS throw, a skipped logical assignment or an await before
actual completion may conservatively lose field identity. Such loss cannot be
presented as an actual write/value. Sticky invalidation survives event eviction.
The same object identity may remain known; current-field ancestry stays Unknown.

Cover ordinary and computed assignment/update/delete, class/parameter contexts,
awaiting RHS, member targets inside destructuring and for-in/of assignment heads.
Reuse one bounded Babel AST helper in the existing source plugin and, only where
hash/site guards permit, private React/Query build-input copies. Preserve old
completion facts and their original controls. A generic write-target recognizer
must prevent existing expression read wrappers from replacing an lvalue with a
call expression. Metadata remains at the original source range.

Super writes require preserving implicit receiver/key evaluation order; exclude
with an explicit boundary unless that is demonstrated. Object/Reflect/Array
native writes, opaque aliases, unknown/earlier code, omitted source or realms and
uncovered compiler input stay unproven. This guard alone never enables fullPath,
a readonly effect certificate or a claim of complete writer history.

## Predetermined tests

Compare original/guarded returns, key ToPropertyKey/coercion count/order, getter
and setter counts, thrown object identity, skipped logical branches, delete/update,
class/default-parameter/direct-eval contexts, suspension and destructuring/loop
assignment. Parsed object controls include an equal computed write, a skipped
logical assignment (loss only, no completed-write claim), failing RHS and delayed
await. Arbitrary Proxy receivers must receive only original traps and no new
getOwnPropertyDescriptor calls. Preserve original old positive/negative cases.

First verify the source-only guard and native acquisition before deciding which
private vendor inputs can safely use it. Never claim global coverage from a local
pass or silently skip syntax to make a coverage claim pass.
