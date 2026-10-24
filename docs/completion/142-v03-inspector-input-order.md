# V03.19 — bounded inspector ordering diagnosis complete

Current: **Bounded diagnosis complete after ONE review and one tested Important correction pass.** Actual ten-record order/visible local conflict preserved; finalization guard corrected. Original guide/native17 remain FAIL; no product fix or full V03 acceptance.
Baseline843a648; A02.4 bounded complete, whole20/29 unchanged. V03.17/native guide
FAIL and V03.18 source-only ordering results remain unchanged. Goal is actual
inspector receive/edit/ack order and the visible per-row refusal, not a guard or
recovery change. [Design](../superpowers/specs/2026-10-24-v03-inspector-order-diagnosis-design.md),
[plan](../superpowers/plans/2026-10-24-v03-inspector-order-diagnosis.md).

Executor chose exact-source conditional breakpoints on the owned inspector only,
always false with bounded projected model metadata. First prove that technique
on the actual source controller with a synthetic backend; it is not native app
acceptance. Only after it passes, register one native case with enough collection
to answer the missing question. No source/app rewrite, app expressions, new timing,
private setter, certificate or IDE campaign. Whole V03/A02/V02/L02/C09 stay open;
A05/L02 mandatory, SDK outside Atom, human participation not a blocker.

## Task1 source controls before browser

Actual serialized probe/source/CDP boundary controls: missing module **13FAIL**;
first implementation9PASS4FAIL (source anchor whitespace/concatenation precedence
and a generated bundle without source comments), corrected exact anchors13PASS.
Additional serialized always-false/failure control and protocol BreakLocation
metadata test: **14PASS1FAIL ->15PASS** after passing only the three Location fields
to CDP. No tolerance/automatic anchor guessing was added. Limits/projection/slot
ownership, partial cleanup and unexpected pause refusal are covered.

Source-controller technique driver is written and syntax checked, not executed.
It serves only the actual controller/draft/plan modules plus a synthetic backend,
uses copied old native baseline data explicitly as synthetic metadata, and scripts
two model edits10/20. The old application is not started. Before Chrome, it seals
source/served bytes/old seed/actualNode/Chrome identities. This will establish only
that six breakpoint sites and ten pre/post records behave as intended, never a
new native commerce result. Own headless sandboxed Chrome; no extensions or
certificates. Original product and all old records unchanged.

## Task1 actual source-controller technique control

On7e7e691, one owned sandboxed headless Chrome control passes
`PASS_SOURCE_CONTROLLER_TRACE_TECHNIQUE_ONLY`. Output:
`.artifacts/v03/inspector-order-control/2026-10-24T10-02-25-811Z/`.
Six resolved sites produce ten ordered pre/post records: first edit, first settle,
accepted receive, second edit, second settle. Raw0→10→20, own acknowledgement clears
dirty state, received revision changes before the next edit, final value20/history2.
No unexpected pause/overflow/projection error or console warning/error. Own slot
removed; controller, CDP session, context, browser and loopback server closed.
All9 registered inputs match. Independent saved verifier10negative controls PASS.

This uses actual source-controller modules with synthetic backend/scripted edits;
no native application or installed-product acceptance is claimed. Old native facts,
model/guard behavior and timing remain unchanged. The technique now permits Task2
preparation of one adequately collected native ordering/visible-row question.

## Task2 frozen native question

New driver/classifier/admission controls13 missing-module RED→13PASS; independent
cleanup fault control RED13PASS1FAIL→GREEN14. Combined with Task1: **29PASS**.
The classifier requires actual paired trace, two literal native edits, transaction/
resource joins and actual visible row message for local conflict. It does not
invent a backend error code or rewrite old native classifier failure.

Preparation initially refused a stale copied source hash before any resources:
old V03 helper-source inventory pins first-read/build-profile before A02.4's exact
recipe/self-pin refresh. A follow-up source check incorrectly looked for this
builder in Atom's payload manifest; it is not there. The actual current A02.4
source-helper inventory supplies the exact new hash. New case explicitly records
this one historical source difference, with both old/current hashes. Product
payload/source has no new change; this extra source inventory is not a claim of
new installed helper/VSIX qualification. No helper/IDE process runs here. Both
preparation failures occurred before a native registration/resource; no old map
or result was rewritten.

`docs/testing/inspector-input-order-case76.json` freezes max1 run, current76/UI2,
327 product inputs,223 source-inventory inputs,36 other pinned inputs and both
65-file original/copied source maps plus packed host files. Preflight **578 inputs
PASS**, no browser/server launched. Output reserved at
`.artifacts/v03/inspector-input-order/2026-10-24T10-13-15-954Z`.
Actual driver/proc and Vite/proc executable admission are required; this addresses
the old deferred Node-admission issue only in the new driver, not retroactively.

Next: commit exact case/driver then execute once. Source-controller control stays
separate, original guide/native17 remain FAIL. No automatic refresh/rebase/discard,
Undo/Draft/baseline/mutation-probe/whole guide retry or new timing/production policy.

## Task2 actual native result

One registered run on **1f592ee** terminates
`DIAGNOSIS_CAPTURE_COMPLETE_NOT_GUIDE_ACCEPTANCE`, **6/6 named checks**.
Output `.artifacts/v03/inspector-input-order/2026-10-24T10-13-15-954Z/results.json`;
SHA256 **1a25865a240334c0a9fb5a8c16c0094efbd39dcfe80549ecf0bf6c41577904ce**.
Exact76/UI2,327 product/223 source-inventory/original65 copied and immutable files,
578 total inputs unchanged. Vite actual /proc executable matches executing Node;
six actual packed-bundle locations match the source hash. Observer runs only on
the owned inspector, no source replacement or application Debugger collector.

