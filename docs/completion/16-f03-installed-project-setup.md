# F03 — installed helper/plugin setup

Status: implemented, acceptance incomplete on 2026-10-19. The required installed
first-read regression fails; F03 remains active. Spec: approved
`scope-review-1`, F03 in `03-runtime-and-onboarding.md`. Source base:
`fa0cfb231e0f06595d9b071b4dd745be1ffe2163`; checks run on the F03 worktree.
Only the normal installed development setup is in scope. The specialised first-read
profile keeps its original premises and evidence criteria. No publication is implied.

## Implementation

- The helper builds as an installable VSIX. Native acceptance loads product code
  from isolated installed extensions and verifies metadata/bundle bytes against
  that VSIX. Only an inert acceptance driver uses Development Extension Host;
  contributor loading remains available separately.
- A private clipboard receipt replaces manual URL/token/source-folder transfer.
  Schema 1 binds helper ID/version/protocol, session, workspace ID/name, exact HTTP
  application origin and source subtree. The token never enters a URL or exported
  diagnostic. The browser validates receipt shape and helper response; the helper
  rejects wrong-session/workspace receipts. Secret UI input clears after use.
- Source workspace choice is explicit. Multiple folders require a selection in the
  IDE command; untrusted or non-local workspaces cannot start source access.
  `stateatom.sourceFolder` is relative; `.` explicitly authorizes the workspace,
  avoiding any requirement for repository fixture filenames. Canonical path checks
  still reject traversal and symlink escapes. Folder changes stop the old session.
- Occupied helper ports have a concrete repair action: change `stateatom.helperPort`
  and reconnect; there is no scan/proxy/shell startup. Startup/stop are generation
  bound, so Disconnect and newer starts cannot be undone by a pending candidate.
  Receipt creation also rechecks session/trust after awaited filesystem reads.
- `@stateport/vite-plugin` is a local installable artifact that delegates to the
  original transformer. Its thin installation wrapper detects conflicting React
  transforms/classic-JSX configuration. Runtime assets are in the tarball, not read
  from the sibling checkout. Babel/Vue dependencies stay external with their own
  licenses; mixed historical MIT/original Apache notices accompany local code.
- Supported recipe is Node 24, Vite 7.3.7, React/React DOM 18.3.1, explicit classic
  JSX with the opt-in host adapter. Unsupported bundlers/versions and plugin-react,
  SWC/automatic-JSX combinations are not claimed compatible. Production builds do
  not run this serve-only instrumentation. No configuration is silently rewritten.
- Setup hints distinguish missing plugin observation, source mismatch, disconnected
  helper and maps without original source content. Repair guidance is separate
  from actual source/runtime evidence. Wrong helper version retains admitted Basic;
  missing/disconnected helper and removed integration retain useful Basic inspection.

## Actual installed workflow

The executable test creates a clean ordinary `shop-web` app under a unique `/tmp`
workspace with `src/ui/Cart.jsx`, `src/main.jsx`, Vite config and explicit IDE settings.
It installs public package dependencies and the supplied plugin tarball using npm,
then the exact VSIX through VS Code's CLI into an isolated extension directory.
No Atom harness folder, `.runtime` dependency, predefined Atom selectors or static
instrumentation markers are inserted into application sources. The acceptance
harness lives outside the app. Its app data are synthetic; this is an independent
layout/install example, not a human usability study or universal compatibility test.

Final ordinary-project receipt:
`.artifacts/project-setup/2026-10-19T13-04-15-656Z/result.json`, **PASS 18/18**.
This proves Basic before installation, the actual public receipt-copy command and
panel connection, missing-plugin repair, supported operands, exact original
file/range opened in the real IDE, state change/reinspection, a deliberately stale
compiled-source mismatch, recovery through HMR/reload, keyboard/narrow UI, the
installed IDE Disconnect command and closed helper endpoint, browser unpairing,
production output without instrumentation, plugin uninstall/cache refresh and
Basic afterward, plus actual VSIX removal from the isolated installation.

