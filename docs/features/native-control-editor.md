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

## 3b.1 source primitive

`packages/atom/src/control-world.mjs` supplies the self-contained function executed
in the extension isolated world. It is not imported by the current Atom runtime.
The native driver injects that exact source into a disposable .20 standalone host
copy with a diagnostic receiver; it is not a packed-control-adapter check.

The explicit versioned protocol opens one private session, reads its bounded
native object map, writes an exact current descriptor, or closes it. A private
Port must receive document-bound admission before a write is allowed. The host
receiver must authenticate native sender metadata and compare the injection
document ID; this slice supplies that receiver only in the diagnostic host. Different
sessions cannot adopt an owner. Scope is the actual main Document and retained
native object references; selector text is not used to find a replacement writer.
A closed Port removes subscriptions and closes the local writer independently.
Partially failed bootstrap and exceptions after the setter also dispose locally:
Chrome's own Port.disconnect does not deliver onDisconnect back to its caller.

Discovery scans at most 4096 elements / 100 ms, registers at most 32 supported
controls and bounds returned resources to 60 KiB. Limits are new implementation
settings, not performance measurements. Unsupported types, readonly/disabled
controls, custom validity, ambiguous options and truncation remain explicit.
Passwords and other unsupported input types are excluded before value collection.
Native built-ins avoid page getters. Detached native controls validate proposals
without temporarily changing the real field. Number step/min/max and enabled
select options are preserved; valid text stays within the 4096-byte scalar budget.

Revisions combine retained input/change events, relevant DOM mutation records and
fresh native value/constraint observations. This is an observation token, not a
complete application version. Suppressed events and unobserved programmatic
property writes can leave missing history; arbitrary no-event ABA is unclaimed.
A handler's nested external event makes the attempted result unconfirmed and
revokes later writes. Already applied values are not automatically restored on
close or worker loss; no global application rollback or causal link is inferred.

Verification on the frozen final source: 6 protocol/import model cases plus the
existing ledger/plan tests give 57 focused PASS; full source suite gives 850 PASS.
20 native source checks cover the synthetic controls and real plain React/Vue:
actual field/validation changes and return, Unicode, native constraints, observed
ABA, option changes, exact replacement refusal, forged peer refusal, controlled
after-setter failure, explicit close and actual worker stop. The partial-bootstrap
failure is a separate Node protocol model, not a native failure observation.
Command: `npm run verify:input-control-world -- <handoff.json>`.
Raw run: `.artifacts/u02/native-control-world/2026-10-19T20-56-22-474Z/`;
exact bindings: `.artifacts/u02/native-control-world/verification.json`.

Retained REDs exposed dictionary key-order comparison, a walker-variable listener
closure, one-sided disconnect cleanup and a text/default-value limit. The fixes
preserve exact resource identity, observed revisions and unknown outcomes. The
prior 17-check intermediate pass is retained; it does not replace the final run.

No new tarball, runtime operation, Live/Draft field interaction, installed native
undo or catalogue row is delivered here. The root package adds only the declared
verification command; .20 packet bytes and bundled runtime sources are unchanged,
while its old build-source receipt still refers to the earlier root command list.
Next 3b.2 connects the private owner, permissions, ledger and actual packed runtime.
