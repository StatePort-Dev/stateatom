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


## U02.4b — live inspector ownership and page close/reopen

Delivered within the backend page-lifetime boundary on Atom `.20261019.24`,
unchanged UI `.20261018.2`; handoff
`.artifacts/atom/2026-10-19T22-07-31-902Z/atom-handoff.json`.
Exact source/archive/host/fixture bindings and executable verification:
`.artifacts/u02/input-inspector/verification.json` and `verify.mjs`.

The trusted host explicitly registers an inspector Port dispatcher. Opted-in
clients wait for native admission; the default transport retains old-host
compatibility. An input editor belongs to its envelope session, current live token
and per-view owner ID. Other clients/views cannot adopt, mutate or close it.
Port loss revokes runtime authority synchronously, cancels that client's pending
opening jobs and closes only its editors. A lost connection has no unowned
fallback, automatic reconnect or saved-authority recovery. Optional native sender
metadata is checked where present; missing optional document data is not invented.
An optional per-client connection callback reports loss, not successful cleanup.

Fresh frozen results:

- 48 focused lifetime/runtime/transport models; 258 Atom contract tests;
  `npm test`: **930 PASS**, zero failed/cancelled.
- `npm run verify:input-inspector -- <handoff>`: **13 PASS** across both packed
  hosts. Actual inspector-page closure removes active Fetch rules; the next app
  request is original and does not hang. Native closure removes the observer/write
  owner and leaves already changed app values intact. New clients require fresh
  inspection/new investigation; old clients/views/IDs cannot affect the new editor.
- Affected backends on this exact new pair: **25 native-control**, **15 response**,
  **8 guardian/foreign-consumer** controls pass; **2** strict installed type
  consumers and **7** package admission controls pass.

These are agent-operated native private-Port/wire checks, not field-widget or
human acceptance. The harness modifies neither installed host, injects no control
implementation and retains a read-only native cleanup diagnostic. All recorded
current package source/build hashes match. Field catalogue coverage remains 0/18
per mode; actual Live/Draft UI availability remains unimplemented.

The .23 native run passed 12 checks and failed the last embedding reopening with
`Selection changed during inspection`. A finite native-editor model reproduced
that exact error: an old background `state(refreshDeep)` read failed after a new
inspection began, and its catch unconditionally invalidated the new generation.
.24 limits that invalidation to the captured tab/run/generation/selection/editor;
selected native freshness checks are unchanged. The original native case now
passes without retrying the failed step or lowering its threshold. A second RED
proved runtime token revocation was deferred to a microtask; .24 revokes it
synchronously before awaiting cleanup. Intermediate model harness errors and the
terminated incorrect response-editor test remain retained; the corrected model
uses the actual native-editor close ordering. .23 passes remain historical.

Task 4 stays open. Actual page close/reopen now has evidence; **disposing a mounted
view while its client remains alive**, typed fields, scheduling, keyboard and
visual checks still belong to **U02.4c**. Task 2's remaining inspector lifecycle
criterion is not waived by backend page checks. Closing a rule/observer does not
promise application/server rollback. New field-mode/majority acceptance and the
single final review remain required before U02 completion.


## U02.4c.1 — unbundled view queue/controller

The source-only `input-controller.mjs` composes the draft model with a per-view
owner, one in-flight request and a cancellable field queue. Construction is inert;
explicit methods use the caller-supplied client. Neither current runtime nor UI
imports it, and the issued .24 recorded source/build inputs and archive bytes are
unchanged. No new packet, visual change or feature availability is added.

18 controller models / 88 focused contract-ledger-draft-controller checks / 948
full source tests pass. Exact source/log/archive bindings and executable verifier:
`.artifacts/u02/input-controller/verification.json` and `verify.mjs`. These are
fake-clock/backend-ledger models, not actual browser timing or native application
checks. They cover 250ms latest-value coalescing, invalid numeric cancellation,
boolean/select immediate scheduling, explicit flush, a single in-flight edit,
queued newer versions, held drafts on mode switch, explicit grouped Apply,
owned close/dispose, current-read/undo revision ordering and connection loss.
An own quick-edit stale analysis does not close its editor; a different physical
context closes the old owner while retaining a read-only unsent draft.

The initial missing-module RED is retained. Further REDs exposed forgotten
ownership after a failed opening reply, missing exact old-investigation cleanup
for a late reply after disposal, and hidden pre-open mode state. Fixes keep
cleanup scoped and never publish late data into a new view. The original failures
and green results are preserved under the same artifact directory.

