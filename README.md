# StateAtom

StateAtom is an experimental tool for investigating the code and data behind a selected UI property. It is being developed by StatePort for independent, open-source distribution.

The intended workflow is to select a property, inspect the available dependencies, change a supported input locally, and observe the result. An explanation must show its evidence and the point where tracing stops.

## Project status

The working local developer preview includes the React inspection loop: select a
property, inspect its code-linked expression and available observed values, open
its source in the IDE, change the app, and explicitly **Inspect again**. React dev
with the open plugin and IDE is the primary path. Known Vue PARTIAL cases remain
negative controls.

A separate opt-in **closed-project first-read profile** now traces original React
P2 and P1 to the exact HTTP exchange and JSON field, through pinned Query/React
branches. This requires StateAtom's controlled browser and owned compilation;
ordinary development instrumentation does not gain that claim. Historical A/B
six-family results remain **0/6**. See [current support](docs/status.md) and the
[scoped acceptance record](docs/roadmap/2026-10-18-closed-first-read.md).

The maintainer accepted the demonstrated scope as an **alpha on 2026-10-18**.
The reproducibility and UI checks were agent-operated under the requested fallback;
independent developer installation/usability is unverified. No release, Store
extension or SDK is published. Browser-only selection/save/export has separate
checks and does not provide this deeper source/HTTP capability.

The current dependency-repair candidate uses Vite 7.3.7 and Vue compilers 3.5.44,
while retaining React/ReactDOM 18.3.1 dev. Historical reports below retain their
original tested versions. See [dependency repair and compiler limits](docs/roadmap/2026-10-18-dependency-candidate.md).

Current source locations are documented in the [repository layout](docs/repository-layout.md).

## Develop locally

Use Node **24.19.0** (`.nvmrc`) and npm **11.17.0**. The verified host is Linux.
Install pinned public dependencies, run the unit suite, then build:

```sh
npm ci --no-audit --no-fund
npm test
npm run build
```

`npm run build` produces `dist/browser/`, `dist/ide/`, `dist/reader/`, and minified
synthetic fixtures in `dist-fixtures/`. `npm run build:extensions` builds just the
browser, IDE and reader. There is no general lint command. F01 adds the focused
`npm run verify:atom-types` check for strict NodeNext and browser consumers of
the packed Atom/UI artifacts; run `npm run pack:atom` first. It is not a whole
repository TypeScript conversion.

`npm run prepare:source-bundle -- --root <built-directory> --recipe <recipe.json>
--output <new-local.zip>` prepares explicit already-built JS/maps for private local
source import. See [the recipe and limits](docs/source-bundles.md). It does not build
or execute the application, publish artifacts or complete the broader P02 workflow.

For browser verification, install the Playwright-pinned Chromium and its host libraries:

```sh
npx playwright install chromium
```

On Linux, host libraries may need `npx playwright install-deps chromium` with system privileges.
The import checks used an already installed matching Chromium, with its sandbox enabled;
downloading a new host browser and provisioning a new OS are separate prerequisites.

Start the synthetic React/Vue development project with the existing open instrumentation:

```sh
npm run dev
```

Open `http://127.0.0.1:4173/react/` (or `/vue/`). The default local development path allows
`127.0.0.1` ports **4173–4175** plus the IDE bridge on **47731**. The standalone
extension also offers explicitly permitted HTTPS sites in a separate read-only
inspection mode.
Use disposable synthetic applications: interventions reload the page and clear app storage/cache.

## Load the browser and connect the IDE

1. In a Chromium browser with local extension loading, open `chrome://extensions`, enable
   Developer mode, and load unpacked `dist/browser/`. Click StateAtom's toolbar action to open its panel.
2. For the source-connected workflow, use the installed VS Code development host.
   From the repository root, `code --extensionDevelopmentPath="$PWD/dist/ide" "$PWD"`
   loads the open helper. Trust only the source workspace you intend to inspect.
