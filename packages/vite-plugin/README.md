# StateAtom open Vite development plugin (local candidate)

The default installed-artifact recipe below is the experimental React18/classic
host-props profile. Candidate5 additionally contains the explicit experimental
Vue profile described below. A source checkout also has a separately documented
[ordinary React19 contributor recipe](../../docs/testing/ordinary-react.md#contributor-recipe-ordinary-react19)
for automatic JSX and source/read fragments. Its current checkout/native evidence
does not establish a new installed plugin/VSIX combination or React19 committed
host-props support. Candidate7 adds the separate opt-in native ancestor profile
below; it does not add React19 committed host-property producers.

Candidate `0.1.0-candidate.20261028.8` packages the current source, including the
state handoff's captured weak-reference method and current private collection
corrections. Its exports, opt-in profiles, version admission and dependencies are
unchanged. Local archive/consumer checks are separate from installed helper,
browser, React/Vue workflow or lineage qualification; historical native results
below retain their original candidates and limits. No new SDK or public release
is established by this package.

Install the supplied local tarball in an existing app, without cloning the Atom
repository: `npm install --save-dev /absolute/path/stateport-vite-plugin-<candidate>.tgz`.
No registry publication is established. Tested configuration: Node 24, Vite
7.3.7, React and React DOM 18.3.1. Other default-profile bundlers/framework/compiler
versions are unsupported by this recipe. The opt-in React host adapter checks exact upstream
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

## Experimental Vue development profile

Candidate `0.1.0-candidate.20261021.5` adds an explicit `profile:'vue3'` option.
Its declared tuple is Node18.18.2, Vite4.4.9 in app and plugin, Vue3.3.4 and
@vitejs/plugin-vue4.3.2. Keep the original Vue compiler plugin/configuration:

```js
import {stateatomPlugin} from '@stateport/vite-plugin';
// Add to the original application's plugins; preserve its other configuration.
stateatomPlugin({enabled:true,profile:'vue3',root:process.cwd()})
```

The wrapper refuses a missing Vue plugin, mismatched installed version metadata,
React/Query/write/Action Trace options or an unknown profile. Default profile
still requires Node24/Vite7.3.7; the expanded npm peers do not admit every cross
combination. Disable/remove StateAtom for other configurations. Disabled mode is
transparent and instrumentation is serve-only, never a production SDK.

This uses the existing selected Vue script-setup text/disabled observation path.
A source link is not an executed callback, a component prop/consumer proof or
complete value ancestry. Other Vue versions/pipelines and arbitrary component
prop forwarding remain unqualified. The compiler dependencies bundled by Atom
remain separately pinned; they do not replace the application's Vue compiler.
Candidate3 failed actual startup on ordinary HTML void tags; candidate4 uses
the DOM-aware template parser. Candidate4 then exposed a named-export linkage
rewrite error in an original utility module; candidate5 preserves export specifiers
and live-binding semantics. These source corrections alone are not native support.
Actual qualification and failures belong in repository completion record119;
metadata and this recipe alone do not establish a successful installed workflow.
Candidate `0.1.0-candidate.20261021.6` additionally scans HTML and Vue SFC entries
at startup in this enabled Vue profile when the application leaves entry discovery
at its default. This includes template-autoimported components before their first
browser request; it can add initial scanning work. Existing explicit
`optimizeDeps.entries`, `noDiscovery`, `disabled` or `build.rollupOptions.input`
policies (including empty values) are preserved. Custom/accessor configuration is
left untouched; such pipelines may still need their own dependency policy. Vite4
still excludes node_modules/build output, and the original test/coverage excludes
are retained. No dependency names are forced, no application warning is suppressed,
and this does not qualify other Vue/Vite versions or the full native workflow.
Fresh packaged/runtime results belong in completion record124; the earlier
plugin5 cold-start failures and all zero-console criteria remain historical.

No new public release or publication is established.

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

## Experimental React19 native state ancestors

Candidate `0.1.0-candidate.20261021.7` adds a separate development-only profile:

```js
stateatomPlugin({enabled:true,profile:'react19-state-ancestors',root:process.cwd()})
```

It requires Node24, Vite7.3.7 in app and plugin, and the original React19.2.5 /
react-dom19.2.5 dev source bytes recorded in its two-file adapter. Version metadata
alone cannot admit edited bytes. Other versions refuse; do not replace the app's
dependencies to bypass admission. Keep the application's JSX compiler; automatic
JSX is supported by this recipe without conversion to classic createElement.
Conflicting React18/Query/write/Action Trace/first-read options refuse explicitly.

For a Vite HTML entry the plugin prepends the observer's module before app entries.
Custom non-HTML entry pipelines have not been qualified. Build is excluded by
`apply:'serve'`; `enabled:false` injects no runtime and transforms no app/vendor.
Remove the plugin and reload to return to ordinary uninstrumented development.

The observer can report exact current committed DOM ancestors with native
reducer/state queue, dispatch, applied-input/result/revision and eligible update
identities. App state fields are opaque and are not read or serialized. Single-root,
tree512/hook64/ancestor64/event4096 limits fail closed. Public hook kind, field
ownership, state-to-prop transfer and selected-property origin remain Unknown.
An observed ancestor is not an input/producer of the selected property's value.
Stop, HMR, changed identity or unsupported paths invalidate/refuse observations.
These are instrumented-page reports, not hostile-page attestation or permissions.

Atom's existing development source connection is still required for its optional
deep path. The plugin does not grant browser, helper or production write access.
The compact live summary omits opaque IDs; saved v1 diagnostics explicitly omit
this independent observation and record that limitation. The package build/source
checks alone do not prove installed operation. Bounded native qualification and
remaining gaps are recorded in `docs/completion/141-a02-react19-product-acquisition.md`.

To prepare this plugin alone locally, use the root's existing command with the
explicit mode `npm run pack:development -- --plugin-only`. Its separate
`plugin-handoff.json` uses schema `stateatom.development-plugin-artifact/1`, includes
no helper artifact and does not rebuild/reissue an unchanged helper VSIX. The default
combined command retains its existing receipt format. Neither mode publishes.
