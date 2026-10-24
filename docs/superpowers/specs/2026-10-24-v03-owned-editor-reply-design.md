# V03.21 — current owned-editor replies across superseded inspection renders

Baseline570b796/main/local/autonomy untilOct25 evening/scope-review-1/20of29.
V03.20 actual mounted source controls show latest reply10 prepares from10, but
reply10 superseded by another pending read is discarded before inputUI.update,
so subsequent Live20 prepares from7. Native19 records edit7→receive10 conflict,
but its exact RPC schedule remains unproven. Original guide/native17 stay FAIL.

## Outcome and executor choice

A completed current-owned-editor reply may update input editing even when the
inspection render is superseded. Source/selected occurrence/action rendering keeps
its existing generation gate. No new state read, polling/debounce/timing policy,
automatic rebase, conflict clearing, write authority or native revision/ABA change.

Executor chose a private scope-capturing guard in createInputController, consumed
by createInputUI and captured by mountAtom.load before its state request. An
unconditional stale inputUI.update could close/adopt a newer foreign investigation;
polling changes behavior and request cost without addressing discarded replies.
The bounded guard solves only safe admission of an already requested reply. These
are implementation choices under autonomy, not previously approved scope details.

## Interface and identity rules

createInputController.stateReplyGuard() returns an inert closure. Capture the
actual private scope object and current investigation/physical target only while
active; inactive/opening returns a refusing guard. At admission require the same
scope object, still active/not aborted/not disposed/not disconnected, same tab/run,
investigation and sourceKind. Require integer snapshot revision >= current last
revision. Match tabId/origin/run/document/node/selector/property/build of both
current editor and reply input target to the captured physical target. A present
selection native identity must agree; pending picker cannot supply a reply. No
adoption after close/reopen even if test data reuses the investigation identifier.
A newer legitimate closed/tainted same-editor snapshot may retire/disable it.

createInputUI.stateReplyReceiver() captures that guard and, only on acceptance,
uses the existing update path once. This preserves capability refresh and disabled
presentation as well as draft/model rules; do not update resources while retaining
an old permission policy. Normal UI update/controller.receive remain authoritative.

mountAtom.load captures the receiver beside its input snapshot before RPC. On a
successful reply that fails only the render's current() test, offer {...state,
tabId:requestedId} to that captured receiver and return. The receiver itself must
refuse a replaced/closed scope. No stale source/selection/action render is applied.
Normal current replies use the existing path, without duplicate model updates.

## Tests and product qualification

TDD controller controls: same-scope reply admitted; inactive/opening/closed/reopened
scope, different tab/run/investigation/sourceKind/origin/native document/node/
selector/property/build, old revision and pending picker refuse without mutation.
Current closed/tainted receipt is accepted to disable; dirty draft retains its old
revision/raw and conflicts on a fresh external revision, never rebases.

Mounted actual UI controls: superseded same-owner reply10 updates the clean editor
before latest read resolves, so normal Live20 plan uses10. Old selected source/
inspection remains cleared; context changes cannot accept the old reply. Permission
changes in an admitted reply update capability/disabled UI through the existing
path. Use synthetic backend/no fake applied receipts for these source controls.

After source checks/full suite, issue immutable Atom77 (or refuse an already used
version), keep UI2/plugin/helper artifacts unchanged. No CSS/token/template changes;
behavior-only changelog. Current source manifest must bind all changed files. Run
packed types/admission. Preserve76/native19/source20 evidence unchanged, with a
clean pre-change checkpoint and explicit post-change source delta.

Freeze ONE affected native two-Live-edit case only after inspecting the new exact
bundle/trace anchors. Reuse current inspector-only collector and unchanged original
commerce source/synthetic loopback data. ActualNode/proc/Vite, original65 and full
input/host/archive hashes before launch; max1, clean source commit. Require actual
second applied20, exact receipts/resource/plan joins, complete valid final trace,
console/cleanup, and existing source dirty/stale refusal controls before calling
this bounded product correction delivered. Honest stale/incomplete remains literal;
no retry or original guide/Undo/Draft/baseline acceptance by assumption. If facts
show an additional cause, record it before choosing another bounded step.

ONE final fresh read-only whole-item review, at most one tested Important/Critical
pass/no rereview. Whole V03/A02/V02/L02/C09 stay open until their own evidence;
A05/L02 mandatory, SDK outside, human nonblocker. No publication/other repo/redesign/
certificate/IDE/user profile or production-policy work.
