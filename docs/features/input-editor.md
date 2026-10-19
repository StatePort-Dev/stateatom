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

## Response ledger contract (U02.2a)

`core/response-ledger.mjs` is an inert document-bound library, still outside the
bundled runtime. It records at most 128 scalar sites/URLs and 64 edit/restoration
transactions. Future response preparation is bounded to 32 simultaneous receipts
and 128 lifetime receipts; it refuses further delivery preparation rather than
silently dropping earlier acknowledgement evidence. Bodies are bounded to 256 KiB
before and after substitution, 4096 JSON nodes and depth 12. Unsafe keys, null,
structural leaves, negative zero and oversized strings are not writable inputs.

A resource descriptor's value is the current prospective rule value (or raw server
value when no rule exists), not a fresh observation of application state. The
snapshot separately retains `serverValue`, rule phase and unknown consumption /
effect. Subsequent requests must be same-origin GETs in the same document, with
increasing observed request ordinals. Every guarded leaf in one response must
still match its originally observed server scalar; a change/missing leaf disarms
the entire response group before substitution. This is a future-response rule
with a value guard, not evidence that two requests are the same occurrence.
The runtime adapter must independently establish main-frame ownership, MIME and
current authority before using this library; those are not facts a plan can grant.

Delivery receipts record exact request ID/ordinal and adapter acknowledgement.
Repeated deliveries retain earlier successes even if a later send fails. Groups
across different responses report partial success/failure; they are not atomic.
Undo-last restores a prior owned rule, while baseline removes the rules. Both
wait for a later explicitly triggered response and keep application restoration
unverified. A later untouched baseline response can be acknowledged separately.
External scalar changes, even a subsequently observed return to the original scalar,
prevent restoring the old baseline over a new server revision. Close disarms
rules, retains pending receipts and records late acknowledgements without reviving
authority. No resource/history metadata is restored as executable authority.

## Backend lifecycle findings (U02.2b)

The source now has guarded `inputs-open/read/apply/undo/baseline/close` operations,
owned future-response coordination and native property refreshes. Old execution
analysis becomes Stale when quick editing starts; reading unchanged editor facts
does not emit another invalidation. Source generation and native document/node
are checked independently; no full application-build attestation is available, so
this backend keeps `target.build = null`. Readonly summaries persist before
mutation replies. Summaries and old request metadata cannot restore executable
rules, current editing resources or debugger ownership.

Native .15 revealed that Chrome reports the same actual request as Network.Fetch
and Fetch.requestPaused XHR. .16 accepts that pause label only for the exact
independently recorded Network.Fetch ID/frame/GET/URL; actual Network.XHR remains
unsupported. Original .15 failures and packet identities remain retained.

Native .16 passed standalone response effects, masked unchanged target, second
blocker, actual selected text/disabled changes, Unicode/number groups, undo,
baseline and external-revision refusal. Its active-Fetch worker-stop scenario
FAILED: the restarted worker correctly lacked authority, but native Fetch stayed
active and the next request waited indefinitely. No embedding pass followed.
This disproves interruption readiness; prior test counts do not override it.

.17 therefore refuses response mutation with `UNSAFE_LIFECYCLE` unless the trusted
host provides a worker-independent debugger owner. The current in-memory broker
reports false; request metadata cannot forge this capability. UI Live/Draft flags
remain unavailable. An intercepted Network body is not relabelled an original
server value for a later investigation. After worker restart, editing metadata is
removed; new original application requests must be collected explicitly.

U02.2c is the next newly discovered implementation dependency: establish resource
ownership outside the worker being stopped, while preserving actual foreign
lease refusal, inspector disposal and worker interruption cleanup. This is not a
previously approved host architecture. First test native extension-document
lifetime in an isolated synthetic fixture; choose the smallest viable owner from
that evidence. No SDK, other repository mutation or publication is authorized by
this dependency. U02 and Task 2 stay in progress.


U02.2c.3 subsequently establishes the scoped .20 response/native owner backend;
see [its retained interruption results](response-resource-owner.md). The next
[U02.3a native ledger](native-control-editor.md) passes 51 focused / 844 full source
checks but is inert and unbundled. Actual native-control events, both field modes,
inspector-owned close/reopen and majority acceptance remain unfinished. Task 3b
supplies that adapter; field catalogue coverage stays 0/18 in each mode.


U02.3b.2 subsequently delivers the installed .22 native-control adapter/controller:
66 focused / 889 full, 25 two-host native, 15 response, 8 guardian checks, 2 strict
consumers and 7 admission controls pass. Backend source selection is explicit;
there is no implicit change between native controls and JSON responses. Native
acknowledgements retain Unknown consumption/effect and external revision refusal.
The next bounded slice is Task 4's actual fields, both modes, draft preservation
and inspector-owned lifecycle. These backend results do not credit field-mode
catalogue rows or turn on Live/Draft feature availability.
