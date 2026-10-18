# Potential accesses in three private Query compiler inputs

This follows [source-only receiver guards](2026-10-18-write-access-progress.md).
Revision remains `bcde3d0f1572878df662db6bab79e65bc66dd6d0` plus each dirty input
manifest. No old experiment, original P2/P1 or historical denominator is changed.

## Mechanism and boundary

The default-off `queryWriteAccessGuards` requires source write-access guards and
native Query handoffs. The same AST helper runs over exactly three existing
SHA-guarded Query 5.90.3 private inputs, after native adapter transforms and their
separate site-count checks. Installed dependency files are not edited. The staged
input bytes/digest are retained, and metadata paths include that digest. Their
ranges describe staged code, never upstream/application IDE ranges. The helper is
inserted after the pass, uses captured intrinsics initialized at module start,
and always returns the original receiver even if runtime is unavailable or fails.

The three inputs contain 21, 2 and 18 eligible receiver sites respectively, plus
16 explicit exclusions for implicit field definitions. Source/budget/exclusion
records remain incomplete coverage. Other Query inputs, native/opaque effects,
implicit writes, alias lifetime and earlier/other code history remain unverified.
This is potential access before the original operation, not invocation or completed
write proof. `fullPath:false` and Unknown current-field ancestry are mandatory.

A native control calls original `fetchInfiniteQuery`/`ensureInfiniteQueryData`
with genuine parsed options. The library writes `options.behavior`. Source-only
guards cannot observe that private assignment; private guards conservatively
invalidate the same parsed receiver's fields. A throwing `pages` getter, frozen
options and throwing Proxy setter retain original effects/errors. No callback is
rerun for inspection.

## Concrete integration fix

Initial native acquisition passed, but review found that the IDE bridge treated
the absent private virtual file as a changed workspace source and made the entire
fresh trace/commit Stale. The retained RED classifier test reproduces it.

The validator now treats only a narrow auxiliary potential notice as unavailable
private source: exact namespace/file/digest, no origin or producer authority,
`completedWrite:false`, and no matching workspace file. It downgrades that notice
to Unknown, removes its value and denies source/IDE/invocation validation. Actual
workspace and commit-source digest mismatches remain Stale. Private nodes cannot
be exempted as selected producers. This grants no source or action authority.

## Commands and evidence

Run native checks sequentially with unused tags, after stopping any dev server:

```sh
npm test
npm run build
QUERY_WRITE_TAG=<unused> npm run verify:query-writes
QUERY_TAG=<unused> npm run verify:query-handoffs -- --query-write-access-guards
QUERY_CALL_TAG=<unused> npm run verify:query-calls -- --query-write-access-guards
HOST_UI_TAG=<unused> npm run verify:query-writes-ui
```

The root checkpoint passed 290 unit tests and full build. Focused Query tests
include 12 original-versus-guarded real-bundle cases: native/ensure, getters,
throwing RHS/setter, Proxy traps/error identity, frozen options, missing/accessor/
throwing/misreturning runtime. The private-source classifier retains ten attempted
bypasses as negative controls. No source proof is inferred from count alone.

Native acquisition `three-input-first-20261018`: **10 PASS**, stable inputs/no
errors, eight native cases across pristine/source-only/private modes and unchanged
original P2/P1/P3. Separate regressions with private guards enabled retained
**29 handoff** and **16 census** checks. Chromium is 153.0.8010.12 via pinned
Playwright; Browser plugin unavailable. These are acquisition checks, without
MV3/IDE, and do not constitute UI acceptance.

Actual panel/IDE `query-write-first-20261018`: **22 PASS**, stable/no errors.
The new React control selects quota, opens its exact real app range in VS Code,
performs the original native option write, reinspects an unchanged 12 with removed
field origin, retains a current app commit and explicitly Unknown private source,
then reviews/downloads the diagnostic and opens it in a fresh offline reader.
Repeated inspection leaves the one original query-function call at one. Existing
picker/navigation freshness and unsupported controls remain included.

Clean candidate `/tmp/stateatom-query-write-candidate-20261018` contains 231
regular source files with recorded modes, without the old spike, inherited
dependencies or outputs. An independent fresh offline public-cache install used
empty npm user/global configuration; exact lockfile/dependency settings are
unchanged from the prior public-verified installation. This reuses that dependency
proof rather than claiming a new empty-cache network install. It passed **290
tests/build**, reproduced **34 outputs**, **10 native checks** and separately
**22 actual UI checks**, stable inputs/no errors. The final UI additionally checks
private-source unavailability in the fresh offline reader.

Acceptance is authorized **agent-operated**, not independent human/manual/Store
installation. Bootstrap/manifests/commands are in
`.runtime/candidate-bootstrap/query-write-final-20261018/` and
`.runtime/query-write-regression/acceptance-pipeline.json`. The safe allowlist in
`.runtime/preview-acceptance/query-write-accepted-20261018/` contains reviewed
results/screenshots and eight exports; no profiles, credentials, raw IDE logs or
full staged dependency text. Exact staged bytes remain in the private native run,
with their digests in the review copy. All 1,527 historical plus 241 old short-loop
files were rehashed unchanged. Review found no remaining classifier blocker;
actual workspace/commit mismatch controls still fail closed. No commit, push,
publication or repository administration change occurred.

## Following bounded decision

Apply the same receiver mechanism to the already pinned private React dev inputs,
with a native object-ref assignment control and original behavior checks. That
would still leave native/implicit/opaque effects and product-owned code history
unproven. No readonly certificate or full selected P2/P1 path is accepted here.
Historical deep families remain 0/6; publication remains a separate gate.