3. Run **X-Ray: Show local pairing token** from the Command Palette (the existing command ID is
   retained). Enter the displayed local URL/token in the panel. Keep the token private.
   Set app origin to `http://127.0.0.1:4173`, source folder to `tests/fixtures/inspection`, and Pair.
4. Refresh tabs, choose the React fixture, Attach debugger, then reload the app so collection
   starts before the API responses. Choose **Disabled**, click **Select page element**, and select
   **Confirm combined**. The main block shows the snapshot, code-linked expressions and
   available observed values; **Open in IDE** opens the corresponding source range.
   After editing or interacting with the app, click **Inspect again**. The displayed values
   are a labelled snapshot, not live values. A skipped branch stays unavailable.
5. Open **Advanced response experiments** for the imported experiment control below. Run its three repetitions, inspect
   the recorded rollback results, then click **Restore baseline**. The historical evidence must read **Stale**.

```json
[
  {"name":"left masked","rules":[{"url":"http://127.0.0.1:4173/api/account","patches":[{"path":"risk.hold","value":false}]}]},
  {"name":"right masked","rules":[{"url":"http://127.0.0.1:4173/api/permission","patches":[{"path":"access.ready","value":true}]}]},
  {"name":"joint unlock","rules":[{"url":"http://127.0.0.1:4173/api/account","patches":[{"path":"risk.hold","value":false}]},{"url":"http://127.0.0.1:4173/api/permission","patches":[{"path":"access.ready","value":true}]}]}
]
```

The IDE helper and the dev plugin are **required for this source-connected scenario**.
Basic DOM inspection and diagnostic save/export have their own IDE-free check; that does
not supply source or deep provenance. To read an exported diagnostic, open
`dist/reader/reader.html` and choose the JSON file. Imported claims are historical and untrusted.

The panel labels each snapshot **Basic** (DOM only), **Source-linked** (open IDE/source)
or **Instrumented** (open IDE/source plus an observed development-instrumentation page).
Instrumented does not mean every expression has supported operand values. Unsupported
Vue template operands and aggregate text remain unavailable. Expand **Source connection
and setup** to pair, **Save and export a diagnostic** for diagnostics, and the trace/raw
evidence sections for detailed records.

## Repeat the short developer workflow

The imported short-loop harness now lives in this repository. Install the optional,
pinned independent TodoMVC test applications once (Git, tar and public npm access required):

```sh
npm run prepare:short-loop
npm test
npm run build:extensions
npm run verify:short-loop
```

Preparation writes only `.runtime/todomvc/`, preserves upstream licenses and original
application sources, and installs their production dependencies from upstream lockfiles
with lifecycle scripts disabled. These are optional test applications, not product
dependencies or shipped assets. An existing local Git mirror can be read with
`TODOMVC_SOURCE=/path/to/todomvc npm run prepare:short-loop`. Preparation refuses to
overwrite an existing destination; inspect any incomplete destination before removing it.

The native check requires the Chromium, graphical VS Code host and local ports described
below, plus 4175. Each run exclusively creates `.runtime/short-loop-runs/<timestamp>/`
and isolated profiles. A custom `SHORT_TAG` must be unused. It checks the original
T/E/V/I criteria, expects known partial cases and fails on a changed expectation.
See [short-loop checks and limits](docs/testing/short-loop.md).
There is no need to start `npm run dev` separately for this harness.

## Controlled first-read example

After the build, on the verified Linux x64 host with graphical VS Code and the
matching Chromium installed:

```sh
npm run dev:first-read
```

Use the opened StateAtom panel and inert setup page. Load the open IDE helper,
pair with source folder `tests/fixtures/inspection`, attach to that setup tab,
then follow its React app link. Select **Disabled / Confirm transformed (P2)** or
**Text / 13 (P1)**. The separate finite-trace block identifies the actual exchange,
field/read, native Query/React handoffs and selected commit; source proof is
Code-linked, while acquired event records are Observed. Open in IDE selects the
original expression. Save/review/export works through the existing panel.

