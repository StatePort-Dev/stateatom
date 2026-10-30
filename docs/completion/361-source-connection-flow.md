# Direct source connection — 2026-10-30

User-approved interaction: one button in Atom asks for confirmation in the IDE;
without pressing it, Atom continues without an IDE. Manual receipt transfer must
not be the normal route. This is a bounded local helper/Atom change, not a new
release qualification or automatic permission to access every workspace.

Implementation choices: keep the exact configured loopback helper endpoint;
no port scanning or account. A connection request can only come from an extension
origin, and does not itself authorize source reads. The trusted IDE prompts for
the exact application origin and configured source folder. Approval issues a
session credential scoped to that extension, origin and folder. Existing pair,
source freshness, native identity and runtime evidence checks still apply.
Denial, cancellation, timeout, trust loss and context changes leave Basic usable.
The old receipt form remains a collapsed advanced recovery route.

The basic empty result also needs an available next action: page fields where
supported, otherwise recorded element details. These are never relabelled as code
dependencies. Existing populated dependency views and production grants remain.

Verification must distinguish helper/HTTP and mounted UI tests from user-operated
installed pairing. Chrome extension UI is not accessible to the browser tool;
that restriction must not be bypassed. The real React source demo uses port4173,
not the native-controls-only page on8765. Results and limitations are recorded below.

## Implemented

- Atom toolbar `Connect IDE` requests `/connect` on the configured loopback
  helper only after a user gesture. The HTTP development-page boundary is
  unchanged; HTTPS release-source exploration is a separate existing route.
- The VS Code helper prompts with project, source folder and exact page origin.
  An accepted credential is bound to the extension ID/origin/folder, expires
  after 60 seconds if unused, and lasts for this trusted helper session after
  pairing. Disconnect/stop revokes it. The initial request cannot read sources.
- No automatic prompt, clipboard transfer, port scan, account, new browser host
  permission, system trust or personal-profile change. The ordinary receipt path
  remains in collapsed advanced options for older/manual setups.
- Cancel, denial, stale context, disposed inspector and changed IDE trust or
  configuration are checked. A pending native modal cannot stack with another.
  Late approval does not restore an old selected element or discard page drafts.
- Approved pairing reuses the existing runtime operation and refreshes the exact
  selected native identity if the selection has not changed. Pairing does not
  itself prove source association or supported runtime dependencies.
- Basic has `View page fields` where implemented (existing permission/owner
  checks remain), otherwise `View element details`. The absence of a recorded
  computation is still stated under `About code dependencies`.

## Verification and limits

Commands and receipts are retained under
`.artifacts/ui/2026-10-30-direct-source-connection/checks/`. The main affected
run covered source approval/HTTP bridge, project setup, bridge source priority,
connection client, mounted inspector, property results, input UI and production
UI. Follow-up checks cover the source-setup link and drafts made while waiting.
**184 passed, 0 failed, 0 skipped** in the final combined run. Browser and IDE
builds passed; esbuild reported CJS `import.meta` warnings in unchanged first-read
modules (retained in the build log). Final counts/build identity are recorded in `verification.json` in this same
artifact directory. This is local follow-up evidence, not a replacement for
candidate96 or earlier release results.

The VS Code API is exercised with a mocked native window in tests; the HTTP
bridge uses real temporary loopback servers. These checks are not proof of the
installed Chrome → actual VS Code modal → actual dependency-result journey.
That final installed check is pending with the user. The automation tool denies
extension-page access and has no native-app control; no alternate automation
route was used to bypass those restrictions.

Rendered first viewport checked in Chrome at 360×780 and 440×780. Existing
StatePort header, Inter typography, tab layout, icon controls and shared tokens
were retained against the supplied extension-ui reference set. Documented
changes are the optional toolbar button and the Basic empty-state composition;
there is no replacement design. Enter starts and cancels the connection, focus
stays visible, controls fit and the useful Basic action remains available.
Screenshots `basic-360.png`, `pending-360.png`, `cancelled-440.png` are **rendering
candidates** from the real mounted UI with a synthetic client. The rendering
fixture cannot contact an actual helper; it is not installed pairing evidence.

## Try the current local build

1. Reload the existing browser extension from `dist/browser`; no new installation
   folder is needed. In the already opened demo VS Code development window, run
   `Developer: Reload Window` once to load the rebuilt `dist/ide` helper.
2. Open `http://127.0.0.1:4173/react/`. The server is the real
   `npm run dev:react-host` app. The supplied `docs/testing/atom-demo.code-workspace`
   points the helper at the fixture sources and the existing port47731.
3. On the page, `Name = AB` leaves `Local validation` disabled; `ABC` enables it.
   Both states were checked through the actual browser UI and the field restored
   to empty. This confirms the app behavior, not a successful Atom source link.
4. Open Atom on this page, select `Local validation`, click `Connect IDE`, then
   choose `Allow source access` in VS Code. Atom should refresh that selection.
   The demo expression is `form.length < 3`; ordinary apps still need matching
   sources and supported instrumentation for recorded operands.
5. Skipping Connect IDE leaves Basic available. Cancelling the IDE prompt must
   preserve the page inspection. Tokens/receipts should not be copied or shared.

No push, publication, SDK work or StatePort repository modification is included.
