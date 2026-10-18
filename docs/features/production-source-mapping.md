# Production Source Mapping

**Status:** Implemented local candidate — mapping/source exploration; see [verification and limits](../testing/production-source-mapping.md)\
**Scope:** StateAtom browser extension\
**Target location:** `docs/features/production-source-mapping.md`\
**Audience:** Developers, QA, and product teams investigating deployed web applications

## Purpose

Let someone investigating a deployed application inspect the available original source without installing an IDE, checking out a repository, or adding a production SDK.

StateAtom should associate JavaScript **actually loaded by the selected tab** with its corresponding source maps and, when available, embedded original sources. The result enriches an existing element inspection with readable expressions, symbols, and file locations. It does not turn a source map into runtime evidence.

An employee who can access an internal artifact server through their existing corporate environment may be able to load maps from that server. StateAtom does **not** introduce its own user accounts, QA roles, API keys, or privileged diagnostic backend.

### Example workflow

1. QA opens a deployed application and selects a disabled **Confirm** button in StateAtom.
2. StateAtom offers to discover maps for the JavaScript scripts currently loaded in that tab.
3. A map is available from the application origin, an approved internal artifact URL, or a local release bundle supplied by the team.
4. StateAtom verifies the association between the loaded script and the map. Where the inspector also has a supported binding from the selected UI property to a generated-code location, it resolves that location into an original expression.
5. The panel shows a short answer and its limits: `disabled = creditHold || !canConfirm` — *code-linked; runtime operands not observed*.
6. QA saves a diagnostic report **without including source-map contents or private source code by default**. A developer can later enrich the same report with stronger observations.

No source map or UI binding available? Basic inspection still works. The panel says what is missing rather than inventing a source location.

## User-facing entry points

| Source | How it works | Conditions |
| --- | --- | --- |
| **Automatic discovery** | Read source-map references associated with scripts loaded by the selected tab, such as `Debugger.scriptParsed.sourceMapURL` or an applicable source-map response header. | Only access a resource permitted for the current inspection. Do not guess arbitrary private URLs or scan the corporate network. |
| **Internal URL** | The user supplies an HTTPS source-map or build-artifact URL. StateAtom requests the specific origin permission and loads it locally. | Existing browser/network access may work, but internal SSO and cookie behavior are not guaranteed. No extra StateAtom authentication. |
| **Local file or bundle** | User selects a `.map` file or a ZIP bundle containing maps and an optional manifest. | Read only selected files. A source map with no original content may need a companion source archive for full source analysis. |

An original source path in `sources` or `sourceRoot` is **not** permission to fetch that path. The extension must not automatically follow source-map pointers into additional local files or network hosts.

## Scope and limits

| Available material | Supported outcome | Not established |
| --- | --- | --- |
| Only deployed JS | Current DOM/network inspection; available runtime observations; limited handler details | Readable original expressions or a complete code-to-UI dependency path |
| Map without `sourcesContent` | Generated-to-original positions and available names/files | Original expression text or AST-based tracing unless original sources are supplied separately |
| Map with `sourcesContent` | Readable source snippets and bounded static analysis for supported files | Whether a path executed or which API exchange supplied a live value |
| Verified map + independently established UI/code anchor | Link selected UI property to a corresponding original location | A full runtime lineage without additional observations |
| Map + runtime instrumentation/observations | Combine source locations with scoped observations where the evidence identities match | Unobserved history, opaque library internals, or arbitrary backend behavior |

**Non-goals for this feature:** shipping a general production instrumentation SDK; collecting production secrets; retrieving private Git repositories; automatically running app handlers; rewriting source; changing authorization; auto-confirming API causality; interpreting every framework; or replacing StatePort Capture/Replay.

In particular, **source maps map code locations, not DOM nodes or data dependencies**. If the selected element has no validated generated-code anchor from an adapter or runtime observation, a map cannot establish its producing expression. It may still permit manual source exploration, explicitly labeled as such.

## Source-to-build identity

The selected tab is authoritative. A deployment label, branch name, current `HEAD`, URL, or filename cannot by itself establish an exact match. A long-lived tab may still run a previous bundle after a new deployment; cache, service workers, and multiple chunks can also produce mixed versions.

For each script, retain at least:

- Tab/frame, execution context, `scriptId`, script URL, and inspection epoch.
- Runtime script identity from CDP (`Debugger.scriptParsed.hash`; `buildId` when present), plus an independent digest of the loaded script content where supported.
- Map URL or explicitly selected map ID; map-content SHA-256; supported mapping range; whether `sourcesContent` exists.
- Optional release/build manifest identity, along with how it was verified.

