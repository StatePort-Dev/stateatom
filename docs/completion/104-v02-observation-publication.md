# V02.4 — bounded native observation publication

2026-10-23, scope-review-1. Current qualified Atom64 / unchanged UI2. ONE review
found2 Important issues; one RED→GREEN correction pass and new64 qualification
complete. Finite publication fix/measurement accepted; no full V02, performance
waiver or release claim. Current Basic standalone meets1s, embedding misses;
both active/off targets remain missed.19/29 unchanged. Original63 results below
remain historical, not parent acceptance or fresh64 evidence.

## Reproduction and bounded change

[Plan](../superpowers/plans/2026-10-23-v02-observation-publication.md), source commit
ec39111. In the original actual runtime/platform source fixture,20 complete
native requests with a deliberately gated session write started60 concurrent
storage submissions. The RED assertion retains60 versus expected1; this is a
source/harness concurrency reproduction, not native timing or proof of every
current target miss's cause.

The new private owner publisher retains one pending flight and one dirty bit.
Every native event still normalizes/syncs the bounded observation immediately;
only overlapping persistence/notice publication is coalesced. A burst gets a
current-state follow-up and one notice after final successful save. No timer,
record suppression, raw snapshot/event queue, new grant, schema/API or visual
contract change. Exact tab/scope routing remains. Original global persist epoch
repair and all direct Start/Read/Stop/Delete/revoke/lifecycle/timer writes remain
independent. A delayed retired flight can only persist current global state; it
cannot reattach, reauthorize or restore its old window. No tab broadcast or
weakened foreign/forgotten notice invalidation was introduced.

RED→GREEN helper controls cover burst/current-state publication, request during
notice or flight settlement, failure without automatic retry loop, later dirty
request during failure and independent publishers. Integrated controls preserve
all20 finished records/zero gaps, Stop/Delete/new Start, permission cleanup and
second-tab/context closure while an old save waits. Original unowned observer
notice still invalidates execution immediately.183 focused checks PASS.

One new test initially expected absent metadata after Clear; the existing owner
contract is a deleted tombstone with null window ID/empty records. That assertion
was corrected, without product/contract change; failed log remains. First
child-isolated helper invocations failed generically in sandbox; the declared
--test-isolation=none command produced meaningful behavioral RED failures against
the original per-call persist().then(notify) wrapper, then GREEN. Nothing from the
initial process failure is counted as the functional reproduction.

## Original63 source and immutable package qualification (historical)

Full authorized source run:2420/2420 PASS,0 fail/skip/cancel,92882.980372ms. Original
sandboxed run2414 checks/13 failures (2401PASS) is retained: process spawning and
local listeners were denied EPERM, with downstream empty CLI JSON. An unchanged
full retry with required permission passed; no failure was suppressed.

637 Git-listed JS/TS/cjs inputs were frozen before the first launch; this excluded
licenses/CSS/HTML and bundler dependency inputs. Supplemental828 captured after
that launch is honestly labelled. All828 were unchanged and frozen **before the
successful full retry**, packing and native work, then match after full/pack.
This does not retroactively claim828 prelaunch coverage for the first failed run.

Exact handoff: `.artifacts/atom/2026-10-23T10-51-57-264Z/atom-handoff.json`.
Offline clean consumption, reproducible archives and both packed host builds PASS;
2 strict packed TypeScript5.9.3 consumers and9 admission/negative controls PASS.
269 bundled source inputs/326 build inputs (overlap, not added counts); immutable
UI2 archive hash unchanged. Original handoff remains BUILT_NOT_VERIFIED; scoped
qualification is recorded separately. No new public exports/dependencies.

```sh
npm test
npm run pack:atom
node scripts/verify-atom-types.mjs <exact63-handoff>
node scripts/verify-atom-package.mjs <exact63-handoff>
node tests/integration/handoff-observation-input-native.mjs <exact63-handoff>
node tests/integration/basic-observer-performance-native.mjs <exact63-handoff>
```

