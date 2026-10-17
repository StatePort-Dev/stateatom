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
