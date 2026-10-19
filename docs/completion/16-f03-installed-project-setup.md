# F03 — installed helper/plugin setup

Status: **complete within F03's bounded scope on Atom `.20261019.8`**, 2026-10-19.
The required installed first-read and ordinary-project gates pass. Spec: approved
`scope-review-1`, F03 in `03-runtime-and-onboarding.md`. Source base:
`fa0cfb231e0f06595d9b071b4dd745be1ffe2163`; checks run on the F03 worktree.
Only the normal installed development setup is in scope. The specialised first-read
profile keeps its original premises and evidence criteria. No publication is implied.

## Final acceptance — .8

Repair source base: `6d8650fc4ea766833eca4975250826c637590496`; checks run on the
dirty worktree, with the final local commit bound in the verification sidecar.
Helper **0.1.3**, plugin **.20261019.2** and UI **.20261018.2** retain their exact
earlier artifact bytes. Atom `.8` SHA-256 is
`58da6251b0c88ccdf9cba5086b43b1daaf47aa3047d63c8e4be750c52b2dc2a8`;
handoff `.artifacts/atom/2026-10-19T13-57-27-228Z/atom-handoff.json`.

| Check on final product bytes | Result | Receipt/log |
| --- | --- | --- |
| Full unit suite, including contract | 618/618 PASS, including 66 contract | `.artifacts/f03-freshness/tests-accepted-candidate.log` |
| Build/pack and strict installed consumers | PASS, 2 consumers | `build-8.log`, `pack-8.log`, `types-8.log` under `.artifacts/f03-freshness/` |
| Installed first-read panel/IDE/export/reader | 17/17 PASS, stable inputs, no errors | `.runtime/first-read-ui-runs/f03-final-installed-retry-20261019/results.json` |
| Installed React-host | 12/12 PASS, stable inputs, no errors | `.runtime/react-host-ui-runs/f03-final-20261019/results.json` |
| Installed short-loop | 107 checks; original 20 PASS / 10 expected PARTIAL, 2 hypotheses PASS; stable source/build/fixtures, no errors | `.runtime/short-loop-runs/f03-final-20261019/results.json` |
| Independent ordinary project | 18/18 PASS, no errors | `.artifacts/project-setup/2026-10-19T14-10-36-327Z/result.json` |
| Basic without IDE, ABA/export/reader | 26/26 PASS, stable inputs, no errors | `.runtime/browser-runs/f03-final-20261019/native-A.json` |

All are agent-operated Linux checks on the declared recipe. The first-read run
includes actual writer/CSP/foreign-window refusals, original P1/P2, stable proof
on panel refresh, exact IDE ranges, historical export/reader and trials/Restore.
The ordinary app remains independent of fixture filenames and `.runtime`; setup,
HMR, real IDE Disconnect, production output, plugin removal, Basic afterward and
isolated VSIX removal are exercised. These results do not establish universal
compiler support, ordinary-app finite HTTP lineage, official-host acceptance or
human usability.

Final verification sidecar: `.artifacts/f03-freshness/f03-verification.json`.
It verifies four artifact files, 50 packed source/visual entries, five unbundled
plugin runtime assets and 617 retained run input hashes, with the one inventory
delta described below; 611 final source-file hashes bind the local commit.
Earlier `.6`/`.7` failures, the `.8` Workspace Trust precondition failure and the
first `.8` Vite navigation failure remain unchanged. The ordinary-project driver
now records a concurrent `ERR_ABORTED` reload and waits for the replacement
document; every original assertion still runs. Its final run records one such
interruption at plugin installation. Product bytes are unchanged by that driver fix.
Earlier passing suites' broad test-directory inventories retain the prior driver
hash from `6d8650f:tests/integration/project-setup.mjs`; the sidecar records this
single non-executed-input delta explicitly, while their actual entrypoints,
imported helpers and product hashes match. No unrelated native suite is rerun.

The following initial/intermediate records retain their original candidate scope;
they do not override the final acceptance table above.

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

Initial `.6` ordinary-project receipt:
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

## Initial .6 artifact identity and checks

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

## Retained .6 acceptance failure: first-read freshness

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

## Freshness repair continuation — candidates .7/.8

Source base: `6d8650fc4ea766833eca4975250826c637590496`, dirty repair worktree.
The scoped change replaces only the identity acquisition in `src/engine/browser.mjs`:
native CDP document/node backend IDs, native text nodes and the HTML button's own
disabled attribute replace the isolated-world script. Acquisition rechecks the
selector and document. Full and display refreshes therefore need no new compiled
identity helper. No runtime snapshot, unknown-code rule, final-storage guard,
compiler recipe, transform pin or first-eligible occurrence rule is changed.

