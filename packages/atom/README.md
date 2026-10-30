# @stateport/atom (local candidate)

One browser-safe runtime and inspector, extracted from the public StateAtom
implementation. This is a local tarball candidate, not a registry release.
The analyzer, evidence rules and optional open IDE/helper stay public. No Capture,
Native Messaging, account, Electron, Node analyzer or cloud service is included.

See `docs/embedding.md` in the source repository for the complete host contract.

```js
import {createAtomRuntime} from '@stateport/atom/runtime';
import {createChromePlatform, createEventHub, createDebuggerBroker} from '@stateport/atom/platform';
import {createAtomDispatcher} from '@stateport/atom/transport';
const events = createEventHub();
const broker = createDebuggerBroker(chrome.debugger); // shared with ALL host consumers
const runtime = createAtomRuntime(createChromePlatform(chrome, {events, broker}));
// Host synchronously registers Chrome listeners and forwards scoped events.
// Host authenticates its exact extension page URL and its own frame-0 content script.
```

```js
import {mountAtom} from '@stateport/atom/ui';
import {createAtomClient, chromeTransport} from '@stateport/atom/transport';
const client = createAtomClient(chromeTransport(chrome));
const view = mountAtom(container, client, {readerURL: '../reader.html',
  sourceAnalysisWorkerURL: chrome.runtime.getURL('source-analysis-worker.js')});
await view.ready;
await view.dispose(); // owned picker cleanup, UI requests, DOM, timers and Blob URLs
client.dispose(); // this client's requests/subscriptions only
// Host later awaits runtime.shutdown(); panel closure does not shut down runtime.
```

Host imports exactly one copy of the pinned peer's `tokens.css`, then
`components.css`, then `@stateport/atom/atom.css`. Atom does not inject CSS or
register global listeners on import. `contract.json` fixes API/wire version 1,
UI contract 2.1.0 and the exact peer package version. Styles are scoped, not
Shadow DOM protection from hostile host CSS.

Native `disabled` observation is limited to HTML button, input and textarea.
It reads the native reflected attribute without calling application accessors;
`false` does not prove effective availability under fieldset/inert/ARIA/CSS or
application logic. Other kinds/namespaces or unavailable native identity remain
unsupported. Basic disabled reads require no MAIN trace helper. Optional
instrumented tracing binds a resolved native node, holds the shared DOM queue and
rejects native mutations even when a value is restored. Missing node/event binding
stays unavailable. The CDP helper's actual compiled bytes must match its prior
owned-code declaration; no first-read exemption. Native observation does not
identify a source or data producer.

Background source acquisition requires the trusted optional host method
`AtomPlatform.readScriptSource(tabId, scriptId, assertCurrent)`. The supplied
Chrome platform and both brokers run its synchronous guard immediately before
native dispatch, after awaited permission/lease admission. Custom brokers must
explicitly provide `nativeCommandGuard: true` and honor the final fourth argument
to `DebuggerLease.command`; the existing third admission callback may be async.
Without that guarantee, queued source acquisition is explicitly unavailable;
ordinary control/cleanup commands keep their existing contract. Cancellation or
map replacement removes waiting reads, and every returned body is revalidated.
No source body or authorization grant is cached by the queue.

Wire v1 has additive capability discovery v1. Import
`supportsCapabilityPolicy` from `@stateport/atom/transport`, then request
`client.request({op:'capabilities',tabId,capabilityVersion:1})`. The validated
descriptor and `state.capabilityPolicy` distinguish available operations,
source/observations and explicit unavailable reasons. They never grant access:
runtime enforces the same policy with fresh platform facts. Custom platforms
must describe current target permission, grants and lease ownership; unknown
facts do not enable scoped operations. Older hosts without discovery remain
explicitly unavailable in the new UI. An HTTPS permission-request button is
separate from an admitted inspection operation.

Public declarations are checked from installed tarballs using strict NodeNext
and browser Bundler resolution (`skipLibCheck:false`). TypeScript 5.9.3 is a
repository development tool, not a runtime/package requirement. Basic remains
independent of IDE, Desktop, accounts and models. At the F01 checkpoint, Action
Trace, Live/Draft and production change enablement remained future required tasks.
The later guarded input workflow and separately enabled production permission
are described below. Action Trace (A05) remains required future work.

