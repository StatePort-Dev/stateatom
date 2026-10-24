# V03.18 — source-level ordering diagnosis

Bounded diagnosis complete on source `73e7303163007e9b18dfd08991260c888c5bfd07`.
No product code changed. The original input guide and V03.17 native diagnostic
remain **FAIL**; no new whole-task acceptance, still **20/29**.

## Question and evidence

[V03.17](139-v03-control-revision-diagnosis.md) recorded a native revision change
from seven to ten attribute mutations, with value10 retained. A later inspector
input20 was not applied; the summary said “Review 1 field error.” The recording
does not contain the local controller's receive/edit order or row error text.
Those missing facts cannot be inferred from the summary or matching values.

The preliminary source probe from that investigation is preserved unchanged.
A sealed reproduction uses the actual `createInputDraft` and copies the recorded
baseline, acknowledgement and newer resource snapshots. **Plan IDs in these
copies are deliberately replaced with each synthetic plan's ID.** These are
source controls, not replayed native receipts or new application executions.

| Controlled order | Result in the existing model |
| --- | --- |
| New revision arrives before a new edit | The draft uses revision10; a new plan can be prepared. |
| New edit starts before the newer snapshot arrives | Raw20 survives; its earlier revision remains attached; preparation refuses the conflict. |
| Newer snapshot arrives before a late acknowledgement | Raw20 survives; the old acknowledgement cannot rebase it over the newer observation. |

All three assertions passed. In the latter two source controls, preparation
throws `STALE_RESOURCE`. This is a code observed in the controlled source probe;
it was **not collected as the backend error code of the native run**.

The model's behavior is consistent with its safety contract. These cases do not
demonstrate a model defect or identify the actual native UI ordering. Automatic
rebasing or ignoring `name/type/name` mutations is not justified by these results.
No recovery behavior, eligibility, Live timing or production policy was changed.

## Verification and preserved boundaries

Artifacts: `.artifacts/v03/input-snapshot-ordering/2026-10-24/` contains the
preliminary files, sealed registration, source probe, result, saved verifier and
checkpoint. The executing Node path/hash is checked in this source runner.

```sh
node .artifacts/v03/input-snapshot-ordering/2026-10-24/probe.mjs
node .artifacts/v03/input-snapshot-ordering/2026-10-24/verify.mjs
```

The sealed run recorded three source cases, **333 stable registered inputs**,
including the unchanged327 product inputs and retained V03.17 result/checkpoints.
No browser, backend request or application write was involved. The preliminary
probe is credited; the sealed execution adds source/input identity checks. This
is not a repeat of the earlier browser campaign. No new product tests, build,
model inference or whole-project audit was needed for this unchanged-code analysis.
No new reviewer was dispatched for this source diagnosis/report.

Full V03, A02, L02, V02 and C09 remain open. A05's accepted scope is preserved;
L02/A05 remain mandatory, SDK remains outside Atom, human participation is not a
blocker. V03.17 Minor M1 (automatic actual-Node admission in that native driver)
remains deferred; its recorded actual executable was separately confirmed.

## One next work item

**A02.4 — integrate the bounded ordinary React19 acquisition into the product.**
A01 is complete; A02.3 already acquired native reducer/state ancestor identities
on unchanged ordinary TodoMVC. The remaining product integration is explicitly
listed in A02's acceptance gaps and is also relevant to V03's unsupported React19
source-connected route. Reuse that implementation and its controls before writing
anything new. Preserve field ownership, public hook kind, prop transfer and
selected-property origin as Unknown unless separately proved; do not build general
ownership infrastructure or claim complete lineage.

This scheduling does not close the Live/Restore gap. Further native input reruns
need a concrete affected implementation or a new question with adequate collection.
The L02 stopping rule against blind full-corpus/prompt-tuning repetition also stays
in force. Official intake/publication/SDK/other-repository work stays outside this
run's authorization. Exact next implementation choices remain to be examined in
A02.4, not presented here as an already approved solution.
