# P03.3 — Trusted HTTPS artifact and permission workflow

Started2026-10-22 after P03.2 commitb3b6fa7. Approved P03/C06 scope and existing
criteria remain normative. This is executor preregistration, not a new approval.
17/29 whole tasks remain complete; this document is not capability evidence.

## Bounded execution design

Use exact immutable candidate45, current shared UI and both existing MV3 hosts.
Create a new synthetic ordinary application and exact minified listener release
with separate `app.p03.test` / `artifacts.p03.test` HTTPS origins. A test-only Chrome
host-resolver rule maps these explicit `.test` names to the controlled loopback
server. Additional explicit `switch.p03.test` and `pending.p03.test` artifact
origins isolate first native prompts for target-switch/long-wait controls;
`forbidden.p03.test` is the refused redirect target and `mismatch.p03.test` lacks
a certificate SAN. No sensitive endpoint discovery or external account. A unique short-lived
CA is imported through the actual Chrome Certificate Manager/isolated native file
chooser into each disposable profile; no TLS bypass or shared trust-store edit.
Retain a before-trust privacy-error/no-HTTP control and wrong-hostname control.

Use browser-owned native optional-origin prompts and current product buttons.
No permission API replacement/preapproval, app-target test CDP, IDE or manually
supplied source coordinates. Test harness may inspect extension and Certificate
Manager documents, and use chrome.scripting for read-only application counters
only after actual site grant; Atom owns its app debugger connection.

Register before execution in both hosts:

- Actual app Deny then Allow; read-only attach, separate artifact origin still
  ungranted, production change permission false. Select real registered listener.
- Actual artifact Deny: no artifact HTTP fetch; safe local guide. Actual Allow:
  fetch valid exact HTTPS manifest and its declared same-origin JS/map; show
  Code-linked Exact selected-handler source and no app action.
- Clear and load a valid exact HTTPS ZIP; no manual coordinates or IDE. Verify
  app-origin grant alone does not authorize artifacts, and loading sources does
  not grant F05 changes.
- HTTP403, cross-origin redirect to a refused synthetic origin, HTML sign-in
  document, controlled server/network disappearance, real pending cancellation:
  no raw response/query echo, credentials/referrers absent, no forbidden endpoint.
  Network disappearance is a controlled unavailable-server equivalent, not a
  real enterprise VPN/offline OS experiment or authenticated provider claim.
- Actually import the offered local ZIP after failure; same exact source is
  usable and production remains unchanged.
- Actual artifact permission removal invalidates current source access. Regrant
  is explicit; do not assume Chrome prompts again after a previous decision.
- Change the selected tab while the artifact prompt is open: completing that
  origin grant cannot fetch/install into the replacement target. Include a long
  (at least35s) native prompt and the existing explicit inspector-reopen route
  if the private channel closes; record actual behavior, not assumed idle cause.
- Final source/report privacy, no handler invocations, exact package/host/input
  hashes and bounded cleanup. Save native prompt/TLS/current-source screenshots.

Preserve every failed attempt. A harness readiness correction cannot relax the
positive product assertion. Confirmed product defects require a bounded regression
and correction, current source checks, a new immutable candidate and affected native
verification. Retain previous candidates and results.

After actual execution, run ONE whole-P03 code/scope/evidence review and one tested
correction pass if needed. No per-slice review loop or whole-project audit. P03 is
accepted only for demonstrated finite workflow; mandatory L02/A02/release gates,
unsupported map cases, evidence semantics and human-optional policy remain intact.

## Preserved initial attempts / harness corrections

Before final execution, two attempts were preserved unchanged:

- `.artifacts/p03/https-native/2026-10-22T08-18-32-223Z/results.json`:
  two checks then readiness timeout. Actual screenshot/profile database show a
  successful root import; the first leaf-only DOM traversal missed its label.
  Corrected traversal reads nested text/attributes; native import assertions stay.
- `.artifacts/p03/https-native/2026-10-22T08-20-14-609Z/results.json`:
 41 behavior checks pass; final credential assertion fails because two ordinary
 browser `/favicon.ico` requests from the seeded `/cookie` page were classified
 as Atom artifact fetches. Both carry cookie/referrer, as a normal navigation
 control should; all24 actual artifact requests omit both. No forbidden/switch
 origin request. Classify only these two explicit browser routes separately,
 retain all traffic and require a positive ordinary-session cookie control.
 Also activate the actual trusted application tab for its named TLS screenshot;
 the earlier screenshot showed the still-active Certificate Manager, while the
 existing positive page-title/server-request assertions had passed.

