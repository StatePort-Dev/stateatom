# A02.6 — original array call-site bridge (in progress)

Base40146b7; latest human autonomy through Oct25 evening/scope-review-1/20of29.
[Design](../superpowers/specs/2026-10-24-a02-array-callsite-bridge-design.md),
[plan](../superpowers/plans/2026-10-24-a02-array-callsite-bridge.md).

A02.5 demonstrates only source fixture callback identities. Its persistent wrapper
frames and deferred reentrant Stop Minor prohibit generic deployment; old module
and evidence remain unchanged. This item adds separate frame-only hooks and a
source transform, then at most one original/off/on independent TodoMVC source
experiment if semantic gates pass. Native original callbacks must execute directly;
causal storage/state revision/React props/ownership/selected producer remain Unknown.
No product/plugin/SDK/UI/otherrepo/publication or old native campaign change.

Current evidence: source inspection and official Babel Context7 docs only; no new
code/tests/native outcome yet. Relevant existing call/temp/scope patterns read in
src/engine/script-transform.mjs and action-transform.mjs; neither is modified.
Planning is not implementation or capability readiness.

## Task1 source implementation checkpoint

New self-contained frame recorder forwards no app execution: actual native
Reflect.apply is exposed directly; begin/yielded/finish/abort only record weak
identities and return original results. Stop/window rotation invalidates tokens.
Source callback results/array/item fields are not re-read. Opaque IDs are captured
at original entry/yield/return; bounded call audit marks pending/completed states.
Saved history therefore does not depend on later WeakRef liveness, reconstruct
objects, establish current membership or prove GC behavior.

Transformer preserves receiver/method/argument order and inline original arrow
evaluation, including a stack-sensitive getter for which the old wrapper changes
the branch. Generated receiver/method/token bindings are cleared in the original
owner's finally, not an extra JS function. Native callback length1 and lexical
this/arguments/new.target remain. Foreign/off paths use the original arrow body;
unsupported forms remain unchanged with explicit reasons. No generic source/
stack-location reflection or hostile-intrinsic transparency is claimed.

TDD: frame/transform missing-module RED each fails one file before tests execute.
Initial frame19PASS/transform35PASS. Strict nested-function counterexample then
35PASS/1FAIL (`_saArrReceiver` undefined): cloning an outer callback discarded the
nested owner's declarations. Outer callbacks with any nested target are now
explicitly excluded; inner source executes correctly. Repeated caught failing site
in a loop36PASS/1FAIL pending1≠0→abort prior per-site token before reuse fixes it.

First aggregate56PASS and full **3094PASS/0FAIL/0cancelled/0SKIP**,107.49s, precede
the saved-call audit. Added audit control19PASS/1FAIL missing calls; capture original
IDs and explicit metadata→final **57PASS**. Fresh final `npm test` **3095PASS/
0FAIL/0cancelled/0SKIP**,101.70s, terminal92182. Old count/results unchanged. Logs in
`.artifacts/a02/array-callsite-source/2026-10-24`; product327/nine old experiment/app
files match and no product importer. TodoMVC original manifest has28 files, not
commerce65. Native0; source/task commit and Task2 frozen acceptance remain due.