This completes only the source controller slice. **U02.4c.2** must import it into
real fields, wire mounted-view cleanup/recovery, and test actual Live/Draft events,
keyboard, narrow/visual fidelity and native effects. Task 4 stays open; field-mode
catalogue coverage is still 0/18 in both modes, and feature flags stay unavailable.

## U02.4c.2 — actual fields in explicit development preview

Candidate `.20261019.25` / unchanged shared UI `.20261018.2`, checked above
`65435d7` with working changes, now mounts the real field controller. Both local
hosts explicitly opt into `inputEditorPreview`; the library default and public
Live/Draft feature flags remain unavailable until Task 5 acceptance. Preview
never bypasses runtime admission. Atom-only rows use supplied native primitives,
short resource labels, observed/rule → draft, on-demand locators, Live/Draft,
explicit Apply/Discard, current-read and both undos. Shared tokens/fonts and
reference artifacts are unchanged. The optional reconnect callback reloads only
the inspector; no stale writer resumes automatically.

Fresh checks: 34 focused UI/controller and 951 full source tests; 2 strict packed
consumers; 7 package admission controls; 7 source and 7 installed controlled-render
checks; **16 actual packaged native field checks** across standalone/embedding.
The latter use setup/permission/selection RPC, then field DOM actions and native
panel keyboard. Both modes exercise a response rule → next app request → changed
validation → UI undo; text/textarea/number/checkbox/select change actual native
outputs and each undo restores its baseline. Invalid `-` remains local. Actual
embedding unmount closes its observer with the client still alive; remount opens
an independent investigation. This completes mounted-view wiring, not the full
Task 4 timing/race contract or U02 acceptance.

Frozen local receipt and executable verifier:
`.artifacts/u02/input-fields/verification.json` and `verify.mjs`.
Immutable handoff: `.artifacts/atom/2026-10-19T22-46-21-262Z/atom-handoff.json`.
Native results: `.artifacts/u02/input-fields/native/2026-10-19T22-57-13-861Z/results.json`.
Source/installed controlled-render clients are explicitly separate from native
proof. No precise native debounce measurement or catalogue credit is claimed;
coverage stays **0/18** until the preregistered matrix in both modes is run.

Retained failures first exposed a browser timer receiver error, missing readonly
capability refresh and a same-observation scroll reset. Fixes have RED/GREEN
source/rendered checks. Existing immediate tab clearing and pending-property
semantics remain covered. Native harness failures were separately diagnosed:
independent cases overlapped an outstanding Read current (correctly refusing a
stale draft), then selected a new tab before its option arrived. The driver now
waits for the actual UI operation/list; freshness/conflict checks were preserved.
Failed results and diagnostic screenshots remain in their original directories.

Rendered first viewport at 440/390 was compared by the agent with supplied
`01-inputs.png`: original selected-element hierarchy, Inter/native controls,
spacing/alignment and short value rows remain. Necessary deviations are an
explicit source/mode/open toolbar, scope disclosures and real stale/unknown
statuses in place of simulated source/local-state support. Long resource strings
move to disclosures; values truncate within their row without horizontal overflow.
Screenshots are **review candidates**, not human approval. The controlled-render
check covers reduced motion; native layout/keyboard checks cover both widths.
The next bounded slice is **U02.4c.3**: precise native timing, queued/partial and
external-revision cases before unchanged Task 5 majority/default-path acceptance.

## U02.4c.3 — native scheduling and acknowledgement ordering

The unchanged immutable .25 package passes **34** actual two-host field checks
with the extended driver. No product source or archive was changed in this slice.
The additional cases cover rapid last-value coalescing, Enter/blur dispatch,
Draft→Live hold and explicit grouped Apply, newer typing during a slow ordinary
app handler, a delayed real reply arriving behind a newer external snapshot,
partial native group/retained failed raw text/scoped Undo, external eventful ABA
refusal, and cancellation of an unsent edit with a retained read-only draft.

