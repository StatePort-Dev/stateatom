# Atomic verification snapshot implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL superpowers:executing-plans inline; no implementer agents. ONE fresh final reviewer.

**Goal:** Preserve every live verification and fresh snapshot while using one private registry worker message per successful verify.

**Architecture:** Strict opt-in private wire envelope plus existing guardian session optional fast path; unchanged legacy fallback, budgets/loss/close/cleanup barriers. Source-only.

**Tech Stack:** Existing Node24 node:test and private JS worker protocol; no dependency/public API/package change.

**Spec:** ../specs/2026-10-24-v02-verify-snapshot-design.md

## Global Constraints

- Mainbdccd06/local commits/scope-review-1/whole20/29/fullV02/V03/C09/A02/L02/originaltargets unchanged.
- Only2product code files core/guardian-worker-wire.mjs and core/guardian-session.mjs; tests/docs around them. No guard/model/broker/native/queue/budget/policy/UI/SDK/otherrepo change.
- Same live verify then fresh snapshot, no cached/omitted authority/snapshot. Flag only owntrue/verify, oldversion1/12methods/values unchanged.
- Pending64/sequence/size/timeouts/channel-loss and session post-awaitopen/finally cleanup preserved; malformed fast reply rejects all pending, old dispatcher failsclosed.
- Legacy registry fallback2calls and every release/retry/drain/recovery/native-before-authority control unchanged.
- Source-only; exact installed71/UI2/native da87a6f remains historical. No build/pack/native/oldmatrix/IDE/certificate/model/publication claim or repeat.
- One fresh readonly final review, at mostone tested Important/Critical fixpass, no rereview; preserve scratch/ledgers/evidence/criteria/Minors.

## Review Focus

- Malformed/mixed-version success response must reject its own pending request and other requests before deletion, without hanging or using stale snapshot.
- Close/revocation between enqueue/dispatch/resolve still blocks authority; failed verify never calls snapshot, and actual snapshot is fresh rather than cached.
- Optional fast path is limited toverify; legacy registries/ordinary clients and cleanup/recovery keep original result/value/order.
- New private flag must not execute an accessor, alter sequential validation or admit another registry method/capability.
- Source message-count proof is not native speedup/qualification; old installed source identity and fullV02 gates remain distinct.

### Task 1: Atomic verify+fresh snapshot source control

**Files:** core/guardian-worker-wire.mjs, core/guardian-session.mjs; new tests/guardian-verify-snapshot.test.mjs; record132/status/task-index. Existing guardian tests unchanged.

**Interfaces:** registryClient.verifyWithSnapshot(...args) sends same verify args and opt-intrue flag; registryDispatcher returns value{value:true,snapshot}; session.request('verify',args) keeps original public {value,snapshot} boundary. No REGISTRY_METHODS or public types/export change.

- [ ] Read brief/ledger; record atomicfresh choice versus cached/omittedsnapshot and source-only boundary.
- [ ] Write controlled real-dispatch/client/session tests for fastmessage1/freshness/failure/legacy/accessor/malformed/timeout/lateclose, watch RED; implement strict flag/envelope and optional session branch; GREEN.
- [ ] Run existing focused guardian wire/session/broker/document/native-before-guard/cleanup controls and full npm test. Record exact2/327 product source delta and unchanged325, helper223/archive/installed identities without native rerun.
- [ ] Local code/record132/routing commit; ONE fresh readonly source review frombdccd06, at mostone tested Important/Critical fixpass, no rereview.
- [ ] Final saved aggregate/task-done/local finalcommit/clean tree; next one V02.14 immutable candidate/native affected qualification, no source-only speedup credit. Timed goal remains active.

Expected: one actual dispatcher verify+fresh snapshot per one fast wire request, exact legacy/failure/close behavior and green source suites. Installed/native acceptance explicitly due; no test-count-only or document-only readiness claim.
