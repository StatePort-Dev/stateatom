# P01.4 shared bounded source analysis Implementation Plan

> **For agentic workers:** superpowers:executing-plans inline. Preserve Node/React/
> Vue acceptance, source-only evidence and historical runs. ONE whole-P01 review
> after both tasks and remaining actual acceptance; no per-slice reviewer loop.

**Goal:** use the same pure lexical action resolver for explicit source text in
Node and the browser source view, with actual cancellation/budgets and no execution.
**Architecture:** separate Node hash/path/file preparation from existing action
parsing/resolution. Keep the legacy API wrapper and Vue unit injection. Add exact
mapped-function analysis using that same resolver. A separately bundled worker
owns browser parsing; source text/AST stay transient and out of reports/models.
**Tech Stack:** existing pinned Babel parser/traverse, read-only source provider,
native/host anchors, MV3 owned asset Worker, current package/host/UI foundation.
**Spec:** completion/06-production-and-source-maps.md P01,02/12 scope-review-1;
completion72 current native/host source path and remaining pure-analysis gate.

## Global constraints

Base f0245bc/main. Current .35/UI .2 archives immutable. No SDK, other repo, publish,
Live/production grant/handoff redesign or model switch. No source/getter/expression
execution, closure inspection, arbitrary imports/downloads/config loading, filesystem
in browser or main-thread parser fallback. Source body is data, never Worker code.
Native source/renderer/version/invocation/property/HTTP scopes stay unchanged.
Original source indices/duplicate names, exact script identity and digest domains
remain distinct. Source provider ownerDigest is not independent authenticity.
Do not lower legacy JSX/Vue/prop/getter/spread/dynamic/alias/depth/ownership criteria.

Existing limits reused:4MiB serialized explicit source set,512 sources,3MiB aggregate
UTF-8 source,1500ms worker budget. New mapped-analysis limits:8 parsed units,64 proof
relations,8 calls,64 identifier records,400-char expressions,64KiB result. Budget or
unsupported paths remain explicit, not counted as successful complete analysis.
These are technical parser bounds, not Live cadence or production permission policy.

## Review focus

1. Parser/resolver changes must not turn source candidates into runtime observations.
2. Source getters, eval/import/fetch strings and malicious filenames remain inert;
   imported source resolves only among explicit included files, never network/fs.
3. Mapped point must identify one exact function/literal association, not nearest
   function/name/component; duplicate original names retain canonical file keys.
4. Worker timeout/cancel/source/tab/map change/dispose must terminate and discard
   late output; no silently synchronous parser fallback or persistent body cache.
5. Adding an owned worker asset cannot admit Babel/IDE/Node tooling into normal
   runtime/UI bundles; exact worker-only dependency allowlist, notices and assets.

### Task1 — shared pure resolver and Node semantic preservation

Files:create core/action-analysis-pure.mjs and core/action-source-path.mjs; retain
core/action-analysis.mjs as Node digest/Vue adapter; new pure/parser/path/parity tests.
Pure API consumes explicit {file,text,sourceDigest,importName?} prepared by a trusted
adapter. It does not compute a native/V8/artifact hash or authenticate source.
Node adapter recomputes source digest from text, ignores injected importName/digest
and preserves analyzeActions(files,selection,identity,graph,projectFiles=files).

Produces:analyzeSourceActions(...legacy prepared data...,options), shared resolver;
analyzeMappedFunction(files,{file,line,column},identity,options) with original line1/
column0, source-only entry/calls/identifiers/ranges/graph and explicit gaps. Node
wrapper injects existing vueSourceUnit; browser first grammar JS/TS/JSX, no SFC
compiler or general Vue runtime promotion. Import names are inert explicit-file
lookup labels; file keys remain index-specific provider URIs. No first duplicate.

- [x] Retain original Node source/corpus/input/output hashes before extraction.
  Corpus includes lexical/inline/factory/mutable/getter/prop/hook/import/Vue controls.
