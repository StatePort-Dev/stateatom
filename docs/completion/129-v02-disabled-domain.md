# V02.10 — one less native command for disabled identity

2026-10-24/main507420d/scope-review-1. Continue after completed V02.9;
whole20/29 (~69%), full V02/V03/C09/A02/L02 and old performance criteria stay open.
No full corpus, HTTPS/certificate, IDE, model, SDK, release or other-repository work.

[Design](../superpowers/specs/2026-10-24-v02-disabled-domain-design.md),
[plan](../superpowers/plans/2026-10-24-v02-disabled-domain.md),
[cold case](../testing/disabled-domain-cold-case.json),
[comparison case](../testing/input-domain-comparison-case.json).

## Change and source evidence

V02.9 located most measured gesture time inside the existing Apply RPC, without
attributing it to particular internal guards. Source inspection found a narrower
protocol fact: DOM.getDocument implicitly enables the DOM domain. Only text needs
DOM.enable(includeWhitespace: all) to preserve whitespace children. Prove the
attribute-only path cold, then remove exactly that redundant command for disabled;
do not infer its latency cost from command counts or skip any identity guard.

Source8980010 changes one engine condition. Native query/describe/namespace checks,
final node/document comparison, queue, admission, revision and mutation guards stay.
No cache or acquisition getter/expression. New source fault test on original engine
13PASS/1expectedFAIL; conditional change gives focused82PASS. Text refuses if its
required whitespace setup fails. Full npm test2621PASS/0failed/0skipped; first default
isolated-node invocation failed before running cases in the restricted environment,
then project --test-isolation=none ran the intended RED and GREEN checks.

## Direct native controls, separate from installed Atom

Sole harness-owned headless full Chrome153.0.8010.12, sandbox enabled, synthetic
loopback fixture; no Atom/broker loaded. Separate fresh-session getDocument bootstrap
passes. Each of22 subsequent engine acquisitions begins after DOM.disable:
button/input/textarea×absent/empty/'false'/'disabled'/namespace-only, open shadow
false/true, closed shadow and select unsupported, node/document replacement refusal,
and whitespace text Alpha Beta. Custom disabled getters remain unread (0).

First attempt `.artifacts/v02/disabled-domain/2026-10-24T01-23-03-457Z/results.json`
is FAIL0rows: DOM.disable on never-enabled fresh session is refused. Retain original
[registration](../testing/disabled-domain-case.json). Corrected driver starts its
bootstrap cold without disabling first; subsequent22 acquisitions explicitly disable.

Baseline df3b155:
`.artifacts/v02/disabled-domain/2026-10-24T01-23-34-466Z/results.json`;
corrected engine before metadata bump:
`.artifacts/v02/disabled-domain/2026-10-24T01-24-20-164Z/results.json`.
Both PASS22, exact original outcomes, browsers/servers closed and registered inputs
stable during execution. Light disabled7→6 commands, open-shadow16→15; text6→6.
This establishes the removed command and cold native semantics, not installed
broker behavior, user usability, latency targets or runtime lineage. Native records
pin the pre-metadata root lock; later local71 metadata is a declared separate change.

## Immutable local candidate and affected installed route

Atom71 `.artifacts/atom/2026-10-24T01-26-15-352Z/atom-handoff.json`, SHA
`caffac193e058c1ed3fa8b280b2edacdca4425b0351e8b9b6bbb673958062663`.
UI2 bytes remain SHA
`2bfc8229a45e02f775bb563f27d9a803d51dd977145f46843c45a884e07289e5`.
All223 helper8 source inputs unchanged; no helper/plugin rebuild.
327 product/build inputs: source-manifest delta only src/engine/browser.mjs;
build-manifest delta exactly engine, Atom version, changelog and root lock version.
Old70 archive/installed hosts remain immutable; distinct UI archive paths hold
identical bytes and contract. Strict packed NodeNext/browser consumers2PASS;
package admission9PASS.

Actual loopback installed backend regression13PASS:
`.artifacts/u02/input-inspector/native/2026-10-24T01-26-49-312Z/results.json`.
Both standalone/embedding enforce private peer/view authority, response Fetch
cleanup on inspector closure, fresh reopen, native disabled/control writes and
owner closure without rollback claims. This is the existing private Port/wire
backend harness, not field-widget, guide-operated or human evidence. No H09 HTTPS
campaign is repeated for this change.

## Finite comparison, registered before execution

