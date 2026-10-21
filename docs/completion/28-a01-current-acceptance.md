# A01 — current acceptance and picker presentation correction

Status: in progress; the complete A01 review has not yet run. This record extends
[27](27-a01-ordinary-react-progress.md), preserving its original results and the
approved scope-review-1 contract. Agent-operated checks and screenshots do not
establish a public release or independent human usability acceptance.

## Concrete problem and resulting behavior

The retained short-loop criterion requires previous source/operands/actions to
clear while choosing another element. A current run reproduced their return after
a background refresh. U05 separately requires Cancel/Escape to restore the exact
previous recorded snapshot. Permanently deleting the runtime record would violate
that accepted cancellation criterion.

The final implementation projects an empty selected-target presentation only while
picker status is starting, picking or resolving. Source/operands/action explanation,
raw selected details and current save/reinspect controls use that projection. The
original runtime record and saved bytes remain unchanged. Cancel/Escape reveals the
same old record, IDs and observation clock with its existing Not live label. It
creates no execution or new evidence. A synthetic retained finite-profile record is
also hidden while picking and restored only as its original scoped record on Cancel;
no finite proof is generalized to ordinary React19.

Open inputs is temporarily unavailable during selection even if old backend
capability metadata remains eligible. A controlled positive/counterexample checks
ordinary opening before selection, refusal during it, and restoration after Cancel.
Local drafts, input controllers, Live/Draft parameters and permission policy are
unchanged. A separate native setup failure exposed closed Settings stealing focus
on a tab/context update. Focus now returns to Settings only when its dialog really
was open and closed; existing consent, scope/lifetime and cleanup remain unchanged.

No observer/compiler/runtime source, token, primitive, CSS or public API contract
was changed. The supported source/read grammar and all unknown parameter/commit/
HTTP boundaries are documented in docs/testing/ordinary-react.md. Scope documents02
and12 remain byte-identical to44a1df1.

## Current candidate and checks

Candidate .37:
.artifacts/atom/2026-10-20T23-00-23-503Z/atom-handoff.json.
The receipt records dirty BASE85c4cc2 plus exact source/build/tarball/consumer/host
hashes; this is not described as a clean post-commit build.

- npm test:1619 PASS,0 fail/skip; .artifacts/a01/picker-start/full-source37.log.
- Focused UI/input/picker/history/Settings controls:63 PASS;
  .artifacts/a01/picker-start/focused37.log.
- Strict packed consumers:2 PASS; candidate type-consumer-result.json.
- Admission7 PASS:.artifacts/atom/compatibility/2026-10-20T23-02-07-371Z/result.json.
- Native ordinary grammar12/picker14/source-edit14/instances10 PASS, exact .37:
  .artifacts/a01/current-acceptance/verification37-native.json. This frozen record
  binds the executed archived driver; later test-only corpus additions do not
  retroactively change its driver hash or promote its scoped status to whole A01.
- Original three retained React/Redux questions PASS18 across both .37 hosts:
  .artifacts/a01/ordinary-corpus-native/2026-10-20T23-28-57-039Z/results.json.
  Native off/on add/toggle outputs agree; actual selector UI/current source digest,
  exact native backend/marker and reachable observed reads, real IDE selected bytes,
  original v1 save/review/completed browser download and fresh passive reader after
  app/IDE close. Redux was previously exposed, not a fresh holdout. The reader
  shows the question/source locations and exact original read nodes in its inert
  historical payload; it does not reverify execution or show all nodes in summary.
- Original eleven synthetic pinned18 host-UI criteria PASS in each .37 host plus
  exact package setup (23 checks):.artifacts/a01/retained-host-ui-native/
  2026-10-20T23-35-39-891Z/results.json. Actual committed-props/read UI, native form
  update/explicit reinspection, IDE/source ranges and bytes, reviewed native
  downloads, clone/mutation refusals and fresh offline historical reader. This is
  pinned18 synthetic support only; no React19 final producer is inferred.