Canonical loopback HTTP sites default to development read/inject and supported input
editing after attachment; explicit read-only site settings take precedence. Ordinary
attachment needs no cache/storage reset or reload permission. Remote sites are not
inferred to be development. The UI defaults to page fields and explicit Apply.
A host may explicitly set `readOnlySites:true` on both `createChromePlatform` and
`createAtomRuntime` and supply `requestOriginPermission` through the `mountAtom`
options object to enable permission-gated HTTPS inspection. The standalone host
does so; this does not widen the default. HTTPS inspection grants read/inject
helpers. Only the separately confirmed F05 permission admits supported input
changes; legacy experiments, Restore and IDE context transfer remain denied.
Source-map operations add offline import, permitted URL acquisition, manual lookup,
selected native registration lookup and clearing to wire version 1. Parsed maps/source stay outside storage, expire
after five minutes and clear on detach/navigation. Diagnostics omit their contents. Browser
basic/save/export work without IDE. A current listener registered directly on the
selected element can also be mapped without IDE: select the element, open Actions,
choose Connect source map, import its map/release ZIP, then View registered listener
source. Coordinates come from fresh native registration metadata, not manual input.
An explicit manifest ZIP is connected once for this tab session. Other current or
later loaded supported handler scripts can use the same connection without another
file selection:matching derives the loaded UTF-8 script digest, not its filename or
release label. JS bodies are discarded after verification; raw map index and unique
parsed-map inputs share the existing8MiB cache budget. Cold maps are reparsed on
explicit use. Missing/ambiguous/mixed-release cases remain explicit. Clear source
connection, navigation, expiry and detach release index/maps; no persistence is added.

Artifact parsing uses the host's owned offscreen document and the exported
`source-parse-worker.js` asset copied beside `atom-guardian.html`. The examples
supply this via `createGuardianBroker`; the plain debugger broker still supports
other inspection but reports source exploration unavailable. Do not provide a
caller-decoded map on the Atom wire. Each private job uses a fixed local Worker,
existing1500ms map/manifest or2000ms ZIP budget, and termination on cancel/budget.
At most2 jobs run together. Source payloads use a separate bounded channel; they
never enter debugger registry messages or persistence. Shared raw binary objects
are transferred once within a32MiB transport message; existing4/8/16MiB artifact
limits and8MiB cache input accounting still apply. This is not a total heap or
zero serialization/hydration CPU claim. Clear/replacement/nav/expiry/detach/dispose
cancel pending import/acquisition/lazy parse work. Obsolete file-read/permission/RPC
replies cannot reconnect a cleared view or replace its completed status; active
validation/permission failures still surface. The exact host script URL comes
from the verified private challenge, without requiring offscreen getManifest. Unsupported offscreen hosts do
not fall back to synchronous parsing. This asset/feature is additive to API/wire1;
no extra app mutation grant is needed for source exploration. After offscreen loss,
explicitly attach and import again. Reopening the inspector is also required after
a service-worker restart; source connections and inspector authority are not restored
from a previous runtime.

An exact artifact links the registered location only; invocation, callback identity
and the selected property's producer remain unproved. Unverified maps stay Candidate;
maps without source content provide positions only. A finite React-compatible
profile additionally reads the selected host's own onClick/onClickCapture data slot
and its native function location in the exact MAIN context. It uses the same
Connect/View map workflow. This profile was developed against ReactDOM18.3.1;
private host data does not independently attest the renderer/version. Getters,
Proxies, ambiguous carriers, wrong host/frame and bound/native functions without
locations remain unsupported. Root/delegated dispatchers and nearest components
are not substituted for application callbacks. The read-only source operation
never calls a handler/getter or the IDE. Other IDE source
navigation and property-linked IDE analysis require the public open helper. Unknown, Unsupported, Stale and
historical diagnostics keep their original meanings. Export is not a State Card.

An owned extension document may pass `sourceAnalysisWorkerURL` for the exported
`source-analysis-worker.js` asset copied into its own extension. Both example hosts
configure this asset. Explicit View requests a transient source set from the current
map and starts one dedicated module Worker, terminated after completion, cancellation
or a 1500ms budget. Source text is data; the fixed JS/TS/JSX parser resolves lexical
names/imports only among included files. Missing Worker/content/unsupported syntax or
budget exhaustion keeps the preview with an explicit analysis gap. There is no
main-thread parser, network import, application execution or AI fallback.
Original source lines recognize LF, CRLF, CR, U+2028 and U+2029 with UTF-16 columns;
a valid mapped position uses the same line convention in preview and analysis.

The optional source details show the function, possible calls and bounded expression.
Calls stay Candidate; runtime values, branch choice, invocation, property producer
and HTTP origin remain unobserved/unknown. An unverified map stays Candidate even
when lexical structure is readable. Source sets/ASTs are transient, omitted from
state/diagnostic/model defaults; this does not promise erasure of strings already
returned to an authorized host. Source-provider digests are not independent artifact
authenticity. Node uses the same pure resolver with its own digest/Vue adapter; the
browser Worker does not include the Node wrapper, filesystem or Vue SFC compiler.