Ten ordered records establish THIS instrumented run's actual path:

1. First native edit creates raw10 from baseline0. A same-resource receive occurs
   before the first acknowledgement and does not conflict.
2. First settle records the actual plan/receipt, resource revision ending
   `2:7:2:1`, value10; dirty clears and no draft remains.
3. During the first window the backend snapshot reaches `2:10:2:1` with value10.
   The inspector trace still has six records; its last model resource is revision7.
4. Second native edit creates raw20/draft from revision7, initially conflictfalse.
5. The next controller receive supplies revision10. After that call the resource
   is10, draft revision remains7, raw20 survives and conflict becomes true.

Actual row is visible/focused/aria-invalid=true, message **“Field changed elsewhere.
Discard this draft.”**, summary “Review 1 field error.” Backend retains one applied
transaction/value10, application native value10/products[1]; no second write.
Outcome `LOCAL_CONFLICT_REFUSED_WITHOUT_WRITE` describes local captured facts;
backend error code remains **Unknown**, not an invented `STALE_RESOURCE` receipt.
The row screenshot was viewed and remains a candidate.

Two windows each retain ten samples over **1258/1234ms**. These are fixed diagnostic
windows under observer overhead, not an approved timing policy/performance result.
Captures of backend/DOM/UI/trace are interval bounded, not atomic. First ack already
records native10 while the application's product list can still be[1,2]; products
become[1] by afterFirst. The initial independent verifier incorrectly expected the
post-debounce list at ack too; it was corrected to the registered after-window
criterion. Actual raw result was never changed and no native run repeated.

No unexpected pause, overflow, projection error or attached console warning/error.
Stopped trace has all ten identical records, own slot removed, all independent
cleanup steps pass; Chrome1529317/Vite1529276 absent. Saved independent verifier
**20negative controls PASS** checks actual order/row/revision joins, windows, exact
source/inputs, old hashes, actualNode and cleanup; files in output `verification/`.
It does not accept the original guide or retroactively determine native17's order.

ONE final review is now due. No product source/package/guard/timing/permissions
changed. The next bounded source question is why the clean inspector model still
held7 while a sampled backend snapshot already held10, before proposing any
synchronization change. No automatic rebase or another native guide campaign.

## Final review and one correction pass

ONE fresh astra/high read-only review on843a648..23cd8a7: **0Critical/1Important/
0Minor**, fresh29PASS and read-only native verifier/20negative controls PASS.
Report `.artifacts/v03/inspector-input-order-review/2026-10-24/report.md`.
I1: late collection errors/overflow/extra records between classified read and Stop
could retain COMPLETE because cleanup checked only unexpected pauses. The saved
native run is unaffected: all final ten records match and validity fields pass.
Clean pre-fix checkpoint at23cd8a7 verifies all578 inputs before any edits.

Actual old cleanup/finalizer logic exposed to focused tests produces **16PASS/
6FAIL** for late overflow/projection/count/extra/changed-record/still-active states.
The corrected guard requires STOPPED, no errors/overflow/pauses, a consistent finite
count and exact equality with the classified records; mismatches make trace cleanup
fail and final status INCOMPLETE, while every other cleanup still runs. Final
focused **37PASS**. One tested correction pass; no rereview or native repetition.

The initial full source run was interrupted during an existing observation test:
1027PASS/0FAIL/1919cancelled; this is not a passing full run or established product
regression. Its log explicitly says “Interrupted while running,” consistent with
the external turn interruption. That file alone27PASS; with both new files64PASS.
The subsequent uninterrupted `npm test` completes **2955PASS/0FAIL/0cancelled/
0SKIP**,104.23s. Both logs remain under this plan's workspace.

`verify-fix.mjs` and `fix-verification.json` in the review output validate the
unchanged saved result with the stronger guard and six negative controls. All
**576 physical frozen inputs +2 registered historical Git blobs** match the
pre-fix checkpoint; exactly the driver and its tests differ. Product source/
payload changes0, no package rebuild/native repeat. Old strict pre-fix verifier
is historical after these known test-file edits; it is not falsely labelled a
fresh physical578-input run. Current fixed guard accepts all ten saved records.

Executor rulings on all review declined boundaries (with cost):

1. Clean-model delivery cause/fix remains the next source question. Cost: this
   diagnosis does not claim to cure repeated Live editing.
2. Conditional-breakpoint order is scoped to this run. Cost: no uninstrumented
   timing/performance or React-writer attribution.
3. Preserve original guide/native17 FAIL and all remaining baseline gates. Cost:
   no new whole-task acceptance;20/29 unchanged.
4. Screenshot is a candidate, not human fidelity acceptance. Cost: no human study;
   independent human participation is still not a blocker.
5. Extra helper-source inventory is source identity only. Cost: no new installed
   helper/VSIX/IDE-trust support claim.

Other executor choices: keep main/local commits and retained scratch/history under
the user's explicit autonomous/shared-checkout instructions; no branch/menu/push/
publication. Use an inspector-only observer rather than product API/source rewrite,
with explicit overhead and hard projection limits. Preserve the original native
artifact and bound the finalization fix with historical source equality rather
than repeat the campaign. The frozen plan/case remain unchanged; completion is
recorded here and in the execution ledger. No deferred Minors.

One next item: **V03.20 source diagnosis of clean editor snapshot delivery before
a second Live edit**. Read the existing runtime/editor/UI path and build only the
missing bounded source control before choosing any synchronization change. No
new timing policy, automatic rebasing, revision/ABA waiver or blind native retry.
