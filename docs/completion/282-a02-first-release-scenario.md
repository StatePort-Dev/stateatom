# A02 — bounded first-release scenario: edited list-item title

28 October 2026. The maintainer delegated formulation of a sufficient bounded
first-release scenario. The choices below are the executor's specification under
that instruction, not earlier approved implementation details or completed evidence.
**Approved:** the maintainer subsequently instructed “Вот, фиксируй это и выполняй все оставшееся до релиза самостоятельно”. Scenario and autonomous execution are now approved; implementation/evidence are still pending.

A02 remains open. This selects one ordinary **state** pattern permitted by A02;
it does not waive ownership, repeated-update, identity or counterexample criteria.

## User result

In an ordinary supported React development project, edit a task's title through
the application's own UI, select its displayed label with Atom, and ask where that
text came from. Atom must show a readable chain with source locations:

`applied reducer UPDATE_ITEM title write → exact returned state/row/revision → App todos → Main filtered/mapped row → Item todo parameter → title read → selected committed label`

Example explanation, conditional on all required evidence: “This label reads
`todo.title` in Item. This version of that field was written by the title update
in the reducer and passed through App and Main to this row.” The UI may show the
actual title, but the explanatory match must not depend on its spelling or value.
The chain starts at the observed reducer field write, not at keystroke causality,
HTTP, storage recovery, initial application startup or an inferred action trace.

## Selected scope and alternatives

Choose immutable object-list state and one scalar text field, using the retained
independent TodoMVC corpus revision `ff43b02e59dfa604386bb382034b2cd07c2bcd8a`,
React/react-dom19.2.5 development and the existing explicitly enabled open plugin
route. Existing exact-version admission remains; this is not general React support.
One root, supported instrumented modules, a complete observation interval and a
fresh committed occurrence are required. Observation begins before the tested write.

This is preferable to a new HTTP/query-cache path because native state ancestry,
App/Main transfers and committed references already have scoped evidence. A
source-link-only answer would be easier but would not meet A02's lineage requirement.
Universal framework/ownership tracking is outside this item.

Keep the actual App/Main/Item/reducer source, filter, map, useMemo and memo behavior.
Do not simplify the independent application to fit the observer, force skipped
renders, or use its names/selectors/test IDs as a product resolver oracle. Harness
selectors may drive user actions only. Product matching must use observed identities
and admitted source structure. Same-object retained rows do not acquire the edited
row's origin. A skipped memo render cannot supply a new component execution.

Positive acceptance covers creation and repeated real title edits, including a
same-value edit, for the selected row that actually executes and commits. Preserved
rows and filtered/detached targets must retain only justified history or explicit
Unknown/Stale boundaries. Arbitrary nested mutations, Proxy/getter fields, opaque
libraries, unsupported concurrent/rebased updates and missing source are not
complete-path positives. Do not widen support by fallback to equality or time order.

## Fixed acceptance matrix before implementation

| Case | Required result |
| --- | --- |
| Create two different rows with equal titles | Positive complete chain for a newly committed supported row; distinct row/DOM identities, no match by title, array position or closest component. |
| Rename first row and inspect its label | Complete write-to-selected-title chain, exact field write/result/revision/props/read/commit, source navigation works. |
| Rename it again to the same text | New applied write/revision attributed correctly despite unchanged visible output. Both changed and same-value edits must be positive, not merely Unknown. |
| Inspect untouched second row | Must never inherit first row's write; show justified retained origin or explicit boundary. Memo bailout is not a fabricated invocation. |
| Toggle/filter/remove a row | Preserve field-specific origin only if justified; an unrelated completed-field write is not a new title writer. Hidden/detached or replaced selections cannot reuse a live chain. |
| Same-value write through an escaped alias / outside observed interval | Refuse the complete claim unless that exact writer is independently established. Equal final text and an observed reducer are insufficient. |
| Unsupported updater, opaque callback, getter/Proxy or ambiguous producer | Explicit missing edge/refusal; no extra evaluation to fill it. |
| HMR, Stop, reload or missing/collected reference | Invalidate current authority; preserve labelled history without inventing current provenance. |
| Renamed/restructured held-out control of the admitted pattern | Positive chain without application-name, identifier, endpoint, row-value or source-coordinate hardcoding. Fix control inputs/expected answers before implementation; no fallback to fixture ground truth. |
| Original / plugin Off / plugin On | Same app outputs, relevant call/side-effect counts, exceptions and observable ordering; no extra getter/reducer/callback execution. |
| Public product UI and export | Fresh selection/reinspection, readable scoped chain and source links in standalone and official host. Save/reopen preserves the supported chain and missing edges as history, grants no action authority. Research-only DTOs or a source test cannot substitute. |

The masked two-input-condition control from the original A02 brief remains a
negative/partial boundary control unless its separate edges are proven; it is not
silently removed. No native occurrence may be borrowed from an old experiment.
Query/refetch/equal-cache/prepopulated-cache paths receive no new positive credit:
retain existing tests and explicit Unknown boundaries; never invent an HTTP origin
for this local-state scenario. This choice adds no ordinary query/HTTP release claim
and does not delete any independently required existing release coverage.

## Hard mechanism gate and stopping rule

First determine whether the existing machinery can prove a bounded title writer
and exclude an unobserved alias writer for this actual source, plus the exact
state-row → Item parameter/read → committed label connection. A source association
or ancestor queue alone is insufficient. The writer admission argument must cover
actual aliases/callback escapes and code revisions, not rely on the convention
that reducers are usually immutable. Do not freeze application state, replay a
reducer, or change app semantics to obtain the proof.

This gate is currently unresolved. If the ordinary retained source cannot satisfy
it without general ownership infrastructure, report the concrete missing edge and
stop this implementation item. Do not call a Partial result sufficient or replace
the independent app with an easier fixture after results. Another release-scope
decision would then be explicit, not assumed by this document.

Reuse records113/141/177/191/202 only within their exact recorded boundaries.
Research strong-reference retention from191/202 is not approved product memory
policy. Native209 and276 remain INCOMPLETE with exhausted budgets. A new native
qualification requires an actual changed mechanism and separately frozen inputs;
this scenario neither reopens those runs nor proves current plugin semantics.

## Completion and next item

A02's bounded state pattern is complete only after the positive and refusal cases
above, normal open-plugin setup, actual packaged UI/export and semantic controls
are evidenced on the declared candidate. Other A02 query claims remain explicitly
unsupported unless separately proven; all other mandatory release tasks remain.
No new benchmark, model call, SDK, redesign, publication or other-repository change
is part of writing this specification. Whole-task count remains21/29.

Next ONE source-only item: map the admitted reducer title write and its aliases,
then identify the exact missing Item parameter/read/commit edge using current code.
Produce a finite implementation decision or a concrete stopping-point report before
any new browser campaign. This document is the scenario, not its implementation.
