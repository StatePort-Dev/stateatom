# V03.21 — current owned-editor reply delivery (in progress)

Current: **source/full2989/packed77 qualification ready; one frozen affected native case and final review remain pending**. Baseline570b796. Source20 confirms a superseded reply can be
discarded before updating a clean active editor, unlike a latest reply. Native19
records the conflict path but its RPC schedule is unproven. Original guide17 FAIL
and20/29 unchanged. [Design](../superpowers/specs/2026-10-24-v03-owned-editor-reply-design.md),
[plan](../superpowers/plans/2026-10-24-v03-owned-editor-reply.md).

Executor chose a private scope-capturing receiver for already requested replies.
Exact scope/investigation/target/revision checks must preserve close/reopen and
foreign/stale refusal. Existing input update handles policy/disabled UI and dirty
conflicts; inspection/source render keeps its generation gate. No new polling,
timing policy, automatic rebase, native guard relaxation or visual design change.
Source tests alone will not establish product delivery; immutable package and
one registered affected native acceptance plus ONE final review remain required.

## Task1 source implementation

Controller guard captures the actual private scope object. It refuses inactive/
opening, closed/disconnected/disposed/reopened scopes, foreign tab/run/investigation/
source family/physical target, older or malformed revisions and pending pickers.
It is an inert predicate: no model mutation/request. Input UI receiver uses the
existing update path, preserving current capability refresh/disabled UI and dirty
conflict rules. Root load offers only a successful superseded reply to its captured
receiver, then returns; selected source/inspection rendering remains gated.

TDD: controller18oldPASS25missing-method failures→43PASS; input UI6oldPASS4missing
method failures→10PASS. Mounted regression61PASS1FAIL (`r7` instead of `r10`). The
first new fixture omitted sourceKind, so the correctly strict new guard refused it;
fixture corrected to actual dom-control DTO, with no guard relaxation. Old render
gate rechecked on this complete DTO still fails61PASS1, restored wiring passes.
Final focused **115PASS/0FAIL/0SKIP** across controller/inputUI/mounted inspector.

Current-owner reply10 now feeds the source-only normal Live plan from10 while the
later read is pending; source/selected rendering stays cleared. Tab/selection
changes refuse old replies. A genuinely newer revision after typing still keeps
raw20 conflicted/unsent. New capability denial disables its field through the
normal capability request path; no extra state read or new Apply action.

This is **source implementation only**. Immutable76/UI2 and all old source/native
records remain unchanged. Current product sources have changed; old76 qualification
is historical. A new candidate/full source/types/admission and ONE affected actual
native case are still required before bounded product delivery, followed by ONE
final review. No new whole-task acceptance or general Live/latency/lineage claim.

## Task2 source checkpoint before packaging

Unused candidate77 selected after checking issued top-level handoffs. Package/lock
version and behavior-only changelog advanced; shared UI2, CSS/template/tokens,
plugin and helper unchanged. Full `npm test` on this code: **2989PASS/0FAIL/
0cancelled/0SKIP**,99.29s. This is fresh source evidence, not package/native proof.
Commit metadata before local packing so sourceRevision/sourceDirty are unambiguous.

## Exact77 package and finite affected protocol

Atom77 built from clean **9d1052ebf0fd278e1125fcccca7c1636839339a2** at
`.artifacts/atom/2026-10-24T12-38-57-201Z/atom-handoff.json`;
SHA256 **60960dbc7ad7ad1eabe11a4a2565e0897028af0901e6629e44e1eb7bbf16311a**.
All327 build inputs bind current product bytes. UI2 remains
**2bfc8229a45e02f775bb563f27d9a803d51dd977145f46843c45a884e07289e5**.
Packed NodeNext/browser consumers2PASS, admission9PASS at
`.artifacts/atom/compatibility/2026-10-24T12-39-49-718Z`. No helper/plugin rebuild.

The emitted77 controller uses the same six callable bindings as76, inspected from
its own bundle. A new explicit packed77 test-observer layout additionally projects
the actual prepared plan's id/investigation/mode/resource id/value/revision and new
scalar. It does not copy full target/unknown fields or evaluate app data. Existing
layouts retain their earlier projection; historical raw results are untouched.
Projection tests15PASS4RED→19GREEN plus an actual serialized77-condition VM test;
qualification guard17missing-driver RED plus existing-site control1PASS→22GREEN.
Final relevant focused controls **179PASS**. Full product source2989 predates these
new test-only controls; it is not relabelled a larger full run.

One new case `docs/testing/owned-editor-reply-case77.json` freezes exact77/UI2,
original65/app dependencies, actualNode/Vite identity, source327/hosts/archives,
retained hashes and final trace/cleanup. Preflight **523inputs PASS**, no resources.
Own output `.artifacts/v03/owned-editor-reply/2026-10-24T12-55-30-969Z`.
This Basic input qualification runs no helper; old19's source-helper inventory stays
in its old case, not presented as new installed-helper evidence.

Concrete executor protocol: two native Live inputs10/20, no Enter/blur. First
actual acknowledgement then1200ms window; second waits at most20s for the observable
actual backend+local acknowledgement or a terminal visible row refusal, then1200ms
window. This is harness readiness/collection, not a new debounce or latency target.
The collector is stopped and its complete trace validated **before** final cached
outcome capture/classification; statuses are retained as STOPPED, not relabelled.
Both actual prepared plans and receipts must join, model must have consumed the
newer revision before second edit and actual app/backend must reach20 with a clean
local field. Refusal/unknown/invalid collection is INCOMPLETE, never a substituted
product pass. No original guide/Undo/Draft/baseline/mutation campaign rerun.

Commit source/case before max1 actual run, then independent verifier and ONE final
whole-item review. No new native or delivered-correction claim yet.
