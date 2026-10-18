# StateAtom Development Helper

The open local source bridge for the StateAtom experimental browser inspector.
Requires a trusted source workspace and the companion browser extension for source analysis.
Build from the repository root with `npm run build:extensions`, then load `dist/ide`
using VS Code's development extension mode. No closed StatePort or account is required.

Run **X-Ray: Show local pairing token** (the inherited command name), then enter the
URL/token in the browser panel. Pair an explicit localhost origin and source folder.
The token stays private in the isolated local session. Do not share profiles or connection files.

The manual recipe, automated real-host checks and limitations are in the root
README and docs/status.md. The helper retains MIT licensing. The build generates
THIRD_PARTY_LICENSES.md for the dependencies actually bundled with this helper.

The distributed helper bundles historical MIT code together with original
Apache-2.0 analysis components. Its effective package expression is
`(MIT AND Apache-2.0)`; this does not relicense the historical source. Both license
texts, the root NOTICE and generated third-party notices accompany the bundle.

The optional controlled first-read workflow (`npm run dev:first-read` at the source
root) also uses this helper to independently rebuild the pinned owned compilation.
It currently requires the declared Linux x64 source/toolchain and a private local
channel created by that command. Pair the setup page, attach it, then open its
React example. No source/effect claim comes from a page-provided manifest. Missing
compiler, channel or native browser premises remain Unknown. See
`docs/testing/first-read.md` in the source distribution for the exact scope.
