# V02.18 — recording publication at one task boundary

2026-10-26/main, BASE1c41015, scope-review-1. Source-only bounded candidate.
[Design](../superpowers/specs/2026-10-26-v02-recording-publication-turn-design.md),
[plan](../superpowers/plans/2026-10-26-v02-recording-publication-turn.md).
20/29 (~69%) whole tasks unchanged; fullV02/A02/L02 and release remain open.
L02/A05 mandatory; SDK outside Atom; independent human not a blocker.
Live editing parameters, production grant lifetime/scope, handoff UX undecided
parts remain with their respective tasks; this internal save scheduling change
approves none of them.

## Why this change
Current runtime collectObservation updates its bounded ledger synchronously and
requests background persistence for each changed recording snapshot. The publisher
already combines dirty requests during an unfinished write; it previously started
its first save immediately. Controlled fast-ack/microtask source calls reproduced
separate flights before a scheduler task could combine them: new regression RED
with5oldPASS/1FAIL (Promise identity changed prematurely). This is source behavior,
not evidence that storage caused the original native performance miss.

Publisher now schedules only its first save with one zero-delay event-loop task.
One shared Promise/dirty flag/task per owner, no queued snapshots or events.
Persist reads CURRENT bounded state. Existing in-flight follow-up/rejection/notice
semantics remain. Native ledger updates and explicit/terminal Stop/Clear/revoke/
limit writes remain immediate and independent. No browser command, domain, body
collection, permission, metric lifetime/baseline, UI or Live cadence change.

## Source checks
9publisher controls PASS, including fast-ack30 updates→ONE current-state write,
schedule failure/reset, independent queued owner routing and actual default timer
boundary. The original5in-flight controls use an eager injected scheduler so they
still exercise writes already running. Runtime77focused PASS6540.090012ms includes
five NEW queued replace/permission/context/record-limit/pending-limit regressions;
late queued writes preserve exact current window/terminal data. Original1000-gap
in-flight subscription control explicitly enters the first write after the new
scheduling boundary, then preserves the old1000-gap/two-write/one-handler assertions.
Initial focused71PASS/1FAIL only exposed that old immediate-start assumption;
no criterion or record-count reduction. Global timeout substitution restored in
finally; fixture/native boundaries are synthetic, no actual Chrome run.

Commands:
    node --test --test-isolation=none tests/atom/production-observation-runtime.test.mjs tests/atom/observation-publisher.test.mjs tests/atom/production-observation-native.test.mjs
    npm test
    node --check packages/atom/src/observation-publisher.mjs
    git diff --check
Full suite4853PASS/0FAIL0SKIP125939.556719ms, terminal0 (session69987).
Syntax/diff checks PASS. ONE final review pending at this checkpoint. No new package
or build; source checks cannot establish native performance, installed delivery,
worker shutdown durability, usability or release readiness.

## Preserved evidence and next step
V02.15 actualActive/Off26.6442/29.3247% still misses10%; Basicp95433.8/419.5ms
passes1s. V02.6 Debugger-only did not establish a consistent positive median cost;
V02.16 did not demonstrate a duplicate Basic read-only Network-event persistence
path. V02.17 raw Performance configurations do not authorize lazy collection or
metric-policy changes. No old experiments/readers rerun, distributions trimmed,
criteria waived or raw-mode denominator substituted. A02.33 diagnostic branch
closed at its actual unavailable weak-reference witness, fullpath INCOMPLETE.

Exactly publisher plus two tests are intended code deltas. The retained327product
input map now has326unchanged current files and ONE declared publisher change;
previous immutable package evidence remains exact historical prepared bytes,
not proof of this new source. All protected research/raw inputs remain unchanged
apart from declared files; current registration/checkpoint records the exact hashes.
ONE next bounded item: freeze a new source-derived package and its exact admission
before separately preregistering original performance measurement. No browser/TLS/
certificate/profile action, SDK, other repo or publication in this source item.

Protected checkpoint:1440path comparisons,1436unchanged and4declared comparison
deltas representing3unique files (absolute/relative publisher aliases). Product
326current unchanged/ONEpublisher delta; protected raw/research unchanged.


## ONE final review and correction in progress
Fresh read-only /root/v0218_whole_review (gpt-6-astra/high),1c41015..d8327d9:
0Critical/1Important/0newMinor,13oldminors deferred. I1 accepted: queued recording
callback may outlive runtime shutdown, overwrite a replacement namespace and notify.
Single correction adds stopped guard to runtime publication persist/notify wrappers;
terminal/shutdown persistence remains immediate. Regression reproduced3writes vs2,
then78focusedPASS6491.700905ms including exact replacement state/no late write or
notice. Post-fix fullsuite4854PASS/0FAIL0SKIP124427.789462ms terminal0(session82400). No rereview/native run. Timer can dispatch but
disposed recording publisher is inert; no native suspension guarantee follows.

Runtime.mjs is the declared review-scope extension: four changed source/testfiles,
two changed product files; old327product becomes325current+2historical prepared
inputs. Original registration/earlier source result preserved, new checkpoint
binds correction hashes. [Review and effect/cost rulings](../../.artifacts/v02/recording-publication-turn-review/2026-10-26/report.md).

Final source correction checks:78focused/4854fullPASS; syntax/diff PASS.
1440protected path comparisons1435unchanged/5declared comparisons=4unique files;
325product current+2exactBASEGit blobs verified. All other raw/research inputs
unchanged. ONEreview/ONEtested correction pass complete; no new minor/rereview/native.
