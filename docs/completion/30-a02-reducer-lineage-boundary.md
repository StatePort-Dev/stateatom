# A02.1 — real reducer pattern, unresolved ownership/identity boundary

Status: bounded investigation complete; **A02 is unresolved, not complete**.
Source revision704b632d7e8a6df828aed3715b3b0aef196920bf. No product, compiler,
observer, adapter, package, UI, finite verifier or independent application changed.
The admissible pattern and stopping rule were registered before the checks in
../superpowers/plans/2026-10-21-a02-reducer-boundary.md.

## Actual selected pattern

Pinned independent TodoMVC ff43b02e59dfa604386bb382034b2cd07c2bcd8a,
React/react-dom19.2.5. App uses `useReducer(todoReducer, [])`; UPDATE_ITEM maps the
array and replaces only the matching row with `{ ...todo, title: action.payload.title }`.
Item receives `todo` as a prop, destructures title and displays that title. This is
a real local-state usage, with no query, response or cache exchange to invent.

The requested lineage starts at the original applied replacement and ends at the
later selected row's read/committed text. A same-value replacement still needs a
new origin. It cannot inherit the old producer merely because the label matches.

## Current findings and exact missing inputs

1. `makeReactHostProbe` on the actual independent app reports
   Unknown/Unsupported: Unsupported react19.2.5. The same current call on the
   locked root React18.3.1/vendor hashes reports Observed. This is version/profile
   eligibility, not an observation of the ordinary app's reducer execution.
2. Even a forced compilation with state-handoff flags on the original app inserts
   zero reactStateResult/reactStateBinding sites: the current recognition is for
   named/namespace `useState`, not `useReducer`. A separate synthetic useState
   compilation is a positive control; neither compilation executes the app.
3. Current ledger scope is original native useState queue/update/returned-object
   identity. A reducer result unequal to the direct action does not acquire the
   action's parsed ancestry. Every retained native state witness keeps valueOrigin
   Unknown/Unsupported; raw/equal-value writes and opaque escapes are not excluded.
4. The real Item path additionally loses upstream parameter/prop transfer and
   destructured field history. The ordinary React19 selected final host-property
   producer is unsupported. A reducer callback/source span or later matching DOM
   text cannot supply these missing identities.

The missing inputs are therefore original React19 useReducer queue/dispatch/
applied-reducer-input-and-result/revision identity; bounded field ownership/effects
excluding unobserved writers and escaped aliases; exact state-row→prop/parameter→
destructure transfer; and the selected committed host-producer identity.

## Reused actual UI evidence and current controls

The exact .37 native equal-instance run at
.artifacts/a01/ordinary-instances-native/2026-10-20T23-09-44-823Z/results.json
already exercised two equal titles, a real same-value edit, a different first-row
edit and unchanged second-row reinspection in both immutable hosts. Its14 selected
observations retain exact source/read/instance IDs and fullPath false, no state
handoffs/exchange bindings, and explicit parameter/destructure/commit boundaries.
The two actual original v1 panel/save/exports preserve those same gaps. This record
does not relabel that native run as a new .20261021.1 execution.

Current read-only boundary check binds65 source/input hashes, including the exact
unchanged engine/analyzer/IDE inputs and independent source/lock/licence. The .1
candidate delta remains the already verified pending-picker wording/admission and
metadata/changelog; it changes none of these mechanisms. The diagnostic command:

`node .artifacts/a02/reducer-boundary/inspect.mjs`

Result:.artifacts/a02/reducer-boundary/boundary.json,
UNRESOLVED_ORDINARY_REDUCER_LINEAGE_BOUNDARY_CONFIRMED, A02Complete false.
An initial sandbox EPERM at git rev-parse is retained in inspect.log; the same
read-only check completed in inspect1.log with the required process permission.

The brief's existing current source-acquisition controls also ran:

| Command | Actual result | Record under .runtime |
| --- | --- | --- |
| npm run verify:query-handoffs | PASS29, fullPath false, productUI false | query-handoff-runs/2026-10-21T00-25-55-192Z/results.json |
| npm run verify:query-calls | PASS16, two native call sites only, fullPath false | query-call-runs/2026-10-21T00-26-13-716Z/results.json |
| npm run verify:react-state | PASS14, pinned18 useState only, fullPath false | react-state-runs/2026-10-21T00-26-38-917Z/results.json |
| npm run verify:write-access | PASS19; no complete writer coverage | write-access-runs/2026-10-21T00-27-31-510Z/results.json |

All four retain their actual configuration, stable inputs and zero errors. These
are pinned synthetic acquisition/semantic controls, not ordinary reducer lineage,
MV3/IDE panel acceptance or a new first-read proof. No shared product code changed,
so historical compiler/finite first-read and UI campaigns were not repeated.

## Finite next experiment and dependency ruling

Use the stopping point explicitly allowed by the A02 brief. A02 remains open;
neither partial UI fragments nor this document pass complete lineage. Its initial/
refetch/out-of-order/query-cache, same-write, selector, masked condition, alias,
functional-update and pre-observation acceptance rows retain their requirements.
Local-state rows already exercised above count only for their actual source/read
scope, not as a complete producer path. Query-only rows remain untested here.

The one next experiment for A02 is a version-specific original React19 useReducer
queue/update/result→committed-consumer observation on two synthetic rows, with a
same-value replacement, wrong-row control, rebased/aborted result and observer-off/
on semantics. It must observe original execution, never invoke callbacks/getters
again. Even success leaves field ownership and prop-transfer ancestry Unknown
until separately justified; failure ends with the exact missing identity.

Do not spend this cycle building a general ownership framework. A03 is independently
dependency-ready after A01 and is the next bounded work item. P04/C07 still depend
on the unfinished A02; mandatory A05/L02, SDK exclusion and release gates are unchanged.
