# Native control revision diagnosis implementation plan

> **For agentic workers:** REQUIRED superpowers:executing-plans inline, ONE fresh final readonly review, no implementer agents.

**Goal:** Collect missing native mutation evidence underlying Live stale refusal.
**Architecture:** Test-only passive isolated observer plus narrow native UI driver;
unchanged candidate73/original app, two Live inputs and two fixed sampling windows.
**Tech Stack:** Existing Node24/Chrome153/Xephyr/loopbackHTTP and native helpers.
**Spec:** ../specs/2026-10-24-v03-control-revision-diagnosis-design.md

## Global Constraints

- Main2d9b308/localonly/latestOct25evening; scope-review-1/20of29/V03,V02,A02,L02,C09open/A05mandatoryscopedcomplete/L02mandatoryopen/SDKoutside/humannonblocker.
- Exact73/UI2/product327/helper223/originalReact19commerce65files and oldtwo-products12.5+7; no product/build/app/source/dependency/IDE/certtrust changes.
- Nativepicker #minPrice disabled=false; developmentcache+replayonly; original250msLivenote observed notapprovedpolicy/performanceproof.
- PassiveISOLATED attributes+childList/subtree/oldValue onexactoriginalnode;256records/1024char bounds, explicittruncation/replacement, writerUnknown.
- Two nativeLive inserts10then20/noEnter/noBlur;1200ms samplingaftereachack/insert; ordinarycachedstateonly/no input-read/Undo/Draft/Apply/baseline/guideClose rerun.
- OriginalguideFAIL/unwaived; stale andapplied alternativesliteral/no forcedoutcome; unknownconsumption/effect/applicationRestoredfalse/noglobalrestore.
- Fixedsource/case localcommitBEFOREoneactualrun; pollsamehandle; independentcleanup includingprobe+separatelogwrite/close.
- ONEfinalfreshreview/one testedImportantCriticalpass/no rereview; preservehistory/scratch/localmain/no publication/otherrepo/redesign.

## Review Focus

- Batched ABA mutations: oldValue exact, newValueAtDelivery explicitly delivery-only; no inferred writer or intermediatevalue.
- Pending callbacks at read/stop and cleanup refusal: drain own records before disconnect, retainprimaryfailure and all other cleanupattempts.
- Node replacement/truncation: refuse positive diagnosis, neveradoptnewnode/hideoverflow.
- Second input actually rejected: no inventedtransaction/appliedstate; compareliteralack/currentrevision/ownprobe andretainUnknown.
- Collector overhead/normal app behavior: no getter reevaluation/setterwrap/MAIN/pause/reload/privatefieldsetter/extraHTTPprobe; notuninstrumentedcausal/performanceproof.

### Task 1: One passive-mutation/native-Live diagnosis

**Files:** create tests/helpers/native-control-mutations.mjs; tests/atom/native-control-mutations.test.mjs;
tests/integration/control-revision-diagnosis-native.mjs; tests/atom/control-revision-diagnosis-harness.test.mjs;
docs/testing/control-revision-diagnosis-case73.json; docs/completion/139-v03-control-revision-diagnosis.md;
update docs/status.md and docs/completion/task-index.json only.
**Interfaces:** exported self-contained controlMutationProbe({action}) → serializable
snapshot with originalNodePresent,records,seen,truncated,writerUnknown; driver calls
chrome.scripting.executeScript ISOLATED, saves baseline/ack/firstWindow/secondWindow/
secondOutcome/probeCleanup and actualsource/identities/console/cleanup in results.json.

- [ ] Readbrief/BASE/ledger. Write realfunction tests beforehelper; missingmoduleRED,
then implement start/read/stop, pendingrecorddrain, ABA delivery,256/1024limits,duplicate/
missing/replacement and stopcleanup tests. Tests use substitutedDOM/observer boundaries,
notnativeacceptance. Run node --test --test-isolation=none tests/atom/native-control-mutations.test.mjs.
- [ ] Write actualdriver extractedguard/cleanup tests (missingdriverRED); implement
narrow protectednative driver preserving original setup/errors/cleanup with probeadded.
Corrupt identity/history/unknowns/snapshotorder/incompleteoutcome/overflow refusals tested.
- [ ] Syntax/focusedcontrols/immutablepreflight; registerexact73/327/223/65/oldFAILs and
newcollector/driver/controls/spec/plan beforelocalcommit. No productbuild/fullbackendrerun
unless newsourcechange/failure justifies it. Record139/index currentbeforelaunch.
- [ ] Once run node tests/integration/control-revision-diagnosis-native.mjs docs/testing/control-revision-diagnosis-case73.json; pollsamehandle, retainactualpartial/FAIL andallcleanup.
- [ ] Saved independent verifier/negativecontrols recomputes records (notjustsummary);
updateactualrecord/index thenONEfreshreview. One testedImportantCriticalpass only if
required; aggregate/task-done/localcommit/clean andone nextboundedstep. FullV03notaccepted.
