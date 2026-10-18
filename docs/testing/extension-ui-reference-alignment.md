# Shared UI reference alignment verification — 2026-10-18

## Current composition correction — candidate .2

The maintainer rejected the first pass's composition as insufficient. Its earlier
functional checks are retained below and do not constitute human visual approval.
The current UI candidate is `0.2.0-candidate.20261018.2` / contract **2.1.0**;
Atom is `0.1.0-candidate.20261018.3`, API/wire **1**.

The comparison uses the immutable runnable `design/index.html` at 1440×960,
whose inspector is 440px wide, plus supplied Atom screenshots and real Atom at
440px within the native 960/1280 viewport and a 360px viewport. Browser plugin
is absent; sandboxed Playwright Chromium and the existing real MV3/VS Code
workflow are used. No Figma file is modified or claimed freshly verified.

Concrete visual points inspected in both the reference and rendered screenshots:

| Point | Reference / current resolution |
| --- | --- |
| Composition | Header + product rail, selection, expression, rows, disclosures and anchored footer; setup no longer precedes the data |
| Typography | Local variable Inter actually loads; 13px base, 21px desktop target heading, 12px mono row names, 11px controls/nav/code and 10px source text |
| Alignment | 57px header / 44px product rail, 20px desktop gutters, source label and evidence badge share a row; values align right |
| Expression | Source card raised from approximately y=630 in the old 440px panel to approximately y=260; #171f30 condition surface with original source range in the action |
| Controls | Supplied scan/refresh/link/external/file icon geometry; compact property select, real in-panel navigation and reinspection/diagnostic footer actions |
| Data density | Read-only value chips and ruled rows; source identity stays exact, with no fabricated editable controls or row ancestry |
| Responsive behavior | At 360px, labels wrap, values remain readable, actions remain reachable; the body scrolls inside the panel |
| Evidence wording | Snapshot time and Not live stay visible at the footer. Stale/Unknown remain explicit; complete scope text is in a native disclosure |

Above-the-fold copy intentionally reflects actual Atom data. A short recorded
button label becomes its heading; otherwise the recorded selector is used.
Inputs/Evidence/Diagnostics navigate to real sections. Prototype-only Capture,
Technical/Summary, Responses/History, Apply/draft and editable boolean controls
are not shown. No value, trace or feature is inferred from the design fixture.

Source review found and corrected outer-host scrolling, viewport-only embedded
sizing, stale attach completion effects and surrounding-form submission. New
bounded-container/form checks exercise both packed hosts; source actions also
set type=button. These are presentation/integration corrections, not changes to
the analyzer or acceptance thresholds.

Retained development failures include the old setup-first geometry, an old
full-scope visibility assertion after introducing a disclosure, and a compact
property-select assertion that had expected the ordinary field padding. The
assertions now exercise the actual disclosure and distinguish compact controls
from settings fields. A repeat-export timeout occurred during a concurrent
heavy compile run; three isolated open/cancel cycles and the sequential full
IDE scenario pass. The timeout log is retained, not counted as success.

Final native UI check: **25 PASS**, including current composition, local font,
navigation, keyboard, scope isolation, 360/960px, CSS zoom, Unknown/Stale and
reviewed export/reader. Real code-journal UI: **27 PASS**, inputs stable and no
page exceptions. Full unit suite: **512 PASS**, no failures/skips. Full build
passes. First-read UI: **16 PASS**, inputs stable. Clean installed UI consumers in npm
11.17.0 and pnpm 12.4.2 pass with the exact 13-file payload, deterministic tarball,
no source-checkout or network asset requests, and Chromium CDP reporting
`Inter Variable` / `isCustomFont: true` for rendered text. Packaged standalone and
embedded hosts: **32 PASS**, including both 300px-container/form/outer-scroll
controls, dynamic source button types, exact IDE ranges, fresh occurrences,
HMR/Stale, lifecycle/leases, diagnostic review/export and a fresh reader.
The first embedding attempt retained a FAIL at an old visibility assumption for
`capabilities`; the final driver opens the real scope disclosure before checking
that same Basic boundary text. No evidence requirement was reduced.

Current render: `.runtime/react-host-ui-runs/composition-final-20261018/panel-positive.png`.
Reference crop: `.artifacts/extension-ui/composition-20261018/reference-panel-440.png`.
UI snapshots: `.artifacts/extension-ui/verification/composition-final-20261018/`.
All 151 original design checksums still match. Human design acceptance, OS/browser
chrome zoom, installed public distribution and private StatePort integration
remain outside this agent-operated verification. No publication or push.

### Current commands and immutable artifacts