Outgoing edit dispatch is measured separately from the later app input event.
The observed native-wrapper timings and exact input/result hashes are recorded in
`.artifacts/u02/input-ordering/verification.json` with an executable `verify.mjs`.
Native result: `.artifacts/u02/input-fields/native/2026-10-19T23-03-03-751Z/results.json`.
The message wrapper forwards identical arguments/replies; one declared fault
holds an unchanged real reply. It is transport fault instrumentation, not a mock
writer or proof of real-world latency. The initial wrong app-event-under-250ms
assertion is retained: it confused dispatch with native guard/effect latency.
The corrected probe measures the actual scheduling contract without speeding up
or bypassing native checks. A later harness-only timeout attempted to click an
already disabled Discard button after a draft-free external refusal; removing
that unnecessary action did not change product behavior or conflict criteria.

Controller/source models retain their RED/GREEN pending/older snapshot cases;
actual native interruption/page-close proof remains the separately recorded .24
backend checks. Current DOM control actions do not establish pointer-specific
focus/blur ordering. Task 4's declared UI mapping, fields, keyboard/narrow/reference,
ordering and lifecycle boundary is complete; U02 remains open for **Task 5**.
The original catalogue stays 18 rows and coverage credit remains 0/18 until its
row-by-row both-mode acceptance. Default feature flags are still unavailable.

## U02.5a — fixed catalogue preview acceptance and response ordering

The matrix was written before evaluation in
[the native acceptance brief](../testing/input-editing-acceptance.md), retaining
all original 18 rows. Candidate **.27** / unchanged shared UI .2 passes **11/18
in Live and 11/18 in Draft, independently in each of both hosts**. All seven
unsupported rows retain their reasons, stay in the denominator and receive no
successful-write credit. There are 44 positive row/mode/host cycles and 28
explicit unsupported checks; these are not 72 editable-input successes.

Actual fields exercise six GET response sites with two edits, unchanged app while
waiting, an explicit app request and corresponding DOM output, UI undo and
baseline on subsequent app requests. Native checkbox/number/select and existing
ordinary React/Vue #form similarly change real event-driven outputs/validation
and restore ordered values. The race family retains the original alternating
5/99, slow/fast server behavior in a separate shareable fixture with normal refresh
and both output fields; this adapter-family proof does not broaden into arbitrary
ordinary-session lineage or universal app compatibility. Unknown consumption/effect
and selected dependency in runtime metadata remain explicit despite fixture-side
observations. Unsupported prop/state/hook/cache kinds are absent from writers;
separate malformed wire proposals refuse before mutation. Locked controls remain
unavailable and unchanged; null/root structures are not scalar editors.

Fresh .27 results: **77 focused / 954 full source**, 2 strict packed consumers,
7 package admission controls, and the complete native matrix above. Exact package,
source/build inputs, tests, catalogue, driver, results and retained failures are
bound in `.artifacts/u02/response-ordering/verification.json` / `verify.mjs`.
Handoff: `.artifacts/atom/2026-10-19T23-15-09-670Z/atom-handoff.json`.
Matrix: `.artifacts/u02/input-acceptance/2026-10-19T23-16-46-490Z/results.json`.

The initial .25 partial matrix genuinely failed both race fields: an exact older
response closed a newer rule. The .26 response adapter now continues the older
occurrence unchanged without reading/substituting its body or changing the current
revision. The original no-old-overwrite assertion remains and is strengthened by
no body read, unchanged resource facts, active rule and another later delivery.
The former incidental closed-editor expectation is intentionally superseded by
this new tested behavior; this does not lower any causal/evidence criterion.
Contradictory equal ordinal/different network identity still closes/refuses.
Native continuation failure still closes and disables owned Fetch.

The .26 run exposed a second native ordering case after baseline: Fetch disable
had already resumed a queued older pause, so sending another command to it failed
and incorrectly closed the restored editor. An exact model first failed, then
.27 skips only pauses already released by acknowledged Fetch disable. Unknown
cleanup is not treated as acknowledged. The same actual race rows now pass
without retrying edits or changing their values/denominator/restoration criteria.
Both original native failures, focused REDs and green results are retained.
An EADDRINUSE run before browser setup and a frozen-plan tampering error in the
negative-test harness are retained separately; neither received coverage credit.

This completes only **U02.5a**. Public feature flags remain unavailable and local
hosts still explicitly show Preview. Next **U02.5b** verifies ordinary default
availability, the masked two-blocker/group case, production-default refusal,
interruption and existing browser/IDE causal regressions, then the required fresh
whole-item review. F05 production grant details, U06 handoff and SDK remain outside
this slice; U02 is still in progress. No human visual approval or release follows.
