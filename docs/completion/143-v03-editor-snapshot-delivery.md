# V03.20 — source diagnosis of editor snapshot delivery

Current: **two bounded source controls being prepared; no new native run or product change**.
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
