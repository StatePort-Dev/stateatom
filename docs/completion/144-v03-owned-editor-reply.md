# V03.21 — current owned-editor reply delivery (in progress)

Current: beginning source TDD; **no product correction or new candidate/native
acceptance yet**. Baseline570b796. Source20 confirms a superseded reply can be
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
