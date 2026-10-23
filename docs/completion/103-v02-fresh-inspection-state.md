# V02.3 — retain completed Basic snapshot with native identity validation

2026-10-23, scope-review-1. Current Atom `0.1.0-candidate.20261021.62` / UI
`0.2.0-candidate.20261018.2`. Bounded implementation and measurements are accepted after
ONE whole-parent review (Critical0/Important0/Minor0). **Performance acceptance remains open:** current62 misses
standalone Basic route p95 and both active/off targets.19/29 whole tasks (~66%
equal count), not full V02/release readiness.61's earlier plain-DOM successes do
not certify62 or the marked-source path.

## Change and exact semantics

[Plan](../superpowers/plans/2026-10-23-v02-fresh-inspection-state.md).
`26acce1` added the guarded Basic path; `be12b45` added native node/value controls;
pre-review correction `74d4426` conservatively retained render-occurrence guards.
No new dependency, CSS/token/visual contract, account, cloud model, production
editing permission, SDK, other-repository change or publication.

After a successful same-tab/same-selection-intent explicit manual lookup or
Inspect again, UI requests state with `refreshDeep:false,refreshIdentity:true`.
The additive boolean is state-only. Runtime still checks current permission/lease
and existing editor/window/history/picker exclusions, then reads native DOM
identity/property/value without an app script or action-metadata reacquisition.
A changed node/value becomes Stale; a delayed result cannot touch a newer
inspection. Original selection/read time, action-context identity, Unknowns and
snapshot/Not-live presentation are retained. Failure/new intent uses ordinary
deep recovery. Refresh/invalidation/picker behavior is otherwise unchanged.

A selected render instance string requires the **existing ordinary deep path**:
identity-only returns `DEEP_REFRESH_REQUIRED` without silently running scripts.
UI retries deep state only before presentation and only if load generation/tab/
property are still current. This preserves the original native-action marker/
occurrence checks. No optimization or new support is claimed for instrumented
source/action snapshots; their old guards remain in effect. Full deep refresh
takes precedence when explicitly requested. API/wire1/UI contract2.1 unchanged.

## Source, packaging and actual guard controls

Original integrated source-runtime controls were RED: explicit inspection's two
script reads were followed by an unnecessary third deep read. GREEN preserves
the completed point and uses only native DOM reads in the immediate state.
Tests retain failed-inspection errors/deep recovery, newer selector/property/tab,
ordinary invalidation, node/value replacement, delayed native read, permission
loss and active/historical observer no-read boundaries. Marked-state refusal/UI
fallback were separately RED (missing rejection and one state vs expected two),
then GREEN; late fallback cannot request the prior tab.

The first delayed-read RED waited for a barrier absent from the old runtime;
only the exact owned Node PID740559 was stopped. Its partial log remains partial,
not a completed test result. The control now asserts native verification entry
before awaiting it. No native experiment failed or was credited from that run.
A shallow-only local prototype was not accepted or packed: it would weaken
immediate node-replacement detection, so native identity validation was retained.

Current62: **2411/2411 source checks PASS**,0fail/skip/cancel,85247.384411ms;
2 strict installed NodeNext/browser TypeScript consumers and9 packed admission/
negative controls PASS. Source/control checks115 preceded the initial61 pack;
94 focused checks passed after the marked fallback correction. These counts do
not establish universal application support.

Exact62 handoff:
`.artifacts/atom/2026-10-23T10-14-40-524Z/atom-handoff.json`.
Pack does offline clean consumption/reproducible tarballs/both host builds; shared
UI2 bytes remain immutable. Both source/build manifests, archives, installed pair
and host files match.822 Git-listed source/build inputs were frozen **before**
full62/native runs and match after them. Original handoff stays BUILT_NOT_VERIFIED;
`verification62.json` is the separate scoped qualification receipt, not a release.

Native Chrome153/Linux, both actual packed hosts, disposable trusted HTTPS root
import + real site Allow, no TLS bypass/preapproval/app-target CDP. **11 native
checks PASS**,0 inspector console warnings/errors. Unchanged native identity read
preserves exact snapshot and no app action; original trusted app handlers replace
the node with identical text or change text on the same node. Both become Stale;
actual Inspect again verifies the new point. Actual permission removal denies
identity refresh and leaves no editing authority. These are native guard/API and
agent-operated inspector controls, not human usability or a full new source/
framework-identity acceptance study.

```sh
npm run pack:atom
node scripts/verify-atom-types.mjs <exact62-handoff>
node scripts/verify-atom-package.mjs <exact62-handoff>
npm test
node tests/integration/inspection-identity-native.mjs <exact62-handoff>
```

The actual handoff argument is the path above. Native guard receipt:
`.artifacts/v02/inspection-identity/2026-10-23T10-19-54-691Z/results.json`.
Full/source/RED/GREEN/pack/types/admission logs,822 input maps, original verifiers
and aggregate receipts:
`.artifacts/v02/fresh-inspection/2026-10-23/`.

## Unchanged workload; all tails retained

