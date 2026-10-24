# A02.6 — original array call-site bridge (in progress)

Base40146b7; latest human autonomy through Oct25 evening/scope-review-1/20of29.
[Design](../superpowers/specs/2026-10-24-a02-array-callsite-bridge-design.md),
[plan](../superpowers/plans/2026-10-24-a02-array-callsite-bridge.md).

A02.5 demonstrates only source fixture callback identities. Its persistent wrapper
frames and deferred reentrant Stop Minor prohibit generic deployment; old module
and evidence remain unchanged. This item adds separate frame-only hooks and a
source transform, then at most one original/off/on independent TodoMVC source
experiment if semantic gates pass. Native original callbacks must execute directly;
causal storage/state revision/React props/ownership/selected producer remain Unknown.
No product/plugin/SDK/UI/otherrepo/publication or old native campaign change.

Current evidence: source inspection and official Babel Context7 docs only; no new
code/tests/native outcome yet. Relevant existing call/temp/scope patterns read in
src/engine/script-transform.mjs and action-transform.mjs; neither is modified.
Planning is not implementation or capability readiness.

## Task1 source implementation checkpoint

New self-contained frame recorder forwards no app execution: actual native
Reflect.apply is exposed directly; begin/yielded/finish/abort only record weak
identities and return original results. Stop/window rotation invalidates tokens.
Source callback results/array/item fields are not re-read. Opaque IDs are captured
at original entry/yield/return; bounded call audit marks pending/completed states.
Saved history therefore does not depend on later WeakRef liveness, reconstruct
objects, establish current membership or prove GC behavior.

Transformer preserves receiver/method/argument order and inline original arrow
evaluation, including a stack-sensitive getter for which the old wrapper changes
the branch. Generated receiver/method/token bindings are cleared in the original
owner's finally, not an extra JS function. Native callback length1 and lexical
this/arguments/new.target remain. Foreign/off paths use the original arrow body;
unsupported forms remain unchanged with explicit reasons. No generic source/
stack-location reflection or hostile-intrinsic transparency is claimed.

TDD: frame/transform missing-module RED each fails one file before tests execute.
Initial frame19PASS/transform35PASS. Strict nested-function counterexample then
35PASS/1FAIL (`_saArrReceiver` undefined): cloning an outer callback discarded the
nested owner's declarations. Outer callbacks with any nested target are now
explicitly excluded; inner source executes correctly. Repeated caught failing site
in a loop36PASS/1FAIL pending1≠0→abort prior per-site token before reuse fixes it.

First aggregate56PASS and full **3094PASS/0FAIL/0cancelled/0SKIP**,107.49s, precede
the saved-call audit. Added audit control19PASS/1FAIL missing calls; capture original
IDs and explicit metadata→final **57PASS**. Fresh final `npm test` **3095PASS/
0FAIL/0cancelled/0SKIP**,101.70s, terminal92182. Old count/results unchanged. Logs in
`.artifacts/a02/array-callsite-source/2026-10-24`; product327/nine old experiment/app
files match and no product importer. TodoMVC original manifest has28 files, not
commerce65. Native0; source/task commit and Task2 frozen acceptance remain due.

## Task2 source driver ready, native not prepared yet

Task1 is committed **5d0955d**; task-done57PASS covers40146b7..5d0955d.
Task2 extends its recorder with atomic `sealWindow`: close collection/retire tokens,
retain pending as incomplete, permit only explicit next-window resume. Old A02.5
stays unchanged. Missing seal API23PASS/26FAIL→API47PASS/2FAIL (live/unsealed
accepted)→strict guard GREEN. Native window acceptance now requires sealed data,
collectingfalse/pending0, full source call/yield joins and exact source metadata.

Pure native-data guards: initial25 missing-module failures→25PASS; closure controls
expand to27. Driver guard/profile/CLI initial20FAIL→19PASS/1 missing driver→all pass.
Three coherent page/document counterexamples19PASS/4FAIL including missing CLI→fixed
page label, same loader/frame/target and single-frame binding. A real temporary-file
case/source drift test23PASS/1FAIL missing helper→pre-run expected hashes retained
and checked again at finalization. A refused-phase persistence test24PASS/1FAIL
missing saver→raw facts saved before validation, and mode failure facts/screenshot
are acquired before closing its page. These are source/filesystem controls, not
native fault-recovery evidence.

Current driver imports no IDE/extension launcher. Prepare is resource-free and
requires a clean source commit/new unique output; native execution requires a
committed case and exclusive run marker. Actual Node/proc identity, Chrome binary/
owned PID/profile/headless/sandbox, source/bundle/manifest and independent cleanup
are checked. No certificate or system/user-profile operation. Runtime collection
starts only at declared windows; setup has collection sealed. Capture waits for
actual UI plus recorded completed Main map metadata under the fixed20s harness
timeout, then seals. That timeout is not an approved Live/latency product policy.

