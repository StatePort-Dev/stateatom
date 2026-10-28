# Dependency-first Atom

User's primary flow: select an element → inspect the expressions/variables/API
parameters it depends on → change those inputs and see the effect → open their code.
Everything else is secondary. Prior autonomous execution preference remains in force.

## Task 1: Primary screen

Use the supplied Atom Inputs expression/operand visual hierarchy. Keep the element
identity once above navigation; property sections contain expressions and inputs,
not repeated DOM outputs. Every exact source location is clickable on its expression
or input name. Missing observations remain explicit. Generic page-field editing is
secondary and never described as a dependency editor.

Preserve source identity, native node identity, missing/skipped/stale states and the
shared CSS contract. Project only the validated recorded dependency closure. Never
match by equal values, names or a nearby request. Source-only links stay source-only.

## Task 2: Runtime boundary and verification

Existing input writers support native form controls and future JSON response
replacement. They do not expose a write capability for an arbitrary observed scalar
read. Source/control fixtures and native browser checks must keep this gap explicit;
no synthetic live dependency editing or inferred control binding may fill it.

Verify exact-source clicks, no duplicate output, unknown/stale/unsupported states,
keyboard/narrow layout and preserved secondary editing. Run focused then full checks,
update changelog/audit, get one independent final review, commit only owned paths and
open the actual source-runtime extension. Record the remaining write-binding gap.

## Execution evidence and rulings

Task 1: implemented and focused checks passed. Native inspection exposed broad source
matches repeated under Text; only exact recorded property computations now render in
Dependencies. Upstream reads are nested using actual graph edges.
Task 2: native React/VS Code and narrow/keyboard checks passed; final full suite 6300 PASS, zero failures (full-final.log).
Final review: one important global-stale promotion defect, regression RED→GREEN; no
other blocking findings. No re-review needed. Secondary editor has 8 passing renderer
scenarios. All arbitrary-read editing remains unsupported, not claimed complete.

Ruling: do not invent a writable dependency mapping from matching names/values or page
controls. This leaves step 3 of the product vision open, but preserves truthful behavior
until an actual adapter capability is implemented. Cost: fewer editable primary values
than the desired product flow; generic page experiments remain available secondarily.
