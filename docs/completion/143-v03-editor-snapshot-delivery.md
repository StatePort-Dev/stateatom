# V03.20 — source diagnosis of editor snapshot delivery

Current: **source diagnosis complete: two actual mounted UI controls confirm a snapshot-delivery gap; no product change or new native result**.
Baseline0eda3f6; scope-review-1, main/local autonomous work. Whole20/29 remains;
original guide/native17 FAIL and native19 instrumented facts stay unchanged.

## Missing question

V03.19 records a clean model at revision7 while a backend snapshot already has10;
second edit20 precedes receive10 and becomes conflicted. This does not identify
why the newer snapshot did not reach the model sooner. Source evidence alone
cannot retrospectively establish the native transport/event schedule.

Known source path: `packages/atom/src/ui.mjs` load increments a generation, awaits
state, and returns before `inputUI.update` if superseded. Active input owner is
included in that state request. `input-controller.mjs` independently rejects older
or foreign editor snapshots. `runtime.mjs` state with refreshDeep=false returns
the cached editor snapshot; refreshDeep=true reads an active editor. Native control
MutationObserver increments revision counters, without itself publishing resource
snapshots; `control-editor.mjs` refresh publishes when its snapshot changes.
These are code facts, not observed execution attribution for native19.

## Bounded controls

Use the actual mounted Atom UI/controller/draft with the existing inspector DOM
fixture, synthetic same-investigation resources and controlled Promise replies.
No source edits or internal setters/debug globals. No browser, backend network,
helper, application write or model inference. Scripted Live typing may produce a
synthetic plan request; hold its reply and cancel on cleanup, never manufacture an
applied receipt. Plans and resource revisions are explicitly synthetic.

1. Latest state reply carries revision10 to a clean active editor: subsequent
   normal Live20 must prepare from10 (control of the observation method).
2. A first reply10 is superseded by a still pending later read: determine whether
   delivered first reply updates the active editor. Observe the revision in the
   next synthetic Live plan, then release the latest reply and record the actual
   row conflict/message. Do not silently rebase or change the model.

Freeze327 current product source inputs, fixture/probe/Node and retained19 hashes
before one source execution. Save independent verifier/negative controls, actual
request/response ordering and limitations. Preserve any literal failed control;
no old native or model-order experiment rerun. This is diagnosis, not a new feature
or required full-project test campaign; retained2955 source pass stays historical.

One next item is chosen from the result. A synchronization fix, notification
policy, timing change or another native run is not assumed approved or needed.
SDK/publication/other repository/redesign/production-policy work remain outside.

## Actual source result and verification

One sealed execution on **566521ac94f8acb355abcb304aee61887e83f225**:
`.artifacts/v03/editor-snapshot-delivery/2026-10-24-source-control1/`.
Status `PASS_SOURCE_DELIVERY_DIAGNOSIS_NOT_NATIVE_CAUSE`; **332 inputs unchanged**,
including327 product sources, actual fixture slice, probe/Node and retained19 hashes.
No browser/server/helper or application was started. Synthetic pending plan replies
are cancelled on view disposal; no applied acknowledgement or backend write.

| Controlled reply schedule | Actual next plan | Later row |
| --- | --- | --- |
| Latest revision10 reply delivered before typing20 | Prepared from synthetic-r10 | No field error |
| Reply10 delivered, but superseded by another still pending read; type20 | Prepared from synthetic-r7 | After latest reply10, raw20 remains and “Field changed elsewhere. Discard this draft.” appears |

Both read requests carry the same actual input owner and refreshDeep=true. The
second schedule is recorded as request1→request2→deliver1→plan→deliver2. Thus the
current UI can discard a usable same-editor input snapshot solely because its
inspection render was superseded. This is a source-reproduced delivery gap, not a
model rebase defect, observed native19 RPC schedule or backend stale error code.

Independent saved verifier **10negative controls PASS**; clean pre-change checkpoint
pins source/result/registration before any product change. Original raw19/17
results, source18 controls and experiment criteria are unchanged. No full-project
rerun or additional reviewer was needed for unchanged-code source diagnosis.
Retained full source2955 is not relabelled a new run. No feature/readiness credit.

One next item: **V03.21 bounded delivery of current owned-editor state replies even
when the inspection render is superseded**. Before implementation, specify exact
scope/epoch/investigation/native-target checks and test close/reopen, tab/selection/
property change, stale revisions, foreign responses and dirty-draft conflict.
Inspection/source/execution rendering must retain its existing generation gate.
Do not add polling, change debounce, clear conflict, rebase drafts or relax native
revision/ABA guards. Any claimed product improvement still needs a new immutable
candidate and one registered affected native case; documents/source controls alone
cannot prove it. These are executor implementation proposals under autonomy, not
technical details approved in the original scope review.