The101 protocol/fixture/actor/order/counts/thresholds are unchanged. A new exact
candidate identity was substituted deliberately; zero-gap validation remains.
Both hosts:30 interleaved measured blocks plus3 fixed warmup blocks;198 raw
workloads,180 measured/18 warmup. No trimming, post-result workload scaling,
changed denominator or waiver.66 active windows each retain20 completed requests
and one checkpoint,21 records, exact zero-gap schema, explicit user Stop; no
truncation or auto-limit counted as fast work. Raw metadata remains within64KiB.

| Candidate, Basic manual lookup p95 ms | Standalone | Embedding | Scope |
| --- | ---: | ---: | --- |
|60, original101 |1015|1553.1|miss/miss|
|61, preserved interim |452|433|plain-DOM route met target; not whole-parent accepted|
|62, current |1864.9|517|**miss / met**; target≤1000|

Current62 lookup p50/p95/max:526.7/1864.9/1979.9ms standalone,
403.15/517/530.4ms embedding. Standalone workload tails were also retained;
their cause is not established. No clean probe or earlier candidate replaces
this actual standalone miss.

|62 workload p50 / p95 / max ms | Standalone | Embedding |
| --- | ---: | ---: |
| Off |67 /158.4 /182|61.1 /66.3 /66.7|
| Basic |75.45 /219.2 /235.7|73.3 /80.3 /81.6|
| Active |80.6 /237.6 /253.2|78 /100.7 /106.2|
| Active / Off median degradation |**20.2985% miss**|**27.6596% miss**|
| Active / Basic (diagnostic only) |6.8257%|6.4120%|

Approved active/off median target stays≤10%. All ordered/paired distributions,
load/memory/environment context and tails are preserved; whole-browser RAM is
not attributed to one subsystem.0 inspector warnings/errors in the current run.

```sh
node tests/integration/basic-observer-performance-native.mjs <exact62-handoff>
```

Current raw receipt:
`.artifacts/v02/basic-observer/2026-10-23T10-20-07-976Z/`.
Command exit0 means complete measurement, `targetsMet:false`, not performance PASS.

## Separate request-phase result and retained61 evidence

Same bounded timing-only own-inspector probe,30 raw lookups/24 measured/six warmup.
Current62 state is `refreshDeep:false` in every trace; no argument/response content,
extra message or app/worker instrumentation. Per-phase p50/p95/max milliseconds:

| Current62 diagnostic | Standalone | Embedding |
| --- | ---: | ---: |
| UI |399.45 /433.2 /433.2|407.7 /516.5 /516.5|
| Explicit inspect RPC |334.35 /358.4 /358.4|343.05 /427.4 /427.4|
| Immediate identity-state RPC |46.85 /57.1 /57.1|51.25 /70.8 /70.8|

Original60 immediate deep-state median239.45/242ms is replaced in this route by
native identity validation. This is a measured bounded phase reduction, not proof
that all tails/degradation disappeared or that every Basic/source route passes.

```sh
node tests/integration/basic-request-phases-native.mjs <exact62-handoff>
```

Current phase receipt:
`.artifacts/v02/basic-request-phases/2026-10-23T10-24-05-926Z/`.
No fresh render/source/action latency claim follows from this plain-DOM probe.

Issued61 remains unchanged:
`.artifacts/atom/2026-10-23T09-47-57-001Z/atom-handoff.json`.
`verification61-historical.json` preserves2408 source/2 types/9 admission,
native11/performance198/phase30, actual H09 reporter17 and primary-picker/local-map7.
Its original822 inputs match after that full run; the initial snapshot was taken
after test launch, not falsely described as prelaunch. The initial child-Git
snapshot failed EPERM; direct Git listing succeeded. Eight later-moved inputs are
explicitly verified against original Gitbe12b45, not claimed equal to current62.

H09 receipt `.artifacts/p04/input-coexistence-native/2026-10-23T10-02-33-777Z/`
and map receipt `.artifacts/p04/picker-entry-native/2026-10-23T10-04-19-072Z/`
are historical61 changed-area controls, **not fresh62 runs**. Those synthetic
unmarked read-only paths cannot enter62's marked-instance refusal/fallback; only
that branch changed61→62. Current62 identity/performance/phase routes are fresh.
Source checks retain reporter/history/permission guards. No broad P04 matrix was
repeated or old failure upgraded to PASS.

## Remaining gates and next ONE step

ONE fresh-context bounded-parent review accepted812b638..2631ddc with no findings
or correction pass. Independent86 focused checks and diff-check PASS;822 input
hashes, exact package identities and raw198/30 recomputation verified. Every
declined boundary has an executor ruling in the retained review/report.md under
the aggregate directory; none becomes a capability or performance waiver.
Full V02 modes/corpus/lifecycle, current standalone Basic p95 and both active/off
misses remain open. L02 usefulness remains mandatory/open; A05 mandatory/scoped
complete, A02 open. Real StatePort/Capture, clean platform and release gates stay
separate; SDK outside Atom, no independent-human blocker or publication authority.

Next bounded **V02.4**: reproduce observation notification/persistence work
amplification and fix only a proven path. Source inspection suggests per-event
publication and late/foreign collector notices deserve controls; current data do
not establish them as the cause of every tail. Preserve this baseline, test the
specific failure before changing code, retain event/owner/time/privacy/cleanup
semantics, then qualify a new candidate with the unchanged workload. No timing
parameter, production permission scope or approved evidence threshold is inferred.