Text acquisition includes whitespace-only nodes, excludes comments and shadow
contents, and refuses incomplete subtrees, more than 32 levels/2048 nodes/128000
UTF-16 units. Only open shadow paths and native HTML buttons are admitted for the
corresponding identity checks; closed shadows, other namespaces/XML disabled
targets and unavailable facts remain unsupported. The broker adds exactly three
read metadata commands; DOM writes and Runtime.evaluate/compileScript stay denied.

RED→GREEN tests cover the no-compilation regression, whitespace joining, an
uppercase non-HTML name and scoped read admission. Actual Chromium mechanism
receipt `.artifacts/f03-freshness/native-identity-1792417012484/result.json` passes
five checks, including no Debugger.scriptParsed events across repeated identity
reads, open/closed shadow bounds, no getter invocation, equal-value replacement
and navigation. This is separate from installed panel/IDE acceptance.

The first intermediate full suite reported a channel subtest and parent failure:
its fixed future timestamp became past during slow repeated compilation. The
fixture now generates that same future-time control at each HTTP response; the
production validator is unchanged. The failed log remains
`.artifacts/f03-freshness/tests.log`; final full suite is **618/618 PASS** at
`tests-final.log`, and contract is **66/66 PASS** at `contract-final.log`.
One fresh focused source review reports no Critical/Important/Minor findings;
that review does not certify native results.

New handoff: `.artifacts/atom/2026-10-19T13-45-43-309Z/atom-handoff.json`.
Atom `.20261019.7` SHA-256:
`843634e12106e324a596e65f6423f2ba6f0ab7a89f805633405035b9eea29738`.
The exact prior helper 0.1.3, plugin `.2` and UI `.20261018.2` artifacts remain
unchanged. Build passes with the previously recorded CJS import.meta warnings;
both strict installed TypeScript consumers pass. The build receipt itself remains
`BUILT_NOT_VERIFIED`; final acceptance still requires the native results below.

The installed `.7` run at
`.runtime/first-read-ui-runs/f03-freshness-installed-20261019/results.json` reaches
**9 PASS**, including original P1/P2, exact IDE ranges, export and unknown-MAIN
refusal, then fails waiting for the controlled-trial result. The availability
invalidation refresh erased that result from `atom-result`. This FAIL is retained;
partial progress is not full first-read acceptance.

Candidate `.8` renders the existing bounded diagnostic trial record only when its
experiment ID and selected/historical target match. Results are labelled Historical.
Restore presentation is bound to origin, tab epoch, selection generation, target,
property and the matching experiment when present. A new Important review finding
showed a final direct assignment could bypass that check after Restore's own load;
RED→GREEN property-change/revocation controls now cover it, and the renderer owns
the final message. No review finding is deferred. This is source review plus unit
evidence; native evidence remains separate.

Final `.8` full suite: **618/618 PASS**, including **66 contract checks**,
`.artifacts/f03-freshness/tests-accepted-candidate.log`. Both strict packed consumers
pass (`types-8.log`); build and pack pass (`build-8.log`, `pack-8.log`). The new
handoff is `.artifacts/atom/2026-10-19T13-57-27-228Z/atom-handoff.json`, Atom SHA-256
`58da6251b0c88ccdf9cba5086b43b1daaf47aa3047d63c8e4be750c52b2dc2a8`.
The first `.8` native attempt (`f03-final-installed-20261019`) stops before any
product checks because the actual IDE Workspace Trust UI was not accepted in time.
It remains FAIL; trust is not disabled or bypassed. A separate fresh-profile retry
and the affected final `.8` native regressions determine acceptance.

DOM protocol basis: [native DOM metadata](https://chromedevtools.github.io/devtools-protocol/tot/DOM/)
and [Chromium whitespace handling](https://chromium.googlesource.com/chromium/src/+/HEAD/third_party/blink/renderer/core/inspector/inspector_dom_agent.cc).

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

Next single unfinished item: **F04**, immutable current Atom/UI pair and consumer
receipt. It remains partial and is not started by this continuation. The new receipt path
is verified in standalone; older F02 two-host evidence is not proof of that new
path in both hosts.
SDK, production enablement/F05, Live/Draft/U02, Action Trace/A05, local-model/L02,
U06 handoff UX, another repository and publication are outside this increment.
