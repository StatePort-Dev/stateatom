# Production source mapping validation

Date: **2026-10-19** (Indian/Mauritius). Local candidate, not a release.
Baseline revision: `7ac42612e0b7ccb3908120b6d79ea64dae334379` plus the reviewed working-tree changes. Original task: [production source mapping](../features/production-source-mapping.md).

## Delivered path

The existing Atom panel selects Text/Disabled, discovers actual loaded scripts,
imports a map or release ZIP and resolves a manually entered generated position.
With a matched release bundle it shows the original source line and **Exact
artifact match**, separately from **not linked to element** and **runtime operands
not observed**. No production UI/property anchor is implemented. This is the
source-exploration alternative explicitly allowed by the minimum completion gate;
it is not the example's causal explanation of Confirm.

Offline maps, stored/deflated ZIP entries, header/scriptParsed discovery,
user-initiated map/ZIP/manifest GET, safe diagnostics and the existing offline
reader are implemented. Sources never enter the action/local-model input.

## Identity and artifact format

Each tab has its own run/epoch and bounded script inventory, with CDP scriptId,
execution context/frame, URL, hash/buildId when present, and script range. The
V8/CDP hash is retained in its own domain. Imported association independently
hashes `Debugger.getScriptSource` as UTF-8 text; it does not equate that digest
with V8's hash or raw HTTP bytes.

A ZIP may use relative paths and explicit directory entries. Root `manifest.json`
uses the schema in the feature document. It must include the corresponding built
JS and map entries. Each asset/map digest is SHA-256 over the exact artifact
bytes. The built artifact must decode as UTF-8 and its text digest must match the
loaded script; inline/sourceURL special cases remain Unverified. Every selected
script is matched independently. A filename, source-map URL or release label
cannot establish Exact. The map and manifest digests and verification method
remain in the safe diagnostic; release labels, private URLs and source paths do
not. A supplied manifest is trusted user-selected provenance, not a signature or
independent CI attestation.

A standalone `.map` remains Unverified and may be explored as a candidate. A map
without `sourcesContent` resolves positions/names only. No companion source
archive resolver, arbitrary file fetch or sourceRoot traversal is implemented.

## Budgets and lifetime

- Input/ZIP download: 8 MiB compressed; ZIP 16 MiB expanded, 128 entries, 4 MiB
  per entry, 2 seconds. Stored and deflate only. No ZIP64, encryption, symlinks,
  traversal, duplicate paths, corrupt CRCs or overlapping file data.
- Map: 4 MiB UTF-8 JSON, 512 sources, 3 MiB embedded source text, 50,000 names,
  250,000 segments, 100,000 generated lines, 2,000,000 encoded mapping characters,
  1.5-second validation loop. Flat v3 only; indexed/sectioned maps are Unsupported.
- Worker memory: three tab sessions, 128 scripts/session, eight parsed maps and
  8 MiB map input/session; these input limits also bound the decoded structures.
- Parsed sources expire after five minutes. Detach, navigation, execution-context
  loss, script replacement, clear and shutdown invalidate/release sources. Timed
  expiry notifies the panel; preview also has its own five-minute expiry. Worker
  restart cannot restore a source cache. No map/source persistence is added.
- Network requests time out after ten seconds, omit credentials/referrer, reject
  redirects and require current host permission. Manifest files stay on the
  explicitly approved origin. `sources`/`sourceRoot` are never fetched.

## Permissions and read-only boundary

The standalone host adds optional HTTPS host permissions, requested by an actual
panel gesture for the chosen site/artifact origin. There is no automatic grant.
The embedded default stays localhost. HTTPS debugger leases grant only read and
inspection-helper injection; runtime blocks experiment/Restore/IDE operations.
Source inspection does not disable caches, clear browser storage, reload the app,
invoke application handlers or install response overrides. The user may choose
this same mode for a synthetic localhost fixture.

Unit checks exercise permission grant/denial, mutation denial, navigation races,
reattach, script replacement, context invalidation, response headers arriving before
scriptParsed, omitted credentials, redirects and HTTP 403. These are harness/API
checks; real enterprise policy, SSO and Chrome's native permission prompt are not
claimed verified by them. Actual Chrome checks use an existing permitted loopback
origin in read-only mode.

## Verification record

