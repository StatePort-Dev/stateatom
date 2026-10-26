# Recording Publication Window Implementation Plan

> REQUIRED superpowers:executing-plans inline; ONE fresh bounded whole-item review.

**Goal:** Batch first recording saves across separate event tasks with fast storage.
**Architecture:** Internal nominal16ms defaulttimer, unchanged publisher flow and
synchronous collector, exact independent terminal/runtime-disposal behavior.
**Tech Stack:** ExistingNode24/owned virtualclock/runtime fixtures, no dependencies.
**Spec:** ../specs/2026-10-26-v02-publication-window-design.md

## Global Constraints
Main/localcommits;20of29/fullV02/16deferred unchanged. Nominal16ms FIRSTsave only,
not harddeadline or Live cadence; immediateinflightfollowups remain. Allcollection/
metrics/frames/records/limits/explicitterminalwrites/source/permission semantics exact.
ONLYpublisher+2tests existingcodefiles; no package/native/model/CA/import/UI/SDK/
otherrepo/publication. Preserve327oldproduct/archives/closed22/432oldinputs via exact
singlepublisher historicalGit afteredit. No native/reader retry or10%waiver.

## Review Focus
- Separate task bursts must batch without dropping a latest-state request.
- Pending timer cannot delay explicit Stop/Clear/revoke or terminal limits.
- Late callback cannot resurrect replaced/cleared state or overwrite shutdown replacement.
- Immediate in-flight followup/rejection/notify reentrancy semantics remain intact.
- Nominal16ms source scheduling is not actual latency/native-overhead proof or Live policy.

### Task 1: Internal first-save window with exact runtime safety controls
**Files:** MODIFY packages/atom/src/observation-publisher.mjs,
tests/atom/observation-publisher.test.mjs,tests/atom/production-observation-runtime.test.mjs;
record213/status/index.
**Interfaces:** internal OBSERVATION_PUBLICATION_DELAY_MS=16/defaultschedule only;
existing createObservationPublisher returnPromise/flow/publicAPI unchanged.
- [ ] task-start/read/register beforeedit; retain actualbeforeprobe20saves/20tasks as sourceonly.
- [ ] RED ownedfactory separatetasks/noearlysave/lateststate and actualruntime completeledger/terminal guards.
- [ ] Minimalinternalconstant/defaulttimer; adapt queued-timer selectors and synchronize5in-flight fixtures on actualwriterentry, keepalloriginalassertions.
- [ ] GREEN focused/full/syntax/diff/hash/parity; sourcecheckpoint/localcommit/task-done.
Expected sourceonly/native0/model0; newpackage and originalgate remain separate.

## Final gate
ONEfreshwholeitemread-onlyreview, ONEtestedI/Cpass/minorsdefer/no rereview.
ArchiveCRC/allbytes/ledgeridentity/binder thenremoveonlyownworkspace/localclosecommit.
Continue to27Oct09Mauritius; one nextdependency-validitem, no broadreaudit/native matrix.
