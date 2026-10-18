# Factory-owned observer identity and cleanup

This is the next bounded prerequisite after the
[compiled-effect assessment](2026-10-18-compiled-effects-progress.md), under the
unchanged original P2/P1 criterion. Revision is dirty `main` above
`bcde3d0f1572878df662db6bab79e65bc66dd6d0`, not a release. The
[preselected scope and native controls](../superpowers/specs/2026-10-18-observer-identity.md)
remain separate from readonly or full HTTP acceptance.

## Actual fix

The factory no longer accepts `window.__STATEATOM__` as instance identity. A private
module-owned WeakMap retains the actual API and publication phase, with captured
get/set/delete operations. Active same-factory reuse and configuration checks remain;
a stopped instance can be replaced. A public page getter is not read for lookup.
This is same-factory/module identity, not a cross-module or hostile-realm guarantee.

Only the inspector-owned API is frozen. Its scope/capture/read/member method slots
are original own-data functions, nonwritable and nonconfigurable. Application data,
callbacks, prototypes and nested state are not frozen or made readonly. The public
global remains untrusted transport; replacing it cannot replace an already retained
API reference. This does not authorize page reports or imports at the browser/IDE
boundary, and does not attest observer code or bootstrap primordials.

Publication is transactional for the supported hook installation: failure clears
the private registration, deactivates the rejected API, independently releases
owned resources/hooks, and preserves the original exception. Reentry cannot receive
a half-published active API. Hook restoration uses current own-data descriptor
identity, preserving application replacements without calling their accessors.
Original descriptors are restored, or temporary own slots are removed if the
original hook was inherited. An application replacement is not overwritten. As
with other local hooks, an application making a hook irreversibly nonconfigurable
can prevent restoration; the inspector does not claim authority to undo that change.

## Retained failures and checks

Four initial REDs reproduce foreign active-object adoption, a public getter call,
replaced global changing factory reuse, and mutable API methods. Two later REDs
reproduce wrappers/active registration surviving failed publication and publication
reentry obtaining an incomplete API. Review reproduced a further failure: a setter
replacing fetch with a throwing getter prevented JSON restoration. Its RED is kept;
restoration now reads only descriptors and handles hooks independently.

Root **353 unit tests**, full build and **31 focused controls** pass. Focused tests
include ordinary trace semantics, original exception/receiver/getter/branch behavior,
factory reuse/mode/stop lifecycle, exact descriptor restoration, publication rollback
and application accessor replacements. These are unit mechanisms, not UI evidence.

`COMPILER_TAG=observer-identity-final-20261018 npm run verify:observer-identity`
passes **16 native checks**, unchanged source/dependency hashes and no errors.
It retains the earlier compiler/effect controls plus four identity checks:

- Original P1/P2 and semantic outputs with frozen own API slots, readonly Unknown.
- Public global getter bootstrap with zero reads and one publication.
- Reflect.set/Reflect.defineProperty replacement attempts rejected; replacement
  functions and accessors have zero calls.
- Changed runtime member body actually executes a same-value write, despite frozen
  slots, unchanged selected output and retained helper compiler correspondence.
  Runtime compiled content differs and readonly/current-field/fullPath stay Unknown.

The runtime-body marker witnesses only this declared synthetic control section;
it is not a product writer event. The first native run completed 15 checks and
failed a harness assertion using the import URL instead of the actual Vite-normalized
runtime URL. That failure is retained. The corrected check uses the exact observed
pinned `/@id/__x00__stateatom-runtime` URL and compares full compiled digests; no
source or effect claim is inferred from URL equality.

## Actual UI is separate

`HOST_UI_TAG=observer-identity-reviewed-20261018 npm run verify:code-journal-ui`
passes **26 actual panel/Chromium MV3/VS Code checks** with stable inputs and no
harness errors. It includes P2/P1 selected values and source, exact IDE ranges,
reinspection/stale boundaries, native state/exchange/access limitations, reviewed
export and fresh passive reader. The run preceded the last descriptor-only cleanup
change; final clean acceptance covers that successor separately.

Browser plugin unavailable; the repository's pinned Playwright 1.63.0 operates
sandboxed Chromium 153.0.8010.12 and actual VS Code Extension Host. Node 24/npm 11,
Vite 7.1.9 and React 18.3.1 dev retain the documented configuration. Review ran the
31 focused controls and found no remaining blocker in the identity/cleanup delta;
it did not run native UI.

## Readonly contract decision