Actual current63 H09 receipt:
`.artifacts/p04/input-coexistence-native/2026-10-23T10-52-51-528Z/`.
17 native checks PASS in both actual packed hosts,0 inspector console warnings/
errors: independent Settings confirmations, Live, constraint-refused Undo,
Draft/Apply and unapplied Draft through Stop, reviewed default-private download,
passive reader and explicit revoke. Original point/words/window remain separate
from input outcomes; failed Undo is not restoration proof. This is affected-route
acceptance, not a broad fresh P04/Live/production or human usability claim. No new
CSS/tokens/layout; screenshots remain candidates.

## Original63 unchanged measurements (historical, overhead targets missed)

The fixed101 protocol/order/sample counts/thresholds and strict zero-gap controls
are unchanged; only exact candidate identity becomes63. COMPLETE198 raw samples,
180 measured/18 fixed warmup,30 interleaved measured blocks per host;66 active
windows retain20 finished requests and1 checkpoint/21 records, exact zero-gap
schema and explicit user Stop. No trimming, changed denominator or waiver.

| Current63 p50 / p95 / max milliseconds | Standalone | Embedding |
| --- | ---: | ---: |
| Basic gesture-to-useful content |432.55 /565.3 /566.7|432.2 /515 /518.3|
| Off workload |59.95 /73.9 /83.3|59.25 /74.1 /82.3|
| Basic workload |73.75 /94 /149.7|74.55 /79.7 /84.6|
| Active workload |76.05 /86.5 /92.4|76.9 /99 /166.1|
| Active/off median degradation |**26.8557% MISS**|**29.7890% MISS**|
| Basic/off diagnostic |23.0192%|25.8228%|
| Active/Basic diagnostic |3.1186%|3.1522%|

Basic route p95≤1000ms is met in both current hosts; active/off≤10% is missed in
both. Diagnostic ratios do not replace the approved denominator. Current62's
standalone1864.9ms miss and both overhead misses remain unchanged historical
results. Different native runs do not alone establish coalescing as the cause of
all latency changes. The source counter proves reduced concurrent publications;
these actual measurements do **not** demonstrate the overall overhead target.
A read-only source-context query (~1.5s) ran during embedding measurements; no row
was removed or attributed to it. Shared-host context/tails remain recorded.

Current receipt `.artifacts/v02/basic-observer/2026-10-23T10-53-26-023Z/`;
exit0 means complete measurement, targetsMet:false.0 inspector warnings/errors.
Buffer remains bounded (21 records/window), no whole-browser RAM attribution.
Archive sizes: Atom874676 bytes (62:874168), unchanged UI368693 bytes.
All828 pre-successful-full inputs still match after native work;269 bundled and
326 overlapping build inputs, archive/installed pair and both host manifests
verify. verification63.json independently recomputes all198 rows and validates66
windows, ties full2420/types2/admission9 and native reporter17 to exact63.
Historical62 native identity11/phase30 remain historical: identity/UI/marked
fallback code did not change, no new credit or broad P04 repeat.

Raw source/RED/GREEN/full/pack/type/admission/native command logs and input maps:
`.artifacts/v02/observation-publication/2026-10-23/`.

## ONE review and corrected current64 qualification

Fresh-context Astra xhigh review8bc7c56..bb91169: Critical0/Important2/Minor0.
Independent44 source checks and828 hashes/269bundled/326build/archive/install/
host identities verified,198 raw rows/66 windows recomputed. Reviewer did not
rerun native/build/full. No second review or deferred minor.

Both Important findings accepted and fixed in one pass (`156bde5`):

1. Context closure and terminal limits were coalesced behind an old recording
   save. While storage waited, memory stopped but persisted state stayed recording
   with no observation notice. Restore independent context/terminal persistence;
   only **recording** updates coalesce. Own RED→GREEN controls cover same-owner
   context,64-record limit and32-pending limit before old save release.
2. Runtime added .catch for each mark on the same shared flight. Reviewer source
   control retained10000 reactions for10000 unmatched gaps/0records; own RED got
   1000 vs expected1. Helper now attaches one ignored-rejection handler per **new
   flight**, runtime adds none per mark. Awaiters still get the original rejection.
   All1000 gaps remain recorded; no automatic retry loop or evidence suppression.

