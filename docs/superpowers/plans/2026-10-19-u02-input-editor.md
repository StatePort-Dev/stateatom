# U02 input editor implementation plan

> For agentic workers: use superpowers:executing-plans inline, task by task, TDD.

**Goal:** deliver U02 Live and Draft/Apply with guarded typed inputs, actual effects,
undo/baseline and explicit unsupported/pending states.
**Architecture:** pure ExperimentPlan contract, bounded investigation ledger and
separate response/native-control adapters feed the existing Atom inspector. Keep
legacy causal trials and shared UI primitives.
**Tech Stack:** repository JavaScript, Node tests, existing Chrome MV3/IDE harness.
**Spec:** docs/features/input-editor.md and completion/04 U02, scope-review-1.

## Global Constraints

- Current main only; each bounded slice verified and locally committed.
- Deadline 2026-10-20 08:00 Indian/Mauritius, 04:00 UTC. Check time at slice boundaries.
- No publication, SDK, other repository, account changes or replacement design.
- Preserve JavaScript semantics, snapshots, explicit evidence states and all legacy
  repeated trial/masked-blocker acceptance. No unknown becomes a known dependency.
- The preregistered 18-row denominator cannot silently shrink. Planned 11-row
  coverage is a target, not a passed result. U02 stays in progress until verified.
- Production read-only; F05 owns two-stage authority and enabled-path acceptance.

## Review Focus

- Untrusted plan cannot grant authority or retarget a stale node/resource revision.
- JSON keys/pointers, primitive types, finite numbers and operation budgets.
- Rule installation, response delivery, app consumption and effect remain distinct.
- Group failure, external revision, cancellation and undo preserve actual state.
- Delayed acknowledgements and mode/tab changes cannot apply an older draft.

### Task 1: U02.1 catalogue and pure contract

**Files:** core/experiment-plan.mjs, tests/experiment-plan.test.mjs,
docs/features/input-editor.md, docs/completion/u02-input-catalogue.json and progress.
**Interfaces:** future adapters supply fresh target and resource records plus
independent runtime admission; pure validation returns data or a typed error.

- [x] Write failing tests for exact identities/revisions, scalar types/limits,
  GET/JSON pointer and native control locators, unique group keys, denied admission,
  unsafe keys/getters, explicit unknown build and the fixed catalogue denominator.
  Run: node --test --test-isolation=none tests/experiment-plan.test.mjs
  Expected: fails because plan contract is absent.
- [x] Implement inert plan creation/parse/validation; no runtime hooks or feature
  advertisement. Preserve input objects, validate all changes before any mutation.
  Run: node --test --test-isolation=none tests/experiment-plan.test.mjs
  Expected: all contract tests pass.
- [x] Run full unit suite and diff check, record partial U02 status, local commit.
  Run: npm test
  Expected: all pass, legacy causal checks unchanged. Native support still absent.

### Task 2: U02.2 guarded response editing

**Files:** bounded editor ledger/controller, runtime/capability/transport, focused
response rule and lifecycle tests. Do not replace legacy experiment paths.
**Interfaces:** Task 1 plan/current-state validation; resource revision and ordered
edit ledger; install/consume/cleanup provide explicit per-resource outcomes.

- [x] Flesh out exact adapter interfaces from current source before tests.
  U02.2a is an inert `createResponseLedger({investigationId,target})` library.
  `observeResponse({url,method,requestId,requestOrdinal,document,body})` records
  bounded GET JSON scalar leaves before rules exist. `apply(plan,{target,admission})`
  validates fresh ledger resource descriptors and installs document-bound future
  response rules; it neither fetches nor reloads. `prepareResponse(facts)` validates
  the whole same-response group against original server values, returns a pending
  receipt/body; `confirmResponse(receipt,{delivered,error})` records actual adapter
  acknowledgement separately from application consumption (always unknown here).
  `undoLast`/`restoreBaseline` take `{target,admission,expectedRevision}` and refuse
  intervening external value changes, outstanding deliveries or stale revisions.
  Rule removal/restoration only affects future responses, not consumed app copies.
  `close(reason)` disarms rules, retaining any in-flight acknowledgement as unknown
  until confirmed. `snapshot()` is detached data with resources, raw originals,
  rule/phase, ordered history and global revision. Bounds: 128 scalar resources,
  64 transactions, 32 pending / 128 lifetime receipts and 128 URLs; JSON
  <=256 KiB before/after substitution, 4096 nodes, depth 12.
  No CDP/runtime capability is exposed by 2a. Native adapter/real-host proof follow.
  U02.2b subsequently owns Fetch coordination, fresh runtime authority checks,
  transport/capability operations and actual send/cleanup lifecycle integration.
- [x] U02.2a RED/GREEN: future-only rules; exact origin/document/GET/ordinal;
  safe escaped pointers; all-member preflight; delivered != consumed; failed and
  partial deliveries; guarded undo/baseline; external revisions; close/late ack;
  bounds and immutable snapshots. Focused Node tests, then full npm test, commit.