Keep the provided app and panel as the only pages in this fresh controlled browser.
Extra pages/workers, unknown code, missing history, changed pinned sources, CSP or
a later selected render refuse the finite trace. Explicit Inspect again obtains a
new occurrence; it cannot reuse the first render's proof for a later one. Restart
the controlled session for a fresh initial trace. This profile has no HMR and is
not general application/framework support or native invocation attestation.
Ctrl-C stops its server and closes the owned browser.

The repeatable checks use new result tags and run sequentially:

```sh
FIRST_READ_TAG="query-$(date +%s)" npm run verify:first-read-query
FIRST_SESSION_TAG="session-$(date +%s)" npm run verify:first-read-session
FIRST_UI_TAG="ui-$(date +%s)" npm run verify:first-read-ui
```

The first two are native mechanism controls; the third operates the actual panel,
IDE, experiment/rollback and fresh passive reader. For an installed local helper,
add `-- --installed-vsix=/absolute/path/to/helper.vsix` to the UI command. See the
[profile instructions and computing base](docs/testing/first-read.md).

## Optional committed-host experiment

For pinned React/DOM 18.3.1 development with classic JSX, `npm run dev:react-host`
adds experimental final host-props correspondence. This is instrumented-page
identity evidence, not runtime attestation or complete HTTP provenance. Ordinary
dev instrumentation now observes application promise consumption without adding
fetch/JSON promise reactions. Opaque consumers and custom Promise behavior remain
unsupported. Parsed object/field identity does not prove current value ancestry.

```sh
npm run verify:source-consumption
npm run verify:react-host
npm run verify:react-host-ui
npm run verify:preview
```

Run native checks sequentially, using unused result tags. See the
[probe limits](docs/testing/react-host.md), [roadmap evidence](docs/roadmap/2026-10-17-progress.md)
and [developer acceptance procedure](docs/roadmap/acceptance.md). The preview
acceptance command is agent-operated, not independent human evidence.
`npm run verify:fetch-initiator` runs a separate [acquisition-only experiment](experiments/network/README.md); it does not enable HTTP provenance in the panel. The later opt-in
`npm run dev:react-http` adds exact browser exchange identities with a conservative
static-document preflight. `npm run verify:fetch-product` checks its mechanism and
`npm run verify:fetch-ui` checks the actual panel/IDE/export/offline path. CSP and
policy/history limitations remain explicit; complete HTTP provenance is not established.

The following opt-in probes add native state handoff and completed property-operation
observations, while retaining Unknown current field ancestry:

```sh
npm run dev:react-state-writes
# Stop the dev server before native checks:
npm run verify:react-state
npm run verify:source-writes
npm run verify:source-writes-ui
```

State correspondence requires exact native hook/update and committed ancestry.
Write observation covers only supported noncomputed completed operations. Computed,
logical and class-initializer forms remain unsupported. Recognized native Object/Reflect
calls conservatively invalidate parsed descriptors; aliases and other native/opaque
writes remain incomplete coverage.
These probes do not enable complete HTTP provenance or general React support.

A separate default-off source receiver guard conservatively invalidates parsed fields
before eligible property operations, including computed keys and skipped logical
assignments. Potential access does not prove completion or current-field ancestry.
Super/optional chains, implicit class fields and native/opaque/history gaps remain.
See [scope and retained controls](docs/roadmap/2026-10-18-write-access-progress.md).

```sh
npm run dev:react-write-access
# Stop that server before the native checks:
WRITE_ACCESS_TAG=<unused> npm run verify:write-access
HOST_UI_TAG=<unused> npm run verify:write-access-ui
```