Final driver additionally exercises explicit attach/load after permission removal.
Chrome may remember an earlier decision; record whether a new prompt is observed
instead of assuming it. Product bytes and all positive/privacy thresholds remain
unchanged. These are driver readiness/classification/image corrections, not a
product fix or passed reclassification of either failed attempt.

Both first long-app prompts close the private inspector channel after35s; existing
Reopen inspector then explicit Attach successfully recovers read-only access.
Do not claim this loss is fixed or its exact cause established. A long artifact
prompt while attached succeeds in both hosts. Final execution and whole review
remain pending.


## Confirmed revocation recovery gap; bounded correction registered

Third native run `.artifacts/p03/https-native/2026-10-22T08-25-11-440Z/results.json`
reaches20 checks then cannot click Attach after artifact removal. The separate
short-prompt, one-host diagnostic
`.artifacts/p03/https-recovery-probe/2026-10-22T08-30-31-626Z` records the cause:
UI Attach remains disabled with `Debugger resource busy` while a fresh runtime
state already advertises attach-read-only available. Ordinary Refresh updates the
UI, and explicit reattach/regrant works. This diagnostic is not whole acceptance;
its final aggregate intentionally fails the unchanged two-host minimum because
only one host ran. Preserve both artifacts and status.

The initial invalidation is necessary to clear authority/private source immediately.
It can reach the UI while asynchronous native lease cleanup still looks BUSY;
there is no final permission-removal notification after cleanup. Register two
source controls before implementation: delay native cleanup, process initial UI
notifications during BUSY, then require a fresh post-cleanup capability notification.
A genuine foreign replacement must remain BUSY. No automatic attach/grant or private
source revival, mutation, new polling/heartbeat or weaker ownership guard.

Implement a final scoped notification after successful permission cleanup/persist;
retain the immediate revocation. Exclude removed tabs from final notification.
Run RED/GREEN and affected/full source tests, issue immutable46, then repeat actual
new trusted-HTTPS recovery workflow on both hosts without a manual Refresh workaround.
Keep original45 runs and all old P03/P02 evidence unchanged. ONE whole review follows.


Candidate46 source correction: both registered lifecycle controls now pass in a
110-test affected source group; full2136 source tests pass with0fail/skip/cancel. The final HTTPS
cycle retains all original cases and checks current440/390 Attach readiness,
existing13px typography/no overflow and keyboard containment after regrant.
Shared layout/tokens/styles are unchanged. Final native run will use exact46.


## ONE whole-P03 review and correction preregistration

Reviewer `/root/p03_whole_review` assessed4b266d9..b3b6fa7 plus current P03.3:
Critical0 / Important0 / Minor1. Read-only focused53 PASS,325 native input hashes,
archives/install/complete hosts and logs independently checked. Finite P03 acceptable;
report `.artifacts/p03/whole-review/review.md`. No second reviewer or review loop.

R1 Minor: rejected oversized/wrong-extension file can leave old URL guidance visible.
Register RED controls before fixing: each rejected attempt hides obsolete inline alert,
retains its own size/type error and reads/sends no file bytes; a rejected newer local
attempt also prevents an older pending origin response from launching acquisition.
Move clearing/current intent before local validation and retain guarded errors/reset.
Create immutable47 for this UI-byte correction; run focused/full source and actual
same trusted-HTTPS workflow on both current hosts, adding invalid-file UI controls.
Runtime/production code is unchanged from46: retain its27 backend controls with exact
worker identity instead of calling them fresh47. No new review round.

Review exclusions are accepted as boundaries, not waived tests: enterprise SSO/account/
VPN, seamless initial long prompt/unproven channel-loss cause, unsupported maps/runtime
causality/mutation, unrelated mandatory L02/A05/release gates, human visual acceptance,
SDK/publication/other repositories. A05 remains required and scoped complete; L02 is
required/open. Blank embedding46 immediate TLS/root X11 grabs are unusable images;
actual page/title/request/SAN/profile-root checks and readable prompt/source/recovery
images are independent evidence. Never cite the blanks as positive visual proof.


R1 implementation verification: original RED28 total/25pass/3fail; corrected affected
113 PASS and full2139 PASS,0fail/skip/cancel. File validation now runs after current
intent/preview clearing and inside the existing guarded try/finally reset. Exact
candidate47 is next. Its native cycle adds actual oversized ZIP/wrong-extension
file-input rejection after URL403 in each host (four additional checks), with no
new fetch/production permission/app action. All original trusted-HTTPS cases and
native permission/TLS thresholds remain unchanged.


