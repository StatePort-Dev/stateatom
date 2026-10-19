# U05 follow-up — compact target controls and hover presentation

Date: 2026-10-19. Source base `0423335`, same main branch, bounded follow-up to
[U05](18-u05-visual-picker.md). Status: **implemented and verified within this bounded correction**.
The maintainer's live-demo feedback rejected the always-visible selector,
technical paragraph and six ancestor buttons, and requested tidier hover styling.
This is that presentation correction, not completion of U01 or a new redesign.
The .10 artifact, functional checks, original U05 criteria and historical report
remain intact. Human visual acceptance of the new screenshots is not presumed.

The normal target area now contains the observed text title, a short DOM kind and
one Select parent command. The raw CSS identity, full actual ancestor choices,
frame/closed-root limits and source-association caveat remain in collapsed Element
details. Picking and refusal states retain concise actionable wording. This is
progressive disclosure, not removal of missing/unsupported evidence. The existing
Property/CSS fallback and evidence/source sections retain their operations.

Select parent advances from the native controller's actual selected ancestor
index. It does not repeatedly choose the original parent, infer a component or
pick a similarly named element. The normal action stops before body/html; those
actual choices remain available explicitly in Element details. Missing index
metadata or stale evidence does not guess a parent. Empty/long text uses a short
honest fallback/title rather than exposing a long CSS selector in the heading.
No page expression, getter or skipped branch is evaluated to manufacture a label.

The native highlight uses shared primary blue with restrained content/padding
alpha, no rulers/styles/extension lines, and no expanded accessibility tooltip.
Chrome still owns the small native element label and dimensions. No application
DOM overlay, CSS injection, new permissions or event-suppression fallback was
introduced. Native hover/click identity and cancellation cleanup remain unchanged.

The first headed .10 demo screenshot showed native highlight displacement under
viewport emulation on the desktop display. A same-package forced-scale-1 control
aligned it, but reduced the UI size on the HiDPI desktop; the maintainer rejected
that demo-window size. The final headed runner instead keeps the system scale and
disables viewport emulation. The browser helper accepts an optional nullable
viewport; its default fixed automated viewport is unchanged. No browser zoom or
OS settings are changed. Actual final headed facts: **DPR 2**, no emulated viewport,
correct native highlight position, completed select/refine/Cancel and click counters.
This is a demo-launch correction, not universal DPI/emulation support for Atom.
Original displaced and forced-scale controls remain under `/tmp/stateatom-u05-live-demo/`
at `2026-10-19T16-13-21-206Z`, `2026-10-19T16-17-39-766Z` and
`2026-10-19T16-25-48-920Z`. The final system-scale run is `2026-10-19T16-29-17-382Z`.

Reference: supplied `packages/extension-ui/design/README_RU.md`,
`docs/HANDOFF_RU.md`, `design/SCREEN_INDEX.md`, `design/figma-current.json` and
`screens/atom/01-inputs.png`. The supplied principle is data/source first,
explanation on request. The same 440px header/body/footer, typography and shared
primitives remain. Only Atom-local scoped CSS changes; UI .2 and its tokens,
references and visual contract are unchanged. Select parent is a compact real
operation added to the existing target area, not a simulated new screen.

| Exact input | Value |
| --- | --- |
| Atom | `0.1.0-candidate.20261019.11` |
| Atom SHA-256 | `10f0f03045ef77ac4abe89e1018042dec8d457719f9917e439baab04c64fb683` |
| UI | `0.2.0-candidate.20261018.2` |
| UI SHA-256 | `2bfc8229a45e02f775bb563f27d9a803d51dd977145f46843c45a884e07289e5` |
| Build-source digest | `b677a6a6e6b0b943cd1f44a8d99f193e62cff6414468d9b121bff5981856af62` |
| Handoff | `.artifacts/atom/2026-10-19T16-22-55-970Z/atom-handoff.json` |

Its immutable build handoff stays `BUILT_NOT_VERIFIED`. Final bounded evidence is
separate in `u05-presentation-acceptance.json` beside it, bound to the local commit.

| Actual command/check | Result | Evidence |
| --- | --- | --- |
| Presentation RED control | Expected failure: missing presentation helper | `.artifacts/u05-polish/presentation-red.log` |
| Focused view/controller suite | 33/33 PASS, actual selected-index checks included | `.artifacts/u05-polish/presentation-final.log` |
| `npm test` | 650/650 PASS, no skips/failures | `.artifacts/u05-polish/tests-system-launch-final.log` |
| Development native picker | 16/16 PASS | `.artifacts/u05/picker-runs/2026-10-19T16-21-17-726Z/results.json` |
| `npm run pack:atom` | PASS, exact installed pair and both hosts | `.artifacts/u05-polish/pack-final.log` |
| `npm run verify:atom-types` | 2 strict packed consumers PASS | candidate `type-consumer-result.json` |
| `npm run verify:atom-package` | 7/7 installed controls PASS | `.artifacts/atom/compatibility/2026-10-19T16-23-47-594Z/result.json` |
| `npm run verify:picker` | 33/33 PASS, both exact packed hosts | `.artifacts/u05/picker-runs/2026-10-19T16-30-26-739Z/results.json` |
| `npm run demo:picker -- --smoke <handoff>` | PASS_SMOKE, three UI stages | `.artifacts/u05/demo/2026-10-19T16-30-29-966Z/demo.json` |
| Headed actual .11 demo, system DPR 2 | Hover/select, keyboard parent, Cancel and resumed click PASS | `/tmp/stateatom-u05-live-demo/2026-10-19T16-29-17-382Z/demo.json` |
| `npm run check:ui` | PASS, unchanged UI .2 bytes | `.artifacts/u05-polish/ui-final.log` |

Native checks use Chromium 153.0.8010.12, sandbox enabled, Basic without IDE/helper.
Browser plugin is unavailable; the repository Playwright MV3 harness is used.
The final picker cycle now checks the compact normal view and closed raw details,
keyboard Select parent, and explicitly opens details for advanced identity and
limitations checks. Their substantive identity/no-app-action/cleanup/refusal
criteria are retained. The original .10 Actions/IDE/ABA campaigns are credited as
historical evidence, not presented as newly run on .11; their engine/runtime/plugin
implementation is unchanged by this correction.

Final packed screenshots at 960/360 and the actual headed .11 demo were inspected against the supplied reference:
no raw selector or six-button toolbar in the first view, visible keyboard focus,
no horizontal overflow, same anchored footer and scrolling body. Final screenshots remain agent-reviewed candidates pending the maintainer's response.
The headed hover and refined inspector screenshots are `01-native-hover.png` and
`03-parent-button-refined.png` in that /tmp demo directory; the final packed
`standalone-refinement-360.png` and `embedding-refinement-360.png` are in the native
run above. The visible normal title/refinement controls were exercised, not merely
supplied by a selector harness. Both native host manifests and driver hashes match
before/after.

Scope-review-1, required L02/A05, external SDK ownership and unresolved U02/F05/U06
details stay unchanged. The one next planned item remains **U01**; this increment
does not implement its broader workflow, SDK, publication or another repository.