`npm run verify:compiled-inventory` is a separate acquisition-only experiment. It
compares captured CDP compiled sources, including dependencies, with exact trusted
dev-server responses. Compilation/content matching does not prove execution,
response creator, readonly effects or complete HTTP ancestry. See its
[scope and controls](experiments/execution/README.md).

The independent public-application evaluation can be prepared with
`npm run prepare:independent`, then repeated with `npm run verify:independent`.
It records all three preregistered questions across React and React Redux TodoMVC;
useful source/value fragments do not establish store or HTTP lineage.

## Repeat the automated workflow checks

On the verified Linux host, VS Code is at `/usr/share/code/code`; an available graphical
session is required for its Extension Host. **Python 3** (`python3` on PATH) is required
by the artifact sanitizer; the verified host used Python 3.12.3. Reserve local ports **4173, 47731 and 49331**.
Run these sequentially, with any separately started fixture server stopped:

```sh
npm run verify:browser
npm run verify:ide
npm run sanitize:artifacts
```

These are the retained Playwright workflows: they operate the actual MV3 panel and real
VS Code Extension Host in isolated profiles. Some setup and state reads use internal harness
RPC, explicitly distinguished from UI actions in [validation](docs/validation.md).
They are automated UI checks, not a human or Store installation acceptance test.
Generated artifacts and private profiles stay ignored. Sanitize generated artifacts before review;
the original private runtime contains the ephemeral pairing credential and must not be shared.

## An example

Consider a button with this condition:

```js
disabled = creditHold || !canConfirm;
```

A useful investigation identifies the expression, the relevant values, and any supported link to their sources. If both conditions block the action, changing one value can leave the button disabled. That result does not establish that the changed value is unrelated.

Source analysis may identify a possible dependency. Runtime observations may identify what happened in a particular update. An experiment may establish an effect under specific conditions. The evidence model keeps these claims separate.

## Scope

The target is a complete local inspection workflow: element selection, supported dependency analysis, controlled experiments, and readable evidence export. Basic use should not require StatePort Desktop, an account, a model subscription, or a private resolver.

An optional project connection can provide source information. Optional development instrumentation can provide additional execution observations. Connecting an IDE does not itself provide runtime tracing. Available capabilities and missing information must be visible.

StateAtom does not promise to explain every application, recover unobserved history, infer backend correctness, or estimate the time needed to fix a bug.

## Relationship to StatePort

The intended distribution is one StatePort browser extension containing Atom and an optional Desktop connector. Atom remains useful on its own. StatePort handles separate workflows for captured State Cards, replay, and repeated verification.

An Atom evidence bundle records an investigation. A State Card requires an actual capture and the information needed by StatePort to reproduce its supported conditions. Exporting an investigation does not create a State Card.

See [the integration boundary](docs/stateport-integration.md).

## Documentation and contributions

Start with the [documentation guide](docs/README.md). It links to the architecture, evidence model, experiments, validation rules, and recorded decisions.
The [roadmap](ROADMAP.md) separates the current React inspection loop from the later full HTTP path and publication milestones.

[Contributing](CONTRIBUTING.md) describes useful changes and verification expectations. [AGENTS.md](AGENTS.md) gives project instructions for coding agents. Use the [security policy](SECURITY.md) for sensitive reports.

## Licensing

This import retains the historical [MIT license](LICENSE). Three existing files explicitly
use [Apache-2.0](LICENSES/Apache-2.0.txt); see [NOTICE](NOTICE) and the file-specific
[provenance](docs/provenance.md). This is a mixed-license tree, not an Apache-only relicensing.
The intended license for future original Atom work remains Apache-2.0.
Dependency notices are generated from actual IDE bundle inputs. See [licensing](docs/licensing.md).

The opt-in native Query handoff acquisition has its own command:

```sh
QUERY_TAG=<unused> npm run verify:query-handoffs
```

Run native commands sequentially, with unused tags and no other dev server. This
checks native object/assignment/read identities and refusal controls; it adds no
panel cache provenance or full HTTP ancestry claim. See the
[checkpoint and limits](docs/roadmap/2026-10-18-query-handoff-progress.md).

