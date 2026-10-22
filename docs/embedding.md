# Embedding the public Atom candidate

`@stateport/atom` is one local, browser-safe runtime/UI package. Public standalone
Atom and the official StatePort extension are separate consumers of this package.
The public example is a genuine MV3 extension, not the private StatePort host.
Capture, Native Messaging and Desktop remain outside Atom.

The executable examples are `browser-extension/worker.js` + `panel.js` and
`examples/embedding-host/worker.js` + `inspect.js`. Their exact page URLs differ:
`panel.html` versus `workspace/inspect.html`. Both use the same inspector mount
and analysis implementation. The example adds adjacent host controls and a
synthetic competing debugger consumer; it implements no Capture.

## Contracts and ownership

Types ship in the package's `dist/*.d.ts`; API/wire version is **1**, separately
from package candidate `0.1.0-candidate.20261019.11`. Importing any entrypoint has
no Chrome listener, debugger or DOM side effect.

- `createAtomRuntime(platform, options = {}) -> AtomRuntime`. The only current
  option is `readOnlySites?: boolean`, default false. HTTPS also requires the
  platform's independent opt-in and current site permission. `ready: Promise<void>` restores namespaced metadata. The platform
  supplies scoped Chrome resources, host-owned events, permitted fetch and
  lifecycle. It never supplies `inspect` or a substitute analyzer.
- `runtime.request({version:1,id,session,payload}, {signal?}) -> Promise<unknown>`
  dispatches the existing operations. `cancel(session,id)` cancels that request;
  `shutdown() -> Promise<void>` rejects new requests, removes runtime subscriptions,
  invalidates pending selection work, waits for owned cleanup and releases only
  Atom resources. A cancelled request cannot return accepted fresh evidence.
- `createAtomClient(transport) -> AtomClient` wraps validated version/session/id
  messages. `request(operation,{signal?})`, `subscribe(listener) -> unsubscribe`
  and `dispose()` belong to the client. Transport failures are not analysis success.
- `mountAtom(rootElement, client, {maxWidth?,padding?,idPrefix?,readerURL?})`
  returns `{ready,element,dispose}`. It creates an inner `[data-sp-ui][data-atom-root]`
  in that root's document, with generated unique IDs by default. Duplicate mount
  on the same container fails `INVALID_ROOT`. Layout values are CSS lengths;
  default max width is 960px and padding `0 20px 36px`. The standalone host
  explicitly opts into legacy unprefixed IDs. Reader URL belongs to the host.
- Mount disposal aborts its pending requests and removes UI subscriptions,
  generated DOM, timers and Blob URLs. It does not dispose a shared client, stop
  runtime, detach debugger or end another consumer's work. Closing a host page
  disposes that page's mount and client. Host shutdown is a separate decision.

There is no Node analyzer, filesystem, Vite server or IDE/Electron dependency in
browser exports. Existing open source resolution remains `core/bridge.mjs` and
the public IDE helper. An absent/disconnected helper leaves basic DOM inspection,
local save and reviewed JSON export available. Diagnostic JSON is historical
and independently readable; it is never a State Card.

## Host events and trust boundary

The MV3 host owns its sole worker entrypoint and registers onMessage, debugger
onEvent/onDetach, action and tab-removal listeners synchronously. It creates an
EventHub before initialization, forwards events immediately, and Atom queues them
behind storage readiness. There is no library-installed worker or second global
listener set. `tabs.onUpdated` subscriptions used for bounded reload waits are
owned by the operation and removed on completion/timeout.

Use one broker for every debugger consumer. Authenticate extension pages by both
`sender.id === chrome.runtime.id` and **exact** `chrome.runtime.getURL(pagePath)`;
a matching suffix, operation or origin alone is insufficient. Content messages
can only deliver frame-0 picker selection from the allowlisted application tab.
A selection must match the pending short-lived picker token and sender target.
The dispatcher overwrites target/session from the authenticated content sender;
content cannot pair, request source reads or send arbitrary CDP/eval operations.
The trusted host's legacy plain operation form exists for existing harnesses;
it is wrapped and validated by the same dispatcher. New clients use envelopes. Unrelated host messages are left to the host dispatcher.

