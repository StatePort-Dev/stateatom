# A02.51 — selected native frame lookup isolation

Current result: bounded source correction closed after one final review; native0/model0, not full A02.
Base mainc23bf59, localcommits.20of29/fullL02/18deferred unchanged.

`lookupFrame(token)` resolved an exact row, but snapshotFor(selected) validated weak
references in every window row before filtering links. Four owned controls reproduce
a complete selected frame becomingUnknown because a different row lost a tuple/fiber/
dispatch reference, plus unwanted unrelated derefs. Existing distinct-frame tests
already require one selected link, not a whole-window result.

One minimal guard skips unrelated row validation after retaining its audit metadata.
Selected row still satisfies ALL original reference identity/liveness/native/source/
bound/returned/closed predicates. Global snapshot still checks all rows; globalinvalid,
overflow/collecting/active-stack/Stop/stale-window gates unchanged. No name/value/id
matching, neighboring-frame borrowing, new strong pins, application getter/Proxy
reflection, expression replay, source transform or native/browser/GC activity.

Six new synthetic declared-event tests:4RED/2PASS→6PASS. Both row orderings and missing
selected refs covered; unrelated row payloads not dereferenced, global snapshot remains
Unknown after any loss, selected invalid/stopped/unsealed/stale staysUnknown. Focused
96PASS8437.169255ms, `npm test`5786PASS/0FAIL0SKIP164982.993783ms; syntax/diff PASS.
These tests model loss through a controlled WeakRef class, restored immediately;
they do not run real GC, React or native code or prove actual selected-field behavior.

The modified observer is experimental and absent from current82product327manifest.
Current327/archives2 and relevant old50/19case/raw/readers/markers remain unchanged.
One sourcepath referenced by50 is now historical against exactbaseGit; raw1734input
map/firstreaderfailure/preservation25/acceptedbody0 are not rewritten or replayed.
This defect is NOT established as the cause of50's observed missing weak references;
whichref and GC/allocation cause remainUnknown. No new body/field/lineage qualification.
Global original native4/4/App4/8/Main5/9/joint4/8/Memo boundaries are not relaxed.

ONE final bounded-source review:0Critical/0Important/0Minor; no correction/rereview.
Source commit `5cb4cf6`. Own workspace archived with CRC/all-byte/plan-identity
and source preservation checks PASS, then removed. Archive .artifacts/a02/selected-frame-review/2026-10-27/workspace.zip
SHA256 `e1522acf274b513a2dd08b6f453ad0a9150de9620052cdf6bfd1ee27f818eddd`, 5 files. Deferred total18 unchanged.
No packagebuild/type/backend/native/reader repeat for unchanged public bytes. FullA02
remaining boundedfieldownership/effects and exact state→prop/parameter/destructure→
selected committed host path stillopen. NextONE source inspection of selected-source
callback eligibility if a separate concrete counterexample exists; no guessed GC fix
or newnativecase merely replacing50missing premise. SDK/otherrepo/publication out.
