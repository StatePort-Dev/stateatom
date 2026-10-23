# V02.4 — bounded native observation publication

2026-10-23, scope-review-1. Atom63 / unchanged UI2. Source implementation and actual measurements are
verified; ONE whole-parent review is pending. Both current Basic route latency
targets are met, but both active/off overhead targets remain missed.
No whole V02 acceptance, performance waiver or release claim.19/29 unchanged.

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

## Source and immutable package qualification

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

## Unchanged measurement protocol — complete, overhead targets missed

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

## Remaining gates

ONE fresh whole-parent review is next after completed current63 measurements/identity
verification. Next bounded V02.5 should isolate Basic-selected overhead with a
concrete counter/control before changing code: most current median overhead is
already present in Basic; no subsystem cause is inferred from that ratio. Full V02 modes/corpus/lifecycle, L02 usefulness, A02 and integrated/
clean platform/release gates remain separate. No independent-human blocker, SDK,
publication, redesign or other-repository change.
