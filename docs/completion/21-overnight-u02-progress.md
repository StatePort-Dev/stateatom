# Autonomous execution — U02

Start: 2026-10-19. Source base `17c2441`, current main, clean on entry.
User authorized iterative task → checks → local commit cycles until
2026-10-20 08:00 Indian/Mauritius (04:00 UTC). No publication/SDK/redesign/other
repository work. The active goal stores this deadline across continuations.

U01 and previous increments remain credited. Current item is U02, in progress.
The working design is `../features/input-editor.md`; detailed choices there are
new implementation decisions, not prior scope approvals. The fixed 18-row
catalogue is registered before implementation. It is not runtime evidence.

## Cycles

- U02.1: catalogue and pure ExperimentPlan validation — complete within this
  schema-only slice. 26/26 focused and 689/689 full unit checks pass, including
  legacy experimental controls. The first missing-module RED and four additional
  edge-case failures (undefined ID, sparse arrays, group aliases and ambiguous
  fresh revisions) are retained under `.artifacts/u02/contract/`.
  Exact file/test/catalogue hashes are in `verification.json` there. Existing .14
  package build inputs remain byte-identical; the new pure module is not bundled
  or exposed by the runtime. No new tarball or native capability is claimed.
  The 18-row catalogue has 11 intended targets and zero native rows verified so far.
- U02.2a: inert guarded response registry / ordered ledger — complete within this
  library-only slice. 29 ledger cases plus 26 contract cases pass (55/55 focused);
  full suite passes 718/718 on the frozen final inputs. RED/GREEN cases retain
  exact identity/admission refusal, escaped leaf groups, response budget, original
  server value conflicts, A→B→A external revision, partial delivery, undo/baseline,
  cancellation/late acknowledgement, accessor refusal and bounded history. The
  original sandbox full run had four EPERM/listener failures; a permitted local
  run passed, and the final full run follows the last source/test change. Logs,
  hashes and executable verification are under `.artifacts/u02/response-ledger/`.
  No adapter sends CDP commands yet; application consumption/effect remain Unknown.
  The library is not bundled; .14 package build inputs remain unchanged. Both
  feature availability flags stay unimplemented, native rows remain 0/18.
- U02.2b: guarded response backend and safety gate — delivered within this
  bounded backend-only slice. Current .17 passes 92/92 focused, 755/755 full,
  2 packed type consumers, 7 package admission controls and 3 native gate checks
  across standalone/embedding. The current hosts refuse response editing with
  `UNSAFE_LIFECYCLE`; request-supplied safety flags cannot bypass it. .17 handoff:
  `.artifacts/atom/2026-10-19T18-41-49-049Z/atom-handoff.json`. Exact source/package
  bindings and logs: `.artifacts/u02/response-runtime/verification-17.json`.
  The new command is declared as `npm run verify:input-response`; .17 was checked
  with `--expect-unsafe-owner`, so this proves refusal, not editing readiness.
- Retained .15 native FAIL: a real Network.Fetch occurrence was paused with an XHR
  label and was initially refused; exact CDP facts, input hashes and driver copies
  are retained in two runs at 18:30/18:32 UTC under `response-native/`. .16 fixed
  the binding and passed seven standalone checks through real response effects,
  masked target, second blocker, text/number/Unicode, undo/baseline and external
  revision refusal. Its actual active-Fetch worker-stop check FAILED: the worker
  correctly did not recover authority, but native Fetch persisted and the next
  application request hung. Evidence: `response-native/2026-10-19T18-37-10-451Z/`.
  No embedding response acceptance followed. The current gate is the consequence
  of this failure; unit successes never replace the failed runtime criterion.
- Remaining: U02.2c must establish a worker-independent resource owner and native
  interruption/disposal safety. Then native controls, both actual field modes and
  full packed acceptance remain. Current catalogue coverage is still 0/18 in
  both field modes. U02 and main plan Task 2 stay in progress.

The final run report will list exact commits, checks and remaining dependency-ready
work. Historical results/criteria, pointer timeout evidence and unsupported paths
are preserved. Full U02 acceptance awaits actual adapters, effects and undo.


U02.2c.1 recorded a new negative owner-lifetime experiment: a native extension
page survived worker stop and modified two expected synthetic responses, but its
closure left Fetch attached and the following request pending. Source inputs and
parent .17 host stayed unchanged; this disproves a simple document-owner fix.
The new [working owner design](../features/response-resource-owner.md) therefore
selects a live guardian registry with cleanup-only delegation, respecting the
Offscreen runtime-only API restriction. The design is not implementation evidence.
Next bounded slice: pure registry/protocol tests and implementation, then commit.


