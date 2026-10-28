# A02 reducer invocation receipts

> **For agentic workers:** Use superpowers:executing-plans under approved282 and autonomous release execution.

**Goal:** Join an original field creation to its exact completed native reducer call and applied revision, without replaying app code or claiming row membership/ownership.
**Architecture:** Add opt-in invocation framing to285's compiler recipe. A private weak-reference recorder accepts only registered reducer/site pairs, an active native call token and its matching source entry. A separate native grammar recipe threads an opaque call token through the existing applied/ignored tap. Current public plugin/package route remains unchanged until the whole bounded admission is implemented.
**Tech Stack:** Existing Babel tooling, Node VM and engine tests.
**Spec:** Approved282, prerequisites283/285.

## Task 1 — source/runtime invocation receipt
- [x] Write RED tests for original source entry/write/exit, one evaluation and original throw/finally semantics, delayed callback refusal, exact input/action/reducer/call/result/revision matching, ignored/aborted calls, equal rows/results and source-site mismatch, weak loss/Stop/capacity, no reads of app objects. Fix renamed held-out source before implementation.
- [x] Extend reducer-field-writes with explicit capture:'invocation' option (default remains site-only). Add reducer-write-receipts private recorder and native-call recipe composed after exact pinned vendor transform. Native helper executes original reducer once and threads its token to applied/ignored event. No public integration or source-closure inference.
- [x] Run focused source/collector/vendor suites. Expected all pass. Run full npm test once; retain actual logs.
- [x] One read-only final review, one necessary TDD correction pass, local commit and286record.

## Review focus
Nested and delayed callback/source entry must not borrow the current native token. Ignored/aborted results cannot be applied later. Result identity alone cannot merge two invocations. Original reducer exception/finally behavior and receiver/call count must remain. Weak loss, duplicate apply, capacity, malformed sequence/site invalidate authority. No application property reads, raw values or strong retained app references. Applied receipt is a historical occurrence only; current row membership and no-intervening-writer authority remain Unknown.

## Execution ledger
BASE4debe58. New mechanism; no replay of native209/276 or performance89. Runtime source harness is not native/installed evidence. Whole21/29 unchanged.

Initial20tests1existing semantic PASS/19RED→20PASS; five later integration controls
24PASS/1FAIL for undefined weak-result match→79affectedPASS. Initial full6092PASS.
Actual retained reducer executes in VM with synthetic native revision IDs; exact
vendor source hash admits two call sites but no native execution credit.
Final review0C/2I/0M. One fix pass: body-level function-declaration hoisting and
post-exit malformed events reproduced25PASS/3FAIL→82affectedPASS. Full rerun pending.
Final: Ruling: public plugin/package integration excluded from this prerequisite —
remains a later release gate, not delivered functionality — cost if ignored: uninstalled source claimed usable.
Final: Ruling: actual native revisions/committed DOM excluded from source review —
synthetic revision IDs are explicitly labelled — cost if ignored: fixture authority borrowed as runtime proof.
Final: Ruling: current membership/ownership/intervening writers excluded from this
receipt — all remain Unknown and next work — cost if ignored: incorrect field origin.
Final: Ruling: release/performance/visual acceptance excluded from source review —
other release gates remain, performance deviation separately accepted — cost if ignored: unsupported readiness claim.

Final: fixed both Important findings — three regressions25PASS/3FAIL→82affectedPASS;
full6095PASS/0fail/cancel/skip,176679.465928ms,exit0. One review/one correction pass.
Ruling: body-level function declarations are explicitly unsupported in invocation
mode; preserve source unchanged rather than altering hoisting. Actual retained
reducer remains admitted. Cost: some otherwise valid reducers receive Unknown.
Task1 complete at source/runtime prerequisite boundary; no native/product completion.
