# Bounded post-bootstrap telemetry effects

Continuation of the [observer identity prerequisite](2026-10-18-observer-identity-progress.md)
on dirty main above `bcde3d0f1572878df662db6bab79e65bc66dd6d0`.
This is not a release or a readonly wrapper contract. The
[preselected controls](../superpowers/specs/2026-10-18-observer-intrinsics.md)
retain the original P2/P1 and full-field criteria.

## Mechanism and retained failures

Nineteen RED controls reproduced extra callbacks/getter reads after replacing
Date.now, Map/Set operations and iterators, WeakMap.get, selected Array methods,
Number.isFinite and String.slice. Each replacement could change a controlled
quota from 12 to 99 while the observer recorded an already evaluated value.
Suppressing a thrown telemetry error did not undo that mutation.

The observer now captures references at module initialization for selected private
telemetry operations reached by capture/read/member/add: clocks, collection
lookups/retention/iteration, dependency sets/stacks and primitive formatting.
Owned dependency sets are constructed without an application iterable. Array
dependencies use bounded own-data descriptor reads; native Set dependencies use
saved size/values/next. Application globals/prototypes/data remain mutable and
unchanged by the inspector. Original callbacks/getters execute once and original
exceptions propagate. Capture still observes original effects; it does not declare
the original callback readonly.

The 80-dependency limit is enforced while collecting. Overflow marks the record
incomplete and downgrades a containing snapshot to Unknown/Unsupported. A separate
RED on the unchanged previous frozen candidate shows 81 unique reads silently
exported only 80 dependencies with Observed/missing:false. The new boundary survives
passive diagnostic serialization without changing its schema. Closure, record and
byte budgets remain independent. Duplicate dependencies do not consume extra slots.

Raw RED/green logs are `.runtime/observer-intrinsics-*.log`. The first green run had
one harness assertion that expected an old binding after deliberately evicting
over 2,000 records; its failure is preserved. The corrected assertion requires
retained observations only in non-eviction controls.

## Explicit remaining boundary

Saved references are **not** primordial/runtime attestation. Replacements already
present before module acquisition, arbitrary proxy/metadata traps, other observer
paths and ledger/host operations remain outside this bounded fix. Actual compiled
callee/body/closure and transitive effect premises have not been certified.
No wrapper is unwrapped or approved by the strict source grammar. An unchanged
helper digest or selected output still cannot establish readonly effects, complete
alias-lifetime writers, current-field ancestry or the full HTTP path.

Original full P2/P1 remains NOT MET; historical deep cases remain 0/6. Expected
Vue PARTIAL controls remain limitation checks, not supported Vue inspection.
Independent human usability, installed VSIX/Store and publication are separate.

## Reproduction

```sh
npm test
npm run build
COMPILER_TAG=<unused> npm run verify:observer-intrinsics
HOST_UI_TAG=<different-unused> npm run verify:code-journal-ui
SHORT_TAG=<another-unused> npm run verify:short-loop
```

Use the existing prepared fixtures and stop separate dev servers. Native commands
run sequentially. The compiler harness is synthetic mechanism evidence; actual
panel/IDE/export evidence is recorded separately below. Historical experiments and
previous frozen candidates are preserved. No dependency or lockfile changes.

## Root mechanism and actual UI checks

Root **375 tests/build** pass; read-only review independently ran **48 focused
tests** (22 intrinsic, 10 identity, 16 trace) with no blocker. It did not run native
UI and made no changes.

`COMPILER_TAG=observer-intrinsics-first-20261018 npm run verify:observer-intrinsics`
passes **38 native checks**: the prior 16 compiler/effect/identity checks, the
unchanged original application outputs/refused readonly authority, 19 declared
post-bootstrap replacements and the 80/81 boundary. The controls run synchronously
after runtime bootstrap and restore every descriptor before app entry. Selected
callbacks/getters/errors run once with original identity, replacement calls are
zero and quota remains 12; deliberately evicted history is not required retained.
All 67 source-input/five dependency hashes are stable; no harness/page errors.
Chromium is 153.0.8010.12 with Vite 7.1.9, React 18.3.1 dev and Node 24/npm 11.

`HOST_UI_TAG=observer-intrinsics-reviewed-20261018 npm run verify:code-journal-ui`
separately passes **26 actual Chromium MV3 panel/VS Code checks**, stable inputs
and no reported page/harness errors. It covers selected P2/P1 values and supported
host/operand facts, exact app IDE ranges, explicit reinspection, invalidation,
private-source/clone Unknown, reviewed export and ten exports opened in a fresh
offline reader. This is authorized agent-operated acceptance, not independent
human installation/usability. Browser plugin unavailable; the existing pinned
Playwright 1.63.0 workflow operates the real extension and IDE. No new browser
dependencies or sandbox/trust bypasses are introduced. The existing synthetic
duplicate-disabled fixture emits a Vite warning; UI pass does not mean a clean
console. Short-loop console/overlay checks are recorded separately below.