Source licenses: historical MIT implementation plus SPDX-marked Apache-2.0 work;
see LICENSE, NOTICE and LICENSES. The CSS foundation is a separate Apache-2.0 peer.


The inspector now follows the reference composition with a scrolling body and
anchored header/footer. Give its mounting container a definite height when
embedding (for example `height: 600px`); the mount follows that height and is
capped at the viewport. Standalone host CSS supplies 100dvh. Section shortcuts
scroll only the inspector, and all actions are type=button to avoid host-form
submission. Load the optional shared `fonts.css` and serve the exported local
Inter asset at its relative path to reproduce reference typography. Carry the
font's OFL license from the UI package; no external font service is required.

F02 replaces fixture-port defaults: ordinary `localhost`, `127.0.0.1` and `[::1]`
HTTP origins at valid ports can be inspected read-only. `connect-site` takes
`{tabId,connection:{origin,mode,actions}}`; `origin` is canonical without a path,
`mode` is `read-only` or `development`, and `actions` is a subset of `cache`,
`reload`, `override`, `replay`. Development is HTTP only. Saving in Atom's
Browser connection settings explicitly approves checked actions for that exact
scheme/host/port for the browser session, across its tabs; it detaches existing
contexts. Host implementations must expose genuine user consent before sending
this trusted operation. `forget-site` removes it. Page messages cannot configure
connections. Additional HTTP hostnames need both an exact record and Chrome host
access; no registrable-domain or other-port authority is inferred.

Browser host patterns can span ports; Atom's authority does not. Standalone
ships required loopback host access and optional HTTP/HTTPS host patterns, with
required `debugger` permission. Hosts forward `navigation` (`tabId,url`) and
`permissions-removed` events in addition to debugger/detach/removed. Every lease
use also checks current permission/origin; a missing permissions API denies access.
Permission removal conservatively clears all active connection/source contexts.
Cross-origin navigation always requires a new attach, including between approved
sites. Source pairing is a separate, exact app-origin association with a confined
workspace subtree. Read-only HTTP source navigation does not grant mutation rights;
HTTPS IDE context transfer remains denied. Permitted local source-map exploration
is separate and grants no production changes.
The helper URL policy is canonical `http://127.0.0.1:<1..65535>` with an explicit
port, no slash, path, query, fragment, credentials, aliases, HTTPS or LAN host.
Default `47731` is a convenience; the helper keeps binding only `127.0.0.1`.
No endpoint scan, proxy or shell startup exists. Helper and artifact browser
access are checked separately; no application approval grants either.

U05 adds `native-picker-v1` / `basic.pick-refine`. After attachment, `pick`
starts Chrome's native hover/label picker using the owned debugger lease.
`state.picker` exposes status, a short-lived session ID and at most 12 actual
DOM ancestor choices. `refine-pick` accepts `{tabId,pickerId,index}`; it rechecks
both document and native node identity before inspection. `cancel-pick` accepts
`{tabId,pickerId?}`; supply the ID for view-owned cleanup so stale UI cannot
cancel another session. There is no page-token fallback or inferred component.
Legacy `selected` messages are refused. Existing CSS inspection stays available.

Tested primary pointer/mouse selection suppresses application selection clicks,
submit and navigation, including earlier capture/bubble listeners. Escape cancels
but can reach page key handlers; the inspector Cancel button avoids page keys.
Frame and closed-shadow internals, touch, secondary/multi-click and universal
keyboard suppression are unsupported/unverified. A DOM selection establishes no
source producer or runtime provenance. Sessions expire after 30 seconds; this is
picker identity retention, not a Live refresh or production permission policy.

Mount disposal aborts pending picker admission/refinement and asynchronously
cleans its own native session. Await `view.dispose()` before `client.dispose()`.
Hosts must forward owned Overlay/DOM debugger events unchanged. No active native
highlight/inspect mode remains after cleanup. The passive Overlay domain stays
until the owned debugger lease ends: disabling it mid-gesture can release an
application mouseup. No application DOM/style overlay or page listeners are used.

The .11 presentation keeps the observed text title and a single Select parent
command in the normal view. That command advances from the actual selected
ancestor index and stops before document/body choices. Full native DOM choices,
exact CSS identity and picker limitations remain in Element details. Missing
ancestor-index metadata does not guess a parent. This changes presentation only;
Unknown/Stale evidence and exact native document/node checks are unchanged.

