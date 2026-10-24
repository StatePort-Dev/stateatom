# V03.22 — semantic negative controls (complete, test-only)

Base ed9e2a6. Disposition of V03.21 reviewer Minor M1, test-only. Seven existing
negatives can be masked by earlier trace-copy equality; plan projections and saved
trace prefixes also need consistent mutations. No product/native criterion change.
[Design](../superpowers/specs/2026-10-24-v03-semantic-negative-controls-design.md),
[plan](../superpowers/plans/2026-10-24-v03-semantic-negative-controls.md).

Before test edits, V03.21 verifier passed523 physical inputs; completion checkbox
edits then leave522 physical plus one exact original plan Git blob. Saved checkpoint
`.artifacts/v03/owned-editor-reply-review/2026-10-24/pre-test-change-checkpoint.json`.
Old result/case/archives/verifier remain immutable. This task adds no native run,
package, UI or source mechanism, and no whole-task credit.20/29 unchanged.

## Actual result

Seven negatives now assert literal scalar actual/expected rejection values. Before
changing mutations: **15PASS/7FAIL**, each named semantic case failed because the
earlier trace-copy comparison supplied whole trace objects. Matching stoppedTrace
and both before/after plan projections gives **22PASS/0FAIL/0SKIP**. The separate
late stopped-record mismatch control remains. Actual native driver unchanged.

Isolated in-memory/data-URL driver copies: intact seven controls PASS; removal of
each corresponding predicate makes its own test fail. **7/7 removals caught**.
Audit leaves actual driver/test bytes unchanged. Initial sandboxed child-test
attempt produced empty output and was not counted; the automatically approved
normal child execution completed with explicit seven-test output.

New independent verifier copy in
`.artifacts/v03/owned-editor-reply-semantic-controls/2026-10-24/verify.mjs` retains
the old positive checks and immutable actual result. RED confirmed stale-model
failure was masked by trace equality. Semantic mutations now also synchronize
stoppedTrace, pre-stop prefix and all sampled window prefixes, with both plan
copies. **23 negatives PASS**, including seven scalar-checked semantic cases.
Independent isolated removal audit proves **7/7** named verifier predicates are
unmasked: intact rejects the semantic fault, deleting that predicate admits the
same otherwise-consistent copy. Audit initially lacked its own spec binding;
correcting only that ignored audit context produced the stated result. No native
or product failure is inferred from that setup error.

Frozen inputs: **521 physical +2 exact historical Git blobs =523**. Historical
completion plan/test are checked against71325e6 and their original hashes; current
hashes are recorded separately. All original raw/result/case/archive/old verifier
hashes still match the pre-change checkpoint. Original65/both hosts/current327
product inputs remain physical matches. Old Chrome/Vite PIDs remain absent.
Old verification/result files are untouched; their original20-negative report is
historical and retains the reviewer limitation. New23 is not retroactively theirs.

Fresh `npm test`: **3016PASS/0FAIL/0cancelled/0SKIP**,106.10s, terminal session83135.
This includes intervening test-only controls absent from the earlier2989 run; the
earlier count/results remain unchanged. Logs, mutation audits and verifier report
are in the new output above. No package/build/browser/helper/IDE or certificate
operation; product/UI/driver unchanged. No new reviewer or V03.21 correction pass.

M1 is resolved within this new bounded test item. Next one dependency item:
**V03.23 resume the independent original input guide on exact77**, preregistered
and finite. The10→20 correction justifies an affected continuation; old guide FAIL,
Undo/Draft/baseline, global inspection-ready/latency and all original assertions
remain unaccepted until actually checked. No automatic guard relaxation or broad
campaign is authorized by this record. Whole20/29 remains unchanged.
