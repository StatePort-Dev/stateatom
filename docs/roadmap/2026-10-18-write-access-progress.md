# Source-only potential write-access guards

This follows the [two-site Query census](2026-10-18-query-calls-progress.md), whose
native calls deliberately leave effects and alias lifetime unknown. The source
revision is still `bcde3d0f1572878df662db6bab79e65bc66dd6d0` plus each run's dirty
input manifest. Historical deep cases, original P2/P1 and the old spike are unchanged.

## Restricted mechanism

`writeAccessGuards:true` is default off and requires sourceWrites/sourceConsumption.
An in-place fixed-arity guard receives metadata and the already evaluated property
receiver. It returns that exact receiver without evaluating the key, RHS, getter,
setter or callback. Only a private identity lookup is performed on an arbitrary
receiver; unknown/Proxy receivers are not inspected. Known parsed receiver fields
are conservatively and permanently invalidated before the original operation.

The observation is **potential property access**, with `completedWrite:false`.
A skipped logical assignment, failed RHS or suspended assignment can lose field
identity without completing a write. Private-member access does not establish a
public-field write. No readonly certificate, field revision, ownership or full-path
claim follows. The source helper does not yet instrument private vendor inputs.

Eligible source receiver sites include computed operations, destructuring and loop
assignment heads, parameter/class-initializer member assignments and awaiting RHS.
Super, optional-chain targets/receivers and implicit class-field definitions are
explicitly excluded. Wrapping an implicit field initializer would change inferred
function names, and a base constructor can return an existing parsed object.
Native/opaque effects, missing/earlier source and other realms remain uncovered.
Source/site/traversal budget loss never means complete writer coverage.

## Retained semantic fixes

The existing read wrappers wrongly replaced certain exact assignment targets with
calls, breaking for-in/of, destructuring and transparent TypeScript targets. One
shared lvalue recognizer now preserves those targets while receiver/key/default
expressions remain reads. Ordinary `.ts` angle assertions are parsed without JSX.
Parameter-created closures previously referenced a scope declared only in the
function body. Their entire parameter subtree now retains the unsupported read
boundary; the new scope-free receiver guard can still observe eligible accesses.
These fixes apply even when the new flag is disabled. Original RED evidence is
retained locally, along with original-versus-instrumented semantic controls.

## Verification

```sh
npm test
npm run build
WRITE_ACCESS_TAG=<unused> npm run verify:write-access
HOST_UI_TAG=<unused> npm run verify:write-access-ui
SHORT_TAG=<unused> npm run verify:short-loop
```

The focused source/observer suite has 54 passing checks, including TypeScript
transparent targets and parameter JSX/root/closure controls. The potential-access
export control also denies an invented result/completed write. Native source acquisition
`source-guard-reviewed-20261018` passed 17 checks with stable inputs and no errors,
covering unchanged P2/P1/P3 and 16 original-versus-instrumented control cases.
It uses Chromium 153.0.8010.12 through pinned Playwright; the Browser plugin is
unavailable. This is acquisition without MV3/IDE, not product UI acceptance.

Actual panel run `write-access-final-20261018` passed 21 checks with stable inputs
and no errors. It adds computed equal-value and skipped logical access, new
inspection timestamps, retained native object handoff, removed field origin, clear
potential/completion labels, reviewed exports and fresh passive offline reading.
These UI results are separate from native source acquisition. The short harness
`write-access-final-20261018` retained 20 PASS / 10 expected PARTIAL (106 checks).
Vue PARTIAL controls are limitations, not added Vue support. Later JSX-parameter
and captured-lookup fixes have their own regressions; clean acceptance below
checks their final source input rather than reusing the older census candidate.

A new unknown-receiver control retained a concrete late WeakMap.get regression:
one extra application lookup. The guard now uses its captured native lookup, and
the Proxy control still observes no added descriptor traps. This narrow fix is not
a claim of transparency under every intrinsic replacement.

Final clean candidate `/tmp/stateatom-write-access-candidate-20261018` contains
223 regular source files with recorded modes, no old spike, inherited dependencies
or build outputs. Dependency settings and the exact lockfile equal the previously
public-verified candidate; a separate fresh offline `npm ci` reused its verified
public cache with empty npm user/global configuration. This reuses the dependency
proof rather than claiming a new empty-cache network installation.

Both root and clean candidate passed **285 unit checks** and full build; all **34
outputs** match (27 extension/reader files and 7 minified synthetic fixtures).
Clean native acquisition `write-access-clean-20261018` passed **19 checks** with
stable inputs/no errors, now including parameter-created closures and the late
WeakMap control. Clean actual UI separately passed **21 checks**, stable/no errors.
This is authorized **agent-operated** acceptance, not independent human usability
or manual Store/VSIX installation. Safe allowlisted results/screenshots and seven
reviewed diagnostic exports are under
`.runtime/preview-acceptance/write-access-accepted-20261018/`; profiles, credentials
and raw IDE logs are excluded. Bootstrap/manifest/output/dependency reuse evidence
is under `.runtime/candidate-bootstrap/write-access-final-20261018/`, and separate
commands/exits under `.runtime/write-access-regression/acceptance-pipeline.json`.

Read-only reviews found and retained the TS/parameter counterexamples; the corrected
source-only implementation and label/export delta have no remaining reported
blockers within that scope. Reviews do not cover future vendor integration. The
1,527 historical files plus 241 old short-loop files were rehashed unchanged.
No commit, push, publication or repository administrative mutation was performed.

## Next decision

After source-only acceptance and review, assess hash/site-guarded private React and
Query compiler inputs using the same helper. Retain native/opaque/implicit/history
gaps explicitly. Even successful vendor guards would not supply a complete writer
history or close selected P2/P1 HTTP ancestry. Original deep families remain 0/6.