- Affected current-report UI33 PASS:.artifacts/u03/input-reporter-native/
  2026-10-20T23-37-06-392Z/results.json. Original native/response Live/Draft, privacy,
  Save/download/restart/recipient criteria retained. This affected check is not a
  new U03 review or a wider H01–H06 reaudit.
- Current original short-loop30 PASS with explicit original partials in each host:
  .artifacts/a01/retained-short-loop-native/2026-10-20T23-45-39-352Z/results.json.
  Each host records20 PASS/10 PARTIAL,60 cases total, plus19 package/route/transition/
  navigation/viewport controls. Original T/E/V/I predicates and question values
  remain unchanged. Vue row/title/count-span, Basic and no-instrumentation cases
  remain PARTIAL; the original Vue strong-count variant remains a scoped positive.
  Native backend equality, actual UI/source/read rows and exact IDE selected bytes
  are recorded per case. Native form updates, picker start, property/tab switch,
  labelled return, real navigation/new page/run and390px controls pass in both.
- New aggregate PASS_CURRENT_A01_ACCEPTANCE_REVIEW_PENDING:
  .artifacts/a01/current-acceptance/verification37-final.json. It checks all current
  source/package/consumer/entire-host inputs, actual observation/download/report
  bytes, original case registration and scoped semantic/current UI evidence. It
  binds each executed archived driver to its own recorded hash, explicitly names
  later test-only driver/helper additions and never substitutes their new hash
  for a historical execution. Frozen verification37-native.json stays unchanged.
- A01.3 host21/source-consumption8/unit55 remain scoped current mechanism evidence:
  their mechanism/framework inputs still match exactly. The only recorded input
  delta is package-lock metadata Atom version.33→.37. The exact old lock is retained;
  parsed objects differ only at that version field, with all dependency pins equal.
  No old full experiment was rerun solely to change its package-version label.

The current acceptance matrix is complete within those declared scopes. ONE whole
A01 review and tested Critical/Important resolutions remain; parent A01 is not
completed by this aggregate or document.

Actual native methods are explicit. Both .37 hosts consume the exact installed
local immutable pair. Ordinary source tests use verified copied independent source
and locked dependencies, real native UI/DOM metadata and the real IDE audit. The
grammar program remains synthetic. Basic read-only, ordinary19 marker/read fragments,
pinned18 experimental host-props, installed helper setup, legacy raw local build and
passive saved records keep their separate evidence scopes.

## Preserved failing/control evidence

- Initial current host UI timed out after clicking before an explicit native
  picking wait. With that precondition the .33 local-build UI run passed11. The
  first timeout is not claimed as a proved product failure.
- Initial short-loop passed4 React cases, then two row picker waits failed; its
  legacy selected-path visibility wait also targeted text now hidden in Element
  details. The harness now checks visible title/value and exact state identity.
  Another run passed six React cases and reproduced the actual old-details issue.
- Intermediate .34 permanently cleared runtime selection. Its source1615/unit2
  results check that withdrawn behavior only. It conflicts with retained U05
  Cancel/Escape semantics and is not accepted. Its immutable archive remains.
  The old .34 picker driver failed0 at Attach with Native debugger resource already
  attached in its parallel app-CDP setup; it did not reach Cancel.
- Final presentation pure/mounted UI controls first failed2, then passed. An earlier
  mount-test setup omitted atom.target; that setup failure is kept separately.
  The first new runtime tests also had a malformed global open-handoff envelope
  and a blocked synthetic-gate cleanup; their incomplete results are not contract
  RED. One own hung test process was terminated; no user process was changed.
- .35 source1617/focused45/types2/admission7/native14 genuinely passed in their
  recorded configuration. Native attempts before the final14 accepted an
  intermediate cleared render too early. Cancel readiness now requires actual
  aria-pressed=true plus Click an element; restoration requires the real original
  title/state again. Another attempt passed UI Cancel but sent keyDown for app
  Escape. Installed Playwright primary source uses rawKeyDown for non-text Escape;
  the corrected native event genuinely cancels Overlay in both hosts.
