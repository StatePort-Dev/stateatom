# V02.8 bounded superseded-load error correction

Second7a5eb1d attempt12-49-04-617Z preserves92 joined warm rows,132 ledger
checkpoints,two HISTORY_LIMIT65 refusals and one actual standalone native Close
(35.8ms after input, blur recorded, no applied transaction/app effect).886 hashes
match;0 inspector console/errors. It remains INCOMPLETE: embedding fresh Inspect
after Close/Discard reports Stale action identity result before its Close case.
All valid measurements/limits/cancel evidence remain original64 and are not lost.

Source-only analysis identifies two independently testable UI races, without
claiming exact causal attribution of the archived native tail/error:

1. load() throws a rejected old primary request before checking loadGeneration;
   a rejected ordinary-deep fallback is similarly unguarded. Its error can poison
   the same-tab action batch after a newer selection succeeds.
2. Input-close notifications may start background deep-state reads while an
   explicit Inspect RPC is replacing that selection. A current-in-UI but old-in-
   runtime read can then fail before the explicit operation performs its final
   state read, leaving the batch with an unrelated old error.

## Bounded proof/correction

- Add controlled mounted-UI RED cases for expired primary/fallback errors and
  background refresh during both manual CSS/Inspect-again pending work. Preserve
  current primary/fallback failures as positive error-reporting controls. If these
  do not fail meaningfully, do not change the product based on speculation.
- Minimal UI-only correction: per-tab pending explicit-inspection intent defers
  state reads until its actual RPC finishes, then the existing fresh-identity or
  ordinary failure recovery runs. Older completion cannot remove a newer pending
  intent. Reject rendering/status effects from superseded primary/fallback load
  failures; retain actual errors for the current request. Native/runtime identity,
  marker/deep fallback, permissions, values/evidence,250ms/64limit unchanged.
- Files packages/atom/src/ui.mjs and tests/atom/inspector-ui.test.mjs; small shared
  explicit-inspection helper may remove duplicated CSS/Inspect-again lifecycle.
  No generalized queue, runtime weakening, extra app evaluation or automatic
  selection/retarget/retry of a refused runtime occurrence.
- Issue Atom0.1.0-candidate.20261021.65 with changelog/package/lock metadata; UI2,
  wire/API1/contract2.1 unchanged. Never rebuild64 under issued identity.

## Qualification and measurement boundaries

- Freeze current code/harness/plan inputs before full tests/build/native. Run
  meaningful affected inspector/input source checks, then declared npm test,
  npm run pack:atom, npm run verify:atom-types -- <exact65handoff>,
  npm run verify:atom-package -- <exact65handoff> and affected native H09 reporter.
  Actual commands/results/identities recorded, missing scripts not invented.
- New native input-mode driver consumes exact65/new frozen source map; full
  unchanged92/132/2limit/2Close protocol is now warranted by changed product UI
  on this actual route. Keep all original64 rows/INCOMPLETE/driver hashes separate,
  not promoted to fresh65 or retuned. Record actual completion even if a new
  failure remains. All other64 Basic/active/warm-source measurements stay original
  evidence, not automatically current65 performance qualification or a waiver.
- ONE fresh whole V02.8 review after verification,one material correction pass
  at most,no re-review. Local commit and one next item V01 native/packed CI lane
  reconciliation; full V02/Trace/Basic-active/model remain open. No publication,
  SDK, redesign or other repository.
