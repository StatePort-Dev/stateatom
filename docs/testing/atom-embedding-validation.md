# Atom embedding candidate validation — 2026-10-18

The same installed `@stateport/atom@0.1.0-candidate.20261018.1` tarball passed
public standalone and a distinct MV3 embedding host. This is a local candidate,
not a registry release or verification of the official StatePort/Capture host.

Git base: `244e19bcb98833339bef23d07f57a52b90238455`, with uncommitted task changes
and preserved pre-existing documentation edits. The handoff records exact runtime
input digests rather than inventing a commit for this working tree.

Atom SHA-256: `eee61cf7fe5f505865cefefbedcf80ed562a9c0f2ab3bb704f0518f10a27a0d5`.
The ignored artifact directory is `.artifacts/atom/2026-10-18T15-53-09-323Z/`;
`.artifacts/atom/atom-handoff.json` is its current entrypoint. It contains both
Atom/UI tarballs, loadable `standalone/` and `embedding/`, copied synthetic
verification reports/exports/screenshots, command logs and `final-verification.json`.
Browser profiles, IDE connection/token files and native credentials are excluded
from the copied verification payload. Source/tree artifacts from earlier attempts
remain in their unique directories.

## Scope and environment

Linux, Node 24.19.0, npm 11.17.0, Playwright 1.63.0, Chromium 153.0.8010.12 with
sandbox enabled, actual VS Code 1.141.0 Extension Host and public helper 0.1.0.
Browser plugin was unavailable; existing native Playwright MV3 harnesses were used.
The helper ran as a development extension in isolated real IDE profiles, with a
separate session for each extension ID. This preserves its single-peer origin
binding. An installed VSIX distribution was not rerun in this increment.

Atom API/wire version is 1. The exact extension-ui peer candidate is
0.1.0-candidate.20261018.1, UI contract 1.0.0. A clean consumer was created at
`/tmp/stateatom-embedding-consumer-RT6mWa`; it installed the two local tarballs and
the existing pinned esbuild 0.25.12 development dependency. Public build-tool cache
was preferred; a missing cached tarball required a public registry fetch. Its own
`npm run build` succeeded. Both final host bundles record only inputs from that
consumer. `npm ls @stateport/extension-ui --all` confirmed one installed UI peer,
deduped under Atom. All four installed browser `.mjs` entrypoints byte-match the
current build. The 15 bundled runtime/UI source input hashes match current files.

Host entrypoints differ: standalone `panel.html`/`#atom`; embedding
`workspace/inspect.html`/`#workbench-inspector`, generated child IDs, its own worker
dispatcher/adapter and adjacent native host controls. The host owns CSS imports;
Atom adds no duplicate UI foundation.

## Executed commands and results

The first five commands ran sequentially in
`delivery-2026-10-18T15-54-36-709Z`, with `ATOM_EXTENSION_PATH` set to the final
artifact's `standalone/`. Tags and full paths are recorded in handoff.

| Command | Actual result and boundary |
| --- | --- |
| `npm run verify:atom-contract` | 16 platform/transport/lifecycle cases pass; controlled in-memory dependencies, distinct from native proof. |
| `npm test` | 509 pass, 0 fail/skip; original markers, stale/identity, compiler/evidence and negative controls retained. |
| `npm run build` | Full browser/IDE/reader/fixture build passes. Existing IDE CJS output retains two import.meta warnings. |
| `npm run pack:atom` | Tarballs, clean install, consumer npm build and both host builds pass; local only. |
| `npm run verify:embedding` | 30 native MV3/real IDE checks pass on the same tarball; report `verification/embedding.json`. |
| `npm run verify:browser` | 26 actual standalone IDE-free UI/save/export/restart/fresh-reader checks pass. |
| `npm run verify:short-loop` | 106 checks; 20 PASS / 10 explicit expected PARTIAL; source/build/fixtures stable, no errors. |
| `env -u ATOM_EXTENSION_PATH FIRST_UI_TAG=atom-delivery-controlled-20261018-1600 npm run verify:first-read-ui` | 16 original controlled first-read UI checks pass on exact packed worker bytes at the harness's required path. |
| `ATOM_EXTENSION_PATH=<artifact>/standalone UI_TAG=atom-delivery-ui-20261018-1603 npm run verify:extension-ui` | 22 native scope, keyboard, narrow/zoom and affected Atom/reader workflow checks pass. |
| `git diff --check` | Pass. |

