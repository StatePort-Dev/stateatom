# U01 — selected-element workspace

Date: 2026-10-19. Source base `76c3107`, same main branch. Status: **complete within the bounded U01 brief**. This increment follows the approved U01 brief in
[04](04-inspector-and-experiments.md), with F01 and U05 already complete.
It does not implement U02 editing or expand the approved scope.

## Changes and credited work

The .11 compact observed title, DOM kind, actual-parent operation and collapsed
Element details are credited from [19](19-u05-picker-presentation.md). They were
not rebuilt. Current UI adds four real navigation operations: Inputs, Actions,
Data & source and Evidence. Diagnostic remains in the footer. A short result and
one next action distinguish attachment, element selection, Basic source access,
development observation, stale snapshots and unsupported observation boundaries.
Basic selection and re-inspection remain independent of IDE installation.

Data & source offers existing project connection and release-source import.
Manual generated coordinates and their preview are inside Advanced lookup.
Source maps and observed response presence do not establish the selected
property's producer or data ancestry. Compiler journals, raw evidence and
intervention JSON retain their advanced disclosures and original meanings.

Tab/property changes and invalidation notifications clear old target, source and
explanation output before asynchronous cleanup/refresh. Late tab lists retain the
current user choice; an unavailable explicitly requested tab leaves selection
empty. Action presentation keys include exact tab/run/selection/property/binding
context, including equal timestamps across tabs. Pending work cannot show OK
before all actions for that context settle. Section navigation focuses its
section rather than a hidden descendant summary.

Hosts can supply optional positive `initialTabId`. The example hosts use Chrome's
owned `openerTabId`; exact trusted inspector URLs, origin admission and permissions
are unchanged. Native verification opens the exact inspector with Chrome's tabs
API and an opener among multiple eligible apps; it does not claim a human clicked
the browser toolbar. An unknown requested tab never silently falls back to a
different application. The passive reader admits bundled fonts through
`font-src 'self'`; script-src self and connect-src none remain intact.

No engine, observation adapter, expression evaluation, causal-proof mechanism,
shared token, primitive, design reference or visual-contract version changed.
Text/Disabled remain the only supported properties. Local model validation,
Live/Draft, production change authority, QA handoff, official-host intake and SDK
delivery remain separate named tasks.

## Exact candidate

Implementation commits: `59c2a25` and the reviewed property fix `206622b`.
The .14 handoff records `59c2a25` plus its dirty .14 fix inputs at build time;
its full build-source manifest was checked against the final committed source.
Delivery metadata is bound separately after the final local documentation commit.

| Input | Value |
| --- | --- |
| Atom | `0.1.0-candidate.20261019.14` |
| Atom SHA-256 | `9d9987ddc1854e7cdd56075e204110c080c6e85aa18eccbe7ba07de962c8f2c1` |
| UI | `0.2.0-candidate.20261018.2` |
| UI SHA-256 | `2bfc8229a45e02f775bb563f27d9a803d51dd977145f46843c45a884e07289e5` |
| Build-source digest | `14b69a8cb5ff6c2bfaecece332d831353bba8a8a6b4ec39175662f9ce6ecd1d4` |
| Handoff | `.artifacts/atom/2026-10-19T16-59-43-626Z/atom-handoff.json` |

The handoff remains immutable `BUILT_NOT_VERIFIED`; a separate acceptance record
binds successful final evidence to the local commit. Candidates .12 and .13 are retained rather than replaced under their package identities.
The .13 cycle passed 660 unit, 42 two-host and 33 picker checks, but fresh review
reproduced an Important property/refresh interleaving that those native checks
did not cover. Three regressions reproduced it RED, then passed GREEN with the
.14 guard; the .14 full suite passes 663/663. The guard releases on operation
failure and retains the requested property when returning to a pending tab.
The reviewer reported no Critical/Minor findings and no declined judgments; no
second review or human-acceptance claim is inferred from the fix pass.

## Verification record