`QUERY_CALL_TAG=<unused> npm run verify:query-calls` checks two selected native
Query call-site/body correspondences. `-- --without-react-state` tests their
independent source-consumption mode. It preserves wrapper/getter/alias counterexamples
and leaves effects/current-field ancestry Unknown. See the
[two-site census record](docs/roadmap/2026-10-18-query-calls-progress.md).

## Optional private Query input guards

`npm run dev:react-query-writes` adds potential receiver accesses in three pinned
private Query compiler inputs. Open `/react/query-write-view.html` for the synthetic
native option-write inspection. Source links open the app; private staged source
is explicitly unavailable/Unknown. Other Query files, native/opaque writes and
full history remain unproven. This does not add complete cache/HTTP support.

```sh
# Stop the dev server before native checks:
QUERY_WRITE_TAG=<unused> npm run verify:query-writes
HOST_UI_TAG=<unused> npm run verify:query-writes-ui
```

See [private-input checks and limits](docs/roadmap/2026-10-18-query-write-progress.md).

## Optional private React input guards

`npm run dev:react-private-writes` combines the restricted React and Query private
input guards. Open `/react/ref-controls.html?case=plain`, inspect the quota, repaint
and Inspect again. The native object-ref assignment is a potential private access;
its source remains Unknown and app Open in IDE opens the original app range.

```sh
REACT_WRITE_TAG=<unused> npm run verify:react-writes
HOST_UI_TAG=<unused> npm run verify:react-writes-ui
```

Run these native commands sequentially, with no separately running dev server.
See [separate native/UI results and boundaries](docs/roadmap/2026-10-18-react-write-progress.md).
Complete writer history, readonly effects and current-field HTTP ancestry remain
unimplemented. This opt-in is not a complete trace or alpha release.

## Browser compilation observations

Attaching the debugger also collects a bounded, digest-only compilation journal.
After selecting a property, expand **Browser compilation observations (limited)**.
It includes dependencies and inspection helpers, reports missing earlier history
and marks a snapshot Stale when newer collection facts arrive. Inspect again
records a newer snapshot. Compilation does not establish calls, source equivalence,
readonly effects or current-field ancestry. No compiled bodies or URLs enter this
journal. The same historical metadata is available in reviewed diagnostic export.

`HOST_UI_TAG=<unused> npm run verify:code-journal-ui` exercises this through the
actual panel, IDE and passive reader. See [scope and evidence](docs/roadmap/2026-10-18-code-journal-progress.md).

## Separate native compiler-input experiment

```sh
COMPILER_TAG=<unused> npm run verify:compiler-inputs
```

This sequential native harness uses the pinned Vite/React dev inputs and actual
Chromium, without an extension or IDE. It checks exact workspace/stage/native-result
and compiled-content correspondence, cache/invalidation and substitutions. It does
not add product source authority, source-equivalence, readonly or HTTP ancestry.
See [commands, retained failures and separate UI evidence](docs/roadmap/2026-10-18-compiler-input-progress.md).

`COMPILER_TAG=<different-unused> npm run verify:compiler-effects` additionally checks
that actual compiled helper bodies and two executed post-transform writers do not
gain readonly/current-field authority. These are refusal controls, not complete
effect support. See [the exact compiled-effect boundary](docs/roadmap/2026-10-18-compiled-effects-progress.md).


The observer factory now keeps instance identity privately and freezes its own API
method slots. It does not freeze application objects or prove readonly effects.
`COMPILER_TAG=<unused> npm run verify:observer-identity` retains compiler/effect
controls and adds bootstrap, replacement and changed-runtime-body checks. See
[identity, cleanup and separate UI evidence](docs/roadmap/2026-10-18-observer-identity-progress.md).