The first-read native guard intentionally requires `dist/browser`, including the
actual browser command line and output identity. The first attempt with a custom
launch path failed that guard. The existing generated browser build was preserved
at `root-build-browser-before-controlled-check/`; the packaged standalone was then
copied byte-for-byte into `dist/browser`, and the override was unset. Its worker
SHA-256 matched the tarball-built host before/after. `controlled-standalone-mirror.json`
records this setup. The guard and analyzer/evidence thresholds were unchanged.
The earlier failed pipeline record remains retained; the final verification
manifest references the successful scoped rerun rather than relabeling it.

## What the native checks established

Both hosts exercised real picker selection, selected text/disabled property,
Code-linked expression, supported observed operands, actual IDE document and exact
selected source range, re-inspection after original form execution, HMR/reload
invalidation, tab switching, source disconnect, panel close/reopen, local
save/review/exact JSON download and worker-only stop/restart. HMR input was a
harness-emitted Vite watch event for the unchanged fixture; its existing handler
caused an actual browser reload. Worker restart used `ServiceWorker.stopWorker`
and the next authenticated request, not an extension-reload substitute.

Embedding additionally passed repeated mount/dispose, unique IDs, exact peer
routing rejection, native competing-consumer acquisition, BUSY on Atom
attach/inspect/restore, no reload under BUSY and a foreign debugger command still
succeeding after Atom unmount/shutdown. Foreign release then revoked the native
command. A distinct manifest control removed host permissions; actual Chrome
injection denial returned an error without accepting an observation.

The same canonical Basic observation/Unknown meaning and inspector geometry were
compared across hosts at 960px. Both hosts separately asserted the same supported
expression/operand behavior. Neighboring host controls had identical computed
styles with Atom/foundation CSS enabled and disabled. Narrow view and keyboard
interaction passed. Saved exports from both hosts opened in a fresh file-only
reader after the original browsers and IDE sessions closed.

The original finite first-read UI retained its supported P1/P2 trace, actual IDE
selection, export, refusal of later regions, Stale after unknown MAIN code,
controlled intervention/rollback/Restore, literal/bound/getter competing-writer
refusals, CSP refusal, foreign WindowProxy refusal and historical offline read.
No observation, source match or unknown boundary was promoted to broader evidence.

## Review and limitations

Independent read-only review found four Important lifecycle/UI defects. Their
reproductions failed first, then passed after fixes: release Basic reservations
on Detach; cancel only the inspection generation owned by that request; retain
exclusive ownership while native attach/release settles; ignore experiment replies
after tab/selection changes. The missing required experiment requestId type was
regraded as a functional contract issue and fixed. Additional RED→GREEN cases
covered shutdown's own Fetch cleanup, startup tab-removal ordering and ignoring
unrelated host dispatcher messages. No reviewer finding remains deferred.

Decisions retained: all host debugger consumers must share the broker; a native
`attached` flag alone is not authority to detach (a real Playwright target reported
attached before Atom). Bypassing the broker cannot be safely arbitrated by this
in-memory API. Existing helper origin binding remains; changing extension ID needs
a fresh helper session. The supported experiment payload requires its existing
exact requestId. These choices and their costs are recorded in the task ledger.

Screenshots were inspected by the agent and remain candidates until human review.
Vue PARTIAL and historical deep-tracing limits are unchanged. Coverage is the
listed Chromium/Linux configurations and controlled cases, not every MV3
suspension schedule, browser or external application. No lint/typecheck command
or TypeScript compiler exists in this checkout; shipped declarations were not
compiler-checked. Official StatePort, real Capture/Native Messaging coexistence,
production permissions, installed-VSIX and independent human usability remain
separate gates. No private StatePort edit, Capture implementation, npm publication,
PR, release or push occurred. See the bounded
[official-host integration task](../tasks/stateport-host-atom-integration.md).
