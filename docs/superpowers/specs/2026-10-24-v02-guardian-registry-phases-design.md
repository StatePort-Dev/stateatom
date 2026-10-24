# V02.12 — guardian registry worker intervals

Executor design/main532f4dc/scope-review-1, under autonomous local task/check/commit
through2026-10-25 20:00 Indian/Mauritius. V02.11 is complete:12rows/24466API,
Apply736–792ms/API union254–277/uncovered482–515ms, n2 per host/mode. Whole20/29,
fullV02/V03/C09/A02/L02 and original targets stay open. Preserve prior failures,
criteria, raw evidence and deferred Minors. No old matrix or unchanged native rerun.

## Decision and one question

Guardian broker sends begin/finish/verify over a private Chrome Port; offscreen
session forwards each registry operation and a snapshot to its existing dedicated
worker. V02.11 did not observe this layer. A source hook/new package could measure
whole broker calls but changes shipped inputs; debugger conditional breakpoints
would add per-hit evaluation and private lexical access. Choose a reversible wrapper
on existing Worker.prototype.postMessage in the own guardian offscreen document.
It observes original registry sends and matching message events, without constructing
a Worker, sending a message, reading private args/results, or modifying Atom71/UI2.
This choice measures only the offscreen→registry-worker→offscreen interval: Chrome
Port transit, preceding/following document work and service-worker JS stay unknown.
It is an executor diagnostic choice, not approval of a product policy or parameter.

## Source contracts

New tests/helpers/guardian-registry-phase-probe.mjs exports
installGuardianRegistryProbe(scope=globalThis,{limit=16384}={}). Fixed upper16384,
positive integer only. Capture original own prototype postMessage descriptor,
EventTarget add/removeListener and MessageEvent native data getter. Forward exact
receiver/arguments/return/error once; no Promise observers, extra messages, timers,
termination, event cancellation or mutation. Listener observes existing native event.
Only own data descriptors version/id/op and reply version/id/ok are inspected;
never enumerate/read args, value, code, snapshot, capabilities or token content.
Known operations are the12 literal REGISTRY_METHODS. One matching Worker instance
per window; another matching instance, unsupported message/accessor/return, duplicate
ID/reply, error/messageerror, listener failure or overflow invalidates the trace.
Foreign protocol messages forward but invalidate an armed window, never become
registry evidence. Pre-window replies are ignored without completing new rows.

Keep internal matching IDs in memory only. Public rows contain ordinal/op/startMs/
endMs/durationMs/ok; snapshot tag/limit/clock/rows/overflow/inflight/unsupported.
Reset requires no pending rows and valid bounded tag; copy snapshots. Restore checks
wrapper ownership, independently removes its own listeners and preserves external
replacement with explicit error; pending restore refuses and native finalizer still
closes own resources. Native prototype/intrinsic/ordinary worker scope only; arbitrary
hostile Proxy/intrinsic tampering is not promised.

scripts/native-browser.mjs adds zero-argument extensionGuardianSession(): find exactly
one target at chrome-extension://<privately captured extension id>/atom-guardian.html
with page/other/background_page type, return owned CDP session and copied minimal
target metadata. Reject ambiguity; no caller target or application target. Preserve
all prior accessor and startup controls.

New guardian-registry-phase-summary.mjs strictly validates rows/schema/clock/cap/
settled Boolean outcomes, clips translated registry intervals inside existing Apply
RPC, reports union and per-op counts/union plus uncovered interval. A combined
worker-API+registry union uses already validated V02.11 API rows; never adds overlapping
category totals. Both cover concurrent state and worker health snapshots, so neither
is Apply-only identity, CPU, critical path, or entire guardian RPC cost. Preserve
raw three clocks/coarsening without invented synchronization/precision bound.

## Finite native protocol

Exact71/UI2/product327/helper223/archives/installed hosts unchanged. Reuse existing
fixture, trusted input actor, inspector32/API16384 probes and current250ms default.
Both hosts,3 alternating Live/Draft blocks each, first warmup:12rows/4warm/8measured,
one Apply per gesture and original current ack/Draft-before-Apply/unrelated/getter0/
ledger checks. Additional owned offscreen CDP session only; app solely Atom-owned.
Record API and registry raw snapshots BEFORE validation, including failed row.
Pre-register all source/case/harness hashes before launch; preserve actual handles,
failures, cleanup and inputs. New layer is the reason for this finite run; no repeat
of native22/backend/types/admission/limit/Close/HTTPS/IDE/model/source campaigns.

## Completion

Source TDD: exact forwarding/privacy, overlapping/out-of-order replies, ID isolation,
pre-window reply, unsupported protocol/accessors/second worker, errors, bounded cap,
pending/reset/restore, external replacement/listener failures, copied rows; target
ambiguity/foreign URL/argument/metadata mutation controls; summary overlap/gaps/clocks/
malformed/pending/privacy/combined unions. Actual serialized evaluator control and
protected driver inventory/independent registry restore/detach failure controls.
Meaningful focused + full npm test; fixed case committed before native. Native result
may be retained FAIL with precise boundary rather than manufactured measurement.
ONE fresh readonly final reviewer, at most ONE tested Important/Critical correction
pass, no re-review. Preserve scratch/ledger/history, finish locally on main. Record131,
routing/aggregate/task-done; choose one next dependency-valid item from actual result.
No product optimization/guard removal, new SLO, Live/grant/handoff policy, redesign,
SDK/push/publication/other repo, certificates/accounts/system trust/user profiles.
