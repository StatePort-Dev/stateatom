# Picker entry and Settings — 2026-10-30

User review: no Page connection section and no separate Connect action. Start
inspection with the selection icon, then click the page element. Keep useful
configuration in Settings. This is a bounded UI correction after candidate96;
it does not reopen the release scope or qualify a new packaged candidate.

## Changes

- Remove the Page connection disclosure and its connection toolbar icon/button.
- The selection gesture prepares the chosen tab through the existing attach
  operation, then starts the existing picker. Technical preparation precedes the
  page click because the native picker needs a debugger lease. Opening the view
  alone still performs no attach.
- Preserve the supplied `initialTabId`, exact-origin permission prompt, backend
  capability/lease admission, production confirmations and selected DOM identity.
  No automatic connect-site, production grant, cache reset or trial command is
  added to this UI sequence.
- Capture the tab and context generation across permission/attach waits. A tab
  switch or disposal cannot dispatch the old pick against a new tab. Repeated
  gestures during preparation do not attach twice; attach/access errors do not
  proceed to pick.
- Move tab selection/refresh, stop inspection and advanced session permissions
  into the existing Settings dialog. It is available for local pages and empty
  contexts; errors from these controls remain readable inside the modal.
- Update the shared test helper and the two current native CI drivers to the
  Settings/automatic-pick entry. Their existing assertions and thresholds remain.

## Verification and limits

Source UI tests exercise one-gesture HTTP/HTTPS entry, no implicit attach at
mount, permission refusal, foreign debugger ownership, delayed tab-switch races,
repeated gestures, attach failure, Settings reachability and modal errors. The
existing production confirmation/lifecycle tests are retained. These are
controlled client/DOM harness checks, not installed browser acceptance.

The original focused regression run failed all three new cases before the fix.
The final focused command and results are recorded below. An initial full run in
the restricted shell hit child-process/socket restrictions and was interrupted;
its log remains separate from the subsequent ordinary local run.

Rendered verification was attempted through the browser tool using an HTTP-only
controlled UI preview. The browser timed out, then the inventory had no connected
browser. No fresh screenshot, keyboard/narrow-view result or native installed
host result is claimed. The supplied design reference and explicit adaptation
are recorded in docs/design/extension-ui.md. Privileged extension-management UI
was not bypassed. The migrated native CI drivers have syntax checks only here.

Build output for local developer loading is `dist/browser`. The immutable
candidate96 archives, prior acceptance, warnings/latency decisions and release
ledger remain unchanged; the installed archive does not automatically become
this source build. No push, publication or other repository modification.

Actual commands/results (base revision `5de7be9`, task changes in this commit):

- `npm test` in ordinary local execution: **6515 pass, 0 fail, 24 retained-evidence
  skips**, 6539 total. No historical evidence rerun. The restricted attempt was
  interrupted, not counted as passed.
- After the final Settings empty-context/error changes,
  `node --test --test-isolation=none tests/atom/inspector-ui.test.mjs tests/atom/production-ui.test.mjs`:
  **109 pass, 0 fail**, including the two final additional cases. The earlier
  full-suite count is not relabelled as including these later additions.
- `npm run build:extensions`: **exit 0**. Existing bundler `import.meta`/CJS warning
  retained in the log; not suppressed or turned into native runtime evidence.
- `npm run check:ui`: **exit 0**; shared token output unchanged.
- `node --check` for `scripts/harness.mjs` and both changed native drivers:
  **exit 0**, execution of those browser drivers remains unverified here.
- All literal UI/Settings element references exist in the composed template;
  no duplicate `data-atom-id` values. `git diff --check`: **pass**.

Logs: `.artifacts/ui/2026-10-30-picker-entry/checks/`. The adjacent controlled
preview fixture is preparation only; it did not produce a verified screenshot.
