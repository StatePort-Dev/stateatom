# Source provenance

## Import boundary

The 2026-10-17 import selects the current maintainer-supplied StatePort X-Ray
prototype directory snapshot. No upstream Git revision is asserted: the supplied
directory has no Git history. No experimental repository history was imported.
The first local StateAtom source commit is the reproducible public baseline.
Private source paths, per-file import hashes and historical run artifacts stay outside this repository.

| Imported path | Origin and role | Effective terms |
| --- | --- | --- |
| `core/`, except the two files below | Existing prototype analyzer, source bridge, evidence and lifecycle | MIT, root LICENSE |
| `core/basic-analysis.mjs`, `core/diagnostic.mjs` | Later prototype basic inspection and diagnostic modules; original SPDX headers retained | Apache-2.0, LICENSES/Apache-2.0.txt |
| `browser-extension/`, except reader below | Existing single MV3 shell, picker, adapters, experiments and UI | MIT, root LICENSE |
| `browser-extension/reader.mjs` | Existing diagnostic reader; original SPDX header retained | Apache-2.0, LICENSES/Apache-2.0.txt |
| `ide-extension/` | Existing open VS Code helper; development identity/display metadata updated for StateAtom | MIT, ide-extension/LICENSE |
| `stateatom-phase2/engine/` | Existing observer, Babel/Vue transform, static slice and intervention controller | MIT, root LICENSE |
| `fixtures/`, `stateatom-phase2/fixtures/`, `evaluator/` | Existing synthetic examples and independent test oracle | MIT, root LICENSE |
| `tests/`, `stateatom-phase2/tests/`, `stateatom-oss-alpha/tests/`, `stateatom-diagnosis/tests/` | Existing regression suites and real IDE test host | MIT, root LICENSE |
| selected `scripts/`, Phase 2 server/demo/sanitizer, browser-only check | Existing development and bounded validation tools | MIT, root LICENSE |
| root documents, `docs/`, `.github/` templates | Maintainer-supplied 15-document StateAtom pack, reconciled with actual sources | Root LICENSE applies; future Apache direction does not relicense history |

Import edits are limited to package/extension metadata, explicit already-locked direct
dependencies, local run commands, build/verification portability, CI, documentation and notices.
Existing source filenames and the `xray.pair` command are retained to avoid a cosmetic engine rewrite.
The documentation's ts-morph/Joern and adapter design describes possible future work;
the implemented analyzer uses Babel and Vue compilers. There is no second resolver.

## External code and build tools

No Peekly, TodoMVC, MDN application, external images/fonts, closed StatePort source,
Desktop code, capture profiles, raw reports, or generated binary assets are imported.
Peekly was researched by the prototype but is not a runtime origin for the selected code.
The original MIT attribution is preserved verbatim rather than replaced with a new author.

All npm resolutions in package-lock.json are pinned public registry URLs with integrity
values. Direct dependency versions are preserved; `esbuild`, `@babel/types` and
`@vue/compiler-dom` are now explicitly declared at their already locked versions because
the existing source imports them directly. No resolved version was upgraded.

The browser shell bundles local project modules. The IDE bundle additionally includes
Babel and Vue compiler dependencies. `npm run build` generates the exact package names,
versions, declared licenses and original license texts in `dist/ide/THIRD_PARTY_LICENSES.md`
from esbuild's input graph. Do not ship the IDE bundle without those notices and its LICENSE.
Public npm packages retain their own licenses; repository metadata is not a license for them.
The lockfile also includes synthetic fixture and build/test dependencies that are not shipped
in the browser bundle. Installed VS Code and Playwright Chromium are host prerequisites,
not distributed StateAtom binaries. This inventory is not a patent or trademark clearance.

## Short developer workflow follow-up

`stateatom-short-loop/run.mjs` is adapted from the historical MIT short-loop harness;
`tests/source-marker.test.mjs` preserves its five marker regression cases. Historical
reports, checkpoints and run artifacts are not copied or rewritten. The panel changes
modify the existing MIT shell. New `browser-extension/inspection-view.mjs`,
`scripts/prepare-short-loop.mjs`, `scripts/short-loop-inputs.mjs` and
`tests/inspection-view.test.mjs` are original
Apache-2.0 files with explicit SPDX headers. No historical file is relicensed.