- [ ] U02.2b exact runtime interface: `inputs-open` starts one in-memory response
  editor for the current selected physical target; `inputs-read` refreshes its
  selected-property observation without re-running expressions; `inputs-apply`
  takes the versioned plan; `inputs-undo` / `inputs-baseline` require the current
  investigation ID and ledger revision; `inputs-close` is local cleanup. `state`
  returns the existing snapshot without running editor discovery. Only open / edit
  require read+override, reads require owned read; production edit always refused.
  Feature flags stay unavailable until both field modes/native acceptance exist.
  The response adapter serializes install/pause/undo work, revalidates authority /
  native occurrence after awaits, and confirms send acknowledgements separately.
  It intercepts only future main-frame Fetch GET JSON success responses whose
  exact network ID/ordinal/URL were observed. UTF-8 bodies are decoded correctly.
  Close disarms synchronously, drains in-flight acknowledgement and disables only
  its own Fetch domain. Cleanup failure is explicit, never foreign detach.
  Editor state is not executable session storage. Legacy trials conflict with an
  open editor rather than replacing its Fetch configuration. New immutable Atom
  candidates .15/.16 retain their native failures; .17 closes the unsafe worker-only
  route. A separate U02.2c slice must supply a worker-independent owner and prove
  interruption cleanup with actual Chrome before response editing is available.
  This is a new implementation dependency discovered by native testing, not a
  previously approved host architecture or completed feature.
- [ ] RED/GREEN real guarded rules, no implicit reload/request/storage reset,
  exact request match, consumed-versus-waiting states, partial failure and undo.
- [ ] Focused/full checks, source/runtime boundaries recorded, local commit.

### Task 2c: U02.2c worker-independent response owner

**New dependency:** actual .16 worker-stop left native Fetch active. .17 gates the
unsafe backend. This is a new working architecture choice, not prior approval.
**First bounded step:** native extension-document owner lifetime experiment;
inspect source/API constraints before choosing a host owner. Preserve foreign
lease denial and no authority recovery from storage. Both owner disappearance
and worker disappearance need actual cleanup proof before response editing opens.
**Scope:** this repository's Atom package and standalone/embedding examples only;
no official-host repo, SDK, account/publication or replacement UI. Offscreen API
restrictions and an existing host offscreen slot must not be bypassed.

- [ ] Establish native owner lifetime and constraints on a disposable synthetic
  host, retaining successful and failed controls without relabelling readiness.
- [ ] Select the smallest viable resource-owner contract from evidence; RED/GREEN
  lifecycle/proxy/grants/foreign ownership/cancellation and exact trusted peers.
- [ ] New immutable candidate and actual active-Fetch worker/owner interruption,
  inspector close/reopen and normal response matrix in both hosts; commit only
  actual bounded results, preserve the gate until the criterion is satisfied.

### Task 3: U02.3 native controls

**Files:** native control adapter, runtime and tests, synthetic control fixture.
**Interfaces:** same plan/ledger, native exact node and supported update event.

- [ ] Complete exact native descriptor/revision and event contract before RED.
- [ ] RED/GREEN text/number/checkbox/select, actual React/Vue updates, stale or
  readonly refusal, external revision, undo and cleanup.
- [ ] Meaningful native/source checks and local commit; no generic state writer.

### Task 4: U02.4 field UI and acknowledgement ordering

**Files:** Atom-local UI/template/CSS/controller; UI tests and changelog.
**Interfaces:** existing reference controls consume guarded runtime operations;
both modes share plans, history and outcomes, no staged draft auto-submit.

- [ ] Read supplied editor reference and define concrete control mappings.
- [ ] RED/GREEN typed controls, invalid local text, coalescing, 250ms/blur/Enter,
  grouped drafts, mode switch, pending effects, explicit refresh and both undos.
- [ ] Keyboard/narrow/reduced-motion/reference comparison, checks and commit.

### Task 5: U02.5 packed acceptance

**Files:** new declared native command, immutable package version, coverage and
execution records, roadmap/index. Use actual runtime and synthetic shareable data.
**Interfaces:** exact packed pair plus all preceding slices; adapter-specific
atomicity and cleanup limits survive diagnostics without causal upgrades.

- [ ] Finish exact native matrix before executing it; test both modes across all
  preregistered rows and retain expected unsupported outcomes separately.
- [ ] Run typed/rapid/invalid/out-of-order/group/undo/external revision/interrupt
  cases; default production refusal; existing legacy experimental controls.
- [ ] One fresh whole-item reviewer, one Critical/Important fix pass with RED/GREEN
  and full suite. Record agent/human evidence separately, local final commit.
- [ ] Only mark U02 complete if both modes and majority/effect criteria actually
  pass; otherwise commit honest bounded progress and continue dependency-ready work.
