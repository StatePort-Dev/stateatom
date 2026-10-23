# V02.5 — passive DOM-domain/native-point diagnostic

2026-10-23, scope-review-1. Finite actual diagnostic complete, ONE review pending.
Product64/UI2 unchanged. No performance acceptance/waiver/full V02 or count change;
19/29 whole tasks remains. Current target evidence stays104, including embedding
Basic p95=2021.8ms miss and both active/off misses. This workload-only diagnostic
does not measure Basic gesture latency or active observation.

## Question and fixed controls

[Preregistered plan](../superpowers/plans/2026-10-23-v02-dom-floor.md), commit28c8635.
Source identifySelection enables DOM with whitespace and reads native nodes;
the earlier raw-full attach control enabled Network/Page/Runtime/Debugger/
Performance only. Official [CDP DOM documentation](https://chromedevtools.github.io/devtools-protocol/tot/DOM),
retrieved through Context7, says getDocument implicitly enables DOM events and the
backend tracks known nodes. This identifies a source/configuration difference,
not a demonstrated performance cause. Original102 raw-full evidence retains its
declared attach-domain scope and is not rewritten.

Four modes: Off detached; raw five full attach domains; same raw domains plus
DOM.enable/getDocument/querySelector/describeNode/repeated node/document guard
on the fixed synthetic#run; actual Atom Basic-selected#run text. The DOM seed uses only native DOM commands; existing bounded ISOLATED fixture
DOM readbacks remain identical in every mode. No user expressions, app callback/
getter evaluation, new event listener or app-target test CDP. Raw control
operates only with Atom detached, no edit grant/active observation; one native
debugger connection, released between trials. Native actor/workload unchanged:
trusted X11 click,20 sequential no-store HTTPS GETs×1024ASCII bytes, visible count
and two original app frames. No app action occurs from native DOM seeding.
No product DOM/Overlay disable, picker/held-gesture change, new instrumentation
or editing authority.

24 measured permutations balance every mode/position,4 fixed warmup blocks.
Per host112 raw/96 measured/16 warmup; total224/192/32. Same declared actor,
fixture,scope and hardware class; all raw rows/tails and environment retained.
No timing tuning, trimming or invalid sample counted as fast work.

## Source and unchanged64 identity

New5 protocol/seed checks plus original9 performance/transport controls: **14 PASS**,
0fail/skip/cancel. RED against the original transport aliases exposed missing DOM
mode/native seed; then GREEN. An initial negative fixture looked up absent DOM
mode and TypeErrored; corrected fixture builds independent expected mode/domain
inputs. That setup error is retained, not counted as functional reproduction.
Controls reject incomplete/reordered/foreign/untrusted work, wrong grants/domains/
raw commands/native IDs, replaced node/document or changed text. Warmups fixed,
measured tails retained; validator never returns product performance acceptance.

No product source, dependency, shared UI/token/layout/public API or contract change.
Original64 exact handoff `.artifacts/atom/2026-10-23T11-08-43-890Z/atom-handoff.json`:
269 bundled source/326 overlapping build inputs, archives/installed pair/both host
manifests verified unchanged.832 source/build/new diagnostic inputs frozen before
native execution and match after. Original full2424/types2/admission9/build/H0917/
198 performance qualification from104 remains explicitly original64, **not** a
fresh full suite/build/type run for this new harness. New controls are the14
source checks plus this actual224-row diagnostic; no blind rebuild or broad P04
rerun. UI2 tarball bytes unchanged; no new feature readiness from a document pack.

```sh
node --test --test-isolation=none tests/atom/observer-dom-floor.test.mjs tests/atom/observer-transport-floor.test.mjs tests/atom/basic-observer-performance.test.mjs
node tests/integration/observer-dom-floor-native.mjs .artifacts/atom/2026-10-23T11-08-43-890Z/atom-handoff.json
```

The direct diagnostic command is newly declared; package.json scripts unchanged.
Actual Chrome153.0.8010.12/Linux, both packed hosts, disposable HTTPS root import/
actual site Allow, no TLS bypass/preapproval.0 inspector console warnings/errors.
Native receipt `.artifacts/v02/dom-floor/2026-10-23T11-22-21-134Z/`.
Original preregistration/driver/fixture,attempts/workloads/samples and environment
retained there; no incomplete native attempt in this slice. Source RED/GREEN,
832 before/after maps and aggregate verification64-dom.json/verify.mjs:
`.artifacts/v02/dom-floor/2026-10-23/`.

## Result — no consistent DOM explanation

| Workload p50 / p95 / max ms | Standalone | Embedding |
| --- | ---: | ---: |
| Off |67.65 /82.2 /107.1|59 /75.3 /76.4|
| Raw full attach domains |73.45 /106.7 /114.5|75.75 /115.4 /122.4|
| Raw full + DOM/native point |77.05 /90.6 /96.7|75.5 /93.5 /96.9|
| Actual Basic-selected |79.85 /123.4 /149.5|72.75 /97.6 /104.3|
| Raw full/off median |8.5735%|28.3898%|
| Raw DOM/raw full median |4.9013%|-0.3300%|
| Actual Basic/raw DOM median |3.6340%|-3.6424%|
| Actual Basic/off diagnostic |18.0340%|23.3051%|

No consistent large DOM-specific cost is established across both hosts. In this
embedding run the raw full domain control already carries comparable workload
cost to actual Basic; standalone differs. These figures include native debugger
attachment/domain delivery, Chrome extension routing/guards and shared-host
context; they are not pure browser CPU attribution or proof of a universal floor.
Do not disable product DOM/Overlay based on this result. No result here supersedes
104's unchanged-mode target measurements or waives Basic/active thresholds.
Earlier60/61/62/63/native measurements remain scoped historical evidence, not
fresh/current passes. No cause of every latency tail is established.

## Remaining gates and ONE next step

ONE fresh bounded diagnostic review next. V02/current target misses/modes/corpus,
mandatory L02 usefulness, A02/integration/clean platform/release gates remain open;
A05 mandatory/scoped complete, independent human not a blocker. No SDK/publication/
redesign/other repository work or new Live/production/handoff parameters.

Next bounded **V02.6**: isolate Network-only versus Debugger-only versus the
existing full attach set (with Off) on the same unchanged64 workload. This adds
one missing domain control, motivated by the current raw-full cost; it is not a
blind rerun of original102 or a presumption that Debugger is the culprit. Preserve
all old results and fixed workload; no product change until a specific mechanism
is supported. If mandatory native transport itself exceeds the target, record
that limitation rather than changing the denominator/workload or inventing a
maintainer waiver.