`npm run prepare:short-loop` optionally exports the original React/Vue TodoMVC test
applications at `tastejs/todomvc` revision `ff43b02e59dfa604386bb382034b2cd07c2bcd8a`
into ignored `.runtime/todomvc/`, including their `license.md`, upstream package.json
and lockfiles. Their production dependencies are installed there with `npm ci
--omit=dev --ignore-scripts`; neither application nor these dependencies is bundled
or added to the product lockfile. TodoMVC's MIT source and dependency-specific notices
(including `todomvc-app-css`'s CC-BY-4.0 license) stay with these local test inputs.

## Roadmap follow-up additions

The independent harness adapts the MIT native scaffolding; optional external
TodoMVC/Redux applications and their dependencies stay ignored, not distributed.
`scripts/prepare-independent.mjs`, `stateatom-react-host/{run,ui,consumption}.mjs`,
`stateatom-phase2/engine/react-host-vendor.mjs`, the host/source-consumption tests
and their new synthetic fixtures are original Apache-2.0 contributions. The
private vendor-input transform retains React's original MIT comments and uses
installed, hash-guarded development inputs; it does not vendor or modify the
installed React source. Existing MIT observer/plugin modifications remain MIT.
stateatom-network-probe/run.mjs is an original Apache-2.0 verification experiment;
its acquisition test hook is not a product backend. See NOTICE for the
corresponding distribution notices.

The later opt-in worker integration adds original Apache-2.0
`core/fetch-bindings.mjs`, `tests/fetch-bindings.test.mjs`,
`stateatom-network-probe/product.mjs` and the synthetic fetch-controls fixtures.
Existing observer/plugin/worker changes retain their MIT origin. No Chromium or
React source is vendored, and no arbitrary evaluation operation is exposed. The
internal CDP operation installs a fixed policy boolean in a specific context.


The state-handoff/write-occurrence increment adds original Apache-2.0
`stateatom-phase2/engine/react-state.mjs`, `stateatom-react-state/run.mjs`,
`stateatom-phase2/tests/{react-state,source-writes}.test.mjs` and synthetic
`state-controls` fixtures. Original MIT observer/plugin files remain MIT.
No new package or lockfile input was introduced. The pinned React dev transform
observes original native queues/update objects; it does not replace setters.
Write occurrence instrumentation retains the original operation and excludes
unsupported execution contexts; it is not complete value ancestry.

The separate `stateatom-execution-probe/{inventory,run}.mjs` and
`tests/execution-inventory.test.mjs` are original Apache-2.0 acquisition work.
They use the existing installed Vite/Playwright dependencies without introducing
packages or modifying upstream sources. Final trusted server response bytes are
compared with CDP compiled-source bytes; no claim of execution or complete
compiler-input provenance is made. Native output remains ignored and local.
`stateatom-execution-probe/ownership.mjs` and `tests/ownership-boundary.test.mjs`
are original Apache-2.0 negative controls. The declared synthetic React devtools
hook and nested Query method wrapper demonstrate limits; neither is shipped as
an inspection hook or asserted to be part of the original app.
The original Apache-2.0 `stateatom-phase2/engine/source-uses.mjs`,
`stateatom-execution-probe/source.mjs` and `tests/source-uses.test.mjs` add a
source-only all-reference inventory using the existing Babel bindings/sourceSlice.
They do not introduce a second module resolver or change the product trace path.
`stateatom-phase2/engine/source-functions.mjs` and `tests/source-functions.test.mjs`
are original Apache-2.0 AST-only conditional fragment checks. They never evaluate
app functions and do not verify runtime premises or establish ownership.
`stateatom-execution-probe/entry.mjs` is original Apache-2.0 acquisition work. It
records CDP instrumentation pauses and an explicit false precall/missing invocation
counterexample. It does not execute callbacks/getters for inspection or establish
execution history, field provenance or a new browser capability.

The Query acquisition adds original Apache-2.0 query-handoff/query-vendor modules,
query-handoff/query-vendor tests, stateatom-query-handoff/run.mjs and synthetic
query-controls fixtures. It uses hash-guarded private input copies of installed
MIT Query 5.90.3 without editing or distributing installed dependency trees. The
original MIT observer/plugin/server retain their licenses. No dependency/lockfile
change or full-path support claim accompanies this acquisition.
The later original Apache-2.0 query-calls module, query-calls/query-call-vendor tests,
stateatom-query-handoff/calls.mjs and query-call-controls fixtures classify only two
native call sites. They retain original member callee chains and synthetic equal-write
counterexamples; installed upstream inputs and historical experiment remain unchanged.

The source-only write-access helper/tests, stateatom-write-access/run.mjs and
write-access-controls fixtures are original Apache-2.0. They reuse existing Babel
and Playwright dependencies; no upstream dependency or historical spike is edited.
Existing MIT plugin/observer/server preserve their licenses. Receiver guards are
conservative potential accesses, not completed-write or full-history proof.

The private Query receiver-guard extension and its query-write-vendor/private-input
boundary tests, writes.mjs and query-write-controls/query-write-view fixtures are
original Apache-2.0. Staged code is derived locally from three hash-guarded installed
MIT Query inputs; input digests/ranges describe those exact staged bytes, never
upstream/application IDE ranges. The imported MIT source validator retains its
license. Unavailable private source is Unknown and supplies no action authority.

The React private-input guard extension, react-write-vendor tests,
stateatom-react-state/writes.mjs and ref-controls fixtures are original Apache-2.0.
The shared compiler staging helper observes no user values while building metadata.
Query generated outputs remain byte-identical across its six accepted modes. Four
pinned installed MIT React inputs retain their original notices; no installed
package or historical source is edited. Private source remains unavailable/Unknown.

The original Apache-2.0 `core/code-journal.mjs` and tests extend the existing open
browser integration with digest-only native compilation metadata. They derive
no code bodies from external projects for distribution and grant no source or
action authority to page or imported observations.

`stateatom-compiler-probe/{model,acquire,run}.mjs` and
`tests/compiler-inputs.test.mjs` and `tests/compiler-acquire.test.mjs` are original
Apache-2.0 acquisition code. They
observe actual pinned Vite 7.1.9 pipeline inputs/results and exact HTTP/CDP content,
without copying the Vite implementation or introducing product source authority.
Native acquisition data is separate from the actual panel/IDE acceptance records.

`tests/observer-identity.test.mjs` is original Apache-2.0 regression code. The
factory-owned identity and inspection-API sealing changes in the imported
`stateatom-phase2/engine/observer.mjs` retain its MIT provenance. The native
identity controls extend the original Apache-2.0 compiler probe. They do not
establish runtime attestation, readonly effects or full field ancestry.

`tests/observer-intrinsics.test.mjs` and
`stateatom-compiler-probe/telemetry-controls.mjs` are original Apache-2.0 controls.
They use synthetic own-data values and synchronous, restored post-bootstrap
replacements; original application expressions are not replayed. The telemetry
changes in the imported observer retain MIT provenance. Captured references do
not attest pristine pre-bootstrap intrinsics or complete readonly effects.

`stateatom-compiler-probe/{entry-records,references,invocations}.mjs` and
`tests/{observer-entries,observer-entry-owner}.test.mjs` are original Apache-2.0
acquisition experiments/regressions. A declared local post-transform entry probe
derives from the imported MIT observer without editing it; its origin/notices are
preserved. Native closure reads retain digest/location metadata rather than source
bodies or arbitrary application scope values. This is not a product wrapper
contract, runtime attestation, complete provenance or new framework support.

`stateatom-compiler-probe/effect-frontier.mjs` and
`tests/effect-frontier.test.mjs` are original Apache-2.0 acquisition/regression work.
The declared helper-writer control transforms only a disposable local copy of the
imported MIT observer, retaining its notices. Babel parses exact native checkpoint
JS for digest/syntax metadata; this does not import third-party source bodies into
review exports, establish executed branches, certify opaque builtins or change the
product analyzer's supported grammar.

`stateatom-compiler-probe/operands.mjs` and
`tests/{observer-operands,operand-checkpoint}.test.mjs` are original Apache-2.0
acquisition/regression work. The optional entry transform adds receiver/key retention
and disposal only to an experimental copy of the imported MIT observer. Original
notices remain intact; product source is unchanged. Persisted native results omit
receiver objects and function/scope bodies and do not grant field-revision authority.

The Vite 7.3.7 compiler pin module, 15-file SHA-256 manifest and pin/warmup
regressions are original Apache-2.0 acquisition metadata/code. No Vite body is
copied into source or review exports. The helper package metadata describes the
actual mixed MIT/Apache-2.0 bundled components without relicensing historical MIT.
Dependency patches and their upstream licenses are recorded in the lockfile and
generated bundle notices; older source candidates remain unchanged.

The closed first-read profile in `stateatom-field-revision/` and its tests are
original Apache-2.0 work. It composes the same open marker/observer pipeline with
an owned pinned compiler and local launch channel. Installed upstream inputs
retain their MIT/Babel/esbuild dependency notices and are not copied into source
review exports. `stateatom-phase2/engine/script-transform.mjs` is a shared
extraction from the imported MIT plugin; its MIT origin and notice remain.
The finite source argument does not expand framework support or claim native
runtime attestation. Controlled browser profiles and private channel credentials
are local operational artifacts, excluded from distribution and diagnostics.


## Source layout relocation — 2026-10-18

The [repository layout](repository-layout.md) maps the historical filenames above
to current product, test and experiment locations. All 139 tracked sources from
the fourteen stateatom-* directories were relocated; original synthetic fixture
bytes, dependency pins and existing notices were retained. Runtime recipe hashes
were rebound to exact relocated source bytes with the same rejection rules.
Historical MIT material remains MIT; existing Apache-2.0 files keep their headers.
The two ignored old artifact groups were retained privately with checked hashes.
Old X-Ray source, frozen candidates and prior run results were not rewritten.

## Embeddable Atom extraction — 2026-10-18

The local `@stateport/atom` candidate extracts the historical MIT
`browser-extension/worker.js` and panel implementation into
`packages/atom/src/runtime.mjs`, `ui.mjs`, `template.mjs` and `atom.css`.
`src/engine/browser.mjs` keeps its historical origin; its browser API accesses
are bound through a factory, with cancellation plumbing added to the existing
experiment lifecycle. Analyzer/evidence algorithms and acceptance criteria are
not relicensed or replaced.

New platform/transport adapters, package build/pack scripts and new contract/native
embedding checks carry Apache-2.0 SPDX notices, as do the shipped declarations.
Package/host outputs retain the original MIT license, existing notices and Apache
text. The separately pinned extension-ui peer retains its own license/notice.
No private StatePort or Capture implementation is imported. The retained shared
UI design-reference set is unchanged.

Exact bundled runtime/UI source input digests ship as `dist/source-manifest.json` in the
candidate and in its local handoff. They identify working-tree input bytes above
the recorded Git base revision; they do not invent a commit for uncommitted work
or rewrite historical validation hashes. See [embedding](embedding.md).

## Local reference typography — 2026-10-18

The later shared UI composition adds unmodified Inter Variable from the official
`rsms/inter` repository, revision `353b61b9f4430d5f420d56605a6e7993e0941470`.
The original OFL 1.1 license, source URLs and SHA-256 digests are retained in
`packages/extension-ui/assets/fonts/`; optional `fonts.css` registers a unique
StatePort Inter family. Built browser/reader/embedding hosts carry its license.
This is a later asset addition, not part of the historical import above, and is
not relicensed as Apache-2.0. No remote font service is used at runtime.

## Action Inspector — 2026-10-18

`core/action-{analysis,native,explanations}.mjs`, `packages/atom/src/action-ui.mjs`,
the action tests and synthetic React action fixtures are original Apache-2.0 work.
Changes to imported modules preserve their historical license. No external
handler-inspection implementation or model SDK was copied. The shared UI reference
set is unchanged. The compiler marker gains a column suffix; the first-read recipe
and self receipt were updated for these exact reviewed input bytes, without changing
the proof criteria or historical manifests.

## Historical handoff — 2026-10-20

New `core/handoff-{draft,report,store,content,reviewed,files,presentation}.mjs`, handoff controllers and new
source/native tests are original Apache-2.0 work. The content projection adapts
secret-pattern filtering from the existing original Apache diagnostic module; no
external sanitizer or new dependency is copied. Changes to imported runtime/UI
files preserve their historical origin and notices. Private synthetic reports and
verification receipts are local evidence, not published artifacts or runtime proof
for an unimported model. Existing MIT/Apache/OFL notices remain unchanged.


U03 normal review/privacy candidate .20261020.19: exact handoff
`.artifacts/atom/2026-10-20T07-15-17-102Z/atom-handoff.json` (source above1f7df4a),
source/package/entire hosts/actual source and downloaded parent-child files bound
in `.artifacts/u03/review-controls/verification19.json`. Native33 exercises ordinary
controls, not generated rich reporter substitutes. Map/budget compatibility inputs
remain labelled synthetic. .18 and .19a–d `.on('request')` arrays did not receive
network events and prove no HTTP absence. Current .19h uses inspector CDP Network
with positive reader.js reload control; no app/global/P04 collector claim. Raw
historical runs, original failures, and scoped evidence criteria are preserved.
Actual H05 source/build enrichment and whole U03 remain open.


U03 source fidelity final candidate .20261020.21 (above67f8c1e):
`.artifacts/atom/2026-10-20T08-20-12-486Z/atom-handoff.json`, exact receipt
`.artifacts/u03/source-fidelity/verification21.json`. Rejects new detailed creation
from non-Code-linked/absent legacy source status, keeps old records intact and
supports explicit simple review. Old .20 native41/types2 and storage rawPASS15
(exec143 limitation) remain intermediate evidence; .21 has its own native/storage
checks. Historical19 Settings/default/legacy tests retain identity under exact
unchanged authority/source comparison, never current21 execution claims. This
cannot certify or silently correct previously exported untrusted source claims.


U03.2b.4a unimported source-byte model aboveb132957: focused26/full1361,
`.artifacts/u03/source-evidence/verification.json`. Actual temp-file byte hashing
is source-harness evidence only; .21 producer/archive/entire installed hosts are
unchanged and old native results keep identity. No public/installed source-evidence
attachment, native H05 or full-app build attestation is claimed.
