# A02.2 — bounded pinned React19 reducer/commit identity experiment

2026-10-21; base f4e40fc plus registered experimental source. Bounded experiment
COMPLETE; A02/full lineage/ordinary-app product React19 support remain INCOMPLETE.
No product adapter, independent TodoMVC source, SDK or other repository changed.

## Exact experiment and source semantics

Preregistered plan:../superpowers/plans/2026-10-21-a02-react19-reducer-experiment.md.
Uses existing read-only React/react-dom19.2.5 development inputs from the retained
pinned TodoMVC installation, not that application's source/runtime. Exact SHA256:

- react.development.js:4325e6263375459503858c0982d50bbc25bc33e66676954698c67221d2ee8b72
- react-dom-client.development.js:806b25cf84808a5ae0104e81633caabb1aa11fce71e72ef7afe4c1f8d2ebec08

Original and derivative bundles are unique local artifacts. Installed packages and
original notices stay unchanged. All bundled inputs/lockfiles, original/derivative
bundle hashes, source/protocol/configuration and exact expected native sites were
registered before browser execution. Both pinned transforms match declared counts.
The current product React18 adapter remains untouched and still rejects19.

AST taps retain the ORIGINAL direct reducer call, arguments/receiver and returned
object. Ignored StrictMode and applied calls have separate event tags. Throws bypass
successful-result taps and retain their original identity. No reducer, getter or
skipped branch is re-executed by observation. Ledger retains object references as
WeakMap IDs/WeakRefs; application state/action fields are not explored. Native hook/
Fiber/root/props data descriptors are distinct from application objects.

Four source tests pass. The primitive-state control first reproduced an incorrect
Observed result in the object-identity ledger; fixed to leave primitive state outside
this experiment as Unknown. RED/GREEN retained. Other controls cover original call/
getter counts, receiver/arguments, same result and exception identity, observation
callback errors, source pin/site mismatch, ignored results, clones and stop. These
synthetic VM checks alone are not native proof. Full npm test1902/1902 PASS,0fail/
skip/cancel; syntax/diff checks PASS before the actual campaign.

## Actual browser controls

Actual harness browser Chromium153.0.8010.12, sandbox enabled, no extra/security/
experimental launch arguments or extension. Localhost synthetic app, six pages:
original/off/on main scenario and original/off/on error scenario. This is browser
runtime evidence, not installed Atom/MV3/IDE/native-user-workflow acceptance.

The fixture explicitly records local refs at its ORIGINAL reducer/map replacement/
consumer operations and returned React-element props. That declared synthetic oracle
is joined to exact original native dispatch/update/hook/applied-result, host-applied
props and root.current committed tree. It is NOT general field ownership or ordinary
prop-transfer inference. A matching title or nearest component cannot make the join.

All14 actual checks PASS, no errors/unexercised cases, source inputs unchanged during
run. Selected DOM object ID also matches the native committed host node ID.

| Control | Actual result / boundary |
| --- | --- |
| Two equal rows | Distinct row/props/DOM occurrence IDs, same original native queue. Initial state has no replacement update origin. |
| Same-value row1 replacement | Title stays SAME; native result/revision/row IDs change. Observed update:object:14, result object:20, revision:2; initial result object:2/revision:1. Queue remains queue:object:1. IDs scoped to this on/main page. |
| Wrong row2 | Row object:6 remains unchanged; fixtureReplacementUpdateId=null, despite the parent array's new state revision. No row1 replacement provenance assigned to row2. |
| Different row1 | Exact current result object:30, update:object:26 and selected host props; row2 still SAME. |
| StrictMode | One ignored and one applied successful callback for the same synchronous action; their result objects differ. Only applied object:20 is current. No extra observer callback/getter invocation. |
| Suspended transition | Actual pending result object:39 does not replace selected current object:30/commit:3. Gate release later commits actual object:44/commit:4. No pre-commit promotion. |
| Real rebase clone | Actual final result object:68/commit:6, native update object:67 has no matching observed dispatch pointer. Equal action is refused as identity; updateId=null/updateOrigin Unknown. |
| Stop | Current witness removed, app still dispatches/renders AFTER-STOP. No restoration promise. |
| Original exception | ErrorBoundary receives SAME original sentinel object. Exactly2 original reducer calls in each original/off/on error page; no successful result fabricated for that action. |

Synchronous original/off/on counters agree exactly:

| Phase | Reducer calls | Title getter reads | Action getter reads | Stable dispatch |
| --- | ---: | ---: | ---: | --- |
| initial | 0 | 4 | 0 | true |
| same-value | 2 | 11 | 2 | true |
| changed | 4 | 13 | 4 | true |

These actual counts describe this development fixture/configuration, not universal
React invocation counts or all impure/reentrant callbacks. Concurrent phase counters
are retained, not forced to a broader scheduling-equality claim.

## What remains unknown and next one work item

All current observations retain valueOrigin/fieldOwnership Unknown, fullPath false,
and propTransfer labelled explicit synthetic oracle only. Exact state/consumer object
identity is not field-write ownership, escaped-alias exclusion, ordinary prop/parameter/
destructure history, HTTP/query ancestry or general selected-property producer proof.
The original ordinary TodoMVC useReducer path is NOT newly executed or completed.
The actual clone result's update origin stays unresolved; no cloned identity was
invented from its equal action. Product19 eligibility remains unsupported.

This discharges A02.1's finite next EXPERIMENT, not full A02. Preserve its stopping
rule:do not build a general ownership/proof framework this cycle. Remaining product/
ordinary-app queue acquisition, writer exclusions, prop transfer and complete positive/
counterexample/query-specific rows retain their acceptance requirements. No whole-A02
review is claimed; independent human participation is not the missing mechanism.

Next ONE dependency-ready work item:P01.1, bounded native selected-listener
GeneratedAnchor/source-provider boundary, reusing current collector/map contracts.
No manual generated coordinates, handler execution, property-origin promotion or
production mutation-permission change. F02/U01/U05 dependencies are already complete.
Still15/29 original full tasks complete; L02 also remains mandatory/unresolved.

## Evidence / reproduction

Command:npm run verify:react19-reducer. Requires the existing exact retained19.2.5
inputs and current declared local browser; no install or application execution command
is inferred when missing. Synthetic grammar tests stay in npm test independently.
Actual:.artifacts/a02/react19-reducer/2026-10-21T17-33-09-750Z/results.json; all phase
snapshots, native events/oracle identities/registration/bundle metadata beside it.
Aggregate:.artifacts/a02/react19-source/verification.json and verify.mjs; RED/GREEN/
focused/full/native logs and pinned source-transform receipt retained there.
Protocol exact bytes were copied AFTER the run from a file still matching its
preregistered/before-after hash; copy time is not presented as pre-run creation.
Post-run plan progress/documentation does not alter the sealed run or its criteria.
Historical A02.1/.37/old29/16/14/19 campaigns were not repeated or upgraded.
