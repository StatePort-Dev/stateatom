# Bounded all-reference source-use inventory

The next ownership prerequisite is an exhaustive bounded inventory of references
to an exact lexical JSON binding, ordinary aliases and candidate React state
bindings. The existing backward source slice does not inspect all uses/escapes.
Reuse Babel binding identities and the existing sourceSlice for code links; do not
add a parallel module resolver or infer runtime identity from names.

This experiment classifies direct property reads, supported aliases/destructuring,
local writes and explicit call/return/export/props/computed/unsupported boundaries.
Follow a candidate useState value only through its exact lexical setter binding;
that static candidate is never a native handoff proof. Shadowed names do not join.
Budgets, missing/ambiguous entry bindings and syntax loss deny a complete inventory.
Known property reads and local primitive operators are only syntactic use records,
not guarantees of getter/intrinsic behavior or whole-program readonly effects.

Run unchanged original P2/P1 source (account and its data state candidate), plus
generic alias-write, computed, opaque call, reassignment, shadowing and budget
controls. Output Code-linked local facts and exact unproven boundaries. Query and
React lifetime, deep-region/native effects, compiled/source equivalence and full
execution history remain unproved. No field-ancestry/UI claim is enabled.