A host may pass `initialTabId` (a positive integer) to `mountAtom` to retain its
selected application context. Atom selects it only if the runtime admits that tab.
If that tab is missing or unsupported, the application selection stays empty; the
user can choose a tab in Settings. The examples use Chrome's `openerTabId` while
keeping the exact trusted inspector URL unchanged.


The selection icon automatically prepares the chosen tab and starts element
selection; there is no separate Page connection section or Connect button.
Opening the inspector alone does not attach. Settings contains tab/session
permissions. Site access may still require Chrome's permission prompt, and live
page changes still require the two separate production confirmations.

### Optional live resource guardian (candidate .18)

The local standalone and embedding examples use `createGuardianBroker(chrome)`
in place of `createDebuggerBroker(chrome.debugger)`, shared by all host consumers.
The host declares `offscreen` and copies the package exports `guardian.html`,
`guardian.js` and `guardian-worker.js` as `atom-guardian.*` at its extension root;
source exploration additionally copies `source-parse-worker.js` unchanged beside them.
The optional `documentPath` must point to that exact bundled document. The shared
platform waits for `broker.ready`; the old in-memory broker remains available for
hosts that cannot supply the guardian. Existing unrelated offscreen documents
are never closed or replaced. Response mutation requires the live owner; resource
availability is separate from input support or execution evidence.

Only runtime messaging and a dedicated Worker run offscreen. Native calls remain
in the service worker. When its connection is lost, the live registry revokes its
leases and delegates fixed cleanup to a new worker. Storage summaries cannot
restore authority. An unknown existing native debugger client is refused before
attachment; matching owner labels do not adopt it. A guardian loss retires current
live references. Unconfirmed cleanup remains unavailable, not successfully restored.
A lost registry can require restarting the extension; simultaneous context loss
has no blanket crash-recovery guarantee. Official StatePort host intake remains
separate. Field controls and majority acceptance were unfinished at this .18
checkpoint; see the subsequent guarded input workflow below.

### Optional inspector lifetime channel

The local hosts also construct `createInspectorConnections(runtime,{isTrusted})`
from `@stateport/atom/transport` and register its `acceptPort` explicitly on
`chrome.runtime.onConnect`. Pass the same object as `connections` to
`createAtomDispatcher`; `isTrusted` must authenticate the host's exact native
inspector sender. Clients opt in with
`chromeTransport(chrome,{inspectorOwnership:true})`. The default transport keeps
older hosts compatible. No constructor installs hidden Chrome listeners.

A private live Port is admitted before owned requests. Port loss synchronously
revokes that inspector's runtime token and closes only its input editors; it does
not dispose a host's shared broker. The client does not reconnect or adopt saved
editing authority. Optional `subscribeConnection` reports loss, without claiming
native cleanup completed. A bounded failed startup does not fall back to an
unowned request. Native sender document/tab metadata is checked when available;
missing optional metadata is not invented as a native identity.

Input operations can carry a bounded `ownerId` for a particular mounted view,
combined with the transport session and its current live token. Another view or
client cannot adopt or close an active editor. Explicit close must retain the
same owner and current investigation; unmount wiring belongs to the consumer.
Closing releases input rules/observers, not application/server effects. Unknown
cleanup stays unavailable. The .24 packet's field widgets and actual Live/Draft
field-mode acceptance remain unfinished.


### Guarded input fields