Final affected aggregate **111PASS**; current fresh `npm test` **3149PASS/0FAIL/
0cancelled/0SKIP**,99.71s, terminal92696. Earlier3148/3149 source checkpoints are
retained in separate logs and not relabelled. Current25 driver controls pass after
readiness finalization. **No browser/HTTP/native case has started.** Commit this
source checkpoint, then prepare/pin the ONE case from these clean bytes.

## Frozen source-engine case, before browser launch

Clean source driver **1fbd2ac1ce6ec57fbaa9a1ef24c70ad155d8ab57** prepared
`docs/testing/array-callsite-case.json` and unique output
`.artifacts/a02/array-callsite-native/2026-10-24T16-40-09Z` without resources.
406 input hashes plus case itself are checked by preflight. Original28 manifest
is **React13 + Vue14 + license**; only React executes. All original files remain
unchanged; no Vue/native/product coverage is inferred.

Eight admitted source sites; exact original Main digest
09164b4bb70f4162ca2d32e3961133653fd0f9934244ba21eb85477218008a28,
filter13:13–21:15 and map43:18–45:19. Original/observed JS digests respectively
20dd33100cdff8735823c1aec9bd38259e5e43bc6595fb17d4590e1d09711a7d and
c500d3f2ed52a7441be267bce30ee65e9ec17bd73472910e0196caf15bd78d0c;
both CSS9345bytes/digest962f80e6140eef0228ace22464a406e603c556c5b59dc510c7947d19e5353e40.
Unmodified React/ReactDOM19.2.5 vendor bytes; automatic JSX/esbuild overlay is not
original Webpack, installed Atom/plugin/helper or normal-user guide acceptance.

Native max1/exclusive marker, original/off/on and six sealed windows fixed. Every
Main map group is checked from raw call/yield/source/page/window identities; no
latest-group-to-selected-DOM inference. Equal rows distinct; new first-row reference
and unchanged second reference; active filter retains second at original index1;
Stop must leave Unknown/no data while original UI continues. Same-value UI alone
does not satisfy source readiness. Console/inputs/actual process/cleanup guards
remain mandatory. No browser run or result yet; commit case before execution.

## First actual attempt: Chrome identity collector refuses before app phases

Case committed **341dd50**, actual Node job36684 is terminal exit1:
`INCOMPLETE_SOURCE_ARRAY_CALLSITE_NOT_FULL_A02`, **1 named check passed**, zero
app modes/phases. Raw result in the frozen output above, SHA256
**9fda880a7b7afefd95df7c21e69882c3383da92b9c520e001995cfb2dc58829b**.
Exact error: Browser.getBrowserCommandLine refuses because --enable-automation
is not set. No source/React/UI behavior was tested by this attempt.

Browser context and server close returned successfully, attached console0. PID
discovery followed the refused command, so no PID was captured; raw cleanup value
"not-started" describes missing PID and must **not** be used to claim Chrome never
launched. Read-only current /proc inspection finds no process using the exact
owned-profile argument. All **407 physical inputs** and original raw/preparation/
registration/start files were checked before any source fix; clean checkpoint
`pre-process-fix-checkpoint.json` records these facts. Original case is exhausted,
not rerun or relabelled; all positive acquisition questions remain unexecuted.

Bounded prerequisite correction: discover owned browser PID via SystemInfo first
and use its actual /proc executable/hash/arguments for the same profile/headless/
sandbox assertions. Avoid the gated command without adding automation flags or
changing browser configuration. Actual-process source controls and a separate
newly frozen affected process-case are required. No pass from this document.

Collector source correction: owned Node child with real /proc bytes, foreign
profile/hash/executable negative controls, gated CDP command deliberately absent.
RED25PASS/1FAIL missing helper → GREEN26PASS. This is process IO source evidence,
not Chrome acquisition. Spec/plan permit one separately frozen corrected process
case (two attempts total, max1 each); first raw failure and407-input pre-fix
checkpoint retained. Launch flags/app criteria are unchanged; no third attempt.

Corrected-process source gate: aggregate112PASS; full npm test3150PASS/0FAIL/0cancelled/0SKIP112.25s, terminal10745. Product327+old9 physical hashes unchanged. Originalcase406sourceinputs:402physical+4 declaredhistoricalGit(driver/test/spec/plan); oldcasebytes/raw preserved separately. No new native yet. process-source-verification.json records exact distinction.
