# A05.3b — adversarial runtime ownership and late source responses

Continue inline on current main from2abe1f7; user resumed until2026-10-21T16:00UTC
(20:00 Indian/Mauritius), overriding only the previous execution deadline.
Spec: docs/completion/02-release-scope.md,05-analysis-and-actions.md,41 and42.
Do not repeat completed source/native experiments or upgrade old evidence.

## Task 1: Runtime boundary fixture and decisive race regression

Bounded deliverable: exercise actual createAtomRuntime/Chrome platform/broker,
wire validation and source checks; control only external CDP/helper acknowledgements
and IDE transport. No production test-only methods or guessed initial analysis.
Reuse input-capture fixture; new options belong only to tests. Real inspection
must create its own selection/analysis/journal through public runtime operations.
The helper ledger may use the existing core model; this is a synthetic protocol
harness, not native Event/host proof. Expectations are hand-derived identities.

Tests: cancelled pending Arm A→replacement B→late A ack must never cancel/publish B;
stale cleanup callback cannot delete B; read A→pending source check→replacement B
must reject A and preserve B; selection/navigation/client change while source check
pending cannot publish it as current. Add further lifecycle tests only if the same
ownership contract needs them. Missing/changed native context must refuse safely.

Verify regression sensitivity with separately archived runtime source mutations
restoring the relevant original missing guards. Do not alter the live source for
mutation checks. Current tests must pass; each named mutation must fail the
consumer-visible assertion. If a real current failure appears, preserve RED, find
cause and implement the smallest fix. Existing criteria and source identity remain.

Expected: focused tests pass with current runtime, specific historical bug variants
fail; complete npm test passes. Inspect exact commands/results, git diff --check,
update execution record/task-index/status/roadmap honestly, then local commit.
No packed/native rerun for test-only changes; actual runtime changes require a new
immutable candidate and relevant native control. Whole A05 stays open.

## Task 2: Remaining native session/lifecycle matrix

After Task1 commit, register exact remaining cases from41/42, then extend existing
native fixture controls: context/source replacement, Basic/disabled targets, throw,
keyboard and cleanup. Reuse current exact artifacts if product bytes unchanged.
Keep per-run input hashes, screenshots candidate, no production/async/report claim.
Whole A05 acceptance/report integration remains separate until original gates pass.

## Review boundary

This plan's final review concerns its runtime races/lifecycle scope, not a repeat
of previous whole A01/A03/A04 reviews and not whole A05 closure. ONE fresh review
when this bounded plan is complete; fixes need RED→GREEN, no iterative re-audit.