All4 new regressions RED→GREEN,187 focused and **2424/2424 full source PASS**,
0fail/skip/cancel,87330.722905ms. Syntax/diff PASS.828 source/build inputs frozen
before full64 and match after native qualification. Full64 used the known required
local socket/child-process permission; no repeated sandbox failure experiment.

Exact64 handoff `.artifacts/atom/2026-10-23T11-08-43-890Z/atom-handoff.json`:
new offline/reproducible pack/both host builds,2 strict packed types and9 admission
controls PASS. Atom874889 bytes/UI368693 bytes, same UI archive.269 bundled source/
326 overlapping build inputs, archives/installed pair/both hosts match current
source. Original handoff BUILT_NOT_VERIFIED remains unchanged; verification64.json
is a scoped derivative qualification. No source marker/UI/picker/DTO change.

Actual64 H09 both-host17 PASS,0 inspector console/errors:
`.artifacts/p04/input-coexistence-native/2026-10-23T11-10-21-783Z/`.
Same declared reporter/editing scope as63, not a native replay of every terminal
race or the full P04 matrix. Terminal-storage and reaction-budget controls are
explicitly source/runtime evidence. Existing62 identity11/phase30 remain historical.

Current64 exact unchanged workload:
`.artifacts/v02/basic-observer/2026-10-23T11-11-03-403Z/`.
COMPLETE198 raw/180 measured/18 warmup;66 explicit stopped windows each20 finished
requests/1 checkpoint/21 records and strict zero-gap schema.0 console/errors.
No trimming or prior63 timing substitution.

| Current64 p50 / p95 / max ms | Standalone | Embedding |
| --- | ---: | ---: |
| Basic useful-content latency |466.45 /683.1 /732.7|449.4 /2021.8 /2125.9|
| Off workload |60.2 /119.5 /133.6|60.3 /94.1 /140.7|
| Basic workload |75.3 /99.7 /132.7|77.3 /248.8 /272.8|
| Active workload |75.3 /132.2 /235.8|76.5 /265.6 /359|
| Active/off median degradation |**25.0831% MISS**|**26.8657% MISS**|
| Basic/off diagnostic |25.0831%|28.1924%|
| Active/Basic diagnostic |0%|-1.0349%|

Current Basic p95≤1s: standalone met, embedding **miss**; active/off≤10%: both
**miss**. Cause of the embedding tails is unknown; all workload/latency tails and
shared-host resource context remain. Diagnostic ratios do not replace approved
active/off. No total performance gain or CPU attribution is claimed from these
separate native runs. verification64.json recomputes198 rows/66 windows and ties
current full2424/types2/admission9/native17/source828 to exact64.

Issued63 archives/results remain unchanged. verification63-historical.json
verifies all original828 source hashes against current files or original Gitec39111,
with6 later-moved inputs listed explicitly, plus original archive/install/hosts.
It is not a claim that63 source still equals64, or that63 was parent accepted.
Original source-process failures, RED cases, native measurements and reviews are
retained in the same aggregate directory.

Every reviewer-declined boundary has an explicit executor ruling in retained
review/report.md: whole V02/modes/corpus remain open; subsystem causality unknown;
no fresh62 identity/phase credit; no human/visual/publication/SDK/other-repository
claim. No finding rejected, no deferred minor. Main/local integration continues
under existing user authorization, without branch switch, merge or push.

## Remaining gates and ONE next step

Finite V02.4 accepted after one review/correction; full V02/current embedding Basic
p95/both active-off misses stay open. L02 usefulness mandatory/open, A05 mandatory/
scoped complete, A02/integration/clean platform/release separate;19/29 unchanged.
No independent-human blocker or new production/Live/handoff parameters inferred.

Next bounded **V02.5**: compare passive DOM-agent/native-point scope against raw
attach domains on unchanged64 using a preregistered control. Source identifySelection
explicitly enables DOM and reads native nodes; the earlier raw-full control enabled
only Network/Page/Runtime/Debugger/Performance. This difference is not yet a
measured overhead cause. Do not disable product DOM/Overlay or alter picker/gesture
behavior; preserve all current misses and raw distributions. No repeat solely to
obtain a more favorable baseline.
