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

## Result

Closed bounded source54, source968f062. Original15controls RED6PASS/9FAIL: actual
late method/getter dispatch at result/association/witness and unsupported method
handling. First fix captures own deref and apply; GREEN25/affected54/full5907PASS.
Self-review adds two owned descriptor-pollution controls, RED15/2: `.value` of an
accessor descriptor could read an inherited Object.prototype getter. Capture now
requires the descriptor's own data value too. Corrected17new controls plus existing
state/query/vendor/first-read group **56PASS**, final `npm test` **5909PASS/0FAIL/
0cancel/0SKIP**,161737.0376ms. Both earlier REDs and intermediate results retained.
No extra application getters/callbacks, forced evaluation, field or ancestry claim.

Exactly one existing source changes; same queue/update/native result/current hook/
revision/ancestor/Stop gates and weak retention. Missing/accessor/noncallable
capability refuses without invocation; lost refs and same-value state/revision
replacement remain Unknown. This captures a post-bootstrap method, not primordial
attestation, proof of constructor purity or actual GC. Other intrinsic tampering
is outside this bounded fix; no generic ownership/intrinsic framework added.

`.artifacts/a02/state-weak-dispatch-source/2026-10-28/` contains preregistration,
before-source, exact RED/GREEN/affected/full logs and checkpoint.105registered inputs:
only declared state source differs;104protected/327product inputs exact. Original50
raw/case/readers retained, its exhausted budget/Unknown cause/0newbody links unchanged.
Old frozen source-path inputs are historical where this file differs; not silently
relabelled current. Initial registration's restricted spawnSync git EPERM occurred
before registration/source edits; rerun with subprocess permission succeeds, no native.

ONE fresh source-slice review **0C0I0M**, no correction pass/rereview. Reviewer inspected
source/diff/docs/logs, no test or native run.19historical deferred Minor findings
remain. Installed helper/native/browser/GC/50cause/fullA02/release domains declined;
cost: none established by this source review. Syntax/diff/preservation pass.
Own9file workspace archived with CRC/every-byte/plan identity verified before removal:
`.artifacts/a02/state-weak-dispatch-review/2026-10-28/workspace.zip`, SHA256
`a7f110e76091c1093cab64f1b81cc13ead8db12ff6827b238e52a541c6de7a44`.
Final checkpoint beside archive. No package/host/native/model/CA changes in54.

Next ONE bounded V03.30 current existing open dev-plugin artifact: unique local
candidate, source/payload/consumer checks only. Current latest retained plugin7 is
an older local build, not proof that this fix ships or works installed. Preserve
all its archives/receipts and current Atom86/UI2. Whole21/29 unchanged.