Messages require bounded IDs/session, known operation, positive tab IDs and
operation-specific payload checks before dispatch; existing analyzer/experiment
validators apply their original limits as well. Replies bind version, session
and request ID. Common errors are `INVALID_MESSAGE`, `BUSY`, `CAPABILITY_DENIED`,
`LEASE_REQUIRED`, `LEASE_EXPIRED`, `CANCELLED`, `DISPOSED`, `SELECTION_EXPIRED` and
`OPERATION_FAILED` (the original operation's explanatory error text).

## Debugger and mutation

`createDebuggerBroker(chrome.debugger)` returns an inert exclusive broker.
`acquire({tabId,documentId?,owner,capabilities})` reserves an in-memory lease;
`attach()`, allowlisted `command(method,params)`, `release()` and `invalidate()`
operate only on that current token. The initial document ID may be unavailable;
existing exact navigation/frame/loader and DOM identities continue to bind all
analysis evidence. Navigation changes invalidate observations. No persisted token
is authority to resume a debugger session.

| Capability | Existing resource/action |
| --- | --- |
| read | debugger observation commands, picker channel |
| inject | bundled observation helpers and policy helper |
| reload | controlled tab reload |
| cache | cache policy and original explicit cache/storage resets |
| override | bounded existing Fetch interception operations |
| replay | existing explicit experiment action sequences |

Default hosts admit ordinary loopback HTTP origins read-only. Development cache,
reload, override and replay rights require individual actions in a validated exact
site record, explicitly saved by the user for this browser session. The helper
endpoint and artifact origin require separate browser access; the default helper
port 47731 is a convenience, not an application grant. The standalone host
also opts into permission-gated read-only HTTPS, as described below; this does
not enable production edits. Experiment entry requires current grants, an owned lease and the
existing fresh-selection/experiment preconditions. An occupied resource returns
BUSY before attach, script injection, reload, cache changes or interception.
Missing browser permission remains an error; runtime does not retry by weakening
permissions. Shutdown disables its interception/cache policy before owned detach;
a foreign lease is never detached.

Worker restart restores metadata as Stale with `attached:false`; it clears
interventions and busy flags and interrupts compilation continuity. It does not
reattach, replay an action, restore an experiment or claim live lease ownership.
Chrome/native debugger state is distinct from stored metadata; the host must
resolve an outstanding native attachment explicitly, never infer ownership from
`getTargets().attached` alone.

## Storage, CSS and licenses

Atom keys are prefixed `stateport.atom.v1.` in both storage areas. The standalone
host alone opts into version-1 migration of the exact old `diagnostics` key:
validate/retain reports into the namespaced list once, leave the old key intact.
Session tabs/pairing are not migrated. Embedded host does not inspect legacy keys.
No Capture or similarly named host key is read or deleted.

The host imports **one** pinned `@stateport/extension-ui` peer (candidate
`0.2.0-candidate.20261018.2`, contract `2.1.0`), in order: tokens.css,
components.css, then atom.css. Atom never bundles a second foundation copy or
injects stylesheet links. Atom-specific styles stay inside its scoped inner root;
the host owns surrounding layout. This prevents outgoing style leakage; it is
not Shadow DOM isolation against arbitrary host CSS. The retained reference set
and `docs/design/extension-ui.md` remain authoritative. The current visual alignment follows the supplied 440px inspector/reference
base; host width/padding overrides remain supported. It does not implement the
simulated prototype Capture.

Historical worker/panel/engine code retains MIT origin; original platform,
transport, packaging and new verification carry Apache-2.0 SPDX headers. The
package and both independently usable hosts retain LICENSE/NOTICE and the Apache
text. UI is a separate licensed peer. No private code, native credentials or
production extension identity is distributed.

## Local build and evidence

Use Node 24.19.0/npm 11.17.0 and the locked root toolchain:

```sh
npm run verify:atom-contract
npm test
npm run build
npm run pack:atom
npm run verify:atom-types
npm run verify:capability-ui
npm run verify:embedding
```

`pack:atom` creates a unique `.artifacts/atom/<timestamp>/` containing Atom/UI
tarballs, standalone and embedding MV3 outputs and handoff. It installs the two local tarballs and the exact public esbuild development
dependency (prefer offline cache; registry fetch when absent) into a fresh `/tmp/stateatom-embedding-consumer-*`, then builds both
hosts against that installed package. All host bundle inputs are recorded.
`.artifacts/atom/atom-handoff.json` points to the current candidate. No npm
publication, Git push, release or private-host mutation occurs.

Run existing standalone harnesses against the packaged standalone by setting
`ATOM_EXTENSION_PATH` to its handoff path. `verify:embedding` checks real UI and
IDE document/selection on both packaged hosts, original HMR/reload handling,
re-inspection, basic Unknown, save/export/offline read, tab switching, lifecycle,
foreign debugger BUSY and neighboring CSS. It separately records comparisons
and screenshots. The HMR input is a harness-emitted Vite watch event for the
unchanged fixture, not a source-code edit. Worker-only stop/restart, extension reload and metadata unit tests have separate
scopes; the controlled checks do not prove every SW suspension schedule.

Actual command results, browser versions, artifact digests and remaining limits
belong in `docs/testing/atom-embedding-validation.md` for the original extraction,
`docs/testing/extension-ui-reference-alignment.md` for the visual v2 update, and
the corresponding handoff. Screenshots are
agent-produced candidates pending human review. Vue PARTIAL and existing deep
tracing limits are preserved. There is no general lint command. The focused
`verify:atom-types` installs hash-checked tarballs into a fresh consumer, compiles
all four code entrypoints with TypeScript 5.9.3 in strict NodeNext and browser
Bundler resolution with `skipLibCheck:false`, and resolves every exported asset
under the installed package. It consumes no repository-relative declarations.
`verify:capability-ui` is a rendered controlled-client fixture, not native
permission or application-picker proof. Compiler and fixture code do not ship.


The inspector now follows the reference composition with a scrolling body and
anchored header/footer. Give its mounting container a definite height when
embedding (for example `height: 600px`); the mount follows that height and is
capped at the viewport. Standalone host CSS supplies 100dvh. Section shortcuts
scroll only the inspector, and all actions are type=button to avoid host-form
submission. Load the optional shared `fonts.css` and serve the exported local
Inter asset at its relative path to reproduce reference typography. Carry the
font's OFL license from the UI package; no external font service is required.


### Optional production source exploration

The standalone host now opts into `readOnlySites:true` on the platform and runtime,
with `optional_host_permissions: ["https://*/*"]` and the mount option
`requestOriginPermission: origin => chrome.permissions.request({origins:[origin+"/*"]})`.
Call permission requests from a real user gesture. The default embedded origin
contract stays localhost. An opting-in host must authenticate its exact panel and
frame-0 selection sender and relay debugger lifecycle events. HTTPS inspection
uses read/inject helpers only; no reload/cache/override/replay/IDE operation.
Source maps and excerpts remain local, in memory; manual generated-position lookup
is not a UI/property anchor. See [production source mapping](testing/production-source-mapping.md).

## Capability policy v1

Wire version 1 alone is insufficient to discover additive functionality.
`contract.json` advertises `features: ["capability-policy-v1"]`; request
`{op:"capabilities",tabId,capabilityVersion:1}` through the authenticated client.
The response has `schemaVersion`, `wireVersion`, explicit `featureIds`, `features`
and `operations`. Every admission has `available`, `reason`, `code` and
`requiredGrants`. `state` also supplies `capabilityPolicy`. New UI validates the
whole descriptor; a legacy/malformed response leaves scoped controls unavailable
with an update reason instead of inferring authority from wire v1.

`describeCapabilities(context)` and `operationPolicy(op,context)` are exported
from `@stateport/atom/transport`. They are pure projections for consumers, not
credentials. The runtime obtains its own current facts and enforces the same
rules before calling the operation; caller-provided policy fields are ignored.
Discovery acquires no debugger lease and performs no injection, reload or edit.
An available operation can still encounter a changed target or an unsupported
expression; admission does not promise a positive investigation result.

`createChromePlatform` supplies `describeTarget(tabId)`: current URL, host opt-in,
permission, copied grants, ownership (`none`, `owned`, `foreign`, `expired` or
`unknown`) and disposal state. A custom platform must provide these facts to
enable browser operations; missing/invalid ownership facts fail closed. The
shared broker's read-only `status` never transfers ownership. Current grants and
native ownership are checked again when resources are used; no persisted record
or displayed descriptor is a grant. Capability availability is a snapshot and
may change before a request completes.

| Operations | Required resources and current boundary |
| --- | --- |
| `pair`, `unpair`, `tabs`, `list-diagnostics`, `delete-diagnostic` | Trusted host; fixed open bridge endpoint for pairing; storage operations require no debugger |
| `capabilities`, `state`, `property` | Tab-scoped metadata; deep refresh uses inspection admission, even though metadata stays readable on denial |
| `save-diagnostic` | Current observation or retained stale target; historical local evidence remains saveable |
| `attach` | Allowed target, current site permission, non-foreign lease, read/inject; development attach also needs cache grant |
| `pick` | Allowed target, read; read-only picker helper also needs inject; token-bound selection remains separately validated |
| `selected`, `inspect-selector` | Allowed target, read/inject; selected also requires the pending picker token/document; outcome may remain Unknown |
| `open`, `definitions`, `references` | Open source connection and existing development-only policy; source availability grants no page or source-file write permission |
| `deep-experiment`, `experiment` | Attached current selection/analysis, development mode, read/inject/reload/cache/override/replay; response experiment additionally needs supported observed text/response inputs; original repeated-trial criteria remain |
| `restore` | Attached development context and experiment resource grants; local cleanup cannot reverse arbitrary server effects |
| `source-map-import`, `source-map-acquire`, `source-map-lookup` | Attached permitted read context; actual loaded script/map and artifact-origin checks remain operation-specific |
| `source-map-clear`, `detach` | Owned local cleanup; cannot detach a foreign debugger; conflicting experiment remains denied |
| `metrics` | Attached read lease |

`source.navigate`, `actions.source` and `inputs.observed` are separate features:
a connected IDE does not fabricate handler bindings or recorded operands. Actual
Action Trace, Live/Draft editing and production changes explicitly remain
unimplemented (A05/U02/F05). Local model availability requires the extension-page
device check; a deterministic fallback is never advertised as validated inference.
The separate `basic.request-site-access` feature lets an opted-in host offer
**Allow site and attach** before HTTPS permission exists. It does not permit
inspection until the browser grant is actually obtained. Native enterprise
permission UX remains a separate P03 acceptance gate.

## Exact site connections (F02)

See the executable [package policy](../packages/atom/README.md)
and `tests/integration/origin-connections.mjs`. `connect-site` accepts a tab ID
and `{origin,mode,actions}`; `forget-site` removes that exact site record. Only
trusted extension-page requests may configure them. Canonical HTTP candidates
are listed so users can explicitly approve a custom hostname; listing does not
grant access. Saving a connection invalidates the existing context for its tabs.
A host exposing this operation must explain and obtain genuine user consent;
page observations or previously advertised capabilities cannot authorize it.

The standalone manifest retains required debugger/scripting/storage/tabs plus
loopback host permissions. Other HTTP and HTTPS host patterns are optional; the
UI requests exact sites through Chrome's host-permission mechanism. Chrome may
grant a host pattern across ports; Atom still authorizes exact scheme/host/port.
HTTPS requires independent `readOnlySites:true` opt-ins in both platform and
runtime and remains read-only, including source navigation. Development-only
source navigation is separately paired and can operate read-only without granting
application mutation rights. Pairing binds the exact application origin to a
confined source subtree; no workspace path comes from a page.

Forward `permissions-removed` from Chrome permissions onRemoved, and `navigation`
with `{tabId,url}` from tabs onUpdated. Cross-origin navigation detaches even
when both origins have records. Browser-access withdrawal cancels work, releases
leases and clears unsaved private source/trial state. For simplicity an observed
permissions removal clears all active connections/pairing; separately saved
diagnostics retain their documented local retention/export policy. Direct lease
use also rechecks current origin/permission and the original connection/epoch.

The helper binds only 127.0.0.1. Its URL is a canonical HTTP origin with an explicit
nonzero port, without credentials/path/query/fragment. It is not a LAN proxy,
scanner or shell launcher. App, artifact and helper grants do not imply one another.

These rules add connection policy, not F03 installable onboarding, F05 production
consent, U02 Live/Draft editing or general runtime provenance.

## Immutable pair receipt (F04)

`npm run pack:atom` creates a new local timestamped handoff after offline clean
installation and browser-only builds. It refuses changed tarball bytes under an
already-issued Atom/UI package identity; bump the changed package candidate
version instead. An identical byte reproduction may reuse the same version.
Failed candidates stay in hidden staging and never reserve an issued identity.

The handoff distinguishes Atom package/API/wire, exact UI package/visual contract,
source-input digest, tarball hashes, installed export/type/asset hashes and both
host outputs. `consumerReceipt` records build checks and remains
`BUILT_NOT_VERIFIED`. Run `npm run verify:atom-package` and
`npm run verify:atom-types` against the current pointer, or pass an explicit
handoff: `npm run verify:atom-package -- /absolute/path/atom-handoff.json`.
The package check verifies current build-source hashes too; use the matching
source checkout. Keep native acceptance separately, as in the
[F04 execution record](completion/17-f04-immutable-package-pair.md).

`npm run verify:embedding -- /absolute/path/atom-handoff.json` uses the exact
hosts from that handoff. Actions/maps checks accept `ATOM_EXTENSION_PATH` and
`ATOM_PANEL_PATH=workspace/inspect.html` for embedding. Use native suites
sequentially when they share the IDE or app port; the full unit suite also
contains a real fixed-port first-read channel test. Both hosts carry bundled
third-party notices in addition to source and font notices. A receipt verifies
the named pair and checks; it does not add capabilities or publish the package.

## Native element picker (U05)

The additive `native-picker-v1` / `basic.pick-refine` contract uses the existing
owned debugger lease. Forward native Overlay and DOM events as debugger events;
do not translate them into trusted page selections. `pick` now requires an
attached target. `state.picker` carries short-lived status/ID and bounded actual
DOM ancestor labels. `refine-pick` takes `{tabId,pickerId,index}` and verifies the
exact document/backend node. ID-bound `cancel-pick` cleans only that session;
a request signal cancels pending admission or its specific refinement. Legacy
`selected` page messages are refused; CSS selector inspection remains separate.

Await `view.dispose()` before disposing its client: mount cleanup cancels pending
picker admission/refinement and native mode without detaching another consumer.
Cancel via the inspector avoids page keyboard events. Escape cancels but may also
reach page handlers; exclusivity is Unsupported. Frame/closed-root internals and
untested touch/secondary/multi-click paths are not claimed. Passive Overlay can
remain enabled until the owned lease ends, with inspect mode/highlight cleared;
full domain disable mid-gesture was measured to leak mouseup. No page overlay,
DOM reparenting or retained page listeners are used. Selection does not establish
source or runtime provenance. See the [U05 record](completion/18-u05-visual-picker.md)
and [demo](testing/visual-picker-demo.md) for exact candidate evidence.

The .11 target presentation uses observed text plus a single Select parent action.
`state.picker.selectedIndex` records the actual successful choice; missing metadata
never guesses the next parent. Full native choices/selector and scope limitations
remain inside Element details. See the [presentation follow-up](completion/19-u05-picker-presentation.md).

### Optional bounded source-analysis asset (candidate .20261021.36)

A host can copy `@stateport/atom/source-analysis-worker.js` to its own extension root
and pass `sourceAnalysisWorkerURL: chrome.runtime.getURL('source-analysis-worker.js')`
to mountAtom. The asset URL must stay on that document's scheme/host, use the fixed
filename and contain no credentials/query/fragment. Both supplied hosts configure it.
The feature is additive to API/wire1, UI2.1; older hosts may omit the option and keep
source previews with an explicit analysis gap. Feature `source-analysis-worker-v1`
requires the exact exported asset in package admission. No public SDK is introduced.

Only explicit View on a current selected native/own-host anchor requests the transient
full source-provider envelope via optional boolean `includeAnalysisInput`. Default
source reads still return the bounded preview. The fixed Worker revalidates/hashes
explicit content and uses the same pure resolver as Node. JS/TS/JSX only; no Vue SFC
compiler, Node wrapper, filesystem, configuration loading, remote import or evaluation.
Normal runtime/UI/guardian browser input admission remains unchanged. The separate
Worker uses the reviewed exact172-path allowlist and includes dependency notices.
Babel7's build flag is fixed at build time; no broad process/Node polyfill is installed.

One Worker per read is terminated on result,1500ms, cancellation, context/map changes
or view disposal. No main-thread/model fallback.64KiB results,8 parsed units,64 proof
relations,8 calls,64 identifiers and400-character expressions bound the source DTO.
Unverified map association stays Candidate; lexical targets and possible calls do
not establish invocation, branch choice, runtime values, property or HTTP ancestry.
Source sets/AST stay transient and outside default state/diagnostic/model persistence.
This does not erase strings already returned to an authorized host or independently
authenticate a user-provided manifest/source map. Browser bundle success alone is
not native product acceptance; see the current completion evidence for actual runs.

### Owned source-artifact parser asset (candidate .20261021.43)

The two supplied hosts use the existing `createGuardianBroker` offscreen document
for a separate private source-parsing channel. Copy
`@stateport/atom/source-parse-worker.js` unchanged beside `atom-guardian.html` as
`source-parse-worker.js`. Keep the existing `offscreen` permission and exact owned
host/document identity. Source payloads never use the debugger registry protocol.
The plain debugger broker still permits supported inspection; source exploration
requires a configured host parser and reports an explicit gap when absent.
The product has no synchronous source-artifact parser fallback.

Feature `source-parser-worker-v1` declares this exact asset, its eight-input gate,
map/manifest1500ms and ZIP2000ms parent budgets, at most2 live jobs and32MiB private
transport ceiling. Existing4/8/16MiB artifact and8MiB cache-input limits remain.
Binary pooling preserves shared map references without widening memory limits;
message serialization and decoded lookup hydration still cost bounded parent CPU.
No app code/URL/sourceRoot is executed or followed. Clear/replacement/navigation/
expiry/detach/runtime shutdown abort this runtime's own jobs. The shared host owns
the source broker; only disposing that host broker closes the whole source port.
Worker/port loss invalidates pending results and does not resurrect a source index
from storage. API/wire1/UI2.1 stay; decoded source data is never a public Atom input.
See the scoped [execution record](completion/79-p02-mv3-source-parser.md) for current
validation; this contract description alone is not actual MV3 or full P02 proof.

The private host challenge supplies its exact manifest background script URL.
Offscreen documents do not call getContexts/getManifest; their runtime API subset
is narrower. Context identity is verified by the service worker before the challenge,
and the offscreen document checks the URL belongs to the same extension. A wake
cannot substitute a visible page for that host. Pending source UI requests have a
separate generation:Clear/replacement invalidate late file/permission/RPC replies
before a metadata refresh, while current failures remain visible.
