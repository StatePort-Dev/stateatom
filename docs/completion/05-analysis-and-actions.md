# Property analysis, handlers and hooks — implementation plan

**Goal:** extend useful ordinary-session analysis without presenting a closed fixture proof or static candidate as universal runtime provenance.

**Architecture:** retain current source markers, browser observations, React/Query handoffs, source slicing and claim-level evidence. Add supported relations at their existing boundaries. The closed first-read verifier remains isolated and unchanged until a separately reviewed extension of its argument exists.

**Tech stack:** current Babel/TypeScript parsing, open dev transform, framework adapters, CDP and native test harnesses.  
**Spec:** [release contract](02-release-scope.md), existing Actions specification [R27], current finite trace [R07][R08].

## Existing strengths and limits

The current inspector has useful source/value fragments on independent applications. It also has one strong but deliberately closed full-lineage profile. The Action Inspector resolves lexical handlers and specific callback-producing hook forms; no observed call path is implemented. These are three different capabilities, not interchangeable versions of one proof. [R07][R09][R10]

## A01 — Ordinary React property and occurrence support

**Depends on:** F03, U01 and U05.  
**Produces:** a documented supported grammar and ordinary-session property/source/read relationships on real React dev applications.

**Files:** `src/engine/plugin.mjs`, `script-transform.mjs`, `observer.mjs`, `react-host-vendor.mjs`, `browser.mjs`, `slice.mjs`, `core/analyzer.mjs`, `core/runtime-state.mjs`, and their existing engine/React integration tests. New coverage fixtures go under `tests/fixtures/inspection/` with a separate expected-result matrix.

Work:

- Register cases for direct/destructured text, transformed boolean condition, a prop passed through a component wrapper, two instances, form changes, a skipped operand, and HMR. Include immutable and overridden JSX props.
- For each case document the chain needed to answer the question: selected committed host property → source binding → original reads. Do not borrow the nearest component's marker or a same-named function as a producer witness.
- Separate source version, compilation version, component instance, render/commit occurrence and observation generation. Source access alone is not instrumentation or a committed-value witness.
- Extend the existing marker/host-prop mechanism only for supported source forms and tested framework versions. A wrapper/prop override that loses identity must give a specific boundary.
- Support repeated normal user updates, not just first render. An old observation stays historical; new reinspection must bind to the current target or report why it cannot.
- Keep the current no-extra-execution rule. Preserve getters, receivers, function identities, exceptions, Promise scheduling and short-circuit behavior. Never force all operands merely to fill the UI.
- Present ordinary source/read fragments without calling them a full HTTP path. Keep `dev:first-read` and its finite proof visible as a separate optional profile.

**Test cycle:** each new supported pattern has a positive case and a same-output counterexample: duplicate text, a replaced prop, same-value writer, different row instance or stale generation. Compare instrumented/off runs for outputs, side-effect counts, original exception and Promise behavior. Test actual source edits/HMR, not only an emitted watch event.

**Run:** affected unit suites; `verify:react-host`, `verify:react-host-ui`, `verify:short-loop`, and `verify:independent` for retained controls. Add fresh independent questions before modifying the resolver for them. Run the finite-profile suite as regression when shared observer/compiler code changes.

**Done:** the documented ordinary dev workflow answers the registered questions on an independently structured project without controlled-launcher prerequisites. Its limitations are explicit and the original finite result is neither weakened nor reused out of scope.

## A02 — Supported query/state lineage beyond the closed first read

**Depends on:** A01.  
**Produces:** explicitly versioned producer/consumer edges for a bounded ordinary state/query pattern, including repeated reads and refetches where supported.

**Files:** `src/engine/query-handoff.mjs`, `query-calls.mjs`, `query-vendor.mjs`, `react-state.mjs`, `observer.mjs`, `core/fetch-bindings.mjs`, `core/code-journal.mjs`, existing query/state integration tests. Read `src/first-read/` only as the retained proof boundary, not as a fixture-specific shortcut to generalise by renaming identifiers.

Work:

- Choose one real query/state usage from the independent project corpus and register the admissible pattern before implementation. Start from an explicit producer write and a later selected consumer, not equal values or the most recent URL.
- Carry exact response parse/root identity, exchange identity, JSON pointer, cache/state revision, transformation, selected read and committed target where available. Every edge has its own acquisition method and invalidation conditions.
- Distinguish original source ancestry from a later local overwrite. A same-value overwrite still changes origin. Refetch completion order does not determine which version a render consumed.
- Define the mutation/alias boundary needed for a complete claim. Observed writes alone cannot prove that no unobserved writer existed. Use a bounded supported ownership/effect argument or report the missing edge; do not relax the existing finite-verifier criteria.
- Handle pre-observation cache data as an observed current value with unknown earlier origin. Never synthesize an exchange for it.
- Add one repeated-render/refetch case and one masked two-input condition. Keep conditional paths, opaque libraries, unsupported mutation and missing observation intervals explicit.
- Produce a useful partial path when exact ancestry cannot be established. This is still useful UI, but it does not pass the complete-lineage requirement for that registered case.

**Test cycle:** initial load/refetch/out-of-order completion; local same-value write; selector transformation; two cache entries with equal values; two component instances; pre-populated cache; a write through an escaped alias; unsupported functional update; one unchanged control. Each claimed complete case must have a counterexample the implementation refuses or correctly reattributes.

**Run:** existing `verify:query-handoffs`, `verify:query-calls`, `verify:react-state`, applicable write-access checks and actual panel/export checks. Preserve `verify:first-read-query`, `verify:first-read-session` and `verify:first-read-ui` for shared changes. Do not rerun every historical compiler experiment unless its mechanism changed.

**Stopping point:** if the selected usage needs an unimplemented ownership mechanism, document its exact missing input and a finite next experiment. Do not spend the entire product cycle adding new general proof infrastructure. The complete-lineage gate stays open; ordinary source/read capabilities can ship with their own scope.

**Done:** the registered ordinary query/state pattern has a supported, repeatable selected-target lineage, or the task produces a concrete unresolved mechanism and explicitly does not claim completion. Positive coverage must not depend on special application names, endpoints or ground-truth hints.

## A03 — Practical handlers and relevant hook relations

**Depends on:** A01.  
**Produces:** useful application action paths for common component abstractions, with bounded native registration context.

**Files:** existing `core/action-analysis.mjs`, `core/action-native.mjs`, `packages/atom/src/action-ui.mjs`, diagnostics/reader, and Actions tests.

Work:

- Extend the current source resolver by supported cases, not a new whole-app call graph. Prioritise a forwarded handler prop, a same-project object method with a known data property, and a custom hook/composable returning a callback used by the selected element.
- Track where a callback is supplied, transformed and finally bound. Member access, getter, dynamic dispatch and spread overrides must not be executed to discover a name.
- Derive labels from source symbols and original expressions. When the actual function is anonymous, show its expression/location; do not invent a business name.
- Keep `creates-callback` and `returns-handler`; add `reads-hook-output` or `provides-value` only when a code path for this selected action/property is established. The component's entire hook tree is not a dependency list for one button.
- Native listeners retain registration target, capture/passive/once and source coordinates. Extend ancestors only with bounded, correct event-path semantics. Distinguish document/ancestor delegation from a direct application handler, and label gaps for window, shadow roots and portals.
- Freshness covers selected instance, source revisions and replaced listeners/props. A registration snapshot does not prove that a callback later ran.

**Test cycle:** direct/alias/import/inline cases retained; prop forwarding through a wrapper; useCallback alias; object method with a getter counterexample; two hook instances; callback replaced after render; capture vs bubble; stopPropagation scenario; disabled button never invoked by inspection; absent source. Keep existing Vue failures until A04 introduces separate positive assertions.

**Run:** `npm run verify:actions`, Basic and IDE regressions, plus the current packed embedding action scenario. Report source-binding, native-registration and invocation evidence separately.

**Done:** a user sees the supported application function or an honest expression/boundary, opens the matching source and understands which hook relation is relevant. “Handler called” remains unavailable until A05.

## A04 — Positive Vue support and framework capability matrix

**Depends on:** F03, U01, U05 and A03; shares source contracts with A01. The real-library positive property path is mandatory, not satisfied by an opaque-store refusal.  
**Produces:** a small positive Vue property/action workflow, retaining Basic for other frameworks.