After explicitly approving development actions for the exact loopback origin,
inspect a target, choose **Responses** or **Form controls**, then **Open inputs**.
The declared catalogue contains 18 representative sites: 11 are verified through
actual fields in each mode and local host, while seven unsupported rows keep
their reasons and receive no write credit. This is a bounded catalogue, not a
claim about most values in arbitrary apps. The [repository acceptance record](https://github.com/StatePort-Dev/stateatom/blob/main/docs/testing/input-editing-acceptance.md)
describes configuration, negative controls and evidence limits; no public release
or independent human visual approval follows from these local checks.

**Live** sends valid text/number edits after 250 ms of inactivity; Enter or blur
flushes a valid value. Textarea Enter inserts a newline; Ctrl+Enter flushes.
Boolean/select changes send immediately. That is dispatch timing, not an app
latency guarantee. **Draft** keeps changes local until explicit Apply. Switching
a dirty Draft to Live holds it until Apply or Discard. Invalid and newer typed
text remains visible through delayed acknowledgements. Groups report individual
outcomes and are not promised atomic across application effects.

Native controls use ordinary supported input/change paths; React/Vue form cases
are verified without direct hook/state setters. Select accepts observed enabled
options only. Response scalar rules wait for the next matching application GET;
Atom does not make the app request, reload or clear storage on each edit.
Read current values observes the editor/target, without fetching app data.
Applied/waiting/delivered values, app observations and unknown dependency remain
separate. A quick edit is never automatically Experimentally verified.

Undo-last and baseline restoration check current revisions. They refuse an
external update instead of overwriting it, even after eventful same-value ABA.
A closed investigation retains unsent drafts read-only until explicit discard;
no old writer reconnects or migrates to a new target. Consumer unmount closes its
per-view owner; page loss closes its live inspector scope. Cleanup removes
rules/observers, not already changed app or server state. Unknown cleanup stays
explicit. Native attachment absence retires only its known lease; it cannot clean
a replacement foreign owner.

The ordinary local hosts expose these implemented controls without the development
preview opt-in. Current capability decisions still govern every operation; a
known implemented denial remains visible, while an older NOT_IMPLEMENTED host
keeps the hidden fallback. `inputEditorPreview` remains an optional compatibility
mount parameter and grants no authority. HTTPS edits require the separately
scoped two-confirmation Settings permission below. SDK, generic eval,
arbitrary state/props/cache writers and automatic server rollback are not added.

## Production input permission (F05 local candidate)

HTTPS starts with read-only inspection. Browser access is a separate prerequisite
and never grants editing by itself. Select and attach the permitted HTTPS tab,
then open **Settings → Enable changes**. A first warning describes live handlers
and possible server consequences; Continue opens a separate exact-scope and undo
warning. Only **Enable for 10 minutes** creates permission. Enabling performs no
input edit, app request, reload or data reset. Choose **Attach this tab**, then
inspect a current element explicitly before using Inputs.

The new working policy covers one exact HTTPS scheme/host/port, Chrome tab and
native main-frame page for ten minutes. It admits supported U02 form controls and
JSON response fields in Live or Draft/Apply. It grants no additional API origins
or legacy cache/reload/storage-reset experiments. Reload/navigation, tab switch,
closing the issuing inspector or mounted view, permission loss, expiry/revoke and
worker restart/update end it. Permission and tickets are never persisted or
silently resumed.

The production status shows time remaining and **Return to read-only**. This
blocks new edits and retires owned native writers; pending/unconfirmed cleanup
stays explicit. Closing Settings after enabling keeps this bounded permission.
Undo checks revisions and can refuse an external change. It cannot undo server
effects or every already-admitted application action. Enabling or granting input
permission does not strengthen source, dependency or causal evidence.


### Simple issue files (bounded candidate)

Save a snapshot locally, choose it in the saved list, then **Prepare issue**.
Enter what happened and what you expected, review the simple historical report,
optionally omit whole description fields, and download it explicitly. The original
saved snapshot is unchanged. This minimal profile excludes source, responses,
recorded actions and selected text; it records no observation window. User-entered
words still require privacy review. No file is sent automatically.

The local Diagnostic Reader opens the issue without the app/IDE. It can preview
and download an unverified Developer note as a new file; a same build hash does
not verify execution or a fix. V1 reading/advanced export remain available. Rich
per-category review, v2 local persistence, P04 collection and full U03 handoff
acceptance are unfinished; this bounded candidate is not whole C07 readiness.

### Local historical file storage

The trusted host can use `save-handoff {raw}`, `list-handoffs`, `open-handoff {id}`
and `delete-handoff {id, expectedDigest}` without a live app or source provider.
These are historical data operations, not permission to mutate a page. New v1/v2
files keep exact supplied bytes; old v1 object arrays are marked reserialized.
One namespaced diagnostics key shares eight entries, 2 MiB encoded storage and
seven-day retention. An ID with different bytes conflicts; a lost write reply
requires reopening actual storage. Existing list-diagnostics returns v1 records
only, and legacy deletion cannot delete v2. The inspector exposes a separate Save after review, readable saved-file reopen,
explicit UTF-8 import, refresh and exact deletion. Downloads preserve raw bytes.
Rich category/per-note review and full U03 acceptance remain separate.

A confirmed lost debugger lease also revokes production-change grants and pending
confirmation tickets, and closes owned native controls, even if its later native
detach event arrives after local lease retirement. Reattach starts read-only;
production changes require two fresh confirmations. A foreign replacement owner
is never released through the expired reference.


Artifact URL failures offer the existing local .map/release ZIP input. HTTP401/403
indicate access refusal; an HTML document may be a sign-in page. Generic network,
redirect and browser-policy failures remain ambiguous. Atom omits credentials and
referrers and refuses redirects; use your existing company access to download a
local artifact when needed. No Atom login or production-change grant follows.
