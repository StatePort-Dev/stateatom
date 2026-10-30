# Picker recovery and visible entry — 2026-10-30

Bounded follow-up to 359, based on `feccf42`. The user confirmed that switching to
the application and returning to Atom works, then reported that every selection
on the local native-control fixture failed with “Native picker path budget
exceeded”. That confirmation covers navigation, not successful inspection.

## Cause and correction

Read-only inspection of the actual HTTP fixture tab found **36 elements, maximum
DOM element depth 5**, and a sibling DIV with a **7,237-character style attribute**.
The previous index rejected any attribute over 2,048 characters, including unused
styles on unrelated siblings. A later pending path read could replace that first
failure with the generic path-budget error. A clean isolated HTTP-only protocol
probe, without the added block or any extension, selected three targets; it did
not reproduce the user's installed environment and is not an acceptance result.

Regression controls reproduce rejection of the long sibling style and oversized
optional ID/attribute lists. The index now reads only an optional short ID, scans
at most 128 attribute entries, retains at most 160 ID characters, and otherwise
uses its structural selector. Existing exact backend-node/document verification,
4,096-node, depth-48 and selector-length limits remain. Duplicate metadata delivery
counts distinct nodes; the first native failure survives a pending command.
No application expression or getter is evaluated by this correction.

## Entry and local updates

- Empty attached and unattached views offer one primary **Select an element**
  button with the existing picker icon. It shares toolbar permission, preparation
  lock and cancellation logic. No attach occurs simply by opening the view.
- Failures have a short retry message; exact diagnostics remain in collapsed
  Selection details. No unsupported result becomes successful evidence.
- Standalone navigation activates the application only after picker readiness and
  returns on the owned result, while respecting tab/window changes and aborts.
- `npm run update:extension` builds into the permanent `dist/browser` directory.
  Preparation failure preserves the last output; concurrent builds are rejected.
  Reload remains explicit. No archive installation path, extra permission,
  production grant, other-repository change, push or publication is introduced.

## Verification

Final source checks:

```sh
node --test --test-isolation=none tests/browser/*.test.mjs tests/local-extension-output.test.mjs tests/atom/picker.test.mjs tests/atom/inspector-ui.test.mjs tests/atom/production-ui.test.mjs tests/atom/guardian-package.test.mjs tests/atom/package-receipt.test.mjs
npm run update:extension
npm run check:ui
```

**252 passed, 0 failed, 0 skipped**; both build/check commands exited 0.
Entry/duplicate-metadata RED: 111 passed / 5 failed. Long-attribute RED: 21 passed /
2 failed. An initial isolated-process test command failed in the restricted shell;
it is not counted as a regression result. Earlier full-suite results in 359 stay
historical; no full-suite or release-matrix rerun is claimed here.

Final local build ID:
`019af751f070d584b63fcaad050def9fb40cd7cd2006fc18e942ca3acb68c10e`.
All 27 payload file hashes match `dist/browser/local-build.json`.

Rendered HTTP preview uses the actual mounted Atom UI/CSS and a synthetic client.
At 360 and 440 pixels, the new entry is visible; at 360, scrollWidth/clientWidth
are both 360 and the button height is 48.5 pixels. Enter starts and cancels the
synthetic picker; focus remains on the primary button. Screenshots are candidates:
`.artifacts/ui/2026-10-30-picker-entry-followup/{entry-360,keyboard-360,entry-440}.png`.
Logs are in its `checks/` directory; 359's historical check logs are unchanged.
The earlier preview files beside those old logs were reused during this follow-up;
they are not the old source version or additional historical acceptance evidence.

Compared with supplied `screens/atom/10-narrow-inputs.png`: existing brand, type,
blue, icon geometry and shared controls are retained. The centered empty-state
CTA is an intentional user-requested adaptation; the reference depicts a populated
inspector. No shared token or contract version changes.

**Remaining verification:** retry the new local build in the user's installed
extension. Browser tooling rejects extension-protocol/management pages; that
restriction was not bypassed. HTTP preview and source controls do not establish
native installed acceptance. The original report is retained until that retry.