**Files:** existing Vue handling in `src/engine/plugin.mjs`, `script-transform.mjs`, `browser.mjs`, `core/analyzer.mjs`, `core/action-analysis.mjs`, `browser-extension/adapters.js`, `tests/vue/`, Vue fixtures and native workflows. Put framework-specific source bindings behind a small adapter function; avoid a marketplace or generic adapter DSL.

Work:

- Define source bindings using the existing Vue compiler/SFC data rather than parsing a `.vue` file as TypeScript. Track the actual selected instance, not only a component name or `__file`.
- Support a direct template binding, computed condition, ordinary event method and a callback returned by a composable. Connect to the relevant reactive observation where available, while separating component render dependencies from the selected expression.
- Add repeated normal updates and two-instance tests. Preserve unsupported aggregate text, implicit operands and dynamic template cases until they have their own verified implementation.
- Test a Vue application that uses real application state/data infrastructure. Do not replace its store with a transparent test-only version to make the graph pass.
- Publish a capability table by framework/version/mode: Basic, source navigation, selected reads, handlers, native registration, experiments and lineage. A detected framework or passing negative control is not support.
- Keep ordinary JS/Web Components Basic cases. Deeper Angular/Svelte support is a later adapter task selected from an actual user case, not silently promised here.

**Test cycle:** positive source/read/action cases, aliases/composables, stale source, two rows, replaced handler, an opaque store boundary and the previous PARTIAL controls. At least one native Vue UI-to-source test must pass without reusing React markers or a prepared answer table.

**Run:** existing Vue unit suite through `npm test`, extended `verify:short-loop`, a new Vue source/action native scenario and Basic regressions.

**Done:** published Vue rows are backed by positive real UI results and named limits. The old PARTIAL records remain intact; the new matrix is additive.

## A05 — Required bounded Action Trace

**Scope:** mandatory O02 for the completed baseline. Source-only Actions may ship in a clearly narrower preview.  
**Depends on:** A03 and U05, with the F02 observation policy. Observing a user action does not depend on enabling input mutation.  
**Produces:** an explicitly armed observation of one real interaction and a bounded trace with separately justified effects.

**Files:** add `core/action-observation.mjs` and a narrow native test entry; extend existing observer/plugin and runtime/action UI only where needed. Use the same evidence store, identities and permissions.

Work:

- Begin with supported synchronous handler entry/exit and actual event/instance identity. The user performs the real action; the inspector does not invoke a handler during selection.
- Distinguish binding, registration, dispatch and invocation. A click timestamp followed by a request does not establish call causality.
- Attach original source locations to actual entries when instrumentation or a tested native mechanism supplies them. An extra debugger pause, wrapper or callback must not silently alter application behavior.
- Extend to an async continuation/state update/request only after a causal carrier is observed through supported boundaries. Detached/background work stays unlinked. Do not patch all Promises or add reactions indiscriminately.
- End collection after the selected interaction budget. Capture no credentials, input secrets or unbounded argument/closure snapshots. Clearing the trace does not undo the user's application action. Production starts read-only: the user performs the action and Atom observes; the F05 mutation grant is not needed for observation and does not make additional causal links true.

**Test cycle:** capture/bubble/delegation, disabled control, handler throws, async continuation, concurrent unrelated request, rerender/replaced handler, cancellation, and a trace gap. Verify outputs, exception identity, scheduling and side effects against observer-off.

**Done:** the UI can truthfully distinguish “could call” from “was observed calling” for the registered cases and separately identify established consequences or their missing link. No general async/network causality claim follows from synchronous success. Failure of this bounded gate leaves O02 incomplete; it cannot be removed from the completed baseline by calling it optional.

## Review focus

The costly errors are wrong instance/source attachment, promoting static candidates to executed paths, losing origin after same-value mutation, re-evaluating code for convenience, and claiming a framework through negative controls. These cases belong in positive/control pairs, not only prose limitations.

[R07]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/roadmap/2026-10-18-closed-first-read.md "Accepted closed first-read scope"
[R08]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/testing/first-read.md "First-read operating constraints"
[R09]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/testing/action-inspector-validation.md "Action Inspector validation"
[R10]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/core/action-analysis.mjs "Action source resolver"
[R27]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/features/STATEATOM_ACTION_INSPECTOR_LOCAL_AI.md "Action Inspector feature specification"