CDP identifies `Debugger.scriptParsed.hash` as a script-content SHA-256 hash. Do not silently equate a V8 script-content hash with a digest of the raw HTTP asset bytes: compare like-for-like content and record the hashing domain. Inline scripts, transformations, sourceURL and other special cases may require `Unverified`.

### Optional build artifact manifest

For CI-managed artifacts, recommend a small, versioned manifest. Example fields (illustrative, not an implemented stable schema):

```json
{
  "schemaVersion": 1,
  "releaseId": "2026.10.18.1",
  "assets": [
    {
      "asset": "assets/app-A1b2.js",
      "assetSha256": "<64-hex-chars>",
      "sourceMap": "assets/app-A1b2.js.map",
      "sourceMapSha256": "<64-hex-chars>"
    }
  ]
}
```

The manifest lives with build artifacts, not necessarily on the production site. Match every associated script independently; a release ID alone does not prove equality. If `sourcesContent` must be interpreted as the source of a specific release, its provenance must also come from the matched map artifact, not from a similarly named working tree.

### Match statuses

- **Exact artifact match:** the loaded script content is verified against the relevant built artifact and the supplied map is verified against the corresponding map artifact (for example using digests from a trusted release manifest). Exact describes *artifact association*, not dependency certainty.
- **Unverified:** plausible association by URL/name/release label, but required identity evidence is missing.
- **Mismatch:** conflicting verified digests, wrong build, or incompatible mapping. No exact source claims.
- **Unavailable/Unsupported:** no usable map, missing original sources, non-JS/unsupported map, or inaccessible resource.
- **Stale:** navigation, loaded script replacement, HMR, changed artifact selection, or another invalidation means the previous association no longer describes the current inspection.

When uncertain, retain `Unverified` rather than upgrading based on a useful-looking expression. Mapping fidelity and evidence status are separate fields in the existing StateAtom evidence model.

## Architecture

Reuse the existing browser inspector, evidence model and local source-analysis components. Do not create a second inspector or a separate hosted resolver.

```text
Selected tab / loaded scripts
  └─ CDP script identity + sourceMapURL
       ├─ allowed same-origin discovery
       ├─ user-approved internal URL
       └─ user-selected local .map / ZIP
            ↓
     source-map validation + build identity
            ↓
     generated ↔ original location mapping
            ↓
     bounded source analysis (if source content exists)
            ↓
     existing StateAtom UI / evidence / local diagnostic export
```

Current integration candidates in the repository:

- `browser-extension/worker.js`: debugger script inventory, selection epochs, permissions-aware acquisition, artifact identity and invalidation.
- `browser-extension/panel.js`: source-map connection UI, mapping status, source excerpt with correct escaping, user-selected import and per-element explanation.
- `browser-extension/adapters.js`: independently supported DOM/component anchors; never infer an exact producer from a nearby component name.
- `core/analyzer.mjs` and `core/evidence.mjs`: reuse analysis/evidence contracts, adding mapping provenance as needed.
- `core/diagnostic.mjs`: retain the source-map match status and safe references, not private source bodies.
- `stateatom-phase2/engine/plugin.mjs`: existing dev-only instrumentation remains independent; importing a production map must not require enabling this plugin.

Use a maintained source-map implementation (for example `@jridgewell/trace-mapping`) after validating packaging, supported map forms and license. Keep parsing/large source indexing off the panel's interaction-critical path and limit memory. Do not evaluate mapped source as executable JavaScript.

### Resolution flow

1. Start a user-initiated inspection of a supported tab. Enumerate scripts from the attached debugger session. Keep the original script identities even if the application reloads.
2. Offer discovered map references. Only fetch when the resource is allowed by current permission and policy; cross-origin hosts require explicit permission. Avoid automatic authenticated cross-origin requests.
3. Accept a manually specified URL or file. Resolve the map against an identified **loaded script**, not just the application hostname.
4. Parse and validate the map; associate generated positions with original locations and optional source contents. Enforce resource budgets before expensive parsing.
5. Require a separate verified UI-to-generated-location anchor before claiming the source produced the selected property. Otherwise show available code as a candidate, not an exact link.
6. Perform bounded static inspection when original source content is present. Report `Code-linked` findings as possible paths unless execution evidence confirms the relevant call/branch.
7. Invalidate on tab/navigation/script replacement, changed origin/build, or newly selected artifacts. Allow explicit reinspection.

### Browser permissions

