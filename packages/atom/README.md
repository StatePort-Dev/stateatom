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
const view = mountAtom(container, client, {readerURL: '../reader.html'});
await view.ready;
view.dispose(); // UI subscriptions, in-flight UI requests, DOM, timers and Blob URLs
client.dispose(); // this client's requests/subscriptions only
// Host later awaits runtime.shutdown(); panel closure does not shut down runtime.
```

Host imports exactly one copy of the pinned peer's `tokens.css`, then
`components.css`, then `@stateport/atom/atom.css`. Atom does not inject CSS or
register global listeners on import. `contract.json` fixes API/wire version 1,
UI contract 2.1.0 and the exact peer package version. Styles are scoped, not
Shadow DOM protection from hostile host CSS.

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
independent of IDE, Desktop, accounts and models. Action Trace, Live/Draft and
production change enablement remain future required tasks, not new F01 features.

The default embedded host admits ordinary loopback HTTP sites read-only, with explicit development actions.
A host may explicitly set `readOnlySites:true` on both `createChromePlatform` and
`createAtomRuntime` and supply `requestOriginPermission` through the `mountAtom`
options object to enable permission-gated HTTPS inspection. The standalone host
does so; this does not widen the default. HTTPS leases grant read/inject helpers
only, and runtime denies experiments, Restore and IDE context transfer.
Source-map operations add offline import, permitted URL acquisition, manual lookup
and clearing to wire version 1. Parsed maps/source stay outside storage, expire
after five minutes and clear on detach/navigation. Diagnostics omit their contents. Browser
basic/save/export work without IDE; source navigation and supported source-linked
analysis require the public open IDE helper. Unknown, Unsupported, Stale and
historical diagnostics keep their original meanings. Export is not a State Card.

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
HTTPS source navigation remains denied pending a trusted production association.
The helper URL policy is canonical `http://127.0.0.1:<1..65535>` with an explicit
port, no slash, path, query, fragment, credentials, aliases, HTTPS or LAN host.
Default `47731` is a convenience; the helper keeps binding only `127.0.0.1`.
No endpoint scan, proxy or shell startup exists. Helper and artifact browser
access are checked separately; no application approval grants either.
