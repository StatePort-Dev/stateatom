# A02 selected-list integration — native field receipts checkpoint

28 October 2026; base f2b726e. Implements Task1 of
[the continuing integration plan](../superpowers/plans/2026-10-28-selected-list-field-integration.md),
under approved scenario282. This checkpoint is not completion of the plan/A02.

The optional private collector now binds original reducer field receipts to its
own actual applied-update revision and current selected native ancestor. Default
public profile API remains unchanged. Wrong/cloned/aborted/ignored/uncommitted
results, missing weak references, changed current state and Stop do not grant a
receipt. Same-value applied writes have distinct revisions. An explicit control
shows that two sibling labels can share this ancestor: selected-row membership,
field ownership and selected-property origin are still Unknown, fullPath=false.

Private collection/weak operations are captured before later prototype changes.
This prevents added application getter calls from those private operations; it
is not primordial attestation or proof of arbitrary app-object safety.

Adding imports required owned Vite runtime routes and development pack payload
entries for reducer-write-receipts/private-collections. An actual virtual-module
bundle test reproduced the missing resolution before correction. Reviewed changes
to plugin are these routes/import rewrites only. The existing closed first-read
builder correctly rejected its changed recipe hash; pins were refreshed to exact
current plugin/builder bytes. Historical compiler/native evidence is unchanged.
No package/version bump, native browser run, public switch, host intake or model run.

Evidence under `.artifacts/a02/selected-list-integration/2026-10-28/`:
- Native receipt RED: native-receipts-red.log, 1PASS/13FAIL; later15 controls.
- Affected native/source receipts68PASS; expanded affected set136PASS,0fail/cancel/skip.
- Virtual dependency RED retained, then actual bundle check PASS.
- native-receipts-final-full.log:6133PASS/2FAIL, both exact compiler recipe mismatch.
- compiler-pin-green.log: builder passed; local channel listener denied by sandbox.
- npm test with local listener permission: native-receipts-pin-full.log,
  **6148PASS,0fail/cancel/skip**,179040.689194ms,exit0.
The shared checkout also contains concurrent Atom screen/UI changes. Full count
is this source-suite execution, not a packaged revision certificate. Those files
are preserved and excluded from this checkpoint's commit.

Task2 continues with original component field reads and exact selected host/props.
Task3 must discharge ordinary-field/native-array and complete-code/effect premises;
Task4 requires new changed-mechanism qualification/public+official/export evidence.
One final whole-integration review is pending. No old209/276 or performance89 rerun.
Whole21/29 unchanged. Active acceptance281 and macOS deferral287 remain in force.