| Actual check | Result | Retained evidence |
| --- | --- | --- |
| UI context/property regressions | RED → GREEN; 26 focused checks PASS | `.artifacts/u01/review-property-red.log`, `review-property-green.log` |
| `npm test` after the review fix | 663/663 PASS; no skips | `.artifacts/u01/review-tests-full.log` |
| `npm run verify:extension-ui` | 25/25 PASS | `.artifacts/extension-ui/verification/2026-10-19T17-01-06-151Z/verification.json` |
| `npm run verify:embedding -- <handoff>` | 42/42 PASS, both exact hosts and actual IDE | `.artifacts/atom/verification/2026-10-19T17-01-41-772Z/results.json` |
| `npm run verify:actions`, standalone pointer activation | 32/32 PASS on fresh retry | `.runtime/action-runs/u01-final-standalone-retry/results.json` |
| `npm run verify:actions`, embedding keyboard activation | 32/32 PASS, same assertions | `.runtime/action-runs/u01-final-embedding-keyboard/results.json` |
| `npm run verify:production-source-mapping`, each host | 19/19 PASS per host | `.artifacts/production-source-mapping-2026-10-19T17-14-39-437Z/result.json`, `.artifacts/production-source-mapping-2026-10-19T17-14-54-341Z/result.json` |
| `npm run verify:picker -- <handoff>` | 33/33 PASS, both exact hosts | `.artifacts/u05/picker-runs/2026-10-19T17-14-52-817Z/results.json` |
| `npm run verify:atom-types` | 2 strict packed consumers PASS | `.artifacts/atom/2026-10-19T16-59-43-626Z/type-consumer-result.json` |
| `npm run verify:atom-package` | 7/7 PASS | `.artifacts/atom/compatibility/2026-10-19T16-59-50-630Z/result.json` |
| `npm run check:ui` | PASS, unchanged exact UI .2 | `.artifacts/u01/check-ui.log` |

The successful .14 checks use Chromium 153.0.8010.12 with sandbox enabled,
repository Playwright (Browser plugin unavailable), synthetic fixtures and real
VS Code Extension Host for source navigation. Both hosts use the same fixtures
and 440/360 widths for U01; additional established 960, 390 and 200% CSS zoom
controls retain their configurations. This is not browser chrome zoom or fresh
headed HiDPI acceptance. No network model download or real-model inference ran.

Initial regressions, native failures and intermediate candidates remain retained.
In .14, the first standalone Actions pointer run stopped after 29 passing checks;
an embedding pointer run stopped after four. Both timed out delivering a click
to Inspect selector. High memory/swap pressure was observed, but causation was
not isolated. The fresh standalone pointer retry passed all 32; embedding passed
the same 32 assertions using real focus/Enter on that same control. No timeout
was increased and no result assertion was removed. The keyboard result does not
prove that the intermittent pointer timeout is fixed. Original failed runs stay
in `.runtime/action-runs/u01-final-standalone/` and `u01-final-embedding/`.
The earlier isolated IDE trust-startup failure is retained in
`.artifacts/u01/embedding-final.log`; it supplies no product acceptance.
The layout driver was reconciled with .11's already-approved closed Element
details: inert advanced selector text is read with textContent, while visible
title/controls and closed disclosure are checked separately. No unavailable
observation was turned into a passing positive result.

The supplied references are `packages/extension-ui/design/README_RU.md`,
`docs/HANDOFF_RU.md`, `design/SCREEN_INDEX.md`, `design/figma-current.json`,
`screens/atom/01-inputs.png` and the Actions/Handlers screens. The 440px shared
header, source card, read-only input rows, anchored footer, typography and spacing
are retained. Deliberate Atom deviations are truthful capability/result copy,
four real task entries and Inspect again/Diagnostic instead of prototype-only
Apply/Brief operations. Historical prototype fields are not simulated as current
dependencies or editing capabilities. Screenshots are agent-operated comparison
candidates; human visual acceptance is not presumed and a second person is not
a blocker.

The original F01–F04/U05 experiments and acceptance thresholds remain historical.
This document alone proves no capability. The next bounded item after U01 is
**U02 — Live and Draft/Apply eligible-input editing**, depending on F02/U01/U05.
Its exact Live parameters remain to be designed in U02; production permission
duration/scope stays in F05 and handoff UX in U06.
