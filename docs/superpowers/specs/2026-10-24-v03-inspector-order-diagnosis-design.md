# V03.19 — inspector receive/edit/ack observation

Baseline843a648; scope-review-1/main/local commits/autonomy untilOct25 evening.
A02.4 bounded complete; whole20/29 unchanged. Original V03 guide and native17
classifier remain FAIL. V03.18 three source orders show safe model behavior, not
actual native order or row-error cause. No recovery change is justified yet.

## Bounded outcome

Collect the actual owned inspector's accepted model.receive, model.edit and
model.settle order, before/after each call, for one minPrice investigation; collect
the actual visible row error, raw value and backend transaction/resource snapshots.
This is observation under instrumentation, not an uninstrumented timing study,
React writer attribution, original guide acceptance or a reason to relax ABA.

Executor's approach under autonomy, not a previously approved technical decision:
use exact-source CDP conditional breakpoints on the inspector bundle. The condition
records only a projected private model snapshot and always returns false; no pause,
source rewrite, private setter or app expression/callback/getter evaluation. The
application target is never debugged by this collector. Alternatives considered:
DOM-only text misses the controller's receive/edit order; adding a public diagnostic
API changes the product just to investigate it. Neither is needed if the conditional
technique passes its independent control. Debugger overhead is explicitly present.

Official Context7 CDP docs fetched2026-10-24: setBreakpoint condition only pauses on
true; getPossibleBreakpoints supplies executable positions; getScriptSource binds
the actual script. https://chromedevtools.github.io/devtools-protocol/tot/Debugger/
These API facts do not prove this collector works; Task1 controls must do that.

## Collection contract

Test-only helper tests/helpers/inspector-input-order.mjs exports serializable
inputOrderProbe({action,phase,draft,incoming,planId,raw}), inputOrderSites(source,
layout), installInputOrderTrace(session,{sourceURL,source,expectedHash,layout}).
Layouts source/packed76 are explicit, exact unique statement anchors. Six sites:
receive-before/after, edit-before/after, settle-before/after. Resolve only inside
createInputController; actual native source SHA and exact resolved locations must
match. Unknown/duplicate/moved sites, ambiguous scripts or unexpected pause refuse.

Own nonenumerable temporary inspector slot only; refuse an existing slot. Project
only #minPrice's row id/raw/value/resource revision/draft revision/conflict/error,
incoming investigation/revision/row and transaction count, plan id and phase sequence.
Retain no opaque app objects, pairing credentials or arbitrary source/value dumps.
256 events,128-character raw/error,2048-character revision; overflow/missing/invalid
projection explicitly invalidates the diagnostic, never silently truncates a pass.
Stop removes only own slot. Breakpoint removal, probe stop and Debugger.disable
are independent cleanup attempts; report failures. Unexpected pause resumes promptly
and invalidates the run. No source/model/product behavior or timer policy changes.

## Evidence and stopping rule

First: TDD actual serialized probe, source-anchor refusal and CDP cleanup controls.
Then one owned sandboxed headless Chrome source-controller control validates six
resolved sites and false conditions without pause, using synthetic backend/edits.
This control is not actual application or native input acceptance. No app needed.
If this technique fails, preserve the literal failure and diagnose before native use.

Only after that, freeze one native case on exact unchanged76/UI2 and original
commerce app65-file map. Reuse installed dependencies/loopback two-product data.
Own Chrome/Xephyr/profile, no certificate/IDE/user profile. Two native inspector
Live inputs10 then20, no Enter/blur, ordinary250ms controller debounce unchanged.
One1200ms bounded observation window after each, as instrumentation protocol only.
Do not repeat the mutation observer or old full guide/Undo/Draft/baseline/Close.
Capture row error/aria-invalid, projected ordered trace and exact cached backend
snapshots. Accept neither a specific stale text nor a successful20 by assumption:
record literal outcome and joins; require complete six-site evidence, no overflow,
no unexpected pause and no unreported model projection failure. Actual first ack
and second outcome must be classified from captured facts; missing facts stay
Unknown and make diagnosis incomplete. Original guide/17 results never become PASS.

ActualNode admission must bind process.execPath and /proc/self/exe hash plus Vite
/proc/PID/exe, addressing the old deferred harness gap in this new driver only.
Pre-register clean source/protocol and immutable inputs before one native run;
retain all old failures unchanged. Saved independent verifier/negative controls
and ONE final fresh whole-item review; at most one tested Important/Critical pass,
no rereview. No full-product suite/build needed for test-only additions unless an
actual product change becomes necessary; then explain scope before implementing.
SDK/publication/other repo/redesign/new Live or production policy are excluded.
