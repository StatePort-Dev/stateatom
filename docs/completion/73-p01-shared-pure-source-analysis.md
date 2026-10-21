# P01.4a — shared pure source resolver and Node preservation

2026-10-22 (Mauritius); base f0245bc/main plus registered source. This bounded task
extracts the existing lexical resolver and prepares mapped-function analysis. It does
not ship browser parsing:the unchanged .35/UI .2 product still shows source excerpts.
P01 remains in progress;15/29 original items complete. Mandatory L02/A02 gaps remain.

## Implemented boundary

core/action-analysis.mjs is now the Node digest/Vue preparation adapter. The shared
core/action-analysis-pure.mjs owns the original unit/location/import/function/object/
private-prop/alias/hook/proof resolution. The Node API and original evidence criteria
are preserved; Node recomputes source digests from text and ignores browser-only
import-name labels and caller-provided digests. No second miniature resolver was added.
The pure relative-path helper operates on explicit labels only, with no I/O.

The new internal analyzeMappedFunction API takes an exact canonical source key,
line1/column0 and explicit run/build identity. It reports source function names,
ranges, bounded expressions, lexical identifiers and possible calls through that
same resolver. Legacy returned source ranges remain line1/column1. Missing context,
content/digests/syntax, outside/end positions and duplicate source keys remain gaps;
no nearest function/name search. Original index-specific keys distinguish equal names.
Relative imports resolve only among explicitly included files; duplicate names do not
choose a first file. No bare-package/filesystem/network lookup or source execution.

Possible calls remain Candidate, independently of their lexical target status. No
branch winner, runtime value, invocation, property producer or HTTP origin is inferred.
Getters, mutable/dynamic/member/opaque import boundaries remain Unknown. Nested function
bodies are excluded from the selected body's call list. CRLF/CR/Unicode separators and
UTF-16 columns use original source coordinates. Graph proofs have explicit endpoints.

Default bounds:8 parsed units,64 proof relations,8 calls,64 identifier records,
400-character expression. Unit/call/identifier truncation is Partial; proof exhaustion
is Budget with no partial entry/calls. The future browser adapter must verify source
provider content itself and enforce hard elapsed-time/output/cancellation budgets.
Vue SFC parsing remains an injected Node adapter; no SFC compiler entered the browser.

## Actual verification

- 18 new source tests;65 focused action/Vue/pure/path controls PASS.
- 12 immutable before/after Node cases have deeply identical outputs and graphs.
 Baseline source/corpus hashes and original Node module were retained before extraction.
- npm test:1975/1975 PASS,0fail/skip/cancel. npm run build:PASS; existing CJS import.meta
 warnings remain recorded, not suppressed or treated as newly proven runtime behavior.
- Browser esbuild probe:2,218,162 bytes,164 explicit inputs,18 npm packages. No Node
 wrapper/crypto/path/fs, bridge, IDE or Vue compiler. This is BUNDLE ONLY, not actual
 Worker execution and not an admitted product dependency list. Babel's fixed build
 flag still needs explicit treatment in the worker bundle; no broad Node polyfill.
- Actual current native Action/IDE regression:105 PASS across both exact .35 hosts,
 with actual source-open audits, source/instance/native freshness, off/on controls and
 fresh offline readers. Browser Chromium153; input hashes unchanged before/after.
 Result:.artifacts/a03/actions-native/2026-10-21T20-17-37-408Z/results.json.
 Aggregate verification.json:PASS_PURE_NODE_PARITY_NOT_BROWSER_FEATURE;
 reproduce with node .artifacts/p01/pure-source/verify.mjs.

## Preserved failures and test-driver corrections

Initial REDs covered absent APIs, Vue injection, missing explicit evidence identity,
source point beyond a line boundary and graph endpoint coherence. The Vue unit is now
injected explicitly; missing run/build is a gap, never a fabricated identity. The line
boundary check prevents a previous-line column from reaching a later function. An
incorrect test closing-brace/end column was corrected against the literal source end.
All failed logs remain; no evidence.edge requirement or original acceptance was lowered.

The legacy Playwright verify:actions failed before any Action check with `Native
 debugger resource is already attached`:its app CDP owner conflicts with the current
native debugger. The failure screenshot/result are retained. The existing native
Actions driver avoids that ownership conflict and exercises the actual IDE/source path.
Its first run passed34 checks then assumed actionBindings[0] was JSX; current product
puts own-host callback cards first. The driver now finds mechanism react-jsx explicitly.
Its second run passed39 checks then waited for an obsolete Unknown summary on a native
registration. The wait now accepts the existing explicit current statuses; subsequent
registration/freshness/execution/source/instance assertions are unchanged. No parser
failure was established by either driver issue. Failed immutable run records remain.
The second run's reactHostProps metadata was incorrectly toggled; its server records
still explicitly show instrumentation false. Final driver separates the original
instrumentation flag from the product native own-host callback collector.

## Evidence and one next item

.artifacts/p01/pure-source/{node-before.json,node-after.json,original-action-analysis.mjs,
bundle.json,green-final.log,full.log,build.log}; aggregate verification.json and
verify.mjs record exact files and the final actual regression result. Original .35
archives/hosts and all earlier completion records are unchanged. No new publication.

Plan:../superpowers/plans/2026-10-21-p01-pure-source-analysis.md. Next ONE task **P01.4b**:
owned, separately bundled Worker and transient explicit source-provider input in the
current source view, then exact packed two-host/two-loaded-bundle/remaining controls.
Normal Atom bundles must remain parser-free. ONE whole-P01 review follows actual full
acceptance; this source extraction does not complete P01 or prove a browser feature.