- [x] RED tests for exact mapped function vs outside/nearby/ambiguous positions,
  lexical shadow/local/relative imports, duplicate names/index keys, missing content,
  getters/dynamic/opaque/mutable/branch boundaries and literal hostile source inertia.
- [x] Extract the existing resolver; no parallel mini-resolver. Share unit/location/
  import/function/object/prop/alias/hook/proof logic with the legacy selector path.
  Pure relative-path helper keeps legacy supported POSIX behavior, no I/O.
- [x] GREEN new tests, existing action/Vue tests and immutable Node baseline parity;
  full npm test. Browser bundle probe must show no Node/fs/compiler/IDE inputs and
  enumerate exact static parser dependencies before they are admitted to packaging.
- [x] Node integration/build/actual existing Action checks appropriate to changed
  Node path; preserve a failure if unavailable. No unrelated model/old experiment
  reruns. Record bounded source boundary and local commit if Task2 remains separate.

### Task2 — owned worker, transient source envelope and actual product integration

Files:add packages/atom/src/source-analysis-{worker,client}.mjs, pure entry/provider
adapter; update source-map-session/runtime/transport/types, source-map UI/details,
build/pack/receipt scripts, contract asset feature/exports, official/example host URL.
Normal runtime/ui/guardian bundles retain old no-Babel allowlist. The worker alone
gets an exact reviewed dependency-path list; no Node adapter/analyzer/bridge/IDE.

Produces:optional includeAnalysisInput boolean on closed source-map-anchor request;
default response stays640-char preview. Input is exact explicit provider JSON plus
selected file key/line/column/context, only on explicit View with owned worker support.
Worker validates source-provider data/digests itself, parses fixed grammar/options,
returns bounded source-only DTO, never raw AST or source files. Host supplies a
same-origin owned sourceAnalysisWorkerURL; missing/blocked worker yields a visible
analysis gap while existing source preview remains. No external fallback/model.

- [ ] RED/GREEN closed source-envelope admission, identity/cancel/after-await checks,
  no default body inclusion or storage/diagnostic/model leak. Position-only content
  has no analysis input. SourceRoot/filename strings cannot fetch or configure code.
- [ ] RED/GREEN worker protocol/current job ID/output budget, actual source-provider
  hashing, timeout/cancel/worker crash/wrong reply/dispose; terminate per request.
  Unit fakes cover lifecycle, actual Worker cases cover syntax/inertness/termination.
- [ ] Same parser/resolver used by Node and worker; prove corresponding source
  symbols/import targets/expressions, no observed values/branch winners/HTTP cause.
  AST UI uses existing details/cards/textContent and parent artifact/link status;
  no guessed runtime function identity or Code-linked upgrade of an unverified map.
- [ ] Add bundled source-analysis-worker.js export/contract asset feature and exact
  host copies/typed optional worker URL. Asset admission conditional on feature;
  historical package contracts still admitted under their original criteria.
  Dependency notices/source manifests include worker; runtime/ui stay parser-free.
- [ ] Full source, actual Node Action regression, new immutable next Atom candidate/
  UI .2, packed types/admission and both exact hosts. No publication implied.
- [ ] Actual native/host source view with included helper import, same original file
  in TWO co-loaded bundles and exact script/map separation, duplicate source names,
  unverified/positions-only/wrong-map/unsupported point, parsing timeout/cancel while
  UI remains usable, source/tab/map change/clear/dispose. App callbacks/getters/
  network untouched by source parsing. Explicit source remains private by default.
  Existing affected native/host source controls are regressions, not whole-project
  re-audit. Pin/freeze inputs and keep failed runs.440/390/keyboard/console/source
  fidelity vs supplied references, scoped changelog; no redesign.
- [ ] Record completion/evidence/index/status/local commit. After remaining P01
  acceptance is actually satisfied, ONE whole-P01 review; retain any real gaps.

Ruling: owned extension-document Worker with fixed parser input, same-origin asset
and hard termination, rather than parsing private maps synchronously in the service
worker — preserves UI/cancel and isolates source data — cost if wrong:an explicit
Unsupported/Budget analysis gap, never a hidden execution or remote fallback.