U02.2c.2 adds an inert live registry with opaque current-client/lease/operation
identities, actual grant checks, foreign ownership refusal, closing locks, separate
cleanup grants, failed cleanup retention and late executor acknowledgement refusal.
24/24 focused and 779/779 full tests pass. Missing-module RED and cleanup key-order
RED/GREEN are retained under `.artifacts/u02/guardian-registry/`, with exact hashes
in `verification.json`. These are Node model results; no Chrome command runs in
this module. Issued .17 runtime source inputs and package bytes are unchanged,
and current hosts remain gated. Next: exact-peer/native bridge, then real cleanup
fault tests; field-mode coverage remains 0/18.


U02.2c.3 delivers the live native bridge on Atom `.20261019.20` / unchanged UI .2.
156 focused / 819 full source tests, 2 strict packed consumers and 7 admission
controls pass. 15 native response checks pass across both hosts, including forced
worker stop with active Fetch and a completed unmodified next app request. A
separate 8-check native fault pass covers guardian document loss, foreign native
owner preservation/refusal, forged inspector peer rejection and Atom-only shared
broker shutdown. Exact bindings: `.artifacts/u02/guardian-bridge/verification-20.json`;
[interpretation and retained failures](../features/response-resource-owner.md#u022c3-scoped-native-result--candidate-20).

The native driver uses sandboxed Chrome with no test debugger on the app before
Atom admission; the new conservative BUSY guard is retained. Setup/approval and
backend requests are harness RPC, not field-UI evidence. .18/.19 bootstrap failures,
.20 Playwright BUSY and raw-driver setup failures remain retained. Sender identity
binding now respects Chrome's optional documentId while requiring a unique exact
native offscreen context. These are new implementation decisions, not old approval.

Main Task 2 / U02 remain in progress: field modes, native controls, inspector-owned
close/reopen, majority acceptance and final review are required. Both feature flags
remain unavailable and native field catalogue coverage remains **0/18** in each
mode. Next bounded slice: **U02.3a native control descriptor/ledger contract**, then
its actual adapter; do not repeat completed response/guardian work without cause.


U02.3a implements the [inert native-control ledger](../features/native-control-editor.md):
all-member preflight, ordered per-control acknowledgements, partial groups,
explicit unknown/taint, eventful external revision refusal, successive owned
undo and guarded baseline. Closing after an earlier acknowledgement cannot
relabel it late; its failing control and correction are retained. 25 ledger
models + 26 plan checks pass (51 focused), and final full suite passes 844/844.
Exact inputs and unchanged .20 runtime bindings:
`.artifacts/u02/control-ledger/verification.json`. Earlier missing-module RED,
first GREEN and intermediate 843-check full log remain separate. No native
adapter/event/framework write or new package is delivered by this library.
Task 3 / U02 stay in progress; next is **U02.3b actual native-control adapter**.
Both field-mode catalogue counts remain 0/18; all original acceptance gates stand.


U02.3b.0 completes a finite [native mechanism probe](../testing/native-control-probe.md),
not an adapter. Plain React/Vue built-in input events produce real validation
changes and return; an isolated world survives native detach (negative cleanup
finding). A disposable extension-world/private-Port host passes four identity /
cleanup checks, including actual worker stop and refusal of later writes. Raw
results and the nullable-sentinel probe failures are retained. Source checkout and
issued .20 package stay unchanged. Next: **3b.1 native primitive implementation**,
then runtime integration. U02/Task3 remain in progress, field rows remain 0/18.

U02.3b.1 implements the unbundled native-world source primitive and its declared
`verify:input-control-world` command. 57 focused / 850 full source tests and 20
native source checks pass. Real synthetic/native and plain React/Vue inputs change
and return through built-in setters/events; observed external revisions and DOM
replacement are refused. Private Port/worker loss and post-setter exceptions revoke
future writes. Key-order, event-closure, partial-bootstrap/disconnect and Unicode
REDs are retained under `.artifacts/u02/native-control-world/`; final exact binding
is `verification.json` there. See the [source scope](../features/native-control-editor.md#3b1-source-primitive).
This source is injected by a diagnostic driver, not imported from the installed
Atom runtime. No tarball/native ledger integration or field-mode acceptance is
credited. Packet .20 stays unchanged; the root command list now includes the new
check. Next: **3b.2 guarded runtime/ledger/permission integration**, still within U02.


## U02.3b.2 — installed native-control backend

Delivered within the native adapter/controller boundary on Atom
`0.1.0-candidate.20261019.22`, unchanged UI `.20261018.2`.
Handoff: `.artifacts/atom/2026-10-19T21-38-36-313Z/atom-handoff.json`.
Exact bindings and executable verifier:
`.artifacts/u02/control-runtime/verification.json` and `verify.mjs`.

The host explicitly constructs a native-control owner beside its debugger broker.
A private content Port must match the pending identity, extension/tab/frame/origin
and the actual scripting document before admission. Later injections target that
exact native document. Read/inject/replay authority and selected physical identity
are checked before each operation; saved summaries cannot recreate authority.
A one-shot admission deadline and close acknowledgement remove owned observers
and references; uncertain startup cleanup remains Unknown. Shutdown closes only
Atom sessions, without disposing the shared host factory. Model checks cover
foreign sessions, forged peers, cancellation, late acknowledgements and startup
failure; native checks cover actual worker interruption in both hosts.

Fresh results on frozen .22 inputs:

- `node --test --test-isolation=none` with the five focused control/runtime files:
  **66 PASS**; `npm test`: **889 PASS**, zero failed/cancelled.
- `npm run verify:input-controls -- <handoff>`: **25 PASS** through actual packed
  runtime RPC in standalone/embedding. Both backend plan modes change five native
  widget kinds and undo their real outputs; React/Vue validation changes and
  returns. Native constraints, partial group/external sibling preservation,
  repeated edits/baseline, eventful ABA refusal, replaced selected node, real
  read-only connection and forced-worker-stop refusal are exercised.
- Existing `verify:input-response` passes **15** and `--guardian-controls` passes
  **8** on this new pair, preserving response effects, masked blockers, undo,
  active-Fetch interruption, foreign-owner refusal and shared-consumer cleanup.
- `verify:atom-types`: **2** strict installed consumers, including the new optional
  factory/source-family declarations; `verify:atom-package`: **7** controls.

All results are agent/harness operated. Native implementations come from the
archive; the native harness uses ordinary inspector RPC, application reads/setup
and a read-only cleanup diagnostic after worker loss. Neither host is modified.
Live/Draft **field UI is not exercised**, catalogue coverage remains **0/18** in
both modes, and selected-property dependency stays Unknown. Task 3 is complete
within its adapter brief; Task 2's inspector-owned close/reopen is still mandatory
with Task 4, and U02 remains in progress.

Intermediate failures are retained. .21 native runs stopped on harness repeated
navigation and hardcoded embedding worker filename; corrected runs use new own
targets and manifest identity. The first .22 native start collided with the full
source suite's fixture port; runs were then serialized. Another case correctly
refused baseline after an external sibling revision; independent baseline tests
now start a new explicit investigation, with the refusal criteria unchanged.
Read-only reattach initially met the harness's own CDP client and correctly
returned BUSY; a fresh target avoids that client. .21 admission failed after the
root test command changed post-pack; .22 includes it and all source/build hashes
match. A strict consumer fixture naming error and a model promise rejection
handler timing error are retained separately. No failed run is relabelled PASS.

The next bounded item is **U02.4 — field UI and acknowledgement ordering**:
read the supplied shared UI references, implement both modes/draft preservation
and exact inspector ownership, then actual field-mode acceptance. No feature flag
or majority criterion is advanced by this backend packet alone.


## U02.4a — inert local draft and acknowledgement state

`packages/atom/src/input-draft.mjs` adds a source-only model with no runtime/UI
importer, transport, timers or native writer. It preserves typed raw drafts and
invalid numeric intermediates, native observed enum choices, UTF-8 limits and
explicit held drafts during a Draft → Live switch. Its local ticket binds each
submitted field version to its actual transaction; new typing survives a late
reply. Own confirmed after-revisions can rebase queued typing, while external,
missing, malformed or older facts cannot authorize it. Response waiting means an
installed rule, never consumption or selected-property effect. Partial groups
retain failed drafts; pending discard cannot promise to cancel application work.

19 draft models / 70 focused contract-ledger-model checks / 908 full source tests
pass. The missing-module RED, malformed receipt, missing revision, older snapshot
and late acknowledgement failures/green results remain under
`.artifacts/u02/input-draft/`, with exact hashes in `verification.json` and its
executable `verify.mjs`. All recorded .22 source/build inputs and archive digests
remain unchanged; no new packet is prepared for this inert slice.

[The working UI mapping](../features/input-field-ui.md) records the supplied
reference screens and necessary real-adapter deviations. This is not a visual
change or rendered acceptance. Both field modes, native inspector ownership,
scheduler timing and UI controls remain unimplemented; field catalogue coverage
is still 0/18 per mode. Task 4 remains open. Next bounded slice: **U02.4b — live
inspector ownership and actual close/reopen**, before rendered controls.
