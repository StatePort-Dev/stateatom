# A05.3b — native session/lifecycle matrix

2026-10-21, continuation from1873452. Task2 of the bounded runtime-races plan;
whole A05, saved reports, production observation and release remain open.

## Registered controls and actual boundaries

The existing native harness consumes exact immutable Atom/UI/plugin archives, two
actual MV3 hosts, real Vue/SFC/router and an owned VS Code Extension Host. Actual
picker, browser Input and private inspector ports drive the product. Original
fixture source remains unchanged; only isolated App.vue/main.ts copies add controls.
Registry: tests/helpers/action-trace-session-cases.mjs, copied into every run.

The final14 controls per host cover child/bubble, capture/stopPropagation, original
throw identity, disabled target expiry, unrelated click, actual Tab/Shift+Tab/Enter,
selection stale history, metadata-only Clear, two simultaneous inspectors with
view-only Clear, native reload, private-peer closure without reinspection, actual
source edit, IDE disconnection/Basic and Cancel with delayed real IDE verification.
A test-only loopback proxy forwards real browser Origin/auth and real IDE response
bytes; it delays one response, never synthesizes a successful source result.

This is one synthetic application using the real locked library, not two independent
applications. Source editing uses the consumed plugin's existing **full reload**,
not pure Vue hot component replacement. Source bytes are restored and actual served
module/original digest checked before the next reload. Completed native records
remain distinct from opaque callback object identity/full listener/async coverage.

## Actual new failures and fixes

- .14 native .artifacts/a05/session-native/2026-10-21T07-56-27-809Z/results.json:
  archive plus11 standalone cases PASS, then delayed real IDE reply overwrote
  acknowledged Cancel with complete. Runtime cancel-late-red.log independently
  reproduces that same state transition. Old owner/run guards were insufficient
  when the same controller changed. .15 compares the exact pre-await controller
  snapshot again before publication; newer read/Cancel wins and old read becomes
  stale. No app action is undone, and captured records remain.
- .15 native .artifacts/a05/session-native/2026-10-21T08-04-19-479Z/results.json:
  Clear was enabled after selection change, but retired owner had no active map
  entry and operation returned STALE_TARGET. Runtime clear-stale-red.log matches.
  .16 allows matching live actor/view/nonce to clear only its retired metadata,
  without entering a native context; wrong actor, wrong nonce and active other
  owner controls remain negative. Forget the retired publication epoch so old
  cleanup cannot recreate erased history. Remove only matching trace graph rows.
- Two mounted UI RED cases (STALE_TARGET/BUSY) showed old local rows could not be
  cleared after replacement. .16 clears only those known stale rows locally and
  explicitly says "Previous observation cleared from this view". It leaves a
  different observer untouched. Existing controls/card/13px base remain; no CSS or
  shared-token contract change. Changelog records this functional reference extension.

Final runtime14 and mounted UI5 tests PASS. Six isolated historical-bug mutations
remain rejected; those are regression-sensitivity results, not native evidence.

## Harness corrections kept as failures

Failed new harness attempts are preserved without counting them as product bugs:
missing proxy Origin/CORS and optimistic pairing completion; owned IDE leftover
port (exact XRAY_RUNTIME checked, only own exec interrupted); Shift modifier1 versus
actual CDP Shift8; unavailable page.close in the native backend; and requiring a
source counter change although the actual plugin replaced the run via full reload.
Their individual driver copies, logs, inputs and results remain in session-native/.
Native14 controls before each failure keep their original limited meaning.

## Checkpoints

- .14 runtime/source/native checkpoint remains historical in43.
- .15 full source1699 PASS, runtime10 PASS, source mutations6 rejected; it was
  superseded after the additional retired-Clear failure. No final .15 readiness claim.
- Final .16 handoff:
  .artifacts/atom/2026-10-21T08-24-13-465Z/atom-handoff.json.
  Shared UI .20261018.2/contract2.1.0 unchanged; types NodeNext/browser PASS and
  package admission7 PASS (.artifacts/atom/compatibility/2026-10-21T08-24-33-646Z).
- `npm test`: full3.log **1705 PASS**,0 fail/skipped; runtime14/UI5 focused checks PASS.
- `node tests/integration/action-trace-runtime-mutations.mjs`: baseline14 PASS,
  six expected bug variants fail their consumer assertions:
  .artifacts/a05/runtime-races/2026-10-21T08-16-27-022Z/results.json.
- First complete .16 native matrix29 PASS:
  .artifacts/a05/session-native/2026-10-21T08-35-17-509Z/results.json, errors[],
  source/host/plugin/workspace before/after maps unchanged.29 = exact archive check
  plus14 preregistered cases in each real host, not29 baseline work items.

Additional native visual evidence and the bounded-plan review are recorded below
when executed. Candidate screenshots require human review but no independent person
is an implementation blocker. Documents/test counts do not close mandatory A05.

## Remaining next step

Integrate the actual trace into the existing saved investigation/report path with
unchanged old reader/bytes/evidence criteria. Whole A05 still needs its original
supported production/performance/adapter boundaries and ONE whole-item review.
A02/L02 and broader release gates remain separate. No publication, SDK, redesign,
account mutation or changes in another repository are authorized by this work.

Visual supplement: full unchanged14-case corpus repeated only to complete new
view-only-state visual acceptance;29 PASS,
.artifacts/a05/session-native/2026-10-21T08-40-57-141Z/results.json. Actual390/1100px
screenshots for standalone/embedding local-clear state;13px base, actual viewport
width and no root overflow verified. Inspected rendered narrow standalone and wide
embedding against existing supplied Actions card/header/control layout: unchanged
spacing, alignment and typography, explanatory text fits. New copy is a necessary
cleanup-state extension of the simulated reference, not a replacement design.
Screenshots remain candidates; agent comparison is not independent human acceptance.

Final .16 read/inject-only standalone control3 PASS:
.artifacts/a05/read-inject-native/2026-10-21T08-44-30-075Z/results.json; errors[] and
exact inputs unchanged. `node .artifacts/a05/runtime-races/verify16.mjs` checks archive/
current source, all14 IDs per host, real delayed-IDE/actor/Clear outcomes, original
workspace restoration, screenshots and source/type/admission receipts ->
verification16.json PASS_SCOPED_NATIVE_SESSION_PENDING_BOUNDED_REVIEW_NOT_WHOLE_A05.
Bounded-plan review is pending; this is not a whole-A05 acceptance or waiver.