First47 native attempt `.artifacts/p03/https-native/2026-10-22T08-56-28-645Z`
stops after2 checks: X11 `windowfocus` gets BadMatch between chooser creation and
mapping. The failure image shows the chooser subsequently visible. Native helper
now selects only a visible Open File window and waits for successful focus before
typing; no permission/TLS/product threshold changes. For ancillary native images,
discard the first250ms of live X11 frames after transitions (capture stabilization,
not a performance measurement). Preserve failed47; repeat the same48-case current
workflow with current helper hashes and no product/package change.

## Final execution and acceptance

Exact Atom `0.1.0-candidate.20261021.47`, shared UI
`0.2.0-candidate.20261018.2`, API/wire1/UI contract2.1 unchanged.
Handoff `.artifacts/atom/2026-10-22T08-55-21-215Z/atom-handoff.json`.
Aggregate `.artifacts/p03/whole-review/verification47.json`:
`PASS_BOUNDED_P03_ONE_REVIEW_AND_CORRECTION`.

- Current full2139 and affected113 source checks PASS,0fail/skip/cancel.
  R1 original RED28/25pass/3fail retained. Runtime recovery RED11/9pass/2fail,
  GREEN110/full2136 from46 remain separate historical stages.
- Actual current two-host48 HTTPS/UI checks PASS at
  `.artifacts/p03/https-native/2026-10-22T08-59-41-363Z/results.json`.
  Native app/artifact Deny/Allow, exact manifest/ZIP/current selected listener,
 403/HTML/redirect/boundary, stopped server, pending Clear, actual local ZIP,
  rejected size/type files, changed target/late grant, long prompts and actual
  removal/explicit attach/regrant pass.34 actual artifact requests omit cookies/
  referrers; ordinary browser cookie controls prove session availability. No
  refused/switch/mismatched-host HTTP request, selected-handler invocation or
  production permission change. No manual source coordinates or app test CDP.
- One imported test root per closed disposable profile equals the run's DER hash;
  untrusted-before-import and SAN mismatch refuse application HTTP. No TLS bypass,
  native permission preapproval/override, shared trust-store mutation or account.
- Types2/admission9/current extension build PASS. Existing esbuild CJS/import.meta
  warnings remain. Complete47 hosts differ46 only in panel.js/workspace/inspect.js;
  runtime workers equal46. Its actual F05 backend27 is retained with that exact
  worker identity, explicitly not a fresh47 backend run. The self-signed bypass/
  preapproval backend campaign supplies no P03 TLS/permission proof.
- Parser/analysis/CSS assets equal45. Prior parser86/native HTTP22/permission13
  retain their original candidates, criteria and inputs; not counted fresh47.
  Current source/HTTPS/runtime scopes are bound independently by the final receipt.

Agent viewed current standalone/embedding source440 and recovery390 candidates;
both390/440 metric/keyboard checks pass with existing13px typography and no width
overflow. Existing shared design/tokens/layout remain unchanged; changelog records
copy/focus/state changes. Current47 embedding trusted page, imported root and SAN
refusal X11 candidates are readable after250ms frame stabilization. Candidate46
blank images remain unusable historical files, not upgraded evidence. Screenshots
remain agent-reviewed candidates without independent-human acceptance.

ONE review found Critical0/Important0/Minor1; the single bounded correction pass
fixes R1 with three RED/GREEN controls and four actual current native file-rejection
checks. No second review. Initial metadata aggregate46 incorrectly read failed45;
its failed log is retained, path-only correction checked actual46 without rerunning
or relabelling the failed native run. All original native/diagnostic failures above
and earlier83/84/P02 results remain unchanged.

P03 is complete within this finite brief; C06's P01/P02/P03/U05 source-artifact path
is complete within its declared support.18/29 whole tasks (~62% equal item count),
not weighted release readiness. Next P04 — explicit bounded post-start production
observations, after completed F02/U03/U06. Mandatory L02 usefulness, A02 and remaining
integration/validation/release gates stay open; A05 remains mandatory/scoped complete.

Known boundary: an initial app prompt held35s still loses the private inspector
channel. Visible Reopen inspector followed by explicit Attach recovers read-only;
seamless continuation and an exact idle cause are not claimed. Enterprise SSO/account/
OS VPN qualification, unsupported maps, source-to-property/runtime causality, new
production authority, SDK/publication/other repository/redesign and an independent
human gate are not added. Documents are pointers to the scoped actual checks above,
not proof by themselves.
