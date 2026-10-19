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
