# V02.23 — coalesce recording publication across separate event tasks

Mainaa6f57f/local commits;20of29/fullV02/16historicaldeferred unchanged. Userautonomy
optsout of design-selection questions. Previous22 complete new81gate24.3861/22.8143%
misses10%; Basicp95382.9/449.4passes1s. No native/reader retry or waivedcriterion.

Runtime recording updates its bounded ledger synchronously. Publisher currently
uses setTimeout0 before firstsave; fast-ack calls in separate tasks can each settle
before the next call. Actual currentfactory under ownedvirtualclock/20separate1ms
steps produces20saves+20notifications, preservingfinalstate. Savedprobe-before.json
is sourcebehavior only, not nativecost/timing/rootcause proof. Previous184 combined
microtask bursts; this concrete separate-task case is distinct, not that experiment
rerun. Do not claim redundantpublication explains allmeasurednative overhead.

Choose nominal16ms first-save scheduling window for recording publication. This is
executor-selected internal implementation timing underautonomy, not an already
approved Live/Draft interval, production-permission scope/duration or handoffUX.
No hardreal-time≤16ms guarantee: background/loaded timers may be delayed. Basicpath,
explicit Read/Start/Stop/Clear/revoke/limits and shutdown persist directly as before.
All events/ids/frames/revisions/ledger/gap counters are collected synchronously;
no skipped events, snapshots queue, recordbudget/workload/poll/metric change.

ONLY productdelta packages/atom/src/observation-publisher.mjs: export internalmodule
OBSERVATION_PUBLICATION_DELAY_MS=16, use in existingdefaultschedule. Package public
exports/API/wire unchanged. Onefirsttimer/sharedPromise/dirtyflag perowner; immediate
in-flight latest-state followups/rejection/notify-reentrancy semantics remain byteexact.
This is NOT a guarantee of16ms spacing between in-flight followups. Disposedruntime
persist/notify wrappers stayinert; do not add authority or resume afterworkerrestart.

MODIFY tests/atom/observation-publisher.test.mjs with actualfactory/controlledvirtual
clock regressions:20separatetasks coalesce20→2latestcurrentwrites, no write before
nominal16ms, singleflight/independentowner/finalstate. Keepold9sourcecontrols.
MODIFY tests/atom/production-observation-runtime.test.mjs: queued-timer stubs select
exportedinternaldelay (fallback0 for pre-implementationRED), preserving allprevious
exact counts/terminal/shutdown assertions. Add actualruntime/source20eventupdates
whilependingtimer: complete synchronous20request ledger/currentstate, no premature
write/notice, thenonecurrentlatest save; terminalexplicitStop immediate and latequeued
save cannot resurrectoldrecording. No threshold/recordcount reduction.

Register1908tracked/current327/archives2/previous432frozen/closed22packet before edits.
Exactly3existingcodefiles (publisher+2tests), sourceonly. Afterchange81becomeshistorical
forONEpublisherinput;432oldinputs431physical+exactaa6Gitpublisher. Preserve allraw/
case/reader/markers/archives untouched; source fulltests nevernewperformanceproof.
No newpackage/browser/native/model/CA/import/UI/token/provider/SDK/otherrepo/policy/
account/publication. Oneboundedsourceitem: targeted/full/syntax/hash verification,
ONEfreshread-onlyreview/ONEtestedI/Cpass/minorsdefer/no rereview. Archiveownworkspace
CRC/allbytes/identity/binder, localclosecommit. NextONE newimmutablecandidate+changed-
byte correctness before a separatelyfrozen originalgate, only ifsourcecontrol supports
this change. No automatic native matrix or speculation from docs/counts.

## Observed source-test precondition correction

Initial new3tests RED56PASS/3FAIL on oldsource; minimal16ms thennew3PASS but5old
in-flight fixtures FAIL54PASS/5FAIL. They assumedfirstsave hadentered afternetwork's
zero-delay turns. Delayedoldpublication/permission/twoowners/gap1000/context fixtures
now awaitactualfirstwriterentry (bounded2s test-onlyprecondition), thenexecuteexact
oldterminal/count/routing/subscription assertions. No assertion/record/threshold
reduction, no producthook. Queued-timer controls continueholding actualnominaldelay
andpreservefullreplacement/permission/context/64record/32pending/shutdowncriteria.
This necessarytestsetup adaptation extends the earlier selector-only wording while
remaining within the same declaredtestfile. Before-adaptation3files/logs preserved.
