# A02 selected-field read and current host acquisition

28 October 2026; integration base f2b726e, Task1 checkpoint91763b3.
Task2 is still in progress: original field/read/host identity is implemented and
scoped native acquisition is verified; App/Main transfer and runtime authority
premises remain. This is not a public package, fullA02 or release qualification.

## Mechanism

- Original component destructuring produces the binding once. The compiler records
  the already-produced parameter/scalar and original JSX operand; it does not read
  props/row fields again. Nonconstant/default/computed/opaque lexical shapes refuse.
- Actual pinned native component call frames delimit source entries/reads. JSX
  development runtime and jsx-dev-runtime pass their original element/props refs;
  props identity is consumed synchronously, so discarded source element collection
  does not itself invalidate a current retained props reference.
- Selected native host props must be unique in the committed tree and match the
  exact completed source/native component frame. Equal literal sibling labels do
  not borrow the read. Stop, changed/uncommitted frame/props/type, duplicate native
  props, detached node and lost required row/props references refuse.
- The original row ref can join the selected read to Task1's current ancestor
  write; field and current commit must also agree. Raw application refs are never
  delivered through the DTO or a caller-supplied callback.
- `fieldOwnership`, `currentMembership`, `transferPath` remain Unknown/fullPath=false.
  Matching a historical field creation to a later read does not exclude alias
  writes in between. No public observer/profile/UI switch has been enabled.

Native derivative reuses the retained component-call grammar through a new product
private bridge; historical experiment source/results stay intact. New runtime
module route/payload entry and exact first-read recipe pins were reconciled.
No package version change, new tarball, official-host intake, AI/model call or push.

## Actual verification

Source RED logs: component-reads-red-final (8PASS/4FAIL), selected-read-red
(new API absent), field-vendor-red (4FAIL), selected-write-red, raw-callback boundary
RED. Corrected compiler/native/source combinations and virtual runtime bundle pass.
Final affected set before the native correction:155PASS. Native useState failure
then has three explicit RED regressions43PASS/3FAIL, corrected affected59PASS.

Case290 was frozen before the new native acquisition. First run INCOMPLETE is
retained at `.artifacts/a02/selected-field-native/2026-10-28T12-39-53-872Z/`.
Creation joined; changed and same-value edits did not. Concrete source cause:
unregistered primitive useState calls incorrectly globally refused list receipts.
Correction records such calls as opaque native stack boundaries; it does not grant
writes or relax registered list/action, nested-source, weak-reference or revision
checks. No original209/276 retry was performed.

One corrected case290 run:
`.artifacts/a02/selected-field-native/2026-10-28T12-42-50-900Z/results.json`
SHA256 `a0afb55febaa2face64ed0ffb3756c8c6f625cf8b61dfcc8348dc91d4ee1dab4`.
**PASS within private acquisition scope**, exit0:
- Original/Off/On outputs agree at create/changed/same-value/filter steps; no page errors.
- Creation/changed/same-value writes join the selected actual field read. Native
  revisions9/22/33 and invocation20/28/36 are distinct in that page.
- Unrelated label, untouched-row attribution, detached selection and Stop retain
  required boundaries. All claimed joins still have fullPath=false.
- All three fresh profiles and owned loopback server closed. No CA/system/personal
  trust changes. This tests private source collector, not standalone/official UI.
Getter/callback count parity, complete App/Main transfers, code/alias exclusion and
held-out/public/export qualification are not supplied by this diagnostic.

`npm test` after the correction: selected-field-full.log **6187PASS**,0fail/cancel/skip,
186577.34869ms,exit0. Full count is the shared source checkout, including concurrent
Atom UI work preserved outside this commit; it is not packaged candidate evidence.
Logs under `.artifacts/a02/selected-list-integration/2026-10-28/` are retained.

Task2 continues with original App/Main prop and array callback transfers. Task3
ordinary data/native arrays/whole code interval and Task4 qualification/final review
remain open. The next transfer compiler work is not credited by this checkpoint.
Whole21/29; Active acceptance281 and macOS deferral287 unchanged.
