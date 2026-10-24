# V02.13 — live verification and fresh snapshot in one registry message

Executor design/mainbdccd06/scope-review-1. Autonomous bounded local task/check/commit
through2026-10-25 20:00 Indian/Mauritius; whole20/29/fullV02/V03/C09/A02/L02/original
targets unchanged. V02.12 complete: actual71/21876registry messages includes7111verify
and10944snapshot; partial registry occupancy241–266ms, n2, no CPU/causality/speedup.
Preserve native da87a6f/earlier failures and criteria; do not rerun old campaigns.

## One source change and its tradeoff

createGuardianSession currently awaits registry.verify then separately requests a
fresh registry.snapshot. Caching/omitting snapshots would change freshness and foreign
lease/status visibility. Choose an atomic private worker request that executes the
SAME live verify and SAME fresh snapshot in one dispatcher turn. Every verification,
snapshot, authority check, grant/token comparison, cleanup/recovery and broker guard
remains. Eliminate only a dedicated-worker roundtrip on successful verify, not work
or policy. This executor choice is not an already approved product parameter.

Only core/guardian-worker-wire.mjs and core/guardian-session.mjs product code change.
No public package export/type/SDK/UI/Live/grant/handoff policy, registry authority model,
Chrome Port/broker/native-command behavior, timer, queue/budget, dependencies or other
repo. This increment is source-only; installed71 remains immutable prior evidence
and cannot prove the changed product source. Packaging/native qualification is a
separate next item; no performance or new runtime readiness claim here.

## Private wire and session contracts

Keep version1/12existing REGISTRY_METHODS and all old calls/replies unchanged.
registryClient gains private verifyWithSnapshot(...args), using existing op verify
and an own Boolean `withSnapshot:true` flag. Dispatcher permits flag only for verify
and true; an accessor flag is refused without invocation before JSON serialization.
Existing sequential id/size/args/method validation precedes dispatch. After successful
registry.verify(...args), synchronously call registry.snapshot() and return ordinary
reply.value={value:true,snapshot:<fresh redacted snapshot>}. Failed verification
returns original error code and never calls snapshot. No cached snapshot or new
external channel/capability. Existing pending/timeout/loss and64budget apply.

Client marks this request internally. Before removing its pending entry, validate
new success envelope: exact value/snapshot keys, value===true and snapshot a non-array
object. Malformed/legacy true response loses channel and rejects ALL pending calls,
including this request, rather than hanging/adopting old data. Broker's existing
snapshot validation remains authoritative. Plain old calls keep original values.
A coherent immutable package pair is required; mismatched old dispatcher fails closed
rather than receiving silently reduced checks. No mixed-version support claim.

GuardianSession uses optional verifyWithSnapshot only for verify after ready/client
acquisition and within original pending/finally boundary. Await its reply, recheck
open(), return same {value,snapshot} boundary. Old synchronous/asynchronous registries
without method retain original verify+snapshot fallback. Release/retry/drain and all
other operations unchanged. A late reply after close cannot become current; failed
verification/snapshot/transport cannot become a successful cached result.

## Source acceptance and finish

TDD actual dispatcher/client/session transport controls: one worker message per fast
verify, one actual verify+fresh snapshot in that order; fresh foreign-state changes;
wrong grant/expired lease/client fail with originalcode/no snapshot; ordinary legacy
values/messages and fallback2calls unchanged; invalid flag/op/accessor no dispatch;
malformed boxed/legacy reply rejects all pending without timeout hang; transport
loss/timeout and session-close late response fail closed. Existing guardian session/
wire/broker/document/native-before-guard/cleanup/revocation controls must stay green.
Focused + full npm test, diff/only2productfiles changed, exact old327-source delta
reported rather than upgrading old installed runtime. No pack/native/browser/IDE/
certificate/model/HTTPS/publication/SDK/otherrepo work. Keep historical evidence and
Unknown. ONE fresh readonly final source review, at mostONE tested Important/Critical
pass, no re-review; preserve ledgers/scratch. Record132/routing/final saved aggregate/
task-done/local commits; one next dependency-valid immutable-package qualification.
