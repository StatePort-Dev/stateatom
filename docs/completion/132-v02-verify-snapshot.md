# V02.13 — atomic live verification and fresh registry snapshot

2026-10-24/mainbdccd06/scope-review-1. Whole20/29 (~69% equal count), fullV02/V03/
C09/A02/L02/original targets remain open. V02.12 completed partial registry timing
on71; its native evidence staysda87a6f with explicit later harness-only correction.
[Design](../superpowers/specs/2026-10-24-v02-verify-snapshot-design.md),
[plan](../superpowers/plans/2026-10-24-v02-verify-snapshot.md).

## Bounded source change

A successful session verify previously required one dedicated-worker verify and a
second dedicated-worker snapshot request. The new private opt-in `withSnapshot:true`
on the same verify operation executes the SAME live verification followed by the
SAME fresh redacted snapshot in one dispatcher turn and one message. No verification
or snapshot is skipped/cached, no live grant/token/native authority barrier removed.
Other operations, release/retry/drain/recovery, pending64/sequence/size/timeout/loss,
post-await closed-session check and broker/native-before-guard remain unchanged.

Only core/guardian-worker-wire.mjs and core/guardian-session.mjs product files change.
No public package export/type/SDK/visual/control policy, dependency, other repository,
Chrome Port or registry authority model change. Private client gains optional
verifyWithSnapshot; plain legacy calls keep their original values and registries
without the optional method use the original verify+snapshot path. Invalid flag/op/
accessor is refused before dispatch; malformed or legacy unboxed fast reply loses
channel and rejects itself plus other pending requests before entry deletion.
A coherent new immutable candidate is required; mixed old-dispatcher/new-client
success is refused, with no mixed-version support claim.

## Source evidence; installed runtime remains earlier evidence

Controlled actual dispatcher/client/session tests establish one message, one live
verify then one fresh snapshot, new foreign-state visibility, original wrong-grant/
expired lease/client/snapshot failure codes, legacy plain/fallback behavior, flag/
getter refusal, malformed reply fail-closed, common64budget/size/sequence/timeouts
and late session-close refusal. Initial RED: missing fast method, actual2vs1 message,
flag dispatch and missing late path. First unbounded late-path fixture was stopped
as an own test process; corrected1000ms bound gives explicit terminal RED. This is
fixture correction, not native experiment or product acceptance. New11controls PASS;
existing103 focused checks PASS before correcting a nonexistent production-test
selector. Final intended guardian/policy focused and full source checks remain due.

Exact327-input package71 comparison records only2product source changes/325unchanged;
helper223/archive/UI2/installed71/bothhosts remain byte-identical, no rebuild or native
repeat. `.artifacts/v02/verify-snapshot/2026-10-24/source-delta.json` preserves old/new
hashes. Those earlier runtime results do not qualify the two current changed sources.
No speedup, original SLO/Live250ms/grant/handoff decision or full feature readiness
is inferred from fewer messages in a source-controlled transport.

ONE fresh final readonly source review remains due. Next one **V02.14** must prepare
an immutable candidate for these exact changes and qualify its affected installed
native workflow; choose/register that bounded protocol before any new run. This item
contains no package/build/native/browser/IDE/certificate/account/SDK/publication or
other-repository action. Historical evidence/criteria/failures/Unknown retained.


## Final source checks before review

Corrected intended selector runs guardian wire/session/real transport/broker/document/
entry/package/production-change-policy/input runtime: **131PASS/0FAIL/0SKIP**.
Full npm test **2684PASS/0FAIL/0SKIP**, source-only. The earlier103 focused log did not
run a nonexistent `production-changes.test.mjs`; it is not credited with those policy
checks. All initial RED, fixture stop/bounded retry and GREEN logs remain in
`.superpowers/sdd/2026-10-24-v02-verify-snapshot/`.

Same authority verify and fresh snapshot each execute once per fast request in one
actual dispatcher turn; one transport message replaces two. Source failure controls
preserve expired client/lease/wrong-grant/snapshot-failure codes, late-close barrier,
strict flag/getter/size/sequence/common64budget and malformed/legacy reply channel
loss. These are controlled source executions, with no new native/packed acceptance.
Exact325unchanged/2changed product/helper223/archive/install receipt remains valid.
ONE readonly review due; V02.14 unchanged as the next native candidate qualification.
