# A02 — original reducer field-definition capture prerequisite

28 October2026, base489ab97, approved282/autonomous remaining release execution.
This is a new finite mechanism after283's characterization; it is not a replay of
closed native209/276 or a complete writer/ownership/selected-value implementation.

## Implemented

`src/engine/reducer-field-writes.mjs` exports compiler-only
`instrumentReducerFieldWrites(source,file,{binding,field,observerName})`.
It recognizes a unique immutable synchronous two-parameter reducer binding and
ordinary explicit object-literal field definitions whose original initializer is
a member path rooted in the actual action binding. Input names/paths/field values
are parameters, not a TodoMVC-specific resolver or fixture oracle.

The completed original object expression becomes an argument to a collision-free
private helper. The helper calls a supplied **trusted synchronous** observer with
source-site metadata and the exact original object, catches synchronous observer
failure and returns the original object. No initializer/getter/reducer is replayed;
failed original construction emits nothing and preserves its thrown value.
The observer is a future compiler-integration input, not installed/global product
API. Asynchronous/untrusted observers are outside this primitive's contract.

Code-linked metadata includes source SHA256, original position, literal span,
field and action path; it does not serialize application values. Unknown/refusal
returns the original source unchanged. Action reassignment/shadowing, duplicate or
computed keys, accessors, prototype definitions, post-field spreads, opaque value
calls, helper collisions, dynamic eval and unsupported/oversized input refuse.
Limits2MiB input/64sites/12path segments are internal recipe bounds, not Live policy.

## Actual source evidence

18new initial tests all RED because the module was absent, then18PASS. Two further
integration/branch controls yield20new and **115affected PASS** across the recipe,
existing source-write/write-access and React19 acquisition suites.

- Original retained reducer source matches frozen corpus manifest; its two title
  definition sites (create/update) are admitted without fixed names or line IDs.
- Actual retained reducer + its original constants execute in a Node VM after
  standard existing esbuild module conversion: create and same-title update each
  deliver exactly their returned new row reference. Toggle changes completed and
  emits no title-write capture. This is actual app-module execution in a source
  harness, not native React/browser/committed-DOM evidence.
- Held-out renamed function/action path/field fixed in tests before implementation
  is admitted. This proves only compiler structural independence, not full282's
  held-out selected-lineage acceptance.
- Getter count1, spread→field→tail→capture order, original thrown-object identity,
  no capture on failed construction, observer-failure isolation, unchanged row
  identity, nested helper-name collision and skipped branch all checked.
- Refused forms retain source byte-for-byte and no admitted sites.

Artifacts `.artifacts/a02/reducer-field-writes/2026-10-28/`: red.log,
green-initial.log,affected.log,full.log. Full `npm test` actually passes
**6063/6063,0fail/cancel/skip**,162344.717777ms, exit0, with the same authorized
local subprocess/FIFO/loopback environment as284.

## Remaining authority / integration

This source recipe is not wired into the public plugin, observer or Atom package.
Its result deliberately has fullPathfalse and fieldOwnershipUnknown. Capturing a
literal does not prove a reducer call was applied, the row belongs to its resulting
state, there were no intervening writes, or a selected Item consumed that field.
Ignored/aborted updates and delayed nested callbacks must not get applied credit.

Next bounded mechanism: a private runtime receipt for the exact created object,
joined to the actual applied state/row and revision; separately establish finite
source/alias admission across App/Main/Item/Footer and known native boundaries.
Existing `sourceUses` reports props/callback/container escapes and existing
`guardPropertyWriteReceivers` explicitly says completeWriterCoveragefalse. Neither
is silently promoted to a no-writer certificate. Unknown main-world code and gaps
must invalidate complete claims; current ordinary route still lacks that admission.

Do not claim general ownership impossibility or closure of282's stopping rule
merely because it is not yet implemented. No new native collection, strong-retention
policy, package, performance/model result or release acceptance. FullA02 remains
open and whole21/29 unchanged. Bounded source prerequisite complete after the review below.

## Final review and correction

One read-only review:0Critical/1Important/0Minor. Configured observer names
`metadata`, `value` and `_stateatomFieldWrite` could collide with helper locals;
`arguments` resolved to the helper implicit binding. Four regressions reproduced
the fault (20PASS/4FAIL in review-red.log). Private identifiers now avoid the
configured observer name, and `arguments` refuses unchanged source.

After this single correction pass: **119affected PASS** (review-green.log); full
`npm test` **6067PASS,0fail/cancel/skip**,161188.949466ms,exit0
(review-full.log). No native replay or second review. This supersedes the initial
source check counts only; native, ownership and release boundaries above remain.
