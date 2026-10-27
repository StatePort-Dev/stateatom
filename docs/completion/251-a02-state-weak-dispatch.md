# A02.54 — state handoff weak-method dispatch

Bounded source step after I02.36 host223714a7. Current source base6d83bef; main/local.
Observed source risk: src/engine/react-state.mjs reads `.deref` dynamically on its
private weak refs at state-result, association and selected witness. A later app
method/accessor replacement can therefore run application code from telemetry.
This is a new independent semantics question, not the cause of A02.50's unavailable
references. Do not acquire new native data, pin strong app objects or rerun50/readers.

Use the existing state ledger and original identity/revision/queue/commit predicates.
First reproduce late method/accessor dispatch with owned synthetic native events,
restoring all patched descriptors in finally before assertions. Then capture a
callable own-data weak deref at ledger initialization and use captured Reflect.apply;
missing/accessor capability must not be invoked/adopted and stays unsupported.
Keep missing/collected reference and same-value replacement outcomes Unknown.
One existing source file only plus targeted tests/docs; no broad intrinsic framework.
The module is absent from current86source270/build327; no package/host refresh implied.

Spec: ../superpowers/specs/2026-10-28-a02-state-weak-dispatch-design.md.
Plan: ../superpowers/plans/2026-10-28-a02-state-weak-dispatch.md.
Source, original50raw/case/reader, current86/UI2 and required input hashes before edits;
RED→GREEN/affected/full suite/diff/preservation, ONE source-slice review, local commit.
No new source/body/field/writer/parameter/selected DOM or fullA02 acceptance from tests.
Current whole21/29(72.41%); original mandatory L02/usefulness and V02 misses preserved.

Result pending reproduction. Historical criteria and old results remain unchanged.
