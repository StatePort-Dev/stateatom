# F01 Capability and Public Contracts Implementation Plan

> Execute inline under executing-plans and TDD. The maintainer authorized F01
> after committing the scope. Stay on the current branch; stop after this item.

**Goal:** one operation policy, truthful versioned capability discovery and
compiled consumers of the actual packed API, without changing origin grants.
**Architecture:** pure `capabilities.mjs` owns origins, operation/resource rules
and availability. Platform supplies current permission/lease facts; runtime
enforces those same rules. UI consumes the returned policy, never grants access.
**Tech stack:** existing ESM/MV3, Node 24.19.0/npm 11.17.0; pinned development-only
TypeScript 5.9.3 for strict NodeNext and browser-bundler consumers.
**Spec:** docs/completion/03-runtime-and-onboarding.md, F01; scope-review-1.

## Constraints and interfaces

- Retain wire/API v1 with explicit `features` discovery and capability schema v1.
- Keep original synthetic ports/bridge policy; HTTPS remains opted-in/read-only.
- No Live, production grants, trace or real-model success is implemented here.
- Observed operands/source availability do not imply permission or execution.
- `describeCapabilities(context)` is pure. `operationPolicy(op,context)` returns
  availability/reason/code/required grants; debugger command grants stay distinct.
- Platform current facts never attach or acquire leases. Discovery cannot mutate.
- Legacy hosts missing discovery are explicit unknown/unavailable in new UI;
  stale metadata cannot grant permission. Packed types use strict ESM resolution.
- Preserve design/reference and layout; only existing control availability changes.

Pre-flight: platform produces current origin, permission and lease facts consumed
by runtime policy; runtime produces the capability response consumed by UI.
Declarations and packed entrypoint exports must describe those same interfaces.

## Task 1 — Consolidate and prove F01

- [x] RED: Basic/no helper; source without observations; unsupported instrumented
  expression; read-only HTTPS; wrong origin; missing permission; foreign lease;
  disposed runtime; older host discovery; direct denied operation with no effects.
- [x] GREEN: central policy, platform facts, validated capability operation and
  state projection; advisory controls use the projection. Preserve existing tests.
- [x] RED: strict NodeNext packed declaration consumer exposes existing bad imports;
  add browser-bundler consumer and negative request typing checks.
- [x] GREEN: fix declarations; pin compiler; add `verify:atom-types` that installs
  actual tarballs and never resolves declarations from the source checkout.
- [x] Bump changed Atom candidate identity; update contract, docs and changelog.
- [x] Run `verify:atom-contract`, `npm test`, `npm run build`, `pack:atom`,
  `verify:atom-types`; sequential affected native browser/embedding/maps checks.
- [x] Fresh focused code review, address material issues, record actual results
  and remaining evidence boundaries, update item status and one next item.

## Review focus

Revoke permission or replace a lease after discovery; unknown custom-platform
facts; late/disposed requests; production/source separation; old-host downgrade;
packed declaration isolation; no snapshot-to-execution evidence promotion.

## Execution ledger

- Base: `7a9f718`; scope adoption committed before implementation. No branch switch.

- RED→GREEN: initial discovery; descriptor/grant mutation boundaries; strict old
  packed declaration consumer; four independent-review findings; stale action
  projection; initial Restore; intervention terminal availability.
- Ruling: metrics cancellation now uses an attached lease; worker VM supplies the
  new pure policy imports and explicit target facts. Original semantic/race
  assertions remain unchanged.
- Ruling: only the three previously approved browser map modules are exempted
  from the obsolete blanket npm-input ban; Node/compiler/IDE and unknown npm
  inputs have negative controls. Historical extraction evidence stays unchanged.
- Review: four Important findings fixed; the stale-action finding was graded
  material against F01 consistency and fixed. No declined findings or deferred
  minors. No second review; corrections have failing-before-fix controls.
- Final: candidate 0.1.0-candidate.20261019.3; 586 unit / 48 contract PASS;
  strict packed NodeNext/browser PASS; rendered fixture 5, embedding 34, Basic 26,
  Actions 32 and read-only maps 19 PASS. Earlier .1/.2 and all failures retained.
  Exact commands, hashes, configuration and boundaries: docs/completion/14-f01-capability-contracts.md.
- Task 1: complete within F01; local commit follows final consistency checks.
  Next: F02 only; no implementation started.
