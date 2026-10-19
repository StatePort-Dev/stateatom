# Typed input editor — U02 working design

This is the implementation design chosen during the explicitly autonomous run
starting 2026-10-19. The approved scope is U02 in completion/04, scope-review-1.
The details below are new working decisions, not previously approved answers.
An implemented subtask does not complete U02 or advertise Live/Draft capability.

## Registered scope and counting

`../completion/u02-input-catalogue.json` registers 18 representative ordinary
input sites/families before implementation. Eleven are targets for both Live and
Draft/Apply; seven explicitly lack a supported safe update path. The majority
gate is strictly more than half of all 18 rows, each counted once, verified in
both modes with real effects/undo where supported. It is a bounded catalogue,
not a claim about most values in arbitrary applications. Repeated boolean leaves
do not replace text, numbers, native controls or lifecycle cases. Unsupported
rows remain in the denominator. Acceptance records actual support against every
row; a planned adapter or installed response rule is not a passed row.

JSON response leaves and native form controls are different resource kinds.
Observed response presence does not establish selected-property dependency.
Observed state, props and hook values never become writable automatically.
Null without a declared nullable value contract stays read-only; no inferred type
change is authorized. Structural arrays/objects and generic eval stay unsupported.

## Plan and preconditions

`core/experiment-plan.mjs` defines an inert versioned ExperimentPlan. Each plan
names an investigation, mode, exact selected target, resource identity/revision,
original scalar and proposed scalar. Target includes tab, exact origin, run,
native document/node, selector, property, value, observation time and nullable
build identity. Unknown build identity stays null, never a fabricated known build.
Runtime must supply fresh target/resource facts and current admission immediately
before mutation. The library compares those facts; the request never grants its
own permission. Importing a saved plan cannot execute it or unlock production.

Resource keys are unique within a plan. JSON locators bind an observed GET
request, exact URL and a validated RFC 6901 pointer; native controls bind exact
document/node/selector/control kind and, for select, the observed option set.
Only finite JSON-stable numbers, bounded strings and booleans are writable initially.
Negative zero is explicitly refused because JSON transport would erase its identity.
No getters, user expressions or skipped branches are evaluated by the contract.
Plans are bounded to 32 changes and 64 KiB and reject unsafe tree keys.

Plan phases distinguish prepared, installed/applied, waiting, consumed, effect
observed, failed and restored. The initial contract does not implement phases or
an adapter. A response rule is waiting for the next matching response; delivery
alone is not proof of application JSON consumption or selected-property effect.
Direct control updates use the supported native input event path and actual
state observations, never a copied React setter or store-internals write.

## Modes and cleanup

Working timing choice: booleans/select commit on change. Valid text/number edits
coalesce for 250 ms; blur/Enter flushes a valid pending edit. Invalid intermediate
text remains local. This timing is a U02 decision, not a statement of prior
approval or a performance acceptance result. Mode switch keeps outstanding drafts
explicit and never submits them. Both modes share the same guarded operation.

JSON rules do not silently reload, clear storage or initiate backend requests.
Already consumed data remains unchanged until a visible separately authorized
refresh/request. An optional explicit refresh names its consequence. Native input
events can run application handlers; server consequences are outside local undo.
Capture one investigation baseline and an ordered edit ledger. Undo checks the
current resource revision/value and cannot overwrite a new external revision.
Groups report per-resource results and compensation; atomicity is adapter-specific,
never assumed across response/control kinds. Cancellation leaves no hidden rule.

Live effects are Observed, pending or inconclusive. The legacy repeated
baseline/intervention/rollback/control and masked two-blocker criteria remain the
only separate path to their scoped Experimentally verified result.

Production remains read-only. F05 will supply its two Settings confirmations and
define grant lifetime/scope; U02 does not choose those policies or invent a bypass.
F05's enabled-path acceptance is recorded in F05, after this local implementation.

## Delivery slices

1. U02.1: preregister catalogue and pure plan/type/revision contract, tests, commit.
2. U02.2: investigation ledger, response rules and guarded install/consume/undo.
3. U02.3: native control adapter and external-revision behavior.
4. U02.4: existing 440px reference-based field UI, both modes and acknowledgement
   ordering; optional bounded corrections as evidence requires.
5. U02.5: immutable packed-host native matrix and actual catalogue coverage,
   retained causal controls, final task acceptance and local commit.

The supplied Atom Inputs/Draft/Applied/Restored and API Fields/Changes screens
govern composition. Shared tokens/primitives stay unchanged. No cloud, SDK,
publication, other repository or replacement design is included.