The current extension is restricted to synthetic localhost hosts. Broadening to real applications is **a separate permission and security change**. Prefer on-demand site access and `optional_host_permissions` for user-selected map origins; request optional permissions from a real user gesture. The existing `debugger` permission is not optional under current Chrome extension rules. Enterprise policy or another debugger client may block attachment. Provide a limited-mode explanation if attachment is unavailable.

Cross-origin fetches must occur in an appropriate extension context with the relevant permission. Do not assume a corporate VPN, an existing SSO login, or a host permission automatically grants access to artifact content. For authenticated downloads, do not silently forward credentials to a new origin. Keep hostnames and redirects within the approved scope and surface 401/403/CORS/policy failures without bypass attempts.

## Security and privacy

Source maps may contain proprietary source code, internal paths, comments, tokens accidentally embedded in code, and application architecture details. A link to a map is not an authorization decision. The owning organization is responsible for where it hosts and shares source artifacts.

Required controls:

- Local-only processing and local source preview. Never upload maps, source text or repository data to StatePort, an AI provider, or analytics by default.
- Never pass mapped source to a cloud LLM. An optional on-device explanation may consume only explicitly selected, minimized material; absence of a model must not change evidence or capabilities.
- Use explicit import or authorized URL retrieval, not blind discovery across origins. Restrict redirects and reject unsupported schemes.
- Treat all fetched and imported content as untrusted. Bound compressed/uncompressed ZIP size, file count, map size, source count, nesting, and parse time; reject traversal paths, unsafe archive entries and resource exhaustion.
- Render source/code as inert text; never insert raw content as HTML, run imports from maps, or execute source strings.
- Do not automatically fetch `sources` entries, `sourceRoot`, or path hints. Companion source files must come from explicit selection or separately authorized artifact access.
- Default to in-memory/session-limited retention. Do not persist full maps or `sourcesContent` in normal diagnostics. Clear on demand and on session end. Prevent private contents from appearing in console logs or telemetry.
- Export only bounded diagnostics: script/map identity, mappings used, evidence references and omissions. Source snippets, response data or private URLs require separate deliberate review before export.
- Production inspection is read-only. This feature must not enable response overrides, invoke handlers, or replay state-changing actions on production pages.

This is a source-inspection feature, **not** a method to circumvent corporate access controls. If an artifact is inaccessible under existing permissions, report the condition.

## UI requirements

Keep the first screen question-oriented, not a source-map debugger clone:

```text
Why is Confirm disabled?
  DOM: disabled (observed)
  Source: OrderActions.tsx:48 (exact artifact match / code-linked)
  Expression: creditHold || !canConfirm
  Current operands: not observed

  Source maps: Connected · 1 matched asset
  [View source] [Change source maps] [Save diagnosis]
```

Only show this example as an achieved result when the UI/property-to-code anchor is independently verified. A correct map alone must not make `OrderActions.tsx:48` an established producer.

Users should see map connection status and the minimum action required: `Connect source map`, `Choose a release bundle`, `Map lacks source content`, `Build mismatch`, or `Reconnect after navigation`. Keep technical details available on expansion, and allow a QA user without an IDE to read the small supported source excerpt in the extension.

## Implementation slices

### PR 1 — Offline maps and honest matching

- Introduce a source-map loader/validator with explicit budgets, mapping lookup, and matching statuses.
- Add user-selected `.map` and ZIP import through the extension panel; support `sourcesContent` and maps without it.
- Match against scripts from the real inspected tab; reject mismatches and mark unverifiable cases.
- Surface a source excerpt only where the code is available and mapping/anchor requirements are satisfied. Otherwise show candidates with limitations.
- Reuse the existing diagnostic/evidence contract. No IDE, SDK or new server required.

### PR 2 — Network acquisition and release manifests

- Discover map references for loaded scripts; load permitted same-origin maps on user initiation.
- Support a manually supplied internal URL with on-demand origin permission; handle denied permission, SSO, offline network and redirects.
- Support an optional hash-based release manifest and detect stale/mixed bundles.
- Reuse local parsed-map cache with bounded lifetime, invalidation and manual clearing.

### PR 3 — Useful source-connected explanations

- Integrate supported UI-to-generated-code anchors with mapped original locations.
- Display expressions, named handlers and bounded candidate dependencies without implying they executed.
- Support local source preview and safe handoff to diagnostics for developers or QA users without an IDE.
- Test the actual extension interaction; do not claim complete React/Vue or API lineage coverage based on a single fixture.

Do **not** block source mapping on completion of the separate Action Inspector/Local AI feature. If source-map capability exists but its UI binding does not, ship it as mapping/source exploration with an explicit limit, not as a causal inspector.

