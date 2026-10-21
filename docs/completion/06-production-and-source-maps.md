# Production and private source maps — implementation plan

**Goal:** let a permitted production user obtain relevant source-backed information by selecting an element, without IDE, special application roles or manual debugger coordinates.

**Architecture:** retain the current read-only source-map session and strong per-artifact matching. Add a separately evidenced runtime-to-source anchor and a browser-safe source provider. Use the same claim model and inspector.

**Tech stack:** current MV3 platform, CDP, `@jridgewell/trace-mapping`, bounded archive/map parsers, bundled pure analysis.  
**Spec:** [release scope](02-release-scope.md), existing source-map specification [R26], current implementation report [R12].

## Existing implementation to preserve

Local map/ZIP import, URL/manifest acquisition, actual loaded-script inventory, exact JS/map association, bounded parsing, expiry and safe diagnostic metadata already exist. Standalone HTTPS is permission-gated and read-only; embedded hosts opt in separately. Do not rewrite this subsystem as a new downloader or make an IDE mandatory. [R12][R13]

Its principal missing product link is **selected element/action → generated code position**. Source maps supply the next mapping; they do not invent the first link. `sourcesContent` may supply original source text, but it does not supply runtime values or history. [R12][R14][X06]

## P01 — Selected action/source anchors without manual coordinates

**Depends on:** F01/F02, U01, U05 and the current action resolver.  
**Produces:** a bounded `GeneratedAnchor` joined to a selected instance and a source provider that can run without Node/IDE.

**Files:** `core/action-native.mjs`, `core/action-analysis.mjs`, `core/source-maps.mjs`, `packages/atom/src/source-map-session.mjs`, `source-map-ui.mjs`, `runtime.mjs`; add `core/source-provider.mjs`, `core/source-anchor.mjs` and corresponding tests. Extract pure action parsing/resolution from Node path/hash/file acquisition where needed; keep one analysis implementation.

Work:

- Define an anchor record containing tab/frame/context/run, selected node/instance, the relation being claimed, generated script ID/location, acquisition method and source/artifact identity. A component source location is not automatically the producer location of every DOM property.
- First support a native listener registered on the selected node, using the actual generated handler coordinates already available to the registration collector. Map that handler to original source and show the application symbol or expression.
- Add one tested framework handler anchor only when the adapter identifies the actual bound handler for the selected host element. Root delegation listeners, nearest component guesses and text search do not qualify.
- Do not execute a function or getter to find its source. When a runtime function/object association is unavailable, show the static candidate or missing anchor rather than selecting the first matching function name.
- For a property condition, require its own producer binding. Do not reuse the successful handler anchor to claim `disabled` input provenance. Present source exploration as a useful separate result where needed.
- Build a source-provider abstraction over user-selected map/source text and IDE-owned project text. It supplies bounded read-only files and canonical virtual paths, not arbitrary filesystem/network access. Keep Node imports out of browser exports.
- Resolve names, imports and expressions through the same pure bounded analyzer. Missing `sourcesContent` yields position/name information and an explicit source-content gap. Maps are never executed.
- Expose one ordinary action: select element → see supported handler/source context. Keep manual coordinate lookup in advanced diagnostics, not as the claimed default workflow.

**Test cycle:** minified native handler, two identical labels with different handlers, direct vs delegated registration, same source file in two loaded bundles, stale/replaced element, wrong map, missing source content, inline/sourceURL special case, a framework handler and its unsupported control. Test column bases, script offsets and duplicate source indices. The exact artifact status and exact anchor status are separate assertions.

**Run:** `verify:production-source-mapping`, `verify:actions`, `verify:browser`, packed embedding with read-only opt-in, plus new source-anchor unit/native checks.

**Done:** at least one native and one supported framework action can be mapped by selecting the real element in a minified app without IDE or manual coordinates. This does not assert executed action, complete property producer or HTTP lineage.

## P02 — Release-bundle workflow and bounded source analysis

**Depends on:** P01.  
**Produces:** practical release-artifact preparation, bulk matching to loaded chunks, and responsive source browsing/analysis.

Current bounded [P02.1 execution](76-p02-release-bundle-preparation.md) delivers the
explicit Node producer and actual generated-bundle compatibility; see
[recipe/limits](../source-bundles.md). One retained import/bulk matching, companion
sources, inspector parse preemption and real-app qualification remain P02 work.

**Files:** existing `core/source-maps.mjs`, `core/source-map-archive.mjs`, map session/UI, packing/build scripts; add a small standalone release-bundle preparation command and tests. This command packages explicit input artifacts; it does not build or execute arbitrary application code.

Work:

- Provide a documented CI/local recipe accepting already-built JS and matching source maps. Emit the existing versioned manifest with exact artifact digests; keep sources private unless the owner deliberately distributes them.
- Import one release bundle and associate every eligible loaded chunk, lazily as needed. Handle mixed loaded releases explicitly; never replace old-tab identity with the deployment server's newest label.
- Preserve digest domains: raw artifact bytes, decoded UTF-8 script text, CDP/V8 hash and optional debug/build ID are not interchangeable. A user-provided manifest is provenance, not independent authenticity or a signed CI certificate.
- Do not infer Exact from filenames, a version string, URL or Debug ID alone. Each positive association must satisfy the existing byte/text/map checks.
- Support companion source files only through an explicit bounded local bundle/provider when `sourcesContent` is absent. Never follow `sources`/`sourceRoot` as arbitrary remote or local paths.
- Measure existing size/time limits against the registered real-app corpus. If indexed maps or larger bundles are required, implement bounded support with dedicated tests and documented budgets; do not simply raise caps or disable validation.
- Move CPU-heavy parse/analysis work off the interactive document/worker event loop where necessary. A dedicated bundled worker can be terminated on budget/cancel; a synchronous parser with a post-hoc elapsed-time check is not preemptible.
- Keep sources session-local by default. Show expiry/reconnect/clear behavior. Any opt-in persistent source cache requires a separate retention decision and deletion test; it is not part of default diagnostic persistence.