Native artifacts: `.runtime/compiler-probes/observer-intrinsics-first-20261018/`.
Actual UI: `.runtime/react-host-ui-runs/observer-intrinsics-reviewed-20261018/`.

The next bounded task is actual compiled observer body/callee/captured-closure
acquisition for one own-data call, with pre-bootstrap replacement and changed-body
refusal controls. Missing function/closure history must remain Unknown; this
checkpoint accepts no readonly wrapper summary.

## Final clean-source acceptance

The frozen `/tmp/stateatom-observer-intrinsics-candidate-20261018` has **259 regular
source files**, no Git revision and sourceArchive:true. Fresh locked installation
uses empty npm user/global config and the already public-verified dependency cache;
it is a new offline npm ci, not a fresh empty-cache network install. No inherited
node_modules/build outputs or old spike are needed. Clean **375 tests/build** pass.

The first output comparison failed only on the three distributed NOTICE copies:
root build preceded this increment's notice append. That FAIL remains in bootstrap
results.json. After native short-loop completion, root was rebuilt from the same
frozen source; reconciled-results.json confirms **34/34 identical outputs**, zero
source changes since freeze and unchanged install/test/build successes. No frozen
candidate file was edited to make the comparison pass.

From the frozen candidate:

- `COMPILER_TAG=clean-observer-intrinsics-final-20261018 npm run verify:observer-intrinsics`
  passes **38 checks**, stable 67 source/five dependency hashes, no errors.
- `HOST_UI_TAG=clean-observer-intrinsics-final-20261018 npm run verify:code-journal-ui`
  passes **26 actual UI checks**, stable inputs and no page/harness errors. Ten
  reviewed exports open in the fresh offline reader. Its journal checkpoint has
  49/49 hashes and zero pending/queued, with explicit isolated/unknown-history limits.

Root `SHORT_TAG=observer-intrinsics-final-20261018 npm run verify:short-loop`
retains **30 scored cases: 20 PASS / 10 expected PARTIAL**, **106 passing checks**,
stable source/build/fixture hashes and no cleanup errors. Five marker regressions
remain in the full suite. The Vue limitation controls do not establish Vue support.

| Actual UI check | Result and evidence boundary |
| --- | --- |
| Identity and meaningful content | Local React routes, actual extension panel and separate file reader; short-loop identity/nonblank checks pass |
| Framework overlay / page exceptions | None in short-loop; connected UI reports no page exceptions |
| Console health | Not clean: eight generic resource-404 messages, two HTTP 404s attributed to TodoMVC learn.json; other resource messages unattributed. Connected fixture emits existing duplicate-disabled Vite warnings |
| Rendered screenshot | Final desktop panel and reader visually inspected: selected text 13, shown 13/allowance 12, app source and explicit scoped limits; no observed clipping/overlap |
| Interaction | Picker/property changes, exact IDE navigation, form update and new inspection, navigation invalidation, unsupported clone/private source, reviewed export and offline import all pass |
| Other environments | No new mobile, Firefox, installed VSIX/Store or independent human acceptance; this observer-only change does not extend those claims |

All **1,527 historical** and **241 original short-loop** hashes still match. Prior
compiler-input (249 files), compiled-effects (252) and observer-identity (255)
frozen source manifests also match unchanged. Current acceptance is agent-operated
under the user's explicit fallback authorization. No commit, push, publication,
account change or release occurred.

Bootstrap/logs/manifests: `.runtime/candidate-bootstrap/observer-intrinsics-final-20261018/`.
Clean native/UI results are in the frozen candidate's corresponding `.runtime`
directories; root short-loop results are `.runtime/short-loop-runs/observer-intrinsics-final-20261018/`.
A separate reviewed allowlist at
`.runtime/preview-acceptance/observer-intrinsics-accepted-final-20261018/` contains
20 metadata/synthetic diagnostic/screenshot payloads plus its hashed manifest.
Derived text copies redact absolute checkout prefixes; originals are unchanged.
The first allowlist assembly stopped on a filename-prefix guard that mistakenly
treated native-write.stateatom.json as a harness result; that incomplete directory
is retained separately. The final assembly validates the four exact result files.
No profiles, credentials, raw IDE logs or runtime/private source bodies are included.
These final documentation appendages postdate source freezing; they do not change
the candidate or add readonly/full-field HTTP authority.
