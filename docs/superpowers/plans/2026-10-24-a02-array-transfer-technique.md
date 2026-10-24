# Array callback identity-transfer technique implementation plan

> **For agentic workers:** REQUIRED superpowers:executing-plans inline, ONE final fresh read-only whole-item review; no implementer agents or native run.

**Goal:** Establish a narrow original native filter→map object transfer without extra app reads.
**Architecture:** Research-only native-call wrapper, weak opaque callback/result observations and identity-only query. Preserve actual call behavior and explicit Unknown for ambiguous/unobserved paths.
**Tech Stack:** Existing plain JS/Node24 node:test, no dependency change.
**Spec:** ../specs/2026-10-24-a02-array-transfer-technique-design.md

## Global Constraints

- main/local only/latestOct25evening/scope-review-1/20of29; fullA02/V03/V02/L02 open.
- Experiment only; no product/plugin/old experiment/app/compiler/vendor/SDK/UI/certificate/otherrepo change.
- No extra object/array field read or predicate reevaluation; preserve receiver/callback this/arguments/return/throw and foreign callback identity.
- Weak opaque refs;64calls/512yields fail evidence closed while application continues; stop drops evidence.
- Historical transfer only; ownership/writers/current membership/React binding/selected producer Unknown/fullPathfalse.

## Review Focus

- Callback throw/mutation/proxy reads must remain original even if evidence collection fails.
- Same value/copy/repeated alias must not borrow another object's transfer.
- Foreign methods must receive original callback identity and arguments unchanged.
- Nested/unfinished/over-limit/stopped calls must not supply completed evidence.
- No research result can promote full lineage or original independent-app/product readiness.

### Task 1: Inert research observer and semantic controls

**Files:** create experiments/react19-reducer/array-transfer.mjs; tests/engine/array-transfer.test.mjs; record146/current pointers and ignored logs.
**Interfaces:** createArrayTransferObserver() returns call(method,receiver,args), snapshot({source,filtered,mapped,item,element}), stop(), retention(); no product exports.

- [x] Write tests for exact distinct objects and explicit Unknown/refusal/caps/stop plus callback semantic controls above. Observe missing-module RED before implementation.
- [x] Implement minimal weak native-call records and exact unique filter→map join, never inspect app state fields. Run focused tests; inspect actual failing counterexamples and preserve them.
- [x] Verify untouched product327/old experiment hashes, no product import, syntax/diffcheck and full `npm test`; record literal outcomes without native claims. Local commit before ONE fresh final review.

## Final closeout (after implementation task-done)

- [x] Resolve at most one tested Important/Critical correction; preserve declined judgments/minors and no rereview. Final local commit/clean checkpoint, name one next bounded dependency only.
