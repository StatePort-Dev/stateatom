# V02.23 — recording first-save window across separate tasks

Current:source verification passed/review pending; no package/native/model. Baseaa6f57f/main,
20of29/fullV02/16historicaldeferred unchanged. [Spec](../superpowers/specs/2026-10-26-v02-publication-window-design.md),
[plan](../superpowers/plans/2026-10-26-v02-publication-window.md). Originalnew81gate
24.3861/22.8143%MISS10% remains; Basicp95382.9/449.4msPASS1s. No waiver/retry.

Ownedvirtualclock actualoldfactory:20separate1ms source tasks/fastackstorage→20saves/
20notices. Nominal16ms firstsave nowcombines them into2lateststate saves/notices[16,19],
finalstate preserved. Actualruntime controlledtimer keeps all20requests20completed/
20records synchronously beforeonecurrentstate save. Source behavior only, not native
CPU/memory/timing/rootcause/performance proof.

Onlyproductdelta publisher internalconstant16/defaultschedule. Wholepublisher text
normalizes exactly tobase; in-flight latestfollowups/error/notice-reentrancy unchanged.
No16msminspacing guarantee during in-flightdirty drainage and no hardtimerdeadline.
Internalimplementation delay is not an approved Live/Draft cadence, productiongrant
scope/duration or handoffUX decision. No skipped events/snapshots queue/newauthority;
collector/maps/source/metrics/budgets/terminalwrites unchanged.

New3controls RED56PASS/3FAIL; minimal16ms made new3PASS but5oldin-flight fixtures
failed becausefirstwrite hadnotentered aftertheir0mstick assumption. Exactbefore-
adaptation3files/logs preserved. Testsetup nowawaitsactualfirstwriteentry (2sbounded
precondition), thenexecutesEVERYoldStop/Delete/newStart/permission/twoowner/gap1000/
context assertion. Queuedtimer selectors useinternaldelay, preserving all64record/
32pending/replacement/shutdown criteria. No acceptance/assertion reduction.
59targetedPASS4348.429968ms/81focusedPASS4427.522828ms; full5712PASS159417.875368ms/0FAIL0SKIP; syntax3/diffPASS.

Per-original-test ASTassertion multisets prove everyoldassert remains initsoriginal
test. Wholepublisher byteexact afterconstant/defaultargument normalization. First
parity invocation hit known sandbox Node spawnSyncgitEPERM beforeoutput; same read-only
check passed onhost, no test/code/native fallback. Registered1908tracked/current327/
archives2/closed22+432frozen beforeedits. Old81 now326current+onepublisher historicalGit;
raw/case/reader/markers/archives untouched. No package/browser/native/model/CA/import/
UI/SDK/otherrepo/policy/publication. Fullsource/reviewnext, newcandidate afterward.
Artifacts `.artifacts/v02/publication-window-source/2026-10-26/`.

Savedsourcecheckpoint/binder PASS1903protected/current81product326+exactbaseGit1/
archives2/previous432=431physical+Git1/closed22packet unchanged. Full5712source checks
complete, no package/browser/native/model. ONE finalboundedsource review next.