Exact A70/B71, standalone ABBA and embedding BAAB; fresh owned profile each case,
three alternating Live/Draft blocks with first warmup.48rows/16warmup/32measured.
Use unchanged input actor/fixture/phase probe. Every current acknowledgement,
Draft-before-Apply unchanged state, unrelated output/getter0, ledger, single Apply
and bounded metadata trace remains required. All raw state/capability overlaps and
tails stay. Default250ms unchanged. Report per condition/host/mode; never pool into
original p95 qualification or assume a universal speedup. Native comparison pending.

## Boundaries and decisions

- Latest user steering extends autonomous local iterations to2026-10-25 20:00
  Indian/Mauritius; internal older goal date is superseded. Cost if interpreted
  incorrectly: extra local work; no external mutations are authorized.
- Choose the protocol-redundancy control instead of instrumenting every internal
  guard: it tests one exact branch without altering the worker. Cost: remaining
  Apply RPC cost stays unisolated; command count alone proves no speedup.
- Fresh CDP bootstrap needs no initial disable; preserve failed registration and
  use a new cold-case file. Cost: an extra immutable case, no silent rewritten run.
- Preserve this plan's scratch ledger/evidence despite generic finishing deletion.
  Cost: small local retention, matching the user's historical-evidence requirement.
- V02.9 sparse-operations Minor remains deferred; native probe uses its fixed dense
  list. No generic sparse-configuration support is claimed.

ONE fresh final review and scoped aggregate are still due. Documents alone establish
neither the pending comparison nor full V02 acceptance. One next item will follow
the actual comparison and review, without repeating unaffected campaigns.

## Actual interleaved result

Actual5f4e788/handle38845/exit0:
`.artifacts/v02/input-domain-comparison/2026-10-24T01-28-22-583Z/results.json`,
`PASS_INTERLEAVED_INPUT_DOMAIN_COMPARISON_NOT_PERFORMANCE_ACCEPTANCE`.
Exactly48 ordered rows/16warmup/32measured in8 fresh cases,56 ledger checkpoints;
160 owned RPCs=48Apply+104state+8capabilities.342 registered inputs stable,
327 product/build inputs per kit, archives/installed hosts and declared4-input delta
verified.0 inspector console/errors, acknowledgements, unchanged pre-Apply Draft,
unrelated outputs/getter0, metadata cap and no pending/overflow pass. Own browser,
desktop and server close. No fill/limit/Close campaign or app/IDE/certificate repeat.

Medians in milliseconds;4 measured rows per host/condition/mode:

| Host | Candidate | Live paint | Live Apply RPC | Draft Apply paint | Draft Apply RPC | Local Draft paint |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| standalone |70 |1090.50 |807.90 |846.75 |820.85 |25.25 |
| standalone |71 |1032.45 |752.65 |754.90 |727.10 |23.75 |
| embedding |70 |1123.75 |842.75 |863.20 |842.10 |25.25 |
| embedding |71 |1008.85 |727.75 |772.35 |744.65 |23.40 |

All48 raw samples/order, state overlap/tails and per-condition distributions remain
in result and `.artifacts/v02/disabled-domain/2026-10-24/native-checkpoint.json`.
Concurrent state durations are not summed or declared causal. There is a measured
reduction here, with differing case order/load; one command removal is proven by
native command traces, but these small instrumented synthetic samples do not
establish universal speedup or original performance-target acceptance.71 still
spends~727–753ms median in Apply RPC under these conditions. Existing250ms Live
policy is unchanged and unapproved exact future parameters remain undecided.

Independent saved-result verifier binds both immutable kits, installed trees,
source branch, native cold controls, backend/type/admission receipts and raw rows;
13 deliberate protocol mutations are refused. Restricted Git child-spawn check
initially hit EPERM; identical read-only verifier passed with local escalation,
without another native run. ONE final review is pending. Next bounded item after
review: V02.11, isolate remaining internal Apply phases on current71 before choosing
another correction; no original matrix/corpus/IDE rerun is implied.

## ONE review and one correction pass

Fresh readonly `/root/v0210_whole_review` (gpt-6-astra/high), exact
507420d..6aa9370:0Critical/2Important/1Minor. It independently passed the saved
native verifier without recreating the result. Report/receipt:
`.artifacts/v02/disabled-domain/2026-10-24/review/`.

Both Important findings concern harness failure paths, not the product branch:

