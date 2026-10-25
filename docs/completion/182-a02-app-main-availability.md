# A02.32 — App/Main original-gate availability diagnostics

Source-only addition of owned closureAvailability metadata. Exactly2research files
changed: app-main-props-observer.mjs and its observer test;135baseline accounted as
133unchanged+2declared,327product/allhistoricalraw unchanged. Source base
98e3458ce944567acc1de43ca4bd41709e1713d0. Registration
.artifacts/a02/app-main-availability-source/2026-10-25/registration.json.

Each original config/Main/callback gate now records true/false or NotChecked.
Assignments capture ORIGINAL short-circuit results, retaining exact WeakRef.read
order/count. No extra deref, stronger raw references, app field/getter/iterator
reads, changed status/reason/links or lowered acceptance. Equality=true with
unavailable targets is diagnostic predicate truth only, not identity evidence.
Off/Stop diagnostics have no closure rows. All stronger origins remainUnknown.

Corrected RED33tests26PASS7FAIL missing diagnostics (first draft had a test-local
shadowing error corrected before implementation). GREEN33PASS83.253822ms.
Full4776/4776PASS0fail0skip121607.375241ms/exit0; syntax/diffPASS.
Five OWNED controlled scenarios preserve20WeakRef constructors each and exact
read traces62/48/28/28/37, plus exact legacy serialized hashes after omitting the
new optional metadata. Positive, selective App-element/todos/config/callback-element
loss, NotChecked/Off/Stop checks pass. All26prior controls remain.

Selective unavailable App JSX element reproduces status SHAPE: wholeAppMainUnknown,
nested AppBinding/MainInputObserved. New metadata identifies appElementAvailable
false in that OWNED control. This is not an actual A02.31 missing-reference/GC
witness. A02.31 raw has no such fields; its exact cause remainsUnknown.
Context7 /tc39/ecma262 confirmed current WeakRef.deref/AddToKeptObjects semantics;
language semantics are not evidence of a particular historical collection event.

1452registered comparisons account for2declared changes and allother files equal.
Old A02.30 native1290inputs now1288currentphysical+2exactpreparedGit581786b;
old A02.31 native1416inputs now1414currentphysical+2exactpreparedGit7bddb1b.
Those2paths are observer/test only. Historical raw/case/reader bytes are preserved;
old native outcomes do not qualify new diagnostic source bytes. No native/App/
ReactDOM/model/oldreader run in this item.20of29/fullA02 unchanged;11oldminors retained, review adds M12 below.

ONEfresh final review gpt-6-astra/high0Critical0Important1Minor; no correction/
rereview. M12 deferred: line9 uniform diagnostic-type wording should distinguish
availability predicate values from child status/link-count summaries. Runtime
acceptance unaffected.11oldminors retained, total12.
Eight declined domains have effect/cost rulings: actualoldcause; changed-source
native behavior; realhostGC/performance; exhaustive combinations; oldreaders;
product/strongorigins/release; oldminors; archive. No absent evidence credited. Next ONE bounded actual availability-observation decision:
newly instrumented gate can provide exact missing-reference metadata in a separately
registered run; no automatic retry or presumed positive/GC/selectedDOM claim.