No receipt secret is in that public result. Private connection/receipt files are
mode 0600 in the ignored test profile and are never committed or published.

## Artifact identity and checks

Development handoff:
`.artifacts/development/2026-10-19T13-03-22-564Z/handoff.json`.

| Artifact | Version | SHA-256 |
| --- | --- | --- |
| helper VSIX | 0.1.3 | `68ffbd646435408d9e71d4953544d4574ccdd0f7a8551058441734a2b6ce0051` |
| Vite plugin | 0.1.0-candidate.20261019.2 | `4b7fb12666a50bcefed8d552bf9b0dc5c4957a2551f46ca835f0b5f5add837bc` |
| Atom | 0.1.0-candidate.20261019.6 | `6ca8662d7c37f2897485db72650d3c9342b22f798d6a0fd72797a3c59696ad45` |

Atom handoff: `.artifacts/atom/2026-10-19T13-03-25-996Z/atom-handoff.json`.
UI peer stays `.20261018.2`, contract 2.1.0, SHA-256
`2bfc8229a45e02f775bb563f27d9a803d51dd977145f46843c45a884e07289e5`.
API/wire, helper protocol and receipt schema are independently versioned (currently 1).
Original pack receipts stay `BUILT_NOT_VERIFIED`; a separate F03 receipt records
verified checks and the failed acceptance gate; it does not certify F03 complete.
Earlier artifacts and failed/intermediate runs are retained.
Current local verification sidecar: `.artifacts/f03-work/f03-verification.json`,
status `IMPLEMENTED_ACCEPTANCE_INCOMPLETE`. Its hash comparison checks all four
artifact files, 50 packed source/visual manifest entries and 652 retained run input
hashes against current files. The final local commit is bound after committing;
the original build and native-run receipts remain immutable.

| Command | Result | Evidence |
| --- | --- | --- |
| `npm test` | PASS 612/612 | `.artifacts/f03-work/tests-final.log` |
| `npm run verify:atom-contract` | PASS 65/65 | `.artifacts/f03-work/atom-contract-final.log` |
| `npm run build:extensions` | PASS; existing IDE CJS import.meta warnings | `.artifacts/f03-work/build3.log` |
| `npm run pack:development` | PASS | development handoff above |
| `npm run pack:atom` | PASS | Atom handoff above |
| `npm run verify:atom-types` | PASS 2 strict installed consumers | Atom `type-consumer-result.json` |
| `npm run verify:project-setup` | PASS 18/18, actual installed VSIX/plugin | ordinary-project receipt above |
| `npm run verify:react-host-ui -- --installed-vsix=...` | PASS_BOUNDED_HOST_UI 12/12, stable inputs | `.runtime/react-host-ui-runs/f03-installed-20261019/results.json` |
| `npm run verify:short-loop -- --installed-vsix=...` | COMPLETED_WITH_EXPLICIT_PARTIALS, 107 checks; 20 PASS / 10 expected PARTIAL | `.runtime/short-loop-runs/f03-installed-current-ui-20261019/results.json` |
| `npm run verify:first-read-ui -- --installed-vsix=...` | FAIL after installed-host identity passes: first P2 inspection refuses changed code history | `.runtime/first-read-ui-runs/f03-installed-20261019/results.json` |

Ordinary-project, React-host and short-loop tests use the installed Atom `.6`
standalone path in `ATOM_EXTENSION_PATH`;
the controlled first-read launcher retains its own restricted browser path.
Node 24.19.0 / npm 11.17.0 / Playwright 1.63.0 / Chromium 153.0.8010.12, Linux;
actual VS Code host version is in installed-helper/host-complete receipts.
Browser plugin unavailable; repository Playwright/MV3 workflow used, sandbox on.

## Remaining acceptance gate: first-read freshness

