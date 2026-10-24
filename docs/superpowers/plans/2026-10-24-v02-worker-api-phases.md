# Worker API phase diagnosis implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL superpowers:executing-plans inline; no implementer agents. ONE fresh final reviewer.

**Goal:** Observe existing own-worker Chrome API intervals during one finite input protocol without changing product semantics or claiming causal attribution.

**Architecture:** Promise-preserving metadata-only worker probe plus own worker CDP accessor; unchanged71/UI2/fixture/actor and inspector RPC phase trace; translated clocks/interval unions with concurrency limitations.

**Tech Stack:** Existing Node24/Chrome153/CDP/Xephyr/test helpers, local source checks only; no new dependencies or package.

**Spec:** ../specs/2026-10-24-v02-worker-api-phases-design.md

## Global Constraints

- Main e21f10b/local commits, exact71/UI2/product327/helper223 unchanged.
- No guard/queue/admission/revision/cache/Live/production/handoff/SDK/visual change.
- Own-worker CDP only; no app-target test CDP, diagnostic host copy or private payload inspection.
- API scope and metadata fields exactly as spec;2048worker/32inspector caps; Promise/value/error and receiver/arguments exact.
- Both hosts,3 alternating blocks/host,1warmup:12rows/4warmup/8measured, actual current acknowledgements and ledgers.
- Clock translation/coarsening and concurrent state retained; interval unions, no CPU/request-causality/critical-path inference or new performance acceptance.
- Protect startup/inventory/finalization; preserve all failed runs/cases/raw traces and old Minors; no unchanged campaign restart.
- Whole20/29/fullV02/V03/C09/A02/L02 and original targets remain open.

## Review Focus

- Promise/error/receiver/arguments remain exact; arbitrary thenables/callbacks and private getters are never inspected or executed by instrumentation.
- Partial installation, pending calls and external replacement cannot leave silent mixed wrappers or manufacture a complete trace.
- Worker target accessor cannot attach to the application; worker-wide APIs and overlapping state cannot be mislabelled as selected Apply-only cost.
- Time-origin translation retains raw origins/coarsening, clips intervals correctly and never sums concurrent durations into a false critical-path claim.
- Initial inventory/acquisition failures and independent cleanup preserve primary errors and attempt terminal records; historical immutable product evidence remains separate.

### Task 1: Implement and execute one finite own-worker API phase diagnosis

**Files:** new tests/helpers/worker-api-phase-probe.mjs, tests/atom/worker-api-phase-probe.test.mjs, focused worker accessor controls; scripts/native-browser.mjs, tests/integration/input-worker-api-phases-native.mjs, docs/testing/input-worker-api-phases-case.json, record130/current routing. Reuse current corrected input-domain driver and existing inspector/input actor.

**Interfaces:** installWorkerAPIProbe(scope,{tabId,limit=2048}) → reset(tag), snapshot(), restore(); snapshot metadata/clock/flags only. browser.extensionWorkerSession() → CDP session on its existing worker target. Native case pins exact71/archive/UI2/source inputs/12-row protocol. Saved verifier translates clocks and validates clipped unions/order/authority/negative controls.

- [ ] Read brief/create ledger and record choices; existing source/historical diagnostics already read, no broad project reaudit.
- [ ] New probe/accessor source tests first; run RED (missing feature), implement metadata-only wrappers/accessor, GREEN including twelve previous startup controls. Verify private-read and original Promise/error identities with literal fixtures.
- [ ] Add current fixed-inventory/finalizer native driver and exact preregistration before launch; source aggregation controls reject wrong clocks/overlap/order/cap/unknown traces. Run focused and full npm test, commit harness/protocol.
- [ ] Verify current327/helper223/exact immutable71/UI2/installed hosts; run one finite native12-row protocol, preserve actual handles/failures and all raw worker/inspector metadata. No old native22/backend/HTTPS/app/model repeat.
- [ ] Recompute per-host/mode4measured total each host, per-API counts/union and uncovered interval; retain origin/raw rows/overlaps and explicit unobserved guardian/JS/queue boundaries.
- [ ] ONE fresh readonly whole-increment review from e21f10b; at most one tested Important/Critical correction pass, Minor deferred, no re-review.
- [ ] Final saved-proof aggregate/task-done/record130/routing/local commit; choose exactly one next dependency-valid item from actual result, timed autonomous goal remains active.

Expected: exact forwarding/privacy/source controls and full suite pass; either a retained factual native result or a precise unresolved native failure, never a manufactured target/causality pass. Completion verifier reads retained proof and never relaunches the native campaign.