- The .35 narrow render still showed Open inputs eligible during picking. Actual
  input UI RED1 led to the .36 guard. .36 source1618/focused48/types2/admission7,
  native picker14/source-edit14/instances10 passed within their own scopes.
- One .35 HMR driver wait accepted an intermediate response with no selection,
  then failed on null.selector. It now requires the exact selector/property/time
  plus analysis; no app source-binding defect was established.
- A .36 embedding metadata read lost a global native DOM search session. A proposed
  coordinate lookup then returned the other row under its viewport/scroll assumption;
  the unchanged exact-backend criterion rejected it (FAIL2), while the actual picker
  had selected the correct second row. That failed harness attempt is not a product
  wrong-instance result. The original CSS/native-backend method is retained. Already
  retired cleanup is ignored only after a completed exact lookup; a lost read may
  retry once only with the same observedAt/DOM/instance. No app action is repeated,
  and an identity mismatch is never retried into a pass.
- A later .36 grammar setup opened Settings before Attach: a closed-dialog context
  update moved focus to its trigger, then the harness sent unnecessary Space after
  the native select had already committed. Settings-focus RED1 is preserved. .37
  fixes the real focus issue; native selection sends no extra Space.
- Current .37 legacy host UI failed0 at Attach:
  .runtime/react-host-ui-runs/2026-10-20T23-11-22-282Z/results.json, screenshot
  reports Native debugger resource already attached. Current legacy short-loop
  failed0/0 at its Attach/OK wait:
  .runtime/short-loop-runs/2026-10-20T23-20-06.578Z/results.json. Current legacy
  independent command NOT_MET, all three questions BLOCKED before inspection:
  .runtime/independent-runs/2026-10-20T23-39-49-692Z/results.json. These parallel
  app-CDP setup configurations are not relabelled successful or counted as product
  source/read failures. Native transport retains the same original criteria and
  native resource ownership checks; no foreign debugger guard was disabled.
- Native corpus initial FAIL5:the bare count search returned two results. The
  original UI selector stays .todo-count; independent native metadata uses the
  original span XPath and requires exact selected backend equality. Next FAIL5
  wrongly required member nodes to be kind read with a direct scope. Existing
  member nodes are bound by actual target dependency IDs/page/digest; absent direct
  scope is not invented. FAIL6 required an expression in reader summary beyond the
  original reader criterion; the summary contains question/source locations and
  the exact historical payload retains the observed expression/value. FAIL7 then
  timed out on late selected-tab connection UI before Attach. The driver now waits
  for actual chosen-tab/development UI completion and records bounded attach
  diagnostics. Paths remain under ordinary-corpus-native at23-25-13-376Z,
  23-25-57-821Z,23-26-32-532Z and23-27-10-650Z; no product resolver changed.
- Native retained host UI first passed eleven standalone checks but failed overall
  on reusing an exclusive server.log filename for embedding (23-33-02-879Z). The
  next run again passed standalone but rejected embedding's distinct host title
  (23-33-54-401Z). Unique per-host logs/caches and the exact supplied embedding
  title correct these test setup assumptions; standalone's original title remains
  required. Neither failed overall result is upgraded to a complete PASS.
- Native short-loop23-41-19-926Z failed before P1:the driver required a persisted
  property even for the unchanged initial Text UI default. It now waits the real
  enabled/current UI choice and requires the actual selected property in every
  result, without inventing an extra change event.23-43-03-541Z passed23 standalone
  cases/transitions before a fixed5px input point failed hit-testing in TodoMVC
  Vue. Three actual mid-height points are now tried inside the same element;
  only a native hit on that element/descendant is accepted. A fully covered target
  still fails; no CSS/app source or expected scalar was changed. Both overall
  failed results remain under retained-short-loop-native.

