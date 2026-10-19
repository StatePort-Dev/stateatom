# StateAtom Development Helper

This open local source bridge is installed from a local VSIX, independently of
the source checkout. Use **Extensions: Install from VSIX** and choose the supplied
`stateatom-dev-helper-0.1.3.vsix`, or `code --install-extension /absolute/path/helper.vsix`.
No Marketplace publication, account or closed StatePort component is required.

Open and explicitly trust the intended local source workspace. In workspace
settings choose `stateatom.appOrigin` (canonical exact HTTP origin),
`stateatom.sourceFolder` (relative folder; `.` explicitly selects the workspace),
and optionally `stateatom.helperPort` (default 47731, explicit 127.0.0.1 endpoint;
port 80 is not a canonical explicit-port helper URL). Run **StateAtom: Copy
connection receipt**, choosing one workspace if several are open. Paste the
private clipboard JSON into the browser inspector's **Source connection → Private
connection receipt**, then **Connect receipt**. It contains a session token;
never put it in a URL, application source, report or screenshot. Restarting the
helper creates a new session: copy a fresh receipt. The browser checks protocol,
helper version and workspace/session binding. Basic needs none of these components.

Install the companion open Vite plugin tarball and follow its README for the
supported Vite 7.3.7 / React 18.3.1 classic JSX recipe. Approve development actions
for the exact origin separately in Browser connection before attaching/reloading.
No application configuration is changed automatically. Other bundlers/transforms
are unsupported. The controlled first-read launcher remains an optional restricted
source-checkout profile, not this installation default.

Repairs: occupied port → change `stateatom.helperPort` explicitly and copy a new
receipt; multiple workspaces → select one in the receipt command; source mismatch
→ select the correct workspace/folder, save/reload/reinspect; missing plugin →
install/configure it and restart Vite; missing source-map contents → provide
original sources or sourcesContent. No scan, filesystem proxy or shell launcher
is exposed. Workspace changes stop the old session; source requests check trust.
Run **StateAtom: Disconnect source helper** to stop source access; disconnect in
Atom as well to clear its source context. Remove VSIX via VS Code Extensions and
remove/uninstall the Vite integration, force-refresh Vite cache and reload the app.

Contributors can run `npm run build:extensions` and load `dist/ide` in Extension
Development Host. **X-Ray: Show local pairing token** remains a manual contributor
command. Installed-VSIX acceptance is the distribution test. `npm run
pack:development` creates local immutable VSIX/plugin artifacts after a build;
it does not publish them. Source helper retains historical MIT and original
Apache-2.0 notices, with THIRD_PARTY_LICENSES generated from its actual bundle.