The failed first-read run has stable inputs. It loads the exact helper 0.1.3 VSIX,
then refuses the initial P2 result with `Code changed during inspection; inspect
again`. This is a safe failure, not a positive first-read result. Later controls
in that run were not reached; the historical 17-check pass is not a substitute.

A separate contributor-host diagnostic reproduction (not an installed-distribution
acceptance run) is retained at
`.runtime/first-read-ui-runs/f03-journal-probe-20261019/`. Its native
`journal-diagnostic.json` records isolated-world identity-helper compilations
61/64/65 (1046 bytes, context 8), with the last one after the resolver wait.
The source sequence explains the refusal: `inspect` takes `firstReadCode.journal`,
awaits source analysis, then calls `identifySelection` again; this uses
`chrome.scripting.executeScript` in ISOLATED world and compiles another script.
The final post-storage freshness check rejects that changed generation.
The original failed run and the diagnostic run both retain FAIL.

The next bounded work is to remove this conflict between the final DOM identity
check and the proof snapshot, while retaining exact node/value checks and rejection
of unknown MAIN code, navigation, competing writers and compilations during source
acquisition or final storage. No retry, ignored isolated event, newer journal
substitution, recipe repin or weakened acceptance was introduced here. A new unique
installed-helper first-read run is required after that repair; only then may F03
be accepted. F01/F02 historical records remain unchanged.

## Preserved evidence, review and UI deviations

The transform `src/engine/plugin.mjs` remains byte-for-byte at SHA-256
`1cb2b15233101cc7a7c81a244fc0adb6bff6a17c485b7d58673c7d95d5ede46a`.
Its closed recipe pins and historical source/results are unchanged. Installation
checks live in `vite-install.mjs`; ordinary installation does not use the restricted
first-read launcher. Test counts do not establish those stronger premises.

One fresh source reviewer found one Important startup→Disconnect race. A deterministic
actual-source VM control failed, then passed after the single lifecycle fix pass,
including competing starts; the full suite passed afterward. The review's Minor
installed-helper-removal evidence gap was completed through actual IDE Disconnect
and isolated VSIX uninstall checks in the final native scenario. Source review does
not independently certify native or visual results. Those review findings are
resolved; the subsequent first-read acceptance failure above remains open.

Retained negative evidence includes the offline-cache ENOTCACHED setup attempt,
intermediate candidates and the first required short-loop run. In that run runtime
nodes were Observed but old one-line operand text locators disagreed with the current
two-cell UI, and picker raced asynchronous property changes. The harness now checks
exact expression and JSON value in the same row and awaits property completion.
T/E/V/I thresholds and expected PARTIAL classes are preserved; no unsupported path
is promoted to pass and the failed run is not overwritten.

UI follows the supplied design set and `docs/design/extension-ui.md`. Receipt controls
use existing scoped native primitives inside Source connection; no shared tokens,
CSS primitives, layout redesign or simulated Settings states are copied. Compared
with supplied `atom/01-inputs.png` and narrow Settings, the existing white Inter
shell, dark source block and fixed footer remain. Necessary differences: real
read-only operand cells, source setup/repair text, private receipt input and retained
manual contributor fields. Keyboard and 440px view are exercised; screenshots
`first-viewport.png` and `source-connection-440.png` are candidates without human
visual approval. An independent person is not a completion blocker.

Upstream packaging/trust references: [VS Code packaging](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
and [workspace trust](https://code.visualstudio.com/api/extension-guides/workspace-trust).
The pinned Vite recipe is documented in `packages/vite-plugin/README.md`; no Vite 8
migration or unsupported compiler compatibility is inferred from current docs.

Next single unfinished item: **F03**, the bounded first-read freshness repair above.
F04 remains partial and is not started by this continuation. The new receipt path
is verified in standalone; older F02 two-host evidence is not proof of that new
path in both hosts.
SDK, production enablement/F05, Live/Draft/U02, Action Trace/A05, local-model/L02,
U06 handoff UX, another repository and publication are outside this increment.
