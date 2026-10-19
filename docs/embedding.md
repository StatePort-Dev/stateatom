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
from package candidate `0.1.0-candidate.20261019.3`. Importing any entrypoint has
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

Default hosts grant these capabilities only for the original synthetic localhost
ports 4173–4175, and the optional IDE bridge at port 47731. The standalone host
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
