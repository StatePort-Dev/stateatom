# StateAtom open Vite development plugin (local candidate)

The installed-artifact recipe below is the experimental React18/classic
host-props profile. A source checkout also has a separately documented
[ordinary React19 contributor recipe](../../docs/testing/ordinary-react.md#contributor-recipe-ordinary-react19)
for automatic JSX and source/read fragments. Its current checkout/native evidence
does not establish a new installed plugin/VSIX combination or React19 committed
host-props support.

Install the supplied local tarball in an existing app, without cloning the Atom
repository: `npm install --save-dev /absolute/path/stateport-vite-plugin-<candidate>.tgz`.
No registry publication is established. Tested configuration: Node 24, Vite
7.3.7, React and React DOM 18.3.1. Other bundlers/framework/compiler versions are
unsupported by this recipe. The opt-in React host adapter checks exact upstream
bytes; source links are not proof of runtime execution.

Use this explicit `vite.config.mjs` configuration, adapting only the app root and
server port. React files import React for the classic JSX runtime.

```js
import {defineConfig} from 'vite';
import {stateatomPlugin} from '@stateport/vite-plugin';
export default defineConfig({
  esbuild: {jsx:'transform',jsxFactory:'React.createElement',jsxFragment:'React.Fragment'},
  plugins: [stateatomPlugin({enabled:true,root:process.cwd(),reactHostProps:true})],
  server: {host:'127.0.0.1',port:5173,strictPort:true}
});
```

Do not combine this recipe with `@vitejs/plugin-react`, SWC or automatic JSX
transforms. A detected conflict stops this opt-in dev server with a repair message:
remove StateAtom, or use this documented classic configuration. No app configuration
is rewritten automatically. Instrumentation applies only to `vite serve`, not the
production build; remove the plugin/config import and uninstall the dependency,
restart Vite with `--force` and reload to remove it. Do not retain old Vite dependency
cache after removing instrumented adapters. The controlled first-read launcher is
an optional specialised source-checkout profile, not this installation default.

Install the companion supplied VSIX using VS Code **Extensions: Install from VSIX**.
Trust and open the intended local workspace. Configure `stateatom.appOrigin`,
`stateatom.sourceFolder` (relative folder, `.` explicitly authorizes the workspace),
and optionally `stateatom.helperPort` in workspace settings. Run **StateAtom: Copy
connection receipt**, explicitly choosing a workspace if several are open. Paste
that private JSON into Atom's Source connection settings and connect. It contains a
session secret: never put it in URLs, app code, screenshots or shared diagnostics.
Approve development actions for the exact app origin separately in Browser connection;
then attach and reload. Inspect a property and use Open in IDE to check its exact range.

If plugin observations are absent, restart with this config and reload; Basic still
works. Source mismatch: choose the correct workspace/folder, save and reload/reinspect.
Multiple workspaces: select one in the receipt command. Occupied helper port: explicitly
change `stateatom.helperPort` and copy a fresh receipt; no port scan or proxy is used.
Wrong helper version/session: reinstall matching artifacts and copy a new receipt.
Maps without sources: request an artifact containing sourcesContent or originals;
positions alone cannot produce source text. Disconnect in Atom or run **StateAtom:
Disconnect source helper**; Basic remains independent of IDE, accounts and models.

Historical MIT source and Apache-2.0 components retain their original notices. This
package bundles only local implementation; Babel/Vue dependencies retain their own
package licenses. It does not ship a production SDK or enable production changes.

## Optional Action Trace development workflow

`actionTrace:true` is an additional, disabled-by-default development option. It
registers original synchronous function sites and the private Event/body-entry/
body-leave collector in the existing observer. Original source ranges and event
identity are required; source links/registrations remain different claims.
Use the exact plugin `0.1.0-candidate.20261021.1` archive with a compatible Atom
`0.1.0-candidate.20261021.23` candidate and its pinned extension UI.
Connect the matching private source helper, attach the development page, select
the actual element and open Actions. Arm observation, then perform the real
interaction in the application. Cancel ends collection; Clear removes the trace
without undoing the application action. Selection does not invoke the handler.
The original plugin-only experiment remains historical evidence in
[completion record 40](../../docs/completion/40-a05-plugin-observer.md); it did not
include these installed controls. Enabling the option alone does not provide an
installed workflow. HTTPS Action Trace and general async causality remain
unsupported; no public release is established.

Supported first-identifier synchronous functions/arrows receiving the original
native Event retain normal/throw body leave. Methods, async/generator, wrapper/
SyntheticEvent, missing/destructured first parameter, eval/with and opaque bodies
remain boundaries. Complete listener coverage, function object identity, effects
and source reflection equivalence are not established. Existing property/runtime
observations remain separate; no Promise reactions or argument snapshots are added.
