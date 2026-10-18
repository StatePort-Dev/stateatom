# Bounded function-fragment prerequisite

The source-use inventory stops at calculateEligibility(data). Reuse existing source
links and test a strict syntax verifier for one exact function: immutable lexical
aliases, literal/property reads and primitive operators, followed by a scalar
return. Reject calls (including parameter-free calls), global/free variables,
writes, async/generators, unsupported statements, computed properties and object
returns. No new module resolver or evaluation of the function is permitted.

A supported fragment is conditional source syntax only. It must list unverified
premises: actual compatible callee/source identity, ordinary own data reads,
primitive operator operands and exact runtime invocation. Those premises cannot
be declared proven. No readonly/ownership/fullPath capability follows until the
whole lifetime/compiled-history obligations are independently established.

Check original calculateEligibility/selectAllowance and generic renamed pure
fragments. Preserve controls for a hidden global writer call with no parameter
reference, alias/property writes, getter-capable unknown operands, free closures,
computed access, region return, ambiguous functions and exhausted budgets. The
whole App and Row props remain outside this small straight-line grammar.