- `npm run build`, `npm test` and `npm run check:ui` — PASS.
- `UI_TAG=composition-final-20261018 npm run verify:extension-ui` — 25 PASS.
- `HOST_UI_TAG=composition-final-20261018 npm run verify:code-journal-ui` — 27 PASS.
- `FIRST_UI_TAG=composition-final-20261018 npm run verify:first-read-ui` — 16 PASS.
- `npm run pack:ui -- --verification-evidence=.artifacts/extension-ui/composition-20261018/verification-evidence.json` — two clean consumers PASS.
- `npm run pack:atom`, then `npm run verify:embedding` — 32 PASS on current package.

UI tarball:
`/home/roman/projects/stateatom/.artifacts/extension-ui/0.2.0-candidate.20261018.2/stateport-extension-ui-0.2.0-candidate.20261018.2.tgz`

UI handoff:
`/home/roman/projects/stateatom/.artifacts/extension-ui/0.2.0-candidate.20261018.2/ui-handoff.json`

UI SHA-256: `2bfc8229a45e02f775bb563f27d9a803d51dd977145f46843c45a884e07289e5`.
UI source tree digest: `e361c3c7bb4b84ebce030e457e99d29e9c45e98e2a7c4a897eca948228007d3c`.

Atom tarball:
`/home/roman/projects/stateatom/.artifacts/atom/2026-10-18T18-48-30-945Z/stateport-atom-0.1.0-candidate.20261018.3.tgz`

Atom handoff, now `VERIFIED_LOCAL`:
`/home/roman/projects/stateatom/.artifacts/atom/2026-10-18T18-48-30-945Z/atom-handoff.json`

Atom SHA-256: `23a3995745e4cebbbc2715473263412036de576549799e5aa0bed265529793a9`.
Its UI tarball is byte-identical to the UI tarball above. Visual source digests
match the current template, CSS, mount and host inputs. Tarballs were built from
the working tree above `9eafb0e` with `sourceDirty: true`, explicitly recorded;
the final local commit does not retroactively rewrite that historical metadata.

Native packed-host results:
`.artifacts/atom/verification/2026-10-18T18-49-43-475Z/results.json`.
Current real observed-input screenshots (not prototype data):
`standalone-observed-inputs-960.png` and `embedding-observed-inputs-960.png`
in that result directory. Logs and the retained export control are in
`.artifacts/extension-ui/composition-20261018/`.

## Earlier pass — candidate .1 (retained evidence)

Agent-operated local verification on the dirty checkout above
`9eafb0e131ffc3abf20c16f7636c65e64760b855`. The [reference mapping](../design/extension-ui-reference-alignment.md)
records the supplied source/screens, exact values, preserved operations and
intentional differences. The supplied design's 151 checksums are unchanged.

UI package `0.2.0-candidate.20261018.1` / contract **2.0.0** and Atom package
`0.1.0-candidate.20261018.2` / API+wire **1** are separate versioned contracts.
Atom's exported metadata and peer both match the actual UI. This is a deliberate
visual compatibility change, not an automatic update of an existing consumer.

## Executed checks

Linux, Node 24.19.0, npm 11.17.0, pnpm 12.4.2, Playwright 1.63.0 and real Chromium
153.0.8010.12 with sandbox enabled. Browser plugin was absent, so the existing
MV3/VS Code native harness was used. IDE checks used the actual development
Extension Host and exact document selections, not a simulated source link.

| Actual command | Result |
| --- | --- |
| `npm test` | 511 pass, no failures/skips |
| `npm run build` | PASS, including fixtures; existing CJS import.meta warnings retained |
| `npm run build:extensions` | PASS after final host layout/CSS changes |
| `npm run check:ui` | PASS, generated files match sources |
| `node --test --test-isolation=none tests/extension-ui.test.mjs tests/atom/contract.test.mjs` | 11 focused pass after final changes |
| `UI_TAG=reference-layout-final-20261018 npm run verify:extension-ui` | 24 pass: source-reference colors/geometry, empty startup, navigation, scope isolation, native focus/labels, hover/busy/disabled, contrast, long content, 960/360 sizing, 200% CSS zoom, Unknown/Stale, reviewed export and reader |
| `HOST_UI_TAG=reference-v2-20261018 npm run verify:code-journal-ui` | 27 actual UI/IDE checks pass; inputs stable, no page exceptions |
| `npm run pack:atom` | PASS: local tarballs installed into a fresh minimal consumer; both MV3 hosts built against that installed package |
| `npm run verify:embedding` | 30 pass on the final retry: identical scoped data/evidence in standalone and embedded hosts, actual source navigation/values, reinspection/HMR, Unknown/Stale, reviewed export, no host CSS leak at 960/360, mount/dispose, storage and debugger lease controls |
| `FIRST_UI_TAG=reference-v2-20261018 npm run verify:first-read-ui` | 16 pass, inputs stable: original P1/P2, IDE, refusal/competing-writer/CSP controls, stale, interventions/Restore and fresh historical reader |
| `npm run pack:ui -- --verification-evidence=.artifacts/extension-ui/restyle-20261018/verification-evidence.json` | PASS: exact 9-file payload, repeat pack byte identity, clean offline npm/pnpm installs, actual installed CSS and SVG rendering/keyboard/narrow checks |
| `git diff --check` | PASS |

