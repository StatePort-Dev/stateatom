# V02.18 — recording publication at an event-loop boundary

Continue main from 1c41015 under autonomous local task/commit authorization until
2026-10-26 20:00 Mauritius. No branch, publication, SDK, other repository, UI,
account, certificate, TLS, browser/profile or native experiment work in this item.

## Evidence and selected mechanism
V02.15 original actualActive/Off26.6442/29.3247% still misses10%; Basic p95
433.8/419.5ms passes1s. V02.6 already measured bare/Network/Debugger configurations;
its Debugger-only ratios do not support blaming Debugger. V02.16 did not show a
Basic read-only Network persistence duplicate; V02.17 is a finite Performance
configuration diagnostic, not approval to change collection lifetime or metrics.
Those results/criteria stay unchanged. Do not repeat any experiment.

Current active recording calls publishObservation for each ledger revision.
createObservationPublisher combines requests ONLY during an unfinished save.
A rapid sequence with quickly resolved acknowledgements can serialize repeated
current-state storage submissions. First demonstrate this with controlled source
calls. Then delay the FIRST save of a flight to the next event-loop task, using
one zero-delay timer and one existing dirty flag/promise per private owner.
This is a bounded source optimization candidate, not a proven cause of native
latency or a demonstrated performance target improvement.

All native events continue to update the ledger synchronously. No event/DTO/history
queue or dropped record, extra browser command, request, clock policy, body read,
permission, domain or metric change. Persist still reads CURRENT bounded state.
Dirty updates during a save trigger the existing follow-up; notices occur only
after settled current save. Stop/Clear/context/permission/limit writes remain
independent and immediate. Queued recording publication cannot resurrect old state.
The timer is an event-loop scheduling boundary, not a new Live editing cadence or
user-visible tuning parameter. Existing Live parameters/production grants unchanged.

## Changes and acceptance
Only packages/atom/src/observation-publisher.mjs and its unit test plus necessary
production-observation-runtime regression tests. Existing public DTOs unchanged.
Private schedule injection for deterministic unit controls may be added; scheduler
failure must reject/reset the flight without notification or unhandled rejection.
No retained snapshot/event collection in the scheduler. Preserve gate failure and
retry semantics, reentrant notice requests and independent owner routing.

RED: fast-ack requests spread over microtasks must share one queued flight and
cause zero writes before the controlled task runs, then save only latest state.
GREEN: all old publisher cases plus queued Stop/Delete/newStart, revoke, terminal
limits, owner routing, failing scheduling and saves, reentrant notices, queued
current-state (not stale snapshot) assertions. Focused tests and full npm test,
syntax/diff check. Source counts never substitute for native acceptance. Whole
20/29 and fullV02 remain unchanged; existing13 minors deferred.

ONE fresh final whole-item reviewer, one tested Important/Critical correction pass,
no rereview/native run. Archive own workspace with byte/CRC/identity checks and
remove only that workspace. One next item: qualify this exact source candidate
under separately frozen package/measurement protocol; no automatic native rerun.
