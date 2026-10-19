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

- [ ] Flesh out exact adapter interfaces from current source before tests.
- [ ] RED/GREEN real guarded rules, no implicit reload/request/storage reset,
  exact request match, consumed-versus-waiting states, partial failure and undo.
- [ ] Focused/full checks, source/runtime boundaries recorded, local commit.

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