`COMPILER_TAG=<unused> npm run verify:observer-intrinsics` additionally checks
post-bootstrap clock/collection replacements in declared synthetic telemetry
controls, original callback/getter/error behavior, and the 80-dependency boundary.
Run native commands sequentially. Capture/read/member use saved references for
selected private telemetry operations; they do not freeze application prototypes
or establish pristine bootstrap, complete effects or readonly authority. See
[telemetry scope and acceptance](docs/roadmap/2026-10-18-observer-intrinsics-progress.md).

`COMPILER_TAG=<unused> npm run verify:observer-closure` retains those controls and
adds a same-runtime-body/different-bootstrap-history counterexample. Matching
compiled bytes and a restored public clock do not identify a previously captured
function. This is separate native refusal evidence, with no product/UI change.
See [closure acquisition boundary](docs/roadmap/2026-10-18-observer-closure-progress.md).

`INVOCATION_TAG=<unused> npm run verify:observer-entries` separately exercises an
experimental post-transform member entry journal and native function/closure
checkpoint. It uses DOM handles and own-data reads without evaluation or debugger
pause, with proxy/accessor, foreign observer, retention and stale-selection controls.
The product observer/panel are unchanged; this is not readonly or full HTTP support.
See [exact entry/reference scope](docs/roadmap/2026-10-18-entry-references-progress.md).

`INVOCATION_TAG=<unused> npm run verify:observer-effects` adds a bounded, entry-bound
captured-helper frontier and changed-helper/captured-Map.set/bound-clock controls.
It records exact checkpoint JS body digests where available. Reference edges and
syntax facts do not prove execution, builtin identity, readonly or HTTP ancestry.
See [effect-frontier scope and reproduction](docs/roadmap/2026-10-18-effect-frontier-progress.md).

`INVOCATION_TAG=<unused> npm run verify:observer-operands` additionally acquires
original receiver/key references and bounded scalar read results in disposable
probe contexts, with per-owner stop cleanup. Later native descriptors are separate
from event-time history. Getter/proxy/key and pre-/post-read writer controls retain
Unknown parse-to-read ancestry. See [consolidated roadmap result](docs/roadmap/2026-10-18-roadmap-closeout.md).

## Embed the same Atom runtime and inspector

The local `@stateport/atom` candidate retains this standalone extension and adds a
separate MV3 consumer example. Use `npm run pack:atom` and
`npm run verify:embedding`; see [embedding and ownership](docs/embedding.md),
[verification evidence](docs/testing/atom-embedding-validation.md) and
[the official-host integration task](docs/tasks/stateport-host-atom-integration.md).
The ignored `.artifacts/atom/atom-handoff.json` records the local artifact identity.
No npm publication or official StatePort/Capture integration is implied.


## Production source exploration (local candidate)

Open the panel, choose a tab and Attach. HTTPS tabs request optional site access
and use read-only inspection. Select Text or Disabled, then select an element.
Expand **Source maps**: choose a loaded script and import its `.map` or release
ZIP, load its declared map, or explicitly allow an internal artifact URL. A ZIP
with root `manifest.json`, built JS and maps can establish an exact artifact
match. A map alone remains Unverified. Generated line/column lookup shows inert
original text when available, with **not linked to element** until a separate UI
anchor exists. No IDE, dev SDK, account or AI is required.

Use `npm run verify:production-source-mapping` for the isolated minified React
MV3 check. [Verification, limits and bundle format](docs/testing/production-source-mapping.md).

## Site/project connections (F02 local candidate)

Ordinary HTTP localhost, 127.0.0.1 and IPv6 loopback ports start read-only.
**Browser connection → Application permissions** saves individual development
rights for the exact scheme/host/port for the browser session. Cache/storage reset,
reload, response overlays and replay need explicit checked permissions; local
hosting alone grants none of them. Additional HTTP hostnames need an exact record
and browser access; HTTPS remains read-only. Source pairing and artifact access
are separate. A loopback helper can use another explicit nondefault port instead
of 47731. Cross-origin navigation detaches; permission withdrawal cancels work and
clears unsaved private source/trial buffers. Saved diagnostics keep their original
retention policy.

