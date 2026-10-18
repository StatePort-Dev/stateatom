# Two-site native Query call census

This follows [native handoff acquisition](2026-10-18-query-handoff-progress.md).
Revision remains `bcde3d0f1572878df662db6bab79e65bc66dd6d0` plus run-specific dirty
input manifests. Original P2/P1, old spike and full-path criteria are unchanged.

## Accepted restricted observation

`queryCallCensus:true` is default off and requires `queryHandoffs:true`. Three native
body frames cover Client.setQueryData, Cache.build and Query.setData, but **only two
call sites** are classified: the client's cache.build and following query.setData.
This is not a census of all nested callees or an effects engine.

Original member callee chains remain unchanged. Descriptor-only historical
eligibility is checked on branded ordinary native instances/prototypes, without a
second method getter. Actual build client/default-options operands, returned Query,
setter data and ready options identities must match the same owner frame. An
args-ready marker runs after the original options object/spread evaluation.
A native call from a getter cannot consume the later original invocation token.
Unknown historical callee eligibility stays Unknown even when a wrapper invokes
the native body with the same operands. Preflight/args-ready alone is not an
invocation. Parent means **nearest observed native frame**, not immediate JS caller.

Body returns and abrupt exits are separate; finally cleanup, weak references and
bounded retention deny missing/overflow/stop. No keys, payloads, callbacks or raw
state/query objects cross the census output. Every record explicitly leaves other
callees, effects, alias lifetime and current-field ancestry unknown. `fullPath:false`
remains mandatory. Nothing here is integrated as panel provenance or new store support.

## Checks and retained counterexamples

```sh
QUERY_CALL_TAG=<unused> npm run verify:query-calls
QUERY_CALL_TAG=<unused> npm run verify:query-calls -- --without-react-state
```

Native `two-site-first-20261018` passed **16 checks**, including 13 off/on control
cases, unchanged original P1=13/P2 disabled=false/P3=15, both original site relations
and stop. Inputs stable, errors empty. `two-site-query-only-20261018` separately
passed the same **16 checks without React state observation**, including actual
parsed consumption identity. Records are in `.runtime/query-call-runs/<tag>/results.json`.

The original nested Query.setData wrapper still writes quota=12 while preserving
the public method and returned/stored object. Its native body is observed; the
monitored call-site relationship is **Unknown**. A build wrapper/getter and method
getter likewise cannot borrow a nested native body. An options getter produces two
distinct native setter entries (Unknown before ready, Observed after ready), one
getter call and the original three state updates. Throw/noncallable paths retain
original errors and clean frames. Callee ABA during argument evaluation keeps the
historical callee fact, not a post-call method snapshot.

Functional updater, custom sharing and a later alias each really write the same
field. Some still have Observed native call-site relations: this demonstrates why
those relations do **not** establish readonly effects or a field's HTTP version.
A synchronous listener reentry remains a distinct invocation. These are negative
controls for proof limits, not support successes for their effects.

Read-only review found no concrete blocker in this restricted scope and ran
16 focused model/bundle checks (including the 13-case real pinned-bundle comparison),
not another native/UI run. A further RED/green genuine-Response regression fixed a
Query-only configuration gap: consumption IDs no longer depend on React state
observation being enabled. The direct mode is now also verified natively.

## Separate product evidence

`.runtime/query-calls-regression/pipeline.json` records **8 source-consumption**,
**29 prior native Query handoff**, and **19 actual panel/IDE/review/export/offline**
checks, all exit 0 with stable manifests. The latter uses the supported state/write
UI path; it is not a UI demonstration of the new census. Its intentional negative
fixture warnings remain. Earlier marker/short-loop/browser/IDE/independent results
remain their own revision-specific evidence and are not relabeled as fresh runs.

## Following bounded work

Current field ancestry still lacks complete writer/effect and alias-lifetime
coverage, compatible with captured code history. The next bounded writer experiment
will assess an in-place **pre-operation receiver guard**: conservative invalidation
for computed/logical/class/await property write forms that existing completion
instrumentation excludes. It must preserve each original receiver/key/RHS/getter
and evaluation order, distinguish a potential access from a completed write, and
never infer no writes from incomplete source/native coverage. This is a prerequisite,
not a readonly certificate or a second resolver. Original deep families remain 0/6.

## Frozen candidate and agent-operated acceptance

The final root suite passed **230 tests**; full build passed. Logs:
`.runtime/query-calls-query-only-{unit,build}.log`. The Query-only consumption fix
has a retained RED/green control and the native no-React-state run above.

`/tmp/stateatom-query-calls-candidate-20261018` contains **216 regular source files**,
preserved executable modes, no inherited runtime/build/dependency tree, Git history
or old spike. Dependency settings and exact lockfile match the preceding public
fresh-cache install; that verified public cache was reused for a **separate fresh
offline npm ci**, rather than downloading unchanged packages again. The new copy
passed 230 tests and full build; **all 34 outputs** match the root frozen candidate.
Bootstrap source/mode/output manifests and commands:
`.runtime/candidate-bootstrap/query-calls-final-20261018/`.

From the copy, **19 actual UI/IDE/review/export/fresh-offline checks** and a separate
**16 native call-census checks** passed, stable inputs, errors empty, revision null
and source archive recorded. Commands/exit statuses:
`.runtime/query-calls-regression/acceptance-pipeline.json`. This user-authorized
fallback is **agent-operated**, not independent human/manual/Store acceptance.
Allowlisted synthetic exports, screenshots and manifest:
`.runtime/preview-acceptance/query-calls-accepted-20261018/`; no profiles, pairing
credentials or raw IDE logs were included. All 1,527 historical and 241 original
short-loop hashes match again. Later report/design-only additions are outside the
frozen source snapshot. Subsequent writer work must keep its evidence separate.
