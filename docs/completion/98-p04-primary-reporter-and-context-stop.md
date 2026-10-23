# P04.4d.5 — primary-picked reporter and truthful context stop

Continues `a59b0da`; approved `scope-review-1`, local main. Native59 exposed an
actual context-reason defect: selected-tab cleanup called ordinary Stop, recording
`user`. The failed receipt remains. Candidate60 fixes this bounded defect and
qualifies the primary-picked reporter/keyboard/denial/tab-switch increment.
**Whole P04/C07 remain open**,18/29 (~62% equal count), mandatory L02 open/A05 scoped
complete/A02 open. No SDK/publication/redesign/other repository/human blocker.

## Correction

The existing authenticated `observation-stop` accepts only two optional view-context
reasons: `context-changed` and `tab-switch`. Controller context cleanup sends the
actual context reason; the inspector's target-tab change sends tab-switch. An
ordinary explicit Stop retains user. Exact session/view/window identity is checked
as before; a supplied reason grants no authority. Other observation operations
reject the field; invented/native-only reasons are rejected. Already-stopped
windows retain their first closing reason and timestamps. No old history is edited.
API/wire1/UI contract2.1 remain; the typed Stop field is additive. No CSS/token or
layout change; existing reader/inspector labels already distinguish tab-switch.

## Exact checks

Atom `0.1.0-candidate.20261021.60` / UI `0.2.0-candidate.20261018.2`:

- `node --test --test-isolation=none tests/atom/observation-controller.test.mjs tests/atom/production-observation-runtime.test.mjs tests/atom/handoff-observation-coexistence.test.mjs tests/atom/inspector-ui.test.mjs tests/atom/handoff-observation-ui.test.mjs tests/atom/observation-input-coexistence.test.mjs`:107 PASS.
  REDs cover missing context reasons, ignored invalid reason and runtime rejection
  before the owned request path; GREEN checks foreign owner/nonce, closed DTO,
  legacy Stop and first-reason preservation as well as affected UI/coexistence.
- `npm test`:2378/2378 PASS,0 failed/skipped/cancelled;87782.571971ms. All510
  source/test hashes match before/after, the failed first run and current source.
- `npm run pack:atom`, `npm run verify:atom-types -- <handoff>` and
  `npm run verify:atom-package -- <handoff>`:build PASS,2 strict installed consumers,
  9 admission controls. Typed misuse of stop/read reasons is rejected.
- `node tests/integration/p04-picker-entry-native.mjs <handoff> --confirm --both-hosts --reporter-guards`:13 PASS. Real primary X11 disabled Confirm selection, actual
  native keyboard Continue/reopen, no recording-triggered action; trusted manual
  input/request followed by read/Stop/review/Save/download and passive reader;
  actual initial native site denial/grant; selected-tab switch records tab-switch
  for the old exact window and starts/adopts no window on the new tab.
- `node tests/integration/handoff-observation-input-native.mjs <handoff>`:17 PASS
  affected H09 regression in both hosts. Actual independent Settings/Live/failed
  Undo/Draft/Apply/unapplied draft remain separate through default-private file,
  passive reader and revoke. Failed Undo remains a constraint refusal, not positive
  restoration evidence. Both native runs have0 inspector console warnings/errors.

Exact handoff: `.artifacts/atom/2026-10-23T07-59-52-553Z/atom-handoff.json`.
Aggregate: `.artifacts/p04/context-stop/2026-10-23/verification60.json` binds source,
all logs, archives/install/both hosts and native receipts:
`.artifacts/p04/picker-entry-native/2026-10-23T08-00-43-343Z/results.json` and
`.artifacts/p04/input-coexistence-native/2026-10-23T08-03-57-385Z/results.json`.
Actual Chrome153, isolated headed profiles/nested display, trusted synthetic HTTPS,
real CA import and site prompt; no TLS bypass/preapproval/parallel app CDP.

## Preserved failures and limits

Native59 `07-55-21-290Z` FAIL5 at a new driver phrase mismatch: actual reader says
Dependency remains unknown. Corrected driver changes no evidence semantics.
`07-55-52-828Z` FAIL6 demonstrates the genuine user/context reason mismatch. New60
asserts the actual more specific tab-switch reason, rather than weakening that gate.
The first full60 run FAIL1 (2371/2372) hit fixed first-read port4173 EADDRINUSE;
its six nested tests did not execute. Later read-only listener inspection found
port free. No process was killed; unchanged-input full retry passes2378. Both logs
and source snapshots remain; no missing nested case is counted in the failed run.

Primary-report390px snapshots are candidates, with unchanged shared typography,
existing dialog layout and privacy controls; no new design fidelity/human approval
is inferred. Previous58/59 native lifecycle/matrix/worker-loss evidence stays scoped
to its actual revision. This increment does not silently requalify that entire
history as a fresh60 run, nor establish universal safety/performance/causality.

Next bounded item: **P04.4e named H07–H09 coverage reconciliation**, fill only actual
remaining gaps, then ONE fresh-context whole-P04 scope/code/evidence review. No
whole-project re-audit, historical experiment sweep or acceptance from documents.