## Acceptance tests

Use production-like **built/minified** local fixtures, not Vite dev-server source URLs as a substitute. Run through a real unpacked MV3 extension in isolated Chromium profiles. Record which steps use the panel and which use the test harness.

| Case | Expected result |
| --- | --- |
| Map referenced by a loaded JS asset and permitted by current site access | Mapping loads and reports the observed script identity |
| User imports an exact release map with `sourcesContent` | Original file/expression can be shown when there is a validated source anchor |
| Map without `sourcesContent` | Position/name resolution only; no invented original expression |
| Same filename, different compiled content | `Mismatch` or `Unverified`, never `Exact` |
| Map with different release/build ID or altered digest | Reject exact association and preserve previous evidence without relabeling |
| New deployment while open tab runs old cached chunk | Map follows script loaded in the tab, not the latest deployment label |
| One page contains assets from two builds | Each asset matched separately; no tab-wide single-build assumption |
| No UI-to-generated-location anchor | No exact UI-to-source claim, even with a valid map |
| User-specified internal URL, granted/denied permission, redirect or 401/403 | Clear outcome with no unexpected origin fetches or credential forwarding |
| Imported ZIP with traversal path, oversized entries, malformed mappings or source content | Bounded failure; no extraction escape, code execution or UI lockup |
| Navigate, switch tabs, replace script, change map bundle | Relevant prior evidence becomes `Stale`; reinspection can recover it |
| Diagnostic save/export | Private map/source content excluded unless explicitly reviewed and requested |
| Offline import | No external requests; functionality remains available without StatePort/IDE/cloud AI |
| Untrusted script/source names or content | Displayed as inert text; no injection or privileged command |

Run existing browser-only and React IDE-connected regression tests to guard against changes to pairing, selection, marker evidence, experiments and Restore/Stale semantics. Treat the historical `0/6` deep-path result as unchanged unless independently retested under its original criteria.

### Minimum completion gate

One real production-like React build, loaded in Chromium and inspected **without IDE or dev instrumentation**, supports:

1. User selection of a UI property.
2. Loading its exact corresponding `.map` from a user-selected local bundle, with strong artifact matching.
3. Mapping an independently proven generated-code anchor to an original expression and viewing it in the panel; if the anchor is missing, a demonstrable source lookup with an explicit `not linked to element` status.
4. A saved, readable diagnostic with accurate source-match and evidence labels, but no private source contents.
5. A deliberate mismatch test and a no-`sourcesContent` test that do not produce false exact claims.

Pass of this feature is **not** pass of full provenance, handlers/hooks, general production instrumentation, QA usability, or public release readiness.

## References

- [Chrome DevTools: viewing and manually loading source maps](https://developer.chrome.com/docs/devtools/developer-resources)
- [Chrome DevTools Protocol: Debugger.scriptParsed and Debugger.getScriptSource](https://chromedevtools.github.io/devtools-protocol/tot/Debugger/)
- [ECMA-426 source map specification](https://tc39.es/ecma426/)
- [Chrome extensions: optional permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions)
- [Chrome extensions: host permissions and cross-origin requests](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions)
- [Chrome: user-approved local file access](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access)
- [Vite: production source maps and `hidden` mode](https://vite.dev/config/build-options.html)
- [StateAtom architecture](../architecture.md) · [Evidence model](../evidence-model.md) · [Validation](../validation.md) · [Security](../../SECURITY.md)


## Implementation record — 2026-10-19

The candidate uses the shared `packages/atom` runtime/panel, an in-memory
source-map session, strict flat-v3 validation and pinned trace-mapping 0.3.31.
Offline `.map`/ZIP and user-initiated URL/manifest retrieval are implemented.
Exact matching compares the loaded script's UTF-8 text with the selected built
artifact and verifies both artifact digests from the supplied manifest. The
manifest is user-supplied provenance, not a signed CI attestation.

The standalone extension now separately opts into optional HTTPS host access
and read-only inspection. Embedded consumers retain the localhost default unless
the host opts in. No production mutation/Restore/IDE resolver is enabled by this
mode. Real corporate SSO, policy and permission-prompt UX remain unverified.

There is currently no independently established production UI/property anchor.
The delivered path is manual generated-position source exploration, explicitly
`not linked to element`; it does not show a mapped expression as the selected
property's producer. This satisfies the explicit source-lookup alternative in
the minimum completion gate. See the [validation record](../testing/production-source-mapping.md)
for commands, budgets, supported archive forms, screenshots and remaining gates.
