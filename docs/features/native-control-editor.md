# Native controls — U02.3 working contract

This refines Task 3 of the existing U02 plan during the authorized autonomous run.
These are new implementation decisions, not earlier scope approval or evidence
of shipped controls. Source base: 8114610. U02 remains in progress, 0/18 rows in
either field mode. No generic state/props/cache writer is introduced.

## Bounded slices

3a implements an inert native-control ledger with model tests. It cannot execute
Chrome, events, page expressions, refresh or undo by itself. 3b supplies the actual
native observation/write adapter, runtime integration and real React/Vue/native
controls. Both field modes and inspector-owned close are still Task 4/5 work.

## Resource and observation contract

Use the existing ExperimentPlan native descriptor: document/node/selector,
text/textarea/number/checkbox/select, typed scalar and observed unique options.
A trusted adapter supplies fresh native occurrence and revision tokens; the
request cannot supply authority. Disabled/readonly/unsupported controls are
reported by the adapter separately and cannot become writable resources.
At most 32 native controls and 64 transactions per investigation; one batch at a
time, at most 32 changes. No new denominator or catalogue row is introduced.

A revision must account for the observed value, options and native input/change
sequence. Eventful A→B→A and same-value events invalidate an earlier undo guard.
Arbitrary unobserved programmatic writes without events have no comprehensive
revision guarantee; do not promise whole application-state rollback. The actual
adapter must document its acquisition limits and preserve missing/unsupported
paths. A native acknowledgement is not a proven selected-property dependency.

## Pure ledger interface (3a)

`createControlLedger({investigationId,target})` creates current in-memory state.
`observeControls(resources)` validates a complete bounded set of native descriptors
before updating it. Missing/replaced controls and changed native revisions become
external changes, including equal values with different revisions. It returns a
copied snapshot. Observation during a pending batch is refused.

`prepareApply(plan,{target,admission})` validates all members and the exact current
plan target/resources before reserving one opaque receipt. It returns the ordered
`changes` and transaction metadata; no resource value changes yet. Mixed response
resources are refused here; any cross-adapter orchestration remains explicitly
non-atomic. A duplicate plan is refused. Read/inject/replay grants are independent
runtime facts, with production policy owned by F05.

`confirmControl(receipt,{resourceId,status,after?,error?})` accepts each ordered
member once. `applied` requires a fresh exact same native occurrence/type/options
and the requested scalar, with a new native revision. `failed` means the adapter
confirmed no write; `unconfirmed` retains possible effects and taints this
investigation against further writes/undo. It never fabricates non-delivery.
`afterClose` records when an acknowledgement arrived, not an inferred physical
write time. Closing after an earlier acknowledgement does not relabel it late.
The adapter must check per-member freshness immediately before the actual write;
preceding handlers can change later members after group preflight.

`finish(receipt)` records the bounded batch. Remaining unattempted members become
failed/unattempted, never successful. Applied members enter ordered local undo
history; groups are non-atomic and report each result. No automatic compensation
runs application handlers a second time. Preparation and acknowledgement are
separate from observing the selected property's later effect.

`prepareUndo({target,admission,expectedRevision})` prepares the previous owned
values of the last applied batch. `prepareBaseline(...)` prepares the original
owned values across edited controls. Both reject a changed/missing control,
external revision or stale ledger revision before producing any writes. They
use the same ordered acknowledgements and native event path as apply. A completed
undo refreshes the earlier owned guards with its new native revisions, allowing
another undo without mistaking the prior owned undo for an external write.

`close(reason)` removes executable authority immediately and is idempotent.
Late acknowledgements remain historical, including applied-after-close or unknown
outcomes; they never reopen the investigation. There is no hidden native hook or
pending rule in this library and no authority reconstruction from snapshots.

## Native adapter obligations (3b, not implemented by 3a)

Read exact native control properties through browser built-ins in an isolated
extension world, avoiding page accessors and framework internals. Preserve native
number/select constraints and supported checkbox semantics. Write through native
control setters/events and observe real React onChange / Vue v-model updates;
never copy a framework setter or mutate a cache queue. Exact selected/native
identity and current permission are revalidated across awaits. Report handler
side effects and local control restoration separately from global application
restoration. Actual inspector cancellation/close must leave no hidden writer.


## 3a verification

The inert library is implemented in `core/control-ledger.mjs`. 25 native-ledger
model tests plus 26 plan tests pass (51 focused); the frozen final full suite
passes 844/844 with no failures or skips. The missing-module RED and exact
acknowledgement/close ordering RED→GREEN are retained under
`.artifacts/u02/control-ledger/`; `verification.json` binds the final inputs.
The earlier 843-check intermediate full run is retained separately; the final
run follows the ordering correction. These are Node model results only.

Exact source/build inputs and packet digests of .20 remain unchanged. The new
module has no runtime importer and is not in that package's manifest. No new
archive, browser/framework write, field interaction or catalogue row is credited.
Next slice is 3b, the actual native adapter and real React/Vue/native controls.


## 3b mechanism choice after native probes

The [bounded native study](../testing/native-control-probe.md) proves the
built-in setter/event path on plain React/Vue and records that a custom isolated
world survives native detach. An extension isolated-world/private-Port probe
subsequently passes four cleanup/identity controls, including actual worker stop.
The new working implementation direction is `chrome.scripting` with native object
identity and independent Port cleanup. The study does not deliver a product
adapter or increase field-mode catalogue coverage. Next: 3b.1 native primitive,
then guarded runtime/ledger integration. No generic Page-world eval is introduced.