`npm test` passed **568/568** on the final tree. `npm run build` passed, including minified baseline fixtures. The final
`npm run build:extensions` also includes the final refresh-loop correction and preserved
MIT picker notice. `npm run verify:production-source-mapping` passed **19/19**
checks on Chromium **153.0.8010.12**, Node **24.19.0**, npm **11.17.0**, using a
fresh sandboxed Chromium profile and a real unpacked MV3 extension. Retained run:
`.artifacts/production-source-mapping-2026-10-18T20-38-42-530Z/result.json`.
It records the baseline revision plus dirty overlay, exact configuration and
panel-versus-harness interaction boundary. Its `diagnostic.stateatom.json`,
`first-viewport.png` and `source-map-440.png` are local synthetic evidence.

The final source build manifest is `packages/atom/dist/source-manifest.json`;
its snapshot and the reviewed patch are retained alongside that run. The maps,
source snippets and React artifact JS in this local run are synthetic fixture
material, not the default diagnostic export.

`npm run verify:browser` passed **26/26**, `inputsStable: true`, no recorded errors:
`.runtime/browser-runs/2026-10-18T20-39-16-115Z/native-A.json`.
`npm run verify:react-host-ui` passed **11/11**, `PASS_BOUNDED_HOST_UI`,
`inputsStable: true`, no assertion/page errors:
`.runtime/react-host-ui-runs/2026-10-18T20-43-41-922Z/results.json`.
This exercises the existing React dev/open IDE bridge, exact editor ranges,
historical diagnostic export and fresh offline reader. It does not upgrade
production source-map anchors or finite-provenance claims.

The first React/IDE run timed out clicking the offscreen diagnostic summary.
The saved synthetic snapshot rendered that summary with a normal visible box and
it clicked successfully in an isolated renderer; the unchanged interaction passed
on the fresh full retry. No production workaround or forced click was added.
`tests/integration/react.mjs` now retains ancestor/visibility data on future failure.
The failed run remains at
`.runtime/react-host-ui-runs/2026-10-18T20-40-27-236Z/results.json`.

Existing non-gating diagnostics are retained: duplicate `disabled` key warnings
in the deliberate React spread-override control; app favicon 404; and offline
reader's existing CSP blocking its local Inter font. Source-map panel screenshots
use the packaged Inter font. These checks do not establish reader font fidelity.

Earlier attempts remain retained: a parallel unit listener occupied 4173; another
browser run passed its 26 functional checks but failed `inputsStable` because the
author edited source during it. A later MV3 attempt exposed a real helper-triggered
refresh loop. That issue has a failing-before-fix regression test and was fixed
by notifying only actual source inventory/status changes. Those attempts are not
counted as acceptance. Logs use UTC timestamps in filenames; the user-facing date above uses
the supplied timezone. The build retains the existing two esbuild `import.meta`
warnings in IDE CJS first-read modules; no new warning is treated as success proof.

## Visual reference and deviations

Read `packages/extension-ui/design/README_RU.md`, `docs/HANDOFF_RU.md`,
`design/SCREEN_INDEX.md`, `design/figma-current.json`, the supplied source-map
Settings composition in `source/extension.js`, and
`design/html-reference/generated/settings-maps-html.png`. No live Figma refresh
is claimed. Compared the actual rendered first viewport and 440px source preview
against these supplied artifacts: existing Inter typography, blue/graphite/white
palette, control borders, source monospace, 440px inspector, alignment and pinned
header/footer are retained. No token source or shared primitive changed.

Intentional deviation: source controls live in an existing Atom disclosure with
sequential native controls, rather than introducing the prototype's 1140px
Settings shell and simulated mode tabs. Its source/import/URL, build-matching and
local-data groups inform the real controls. Exact/Unverified/Mismatch and missing
source/anchor text comes from the runtime, not the prototype's demo switches.
This avoids a second inspector and preserves Atom's current workflow/layout.
Screenshots are **candidates pending human review**, not visual-fidelity acceptance.
Keyboard activation and narrow overflow are exercised by the actual MV3 harness.

## Review and unchanged gates

An independent reviewer identified five actionable issues: duplicate-source
indices selecting the wrong excerpt; asynchronous permission erasing new script
inventory; stale reattach/picker recovery; missing invalidation notification; and
response-header/scriptParsed ordering. Each has a targeted regression test and
was fixed before final verification. The source-index, navigation, reconnect and
header cases were observed failing before their fixes.

Not established: production UI/property producer anchors, general static dependency
analysis, runtime operands, handlers/hooks execution or complete API lineage;
real corporate SSO/native permission-prompt usability; every browser/framework;
public release or Store policy acceptance. Historical deep-path **0/6** remains
unchanged. No IDE/SDK/cloud model is needed for the demonstrated offline path.
