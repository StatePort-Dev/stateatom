# V02.35 publication follow-up coalescing design

Purpose: reduce redundant asynchronous recording publications under overlapping
storage acknowledgments. Diagnostic269 sampled the exact publication/storage path;
it did not prove original overhead cause or storage-call counts. User delegates
bounded technical decisions/autonomous execution; no separate design-question round.

Current helper defers first dispatch16ms, then a dirty flag during persist causes an
immediate while-loop retry. Collector updates already happen synchronously in runtime,
separate from publication. Runtime.persist independently repairs epoch races; its
underlying storage operations cannot be equated with helper invocations.

Approaches considered by executor: retain immediate follow-ups (least publication
latency, repeats work on burst acknowledgments); schedule each dirty follow-up through
the existing16ms scheduler (chosen, single flight/dirty flag/task, reads current state
later); drop/reduce records or alter workload/acceptance (outside scope). No founder
approval of a new Live cadence/grant/handoff choice is implied. Cost of chosen approach:
a dirty follow-up gains another nominal16ms scheduling wait; no hard timer guarantee.

Only change observation-publisher.mjs. After each completed persistence attempt:
notify only if clean; if a new dirty request appears during save or notification,
schedule exactly one next run and retain the SAME flight Promise. Clear flight before
resolve/reject. Retry after a failed save only when there was a new dirty request;
otherwise reject its exact error. Scheduling failure at any turn rejects/resets and
permits a future request. Read current state in persist, never store snapshots.

Keep reentrant/synchronous test schedulers, independent owners, queued disposal,
direct Stop/Clear/revoke/limit writes and runtime epoch repair. No core collector,
limits/schema/evidence/privacy/permission/API/wire/UI/token change. Add deterministic
helper controls and a real-runtime synthetic-native storage-operation control; preserve
all existing semantic checks. If old test waits assume immediate dirty follow-up,
replace only that scheduling assumption with bounded observed completion; keep exact
record/gap/write/notice assertions. Native results remain immutable and unpromoted.

RED→GREEN plus affected runtime/history/UI controls/full suite, one bounded final
source review and local commit. No browser/model/native/performance rerun or other
repo change in this slice. Current88build remains old until separate89pack/intake.