`npm run verify:origin-connections` uses real nonfixture ports and Chrome host
permission state, including access withdrawal through browser settings. It does
not claim acceptance of the optional HTTPS permission prompt. See
[the F02 execution record](docs/completion/15-f02-origin-connections.md) for exact
artifacts, controls and limits. F03 installation/onboarding and F05 production
confirmations remain separate work.

## Installed development setup (F03)

`npm run build:extensions` then `npm run pack:development` prepares a local VSIX
and open Vite-plugin tarball, with an immutable handoff under `.artifacts/development/`.
Neither command publishes. Install the VSIX through VS Code **Install from VSIX**
and the tarball as a development dependency of your own project. Follow the
[plugin's normal Vite React recipe](packages/vite-plugin/README.md) and
[helper connection/trust guide](ide-extension/README.md). The private receipt
replaces URL/token/source-folder copy/paste and never belongs in a URL or report.
Basic works without this integration. No production SDK or closed launcher is needed.

`npm run verify:project-setup` tests installed artifacts in a clean independent
project, including real IDE navigation, state change, HMR, disconnect and removal.
It reads `.artifacts/development/handoff.json`; build and pack first. Installed
first-read regression remains separate: `npm run verify:first-read-ui --
--installed-vsix=/absolute/path/helper.vsix`. Its stronger restricted premises and
original acceptance criteria do not become ordinary development claims.

The retained `verify:react-host-ui` and `verify:short-loop` regressions also accept
`--installed-vsix=/absolute/path/helper.vsix`; the development-host path remains
available when that explicit option is omitted. These are separate scoped harness
results, not proof of ordinary apps satisfying the controlled first-read premises.

F03 acceptance on local Atom candidate `.20261019.8` includes normal installed
setup and the separate required first-read regression. See the
[F03 execution record](docs/completion/16-f03-installed-project-setup.md) for exact
artifacts, retained failures and scope limits. The subsequent
[F04 execution](docs/completion/17-f04-immutable-package-pair.md) reproduces the same
Atom/UI tarballs, adds immutable staging and a checked consumer receipt, and
verifies both packed hosts. The subsequent [U05 execution](docs/completion/18-u05-visual-picker.md)
completes native visual hover/select/refine/cancel on Atom `.20261019.10` with
33 packed picker controls, 649 unit, 35 two-host, 26 Basic and 32 Actions checks.
Escape cancels but may reach page key handlers; inspector Cancel avoids page keys.
Source/runtime provenance remains separate. The one next unfinished item is U01;
these scoped checks do not establish a published release.

`npm run verify:atom-package` checks the current packed pair and disposable
compatibility/refusal controls. See [the embedding receipt workflow](docs/embedding.md#immutable-pair-receipt-f04)
for explicit handoffs and native host checks.


To prepare the actual packed picker demonstration, run `npm run demo:picker --
/absolute/path/atom-handoff.json` (graphical display), or `npm run demo:picker --
--smoke /absolute/path/atom-handoff.json` for the finite native preparation check.
See the [demo guide](docs/testing/visual-picker-demo.md) for the exact accepted
handoff, steps, app counters and explicit limits. `npm run verify:picker --
/absolute/path/atom-handoff.json` runs the broader two-host native controls.


The maintainer's subsequent demo feedback is addressed in the bounded
[U05 presentation follow-up](docs/completion/19-u05-picker-presentation.md), Atom
`.20261019.11`: normal target controls are compact, technical DOM details disclose
on request, and native hover uses a restrained blue treatment. The headed demo
records a consistent device scale to avoid viewport-emulation displacement.
650 unit and 33 two-host native picker controls pass. U01 remains the next item;
its compact-title/refinement slice is credited, not treated as the whole workflow.