| Wrapper | Code-local behavior | Remaining effect premise |
| --- | --- | --- |
| scope | Returns a page/counter string; updates its private scope counter | Exact compiled body/closure and primitive captured page/counter |
| capture | Executes the original callback once, records its result or original error | Callback effects and all telemetry helpers; no callback is assumed readonly |
| read | Returns the already evaluated binding value and records metadata | Origin/binding lookups and transitive add/helper/intrinsic effects |
| member | Performs the original property read once, then records metadata | Actual own-data receiver/key/leaf, original getter semantics, descriptor and telemetry effects |

**No readonly wrapper contract is accepted by this fix.** Frozen method slots do
not establish the function body, captured intrinsic identity or transitive effects.
For example `add` still calls live `Date.now` and uses collection operations. A
source hash or unchanged output cannot establish those effects over a selected alias
lifetime. The existing strict grammar continues to refuse opaque observer calls;
none is stripped or approved. Complete inputs/execution/history and cache/state/
props alias lifetime remain unproven; original full HTTP is NOT MET, historical
six-case results stay 0/6, and Vue PARTIAL remains a negative control.

The next bounded task is to assess transitive telemetry effects through `add` for
one selected `member` call, beginning with changed Date.now/collection intrinsics
and ordinary own-data input controls. Bind any accepted summary to actual compiled
body/callee premises; unknown callbacks or intrinsic history must deny readonly.
This is separate from publication, Store/VSIX and independent human usability.

## Reproduction

```sh
npm test
npm run build
COMPILER_TAG=<unused> npm run verify:observer-identity
HOST_UI_TAG=<different-unused> npm run verify:code-journal-ui
SHORT_TAG=<another-unused> npm run verify:short-loop
```

Native commands run sequentially with no separately running dev server. Short-loop
fixture preparation follows its existing README; completed preparation is reused.
No old experiment, frozen source candidate, dependency/lock setting, release or
repository publication is changed by this work.


## Final source and UI acceptance

The immutable `/tmp/stateatom-observer-identity-candidate-20261018` contains
**255 regular source files**. Fresh locked installation used empty npm user/global
configuration and the previously public-verified dependency cache, with no inherited
node_modules/build outputs or old spike. This is a new offline installation, not
a new empty-cache network install. Clean **353 tests/build** pass and all **34
outputs** match root. No lockfile/dependency setting changed.

`COMPILER_TAG=clean-observer-identity-final-20261018 npm run verify:observer-identity`
from that checkout passes **16 checks**, 66 stable source-input/five stable dependency
hashes, no errors. It has no Git revision and explicitly records sourceArchive:true.
`HOST_UI_TAG=clean-observer-identity-final-20261018 npm run verify:code-journal-ui`
then passes **26 actual UI checks**, stable/no errors, including all **10 reviewed
exports** in a fresh offline reader. The compilation checkpoint has **49/49 hashes**,
zero pending/queued, and explicit isolated/unknown-history limits. Final desktop
panel/reader and the root 390px panel screenshots were visually inspected.

The final root short loop `observer-identity-final-20261018` retains all **30 scored
cases: 20 PASS / 10 expected PARTIAL**, with **106 passing UI/configuration/lifecycle
checks**, source/build/fixture hashes stable and no harness cleanup errors. There
are no page exceptions or Vite overlays. Console health is not clean: eight generic
resource-404 messages remain; two HTTP 404s are attributed to TodoMVC learn.json,
with other resource messages unattributed. These are retained, not hidden.
The five marker tests remain in the full unit suite. Vue controls do not establish
Vue support. All **1,527 historical** and **241 old short-loop** hashes match again.

Bootstrap/manifests/logs: `.runtime/candidate-bootstrap/observer-identity-final-20261018/`.
Root native: `.runtime/compiler-probes/observer-identity-final-20261018/`.
Root short loop: `.runtime/short-loop-runs/observer-identity-final-20261018/`.
Clean native/UI results are under the frozen candidate's corresponding `.runtime`
directories. A separate metadata-only review allowlist is retained under
`.runtime/preview-acceptance/observer-identity-accepted-20261018/`; no profiles,
pairing credentials, raw IDE logs or runtime/private source bodies are included.
Documentation appended after source freezing does not alter the candidate.

This acceptance is explicitly agent-operated under user authorization. No commit,
push, source publication, release, installed-VSIX or Store submission occurred.
The stronger wrapper contracts and original full-field HTTP criterion remain unmet.
