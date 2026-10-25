# A02.34 — bounded research App-element retention

Continue4a8fc96 currentmain/localcommits. ONE source-only work item; no browser,
App/native campaign/model/cert/trust/profile/UI/SDK/otherrepo/publish changes.
Old weak-reference diagnostic campaign and L02 install campaign stay closed.

## Concrete remaining premise
Existing app-main-props-observer already captures App config===native JSX props===
Main incoming argument and todos===Main parameter. Do not add duplicate association.
A02.33 actually observed appElementAvailable:false and wholejointUnknown while
AppBinding/MainInput/nativeReturn were separately observed. GC cause was NOT observed.
Original snapshot gate intentionally requires live App JSX element; never delete,
relax or reconstruct that predicate from IDs. All historical results stay unchanged.

New question: can a separate explicitly retaining research observer keep only the
already observed accepted App JSX elements available for that same original gate,
with bounded owner/window lifetime? This is an experiment configuration chosen in
this task, NOT an approved product retention policy or proof of historical GC cause.
No general ownership framework. Original factory/defaults/body/WeakRef behavior
and all old tests/guards/preparers/native cases remain byte-identical.

## Closed additive wrapper
NEW experiments/react19-reducer/app-element-retaining-observer.mjs exports only
createAppElementRetainingObserver({page,enabled=true,policy}). Delegate the existing
createAppMainPropsObserver; return exact delegated values/snapshots/lookup/seal DTOs.
Wrap config so only accepted same-source configs are recognized via private WeakSet;
wrap tap so only their successfully accepted jsx-element-return value is strongly
held. Do not pin Main-local callback elements, arbitrary configs/metadata, arrays,
expressions or fallback IDs. No getters/iteration/property reflection on app values,
no expression re-evaluation, branch forcing or user dispatch. Preserve tap aliases.

Maximum64 App elements matches existing64config bound. Pins last through seal for
lookup, released on successful startWindow, stop, invalid/overflow or failure. Invalid
window argument leaves the current window/pins intact. Off holds nothing and does
not delegate tap. Counts bound references, NOT reachable graph bytes. Strong retention
alters object liveness deliberately; no unchanged-GC/performance/heap/privacy or
production suitability claim. Existing guarded Unknown still wins if a reference
is unavailable even under this mode. Never replace original gate output/status.
Expose separate readonly retention metadata: research mode/count/limit64/window/
reachableGraphBytes Unknown. Do not serialize application values.

Four NEW codefiles: wrapper; tests/helpers/app-element-retention-fixture.mjs (owned
synthetic policy/calls, no app import); tests/helpers/app-element-retention-gc.mjs
(test child only); tests/engine/react19-app-element-retaining-observer.test.mjs.
TDD parity with default source DTOs/returns, exact only-App selection, mismatch/
late/duplicate/missing event failures, off/stop/restart/invalid/capacity, hostile
metadata/getters/intrinsics and forced unavailable weak reference cannot pass.
One isolated Node24 child with --expose-gc proves OWNED object lifetime: weak control
collected, retaining mode holds it, stop releases it. Maximum10bounded async GC
cycles per control,10s child timeout; no actual App/Chrome/GCcause claim. Flag stays
out of browser/application/normal parent. Official Node v24 docs queried viaContext7;
local --v8-options confirms flag. GC flags are testing-only/unstable diagnostics.

Protect current139prior research paths (actual union prior135+4new33 files),327product80,
oldA0233 raw/case/readers and all474lastL02native inputs/current raw/reader report.
This is before/after preservation of CURRENTbytes, not requalification of older
source/native manifests. No historical evidence or old threshold upgraded.
One fresh final whole-item review; ONE tested I/C pass, no rereview;14old minors defer.
Finish bounded source task and localcommit. No native sequel automatic in this item;
nextONE must explicitly decide whether original-gate acquisition is justified.