**Test cycle:** several chunks, stale service-worker bundle, repeated deploy under same URL, wrong map, corrupt/oversized ZIP, indexed-map boundary, missing source content, sourceRoot traversal, aborted parse, expired session, worker restart and app navigation while a bundle is being matched. Keep valid source-index and UTF-8 controls.

**Run:** current source-map suite plus new bundle-builder/parser-worker checks; actual UI import on a nontrivial minified application.

**Done:** QA receives one documented artifact bundle and connects it once; normal source navigation does not require manually identifying every script or entering positions. Limits remain enforced and useful on the tested corpus.

## P03 — Corporate artifacts and actual HTTPS permission UX

**Depends on:** F02, P02.  
**Produces:** a scoped source-artifact connection that works through existing infrastructure, with local import as the reliable fallback.

**Files:** current map session/UI, platform and host permission callback, optional origin configuration in the connection model; new HTTPS integration fixture.

Work:

- Retain explicit user entry of artifact origin/URL or a configured company release-manifest base. Automatic discovery is restricted to declared map references or an explicitly configured provider; do not scan intranet paths or guess sensitive endpoints.
- Keep initial `credentials: omit`, no referrer and redirect refusal. Existing corporate SSO may therefore require the user to download a local bundle outside Atom. Say this clearly; do not promise silent SSO or add cookie/token extraction.
- Separate permitted app origin and permitted artifact origin. Manifest traversal stays within the approved artifact boundary; untrusted page/map data cannot use the extension as an internal-network proxy.
- Classify HTTP/auth/network/policy errors without returning raw sensitive response bodies. Offer local file import on failure, not a new StateAtom login.
- Exercise actual HTTPS and native permission grant/denial/revocation. Unit stubs and an already-permitted loopback page are insufficient to claim this path.
- Source connection itself leaves the production permission state unchanged and defaults to read-only. Deliberate changes require the separate F05 two-confirmation Settings workflow. Having company source access grants no mutation permission or backend role.

**Test cycle:** valid allowed HTTPS artifact, declined and revoked permission, 403, redirect to another origin, HTML SSO response instead of JSON, offline/VPN-unavailable, cancelled download, changed target during the permission prompt and local ZIP fallback. Do not disable certificate verification to pass HTTPS tests.

**Done:** the tested corporate/local workflow uses existing access, reports its limitations, and requires no Atom account or elevated application user. A temporary test account behaves like any other ordinary application session.

## P04 — Safe production observations for QA/PM

**Depends on:** F02, U03 and the U06 journey specification. Can be implemented independently of deep source anchors; U03 does not require P04 to implement its base reader/export path.  
**Produces:** a bounded post-start observation stream and a readable diagnostic report on a production-like app.

**Files:** `packages/atom/src/runtime.mjs`, platform capability policy, `core/diagnostic.mjs`, relevant UI/reader; add `core/production-observations.mjs` and native tests. This is a collector behind existing permissions, not an always-on recorder or new service.

Work:

- Add the intended observations deliberately before/alongside the current read-only early return. Start with network method/status/timing and sanitised route identity, JS error category/location where available, user-selected target state and bounded DOM change checkpoints.
- Collection begins only after an explicit user action; show missing prehistory. Do not infer failed requests or no errors before the observation window.
- Default reports omit cookies, auth headers, URL query values, arbitrary request/response bodies, form values and source text. Add any body excerpt only through an explicit scoped inclusion policy and review, not a blanket HAR export.
- A request after a click is temporally associated unless causal evidence exists. Display “observed during this interaction,” not “this button called the API.”
- Keep bounded per-tab memory, sampling/drop reasons, stop and delete. Share the existing global resource budgets rather than allocating an unbounded second recorder.
- The reporting collector never clears storage/cache, reloads, submits, invokes handlers or installs overrides to manufacture observations. Default production mode remains read-only. Separately enabled F05/U02 interventions may contribute their actual marked outcomes to the report, but enabling reporting or loading maps must never enable those changes.
- Let the user add expected behavior and export a small reviewed record. Developer enrichment later is a new evidence revision; no SDK or special QA role is required.

**Test cycle:** successful/failed request, error before vs after start, unrelated concurrent request, repeated URL, secret-bearing query, cancellation/navigation, large body excluded, source-map import excluded and the U06 handoff on an ordinary account. Assert no collector mutation outside its read-only allowlist, even when a separate editing session is enabled; include actual F05/U02 changes only as separately attributed evidence.

**Done:** the report actually contains useful selected-target context and admitted post-start technical observations through the product UI. It does not claim cause, complete capture, replay or bug-fix complexity.

## Review focus

Most consequential failures are a correct map attached to the wrong element, ambiguous hash domains, source-map contents leaking into reports/models, an intranet fetch proxy, and read-only inspection accidentally acquiring reset or callback authority. Positive and adversarial cases must exercise the same runtime and package.

[R12]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/testing/production-source-mapping.md "Production source mapping validation"
[R13]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/packages/atom/src/source-map-session.mjs "Map acquisition and lifecycle"
[R14]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/packages/atom/src/source-map-ui.mjs "Manual source-map interface"
[R26]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/features/production-source-mapping.md "Source mapping feature specification"
[X06]: https://tc39.es/ecma426/ "ECMA-426 source map format"