The short-loop case arrays are extracted unchanged into
tests/helpers/short-loop-cases.mjs and shared by legacy/native drivers. Registration
equivalence is checked against the archived original static literals for every
mode/stack and independent variant; record:
.artifacts/a01/current-acceptance/cases/registration-equivalence.json.
An initial extraction utility had syntax/spread-property errors before mutation;
the first emitted for-of also lacked a separator and failed node --check. Those
utility/setup failures are not application evidence. The separator is corrected;
original question values/expressions/expected evidence and PARTIAL rules remain.

All earlier paths/statuses/drivers remain stored in the exclusive .artifacts/a01 and
.runtime directories. Old frozen verifiers are not rerun against newer drivers or
packages. Historical native results keep their executed helper/probe/configuration;
no coordinate/search method or current acceptance is retroactively substituted.

## Visual and review boundary

First-viewport/narrow screenshots use the existing shared reference base and
Atom-specific inspector layout. There are no token/primitive/style replacements.
The necessary content difference is the existing empty-selection state while
picking and the temporary input-opening explanation. Native width/overflow, actual
fonts and screenshots are recorded per run; they remain human-review candidates.

Remaining: ONE whole-A01 review and tested Critical/Important resolutions. A01 is
not complete from this document or package alone. P04/C07, mandatory A05/L02, SDK
outside Atom and public release remain separate.

## Commands and configuration

Actual npm commands: npm test; npm run build:extensions; npm run pack:atom;
npm run verify:atom-types -- <handoff>; npm run verify:atom-package -- <handoff>.
The last two use the exact .37 handoff above. Build completed with its existing
esbuild import.meta/cjs warning; the actual strict consumers and native hosts are
checked separately, so the warning is neither hidden nor treated as feature proof.
Focused command:

```sh
node --test --test-isolation=none tests/atom/inspector-ui.test.mjs tests/atom/input-ui.test.mjs tests/atom/picker-lifecycle.test.mjs tests/atom/picker.test.mjs tests/atom/production-ui.test.mjs
```

Direct native commands use the same exact .37 handoff path as their first argument:

- node tests/integration/ordinary-react-hmr.mjs <handoff> --grammar-only
- node tests/integration/ordinary-react-hmr.mjs <handoff> --picker-view-only
- node tests/integration/ordinary-react-hmr.mjs <handoff> (actual source edits)
- node tests/integration/ordinary-react-hmr.mjs <handoff> --instances-only
- node tests/integration/ordinary-react-hmr.mjs <handoff> --independent-only
- node tests/integration/retained-ui-native.mjs <handoff> (original host UI)
- node tests/integration/retained-ui-native.mjs <handoff> --short-loop
- node tests/integration/handoff-input-reporter.mjs <handoff>
- node .artifacts/a01/current-acceptance/verify37-final.mjs

The legacy npm commands verify:react-host-ui/verify:short-loop/verify:independent
were also run once in their current configurations and retain their distinct
failed/blocked paths above. Browser plugin unavailable; native integration uses
owned sandboxed Chrome153.0.8010.12/Node24.19.0 and the actual VS Code1.142 host.
Independent React/DOM19.2.5/router7.14.2 and Vue3.5.33/router4.6.4 match their
retained locks. Source consumption/host-props synthetic results use pinned root
React18.3.1; ordinary19 final props are explicitly unsupported. No private first-read
contract, model, account or controlled first-read launcher supplies these answers.

Subsequent closure2026-10-21: A01 completed after ONE whole-item review and two
verified Minor resolutions. See [29-a01-whole-review](29-a01-whole-review.md).
The .37 result above keeps its original review-pending status; current .1 evidence
covers the reviewed guidance/admission delta and exact contributor recipe setup.
No ordinary19 final producer/full lineage, installed or human acceptance is added.
