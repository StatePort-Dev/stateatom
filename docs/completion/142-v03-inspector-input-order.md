# V03.19 — inspector input ordering (in progress)

Current: beginning the test-only observation technique; **no new native result**.
Baseline843a648; A02.4 bounded complete, whole20/29 unchanged. V03.17/native guide
FAIL and V03.18 source-only ordering results remain unchanged. Goal is actual
inspector receive/edit/ack order and the visible per-row refusal, not a guard or
recovery change. [Design](../superpowers/specs/2026-10-24-v03-inspector-order-diagnosis-design.md),
[plan](../superpowers/plans/2026-10-24-v03-inspector-order-diagnosis.md).

Executor chose exact-source conditional breakpoints on the owned inspector only,
always false with bounded projected model metadata. First prove that technique
on the actual source controller with a synthetic backend; it is not native app
acceptance. Only after it passes, register one native case with enough collection
to answer the missing question. No source/app rewrite, app expressions, new timing,
private setter, certificate or IDE campaign. Whole V03/A02/V02/L02/C09 stay open;
A05/L02 mandatory, SDK outside Atom, human participation not a blocker.

## Task1 source controls before browser

Actual serialized probe/source/CDP boundary controls: missing module **13FAIL**;
first implementation9PASS4FAIL (source anchor whitespace/concatenation precedence
and a generated bundle without source comments), corrected exact anchors13PASS.
Additional serialized always-false/failure control and protocol BreakLocation
metadata test: **14PASS1FAIL ->15PASS** after passing only the three Location fields
to CDP. No tolerance/automatic anchor guessing was added. Limits/projection/slot
ownership, partial cleanup and unexpected pause refusal are covered.

Source-controller technique driver is written and syntax checked, not executed.
It serves only the actual controller/draft/plan modules plus a synthetic backend,
uses copied old native baseline data explicitly as synthetic metadata, and scripts
two model edits10/20. The old application is not started. Before Chrome, it seals
source/served bytes/old seed/actualNode/Chrome identities. This will establish only
that six breakpoint sites and ten pre/post records behave as intended, never a
new native commerce result. Own headless sandboxed Chrome; no extensions or
certificates. Original product and all old records unchanged.