Measured contrast: primary text **6.79:1**, muted on white **5.29:1**, body on
field **17.57:1**, enabled field boundary **3.06:1**. The darker field boundary,
primary focus outline and wrapping are explicit accessibility deviations from the
reference's lighter structural border/nowrap controls. Code blocks use a light
focus outline for actions on their dark background. CSS zoom reflow is tested;
OS scaling and browser chrome zoom are not certified.

Application fixture console warnings/resource-404s and the IDE bundle's existing
import.meta warnings are retained in logs. UI showcase and clean consumers have
no relevant page errors; native workflow success does not certify every dev-server
or framework configuration. No analyzer, runtime/platform/transport, framework
support or evidence acceptance threshold was changed.

## Retained failures and review

- New palette/origin tests first failed against v1. An equivalent #fff/#ffffff
  comparison in the test was normalized without changing the desired color.
- Empty-start browser control failed on the existing invalid-tab state request;
  the UI-only guard now renders explicit unavailable/Unknown state.
- Exported Atom compatibility still pointed to v1; the new Node RED/GREEN control
  now binds actual UI contract, peer and advertised metadata.
- A real browser RED caught the general-link rule overriding inactive navigation;
  general links now precede the navigation rules.
- First packed-host run failed an old innerText whitespace assumption after values
  moved to flex columns. The final assertion requires the exact expression/value
  in the same li and a visible value element. All expected data, actual IDE ranges,
  new-occurrence checks and unsupported boundaries remain required.

Read-only independent review found one Important metadata issue and two Minor
cascade/documentation issues; all were corrected and re-reviewed. No final
Critical/Important issue remained. This is agent review, not human visual signoff.

## Final evidence and artifacts

Before images: `.artifacts/extension-ui/verification/reference-before-20261018/`.
Final shared controls/panel/reader images and result:
`.artifacts/extension-ui/verification/reference-layout-final-20261018/`.
Real source/value/IDE images:
`.runtime/react-host-ui-runs/reference-v2-20261018/`.
Real packaged-host result and images:
`.artifacts/atom/verification/2026-10-18T17-06-51-338Z/`.
Controlled first-read result:
`.runtime/first-read-ui-runs/reference-v2-20261018/`.
Logs, retained REDs and command/evidence manifest:
`.artifacts/extension-ui/restyle-20261018/`.

Final UI tarball and handoff:

- `.artifacts/extension-ui/0.2.0-candidate.20261018.1/stateport-extension-ui-0.2.0-candidate.20261018.1.tgz`
- `.artifacts/extension-ui/0.2.0-candidate.20261018.1/ui-handoff.json`

UI tarball SHA-256:
`4250262980f0863a637844ad3b108ed99bbf8cf21e40644ae6ac5ec367e88221`.
Package-input sourceTreeDigest:
`c56e5d90e3e57bc0726731ce062bd3b908d5ac28acc12a4d27adc5cfd235166d`.
The source manifest includes the original copied SVG. The tarball excludes the
prototype, test evidence, profiles and source checkout dependencies.

Final Atom tarball and verified local handoff:

- `.artifacts/atom/2026-10-18T17-05-14-461Z/stateport-atom-0.1.0-candidate.20261018.2.tgz`
- `.artifacts/atom/2026-10-18T17-05-14-461Z/atom-handoff.json`

Atom tarball SHA-256:
`0c7ddf3a5af83cc031765a59cdc2d55a05dd6447868e88ae9c288d950df5d100`.
The UI tarball consumed by both packaged hosts is byte-identical to the final UI
handoff artifact. Atom's handoff also records the visual source-file digests and
its actual 30-check verification result. The previous v1 UI artifact still has
SHA-256 `5d116a09c0a84ece88dcefefd8c11c3493cc14288c0cd37a31365d1c3db19843`.

These are candidate baselines. No human approval, complete simulated-screen port,
installed-VSIX/Store acceptance, real private StatePort Capture integration,
publication or push is claimed. Current source changes remain in the checkout.