1. Native browser spawn could emit an unhandled child error before the outer
   finally. Acquisition now awaits spawn/error inside try; synchronous/asynchronous
   failure rejects with the original error. Cleanup independently attempts child,
   CDP socket and owned log, and attaches cleanup failure without replacing startup.
2. Initial case/engine/fixture/Git/inventory reads were outside terminal handling.
   Both new drivers now create minimal result after acquiring their output directory,
   protect initialization/preregistration, record its phase/incomplete inventory,
   and attempt a terminal failure record. Final unavailable inventory does not mask
   the initial error. The comparison retains native startup cleanup details.

Twelve actual-source synthetic controls use substituted process/filesystem boundaries,
with no browser/profile/display/server: RED3PASS/9FAIL →GREEN12PASS; expanded focused94
PASS. Current full source suite is recorded below after completion. Original source
and metadata-only71 package stay exact; no repack/types/admission/backend/native repeat.
Original native driver/helper bytes and case files remain preserved. Only three
post-run harness files differ, explicitly bound before/after in
`.artifacts/v02/disabled-domain/2026-10-24/post-run-harness-correction.json`.
`verify-after-review.mjs` checks these declared corrections while retaining every
original native criterion; historical `verify-native.mjs` and checkpoint are unchanged.
Corrected failure paths have source-only proof, not a newly executed native run.

Minor deferred: the earlier pending sentences describe preregistration state and
remain historical wording; this final section and machine routing determine current
status. No product/evidence effect. V02.9 sparse-options Minor also remains deferred.
No re-review or second correction pass is used.

The review's declined boundaries were ruled as follows; none silently disappears:

- Full V02/universal speedup: retain open targets and per-condition4-sample
  distributions; cost if treated as general: unsupported performance assurance.
- Internal CPU/guard attribution: remains unisolated until V02.11; cost: remaining
  latency cannot yet be assigned to a particular operation.
- Direct native CDP versus installed broker: keep22controls separate from backend13;
  cost: neither substitutes for missing real product paths.
- New native ABA: only registered replacement controls ran; retain narrower source
  ABA controls without upgrading them; cost: no new native ABA coverage claim.
- Other versions/OS/hardware: only exact Chrome153/Linux checked; cost: portability
  and broader installation targets remain unverified.
- Iframes/custom controls/closed roots: no support expansion; explicit Unsupported
  stands; cost: users of those paths still lack a supported result.
- Widgets/human/visual/guide: trusted actor/backend proof is narrower; no human
  blocker introduced; cost: no broad usability or visual-fidelity assurance.
- HTTPS/H09/production/certificates/accounts/IDE/model/Capture/other repo: unchanged
  historical boundaries; cost: their open gates cannot be closed by this item.
- Corpus/limit/Close/original targets: no repeat or waiver; cost: existing misses
  and historical-candidate limits remain visible.
- Sparse operations: fixed dense native list unaffected; Minor deferred; cost:
  unsupported sparse diagnostic configuration still needs a later refusal control.
- Shared helper redesign: only startup ownership correction needed here; cost:
  unrelated helper behaviors are not newly qualified.
- Release/publication/fullV03/C09/A02/L02: no upgrade or external mutation; cost:
  distribution and full acceptance remain open.
- Forced termination/unwritable storage/machine failure: ordinary errors attempt
  serialization; no impossible durability guarantee; cost: external interruption
  can still prevent a terminal file.

Finishing keeps main and local commits under existing authorization, without branch
switch/integration menu/push/deletion. Cost: hosted/merged/release validation remains
unclaimed. Existing evidence/workspace are preserved. Scope-review-1, mandatory
L02/A05, two-stage production and unresolved exact parameters remain unchanged.

Actual full source after the single correction pass: **2633PASS/0FAIL/0SKIP**,
`npm test`, log `.superpowers/sdd/2026-10-24-v02-disabled-domain/full-after-review.log`.
Original2621/82 and corrected2633/94 remain distinct evidence; twelve added controls
exercise failed harness startup/inventory only. The finite native results retain
actual5f4e788 and their original input/driver bytes. No native re-review/re-execution.

Final bounded status: V02.10 complete; current aggregate checks exact saved proof
and post-run corrections without relaunching Chrome. Main/local commits/worktree
preserved. Whole20/29 (~69% equal task count) unchanged, not release readiness.
One next dependency-valid item: **V02.11 — isolate remaining internal Apply phases
on current71**, before another correction. It does not authorize repeating the
full performance/corpus/IDE campaign or deciding unapproved Live parameters.
