# A05.3b — runtime ownership, late IDE results and exact native context

2026-10-21, base2abe1f7; scoped continuation under approved scope-review-1. User
resumed until20:00 Indian/Mauritius (16:00UTC); old05:00UTC stop remains historical.
This is runtime regression/cleanup work, not whole A05 or release acceptance.

## Actual scope and failures

New tests execute real createAtomRuntime, Chrome platform, debugger broker,
inspection, capability/wire validation and existing action controller. Only the
external CDP/helper acknowledgements and IDE transport are controlled. Inspection
creates its own selection/analysis; no product test hook or seeded analysis exists.
The existing core ledger supplies synthetic helper records. These are protocol
harness results, not native trusted Event or installed-host race proof.

Three prior fixes pass real runtime scenarios: cancelled pending Arm A followed
by view B and late A ack; late source verification after re-arm B; late verification
after selection change. Existing view/run/source/epoch guards protect replacement
state. Additional navigation/disconnect/unpair late-IDE controls pass.

Two new product bugs were reproduced and fixed:

- context-red2.log:3 PASS/2 FAIL. Arm accepted an old native context acknowledgement
  after destruction and numeric-ID reuse, and destroyed context left history fresh
  and ownership retained. Guard omitted exact context identity. Require exactly one
  matching MAIN context object, enforce it at guard/publication, retire owner when
  journal metadata invalidates it. Numeric equality does not transfer authority.
- cancel-red.log:8 PASS/1 FAIL. After body collection Cancel waited for an IDE source
  check, delaying local cleanup. The shared non-arm branch verified source for both
  reads and cleanup. Restrict source verification to read; Cancel preserves captured
  records immediately with source navigation unavailable until independently checked.

Current runtime9 scenarios PASS. Explicit CDP cleanup barriers avoid guessed sleeps.
Original failing logs and initial fixture INVALID_MESSAGE setup failures are kept
under .artifacts/a05/runtime-races/; setup failures are not counted as product bugs.

## Regression sensitivity

`node tests/integration/action-trace-runtime-mutations.mjs` creates isolated copies
of runtime.mjs with resolved imports, without editing the live worktree. Its latest
receipt .artifacts/a05/runtime-races/2026-10-21T07-14-40-821Z/results.json records:
current baseline9 PASS and5 deliberately restored bugs rejected by actual consumer
assertions: unowned cleanup, omitted post-IDE guard, omitted publication epoch,
context invalidation omitted, and Cancel depending on IDE. Each mutation must fail
its named behavior assertion, not timeout, module/syntax or invalid wire setup.
Source maps before/after are equal. This is synthetic regression sensitivity, not
new release/runtime evidence for an old candidate.

## Current checks

- `npm test`: full1.log **1698 PASS**,0 fail/skipped; product guards/tests unchanged
  during execution. Package version metadata advanced to .14 before its packaging.
- `npm run pack:atom`: .artifacts/atom/2026-10-21T07-15-29-084Z/atom-handoff.json,
  new immutable Atom .20261021.14; shared UI .20261018.2/contract2.1.0 unchanged.
  No visual change in this increment; source/runtime guards only.
- `npm run verify:atom-types -- <handoff>`: NodeNext/browser strict consumers PASS;
  `npm run verify:atom-package -- <handoff>`:7 PASS, logs in runtime-races/.
- `node tests/integration/action-trace-native.mjs <handoff>`:17 scoped checks PASS
  in actual standalone/embedding MV3 inspectors:
  .artifacts/a05/runtime-native/2026-10-21T07-16-16-177Z/results.json, errors[],
  exact source/plugin/host/workspace inputs unchanged. Actual click/body/leave,
  source-open, Cancel/Clear, async explicit gap and native/narrow controls remain.
  These controls do not exercise delayed native acknowledgements or full lifecycle.

No finite compiler/observer path changed, so old finite results are retained rather
than rerun. Existing source suite includes original controlled-channel regressions.
No production observation support, callback object identity, complete coverage,
async/HTTP consequences, saved-report schema, UI tokens or SDK scope was added.
Whole A05/A05.3b remain open. Next bounded Task2: preregistered native session/
lifecycle, Basic/disabled/throw/keyboard controls; reports and original whole-A05
performance/adapter/production boundaries plus ONE whole-item review follow.

Final read/inject-only actual standalone .14 control:3 PASS,
.artifacts/a05/read-inject-native/2026-10-21T07-20-26-552Z/results.json. Same no-mutation
connection, real Arm/click/body; errors[] and input maps unchanged. Exact archive,
current source, types/admission, native maps and regression sensitivity consolidated
by `node .artifacts/a05/runtime-races/verify14.mjs` -> verification14.json PASS.
`git diff --check`:PASS. No publication or changes in another repository.
