# P04.2 private runtime observation admission

Continues committed P04.1 cfbfda7 within approved completion06 P04/U06 H07-H09.
Executor design under explicit autonomous task/check/local-commit instruction;
not new maintainer approval of implementation parameters. Architectural subsystem
integration follows the existing spec; UI/report/native acceptance remain later.

Use a private per-tab session wrapping the pure ledger, separate from the legacy
JSON-body collector. Start requires an authenticated live inspector/session/view,
owned attached debugger, site permission, current exact native selected document/
node/property and one default MAIN context. No attach/grant/edit/expression/action
is performed. Stop/read/clear require the same owner and window nonce; cleanup
works without browser authority. Another inspector cannot stop/delete/replace an
active window. A new explicit Start may replace only its own stopped window or
unowned historical metadata. Imported/restored metadata cannot construct an owner.

Store the immutable current ledger snapshot by reference in existing tab state,
inside the existing3-tab/5MB unsaved budget. A bounded per-tab owner holds only that
controller, at most32 native request clock/token pairs and one deadline timer.
No independent payload archive. On eviction remove the owner/timer as well as data.
End on navigation, selected context/selection/property loss, permission/lease loss,
inspector loss, explicit close/tab switch, runtime shutdown and time/record/byte cap.
Clear removes data; never aborts application requests or undoes edits. Restart
turns a persisted recording into stopped context-changed with unknown end, pending
completions unobserved; never resumes it or imports execution authority.

Native adapter: requestWillBeSent supplies monotonic seconds and epoch seconds;
retain that pair only for each admitted exact MAIN frame/loader request. Later
response/end occurrence time = wallStart*1000 + (monotonic - start)*1000. No use
of event delivery time as occurrence. Pre-Start/future/out-of-order timestamps
are refused by the ledger. Redirect ends the prior occurrence before admitting
a distinct one; missing starts remain unmatched. Runtime.exceptionThrown has
epoch milliseconds and requires exact selected MAIN executionContextId. Retain
only closed class name/origin/numeric location; no message/stack/object evaluation.
Never read headers/postData/bodies or invoke getResponseBody in this path.
Workers/child sessions/unknown loaders/contexts remain outside this finite coverage.

DOM change events have no occurrence timestamp. This slice does not invent one
or call receipt time a DOM-change time. Selected-node lifecycle is checked at
Start/read; later explicit native checkpoints must distinguish post-start read
from unknown mutation time. DOM/report/UI coverage remains pending parent P04.

Verification: RED/GREEN native-event source models plus real runtime/platform
ownership/races/lifecycle/cache tests, source full suite, types/build/package
contracts. Fresh native Chrome event/clock/owner proof is a separate bounded run
before calling runtime collection qualified. Existing47 historical proofs remain
unchanged; P04/C07 unfinished and18/29 whole tasks unchanged. One whole-parent
review only at H07-H09 acceptance. No redesign/SDK/publication/other repository.

Protocol references fetched via Context7 then exact primary definitions:
https://github.com/ChromeDevTools/devtools-protocol/blob/master/json/browser_protocol.json
https://github.com/ChromeDevTools/devtools-protocol/blob/master/json/js_protocol.json
Network MonotonicTime seconds vs TimeSinceEpoch seconds; Runtime Timestamp ms.

## Native phase correction after issued48

Failed48 actual Chrome153 records show loadingFinished timestamp1570864.913493
before responseReceived1570864.913590 on the same request, both after request
start1570864.911221. This disproves the executor's phase-order assumption; it
is not a negative total duration. The source core now validates each phase against
request/window start and retains both raw normalized times plus closed timingOrder
(end-precedes-response / response-precedes-end / response-unobserved / not-completed).
No clamp/rounding/arrival-time substitution and no tolerance for pre-request/pre-Start/
future/foreign data. The captured pair has its own failing source control before
correction. Original48 package, both native failures and prior P04.1 hash/results
remain historical. Issue49 contains this correction; parent criteria unchanged.

## Precise window clock after issued49

Native49 now completes successful/HTTP503/redirect phases, then refuses a fractional
loadingFailed time as future against an integer Date.now sample. The fixed captured
native values remain in its failed result. Issue50 uses performance.timeOrigin +
performance.now for selected-read/window times and ledger now; no rounding, clamp,
future tolerance or event-time substitution. Cross-clock drift still refuses data
and remains a gap; no universal clock-synchronisation claim. W3C HR Time semantics
and drift limitations were checked via Context7/W3C primary material. A global
Date.now-overwrite test instead invalidated unrelated platform leases (CANCELLED);
that attempt is retained, not counted as meaningful temporal RED. The private
precise clock helper missing-export RED, fractional native control and runtime
precise-bound checks are separately recorded. The source synthetic event fixture
now emits high-resolution epoch start stamps too; coarse generated stamps had
correctly fallen before a newly precise window and were not relaxed into it.
https://w3c.github.io/hr-time/

## Final runtime persistence boundary

The exact50 native runtime run passes9 checks across both hosts. Final source
controls also show that debugger owner loss must say context-changed rather than
invent site-permission revocation, and Read must revalidate its immutable result
after persistence as well as after native reads. A blocked prior storage write
cannot later overwrite Stop/replacement state. Issue51 coalesces existing cache
writes through one flight plus a dirty bit, snapshotting the latest bounded state
at submission; no queue/archive of historical payloads. All callers await the
current flush, and late Read returns STALE_TARGET if owner/snapshot changed.
Native50 remains historical until the exact51 is checked separately.
