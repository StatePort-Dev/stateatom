# Shared extension UI candidate verification — 2026-10-18

This is agent-operated local verification of `@stateport/extension-ui`
`0.1.0-candidate.20261018.1`, UI contract `1.0.0`, in the dirty StateAtom checkout
above `0660a6afd8d37a789f96446fc666b0f646f4d631`. The checkout was initially based
on `2958d2b`; the separate repository relocation was committed as `0660a6a` during
this work. Existing work was preserved. Verification and local packaging preceded
the user's subsequent instruction to commit this work together with the design.
The tarball/handoff retain that original dirty-source provenance; a later source
commit does not rewrite their history. No branch switch, push, registry
publication, release or main StatePort change was made.

The [contract/workflow](../design/extension-ui.md) describes the implementation,
accessibility changes and required supplied design references for future work.
This minimal candidate does not claim to port every screen in that reference set.

## Environment and checks

Linux, Node 24.19.0, npm 11.17.0, pnpm 12.4.2, Playwright 1.63.0, real Chromium
153.0.8010.12 with sandbox enabled. Browser plugin was not available; the existing
Playwright MV3/VS Code harness was used. IDE checks used the real VS Code
development Extension Host and actual source selection, not an installed VSIX.

| Actual command | Result and boundary |
| --- | --- |
| `npm run build:ui` / `npm run check:ui` | PASS; also copied package build inputs to a fresh `/tmp` source-only directory and ran build/check without node_modules or fixtures |
| `npm test` | 493 pass, 0 fail/skip; includes new exports, deterministic generation, drift detection and selector-scope controls |
| `npm run build` | PASS; browser, IDE, standalone reader and fixtures |
| `npm run build:extensions` | PASS; package exports copied into Atom and licenses retained |
| `UI_TAG=shared-ui-workflows-20261018 npm run verify:extension-ui` | 22 checks pass; actual showcase, native extension panel, diagnostic export and offline reader |
| `BROWSER_TAG=extension-ui-20261018 npm run verify:browser` | 26 checks pass; browser-only DOM inspection/Unknown, local interventions, rollback, save/review/export, restart persistence, hostile data as inert text, delete and offline reader |
| `HOST_UI_TAG=extension-ui-20261018 npm run verify:code-journal-ui` | 27 checks pass; actual React/IDE navigation, observations, reinspection, code-journal Stale/Unknown, reviewed exports and fresh reader; source/build inputs stable |
| `FIRST_UI_TAG=extension-ui-stable-20261018 npm run verify:first-read-ui` | 16 checks pass; original P1/P2, actual IDE ranges, competing producer/CSP refusals, Stale, controlled interventions/Restore and historical reader; inputs stable |
| `npm run pack:ui -- --verification-evidence=.artifacts/extension-ui/work/verification-evidence.json` | PASS; exact 8-file payload, repeated npm-pack byte identity, clean offline npm and pnpm installs, real Chromium consumer rendering/keyboard/narrow sizing |
| `git diff --check` | PASS |

Before the subsequently requested source/design commit, the two shared-UI tests
and the supplied design's model suites were run together: 43 passed, no failures
or skips. Generated CSS check passed again. This reruns the prototype models,
not its historical browser suites; original reference artifacts remain unchanged.

UI checks cover 960×900 and 360×900, long button/label wrapping, focus-visible,
disabled controls skipped by Tab, busy wording/border, native labels/help/errors,
hover, adjacent-host computed-style identity, actual selected Unknown and Stale
states, 360px export-dialog actions, and imported diagnostic reader. At 720×900,
200% CSS zoom checks reflow; OS scaling/browser-chrome zoom is not certified.
The supplied structural border gave 1.48:1 on white; interactive control boundaries
were explicitly corrected to the supplied muted token (4.76:1). Muted text on
canvas measured 4.55:1. Shared styles never encode evidence status as color.

The IDE application console retains fixture resource-404 and HMR websocket-denial
messages. No page exceptions or panel errors were observed. HMR is not certified
by the passing workflow. No engine, lifecycle, source-data or framework-support
change was made. Existing Unknown/Unsupported boundaries remain explicit.

## Retained attempts

The initial focused RED confirmed the absent package/generator. The first UI run
failed control-boundary contrast and was retained; the documented token reuse
fixed it. One full-page screenshot attempt retained blank offscreen tiles after
resize/keyboard scroll; later captures wait for committed paint and were visually
inspected. Earlier images remain retained rather than presented as final baselines.

The first first-read run passed its 16 UI assertions but failed its integrity
gate because the new `tests/integration/extension-ui.mjs` was extended while that
harness hashed the whole integration directory. Only that test file differed.
It remains a FAIL at `.runtime/first-read-ui-runs/extension-ui-20261018/`.
The separate `extension-ui-stable-20261018` rerun passed with stable inputs.
No assertion or acceptance threshold was weakened.

Read-only independent review and its packaging addendum found no Critical or
Important issue. Its minor failed-pack recovery finding was corrected: candidate
assembly is staged and promoted only after checks, preserving existing outputs.

## Artifacts and provenance

Final tarball:
`.artifacts/extension-ui/0.1.0-candidate.20261018.1/stateport-extension-ui-0.1.0-candidate.20261018.1.tgz`

Handoff:
`.artifacts/extension-ui/0.1.0-candidate.20261018.1/ui-handoff.json`

Tarball SHA-256:
`5d116a09c0a84ece88dcefefd8c11c3493cc14288c0cd37a31365d1c3db19843`

Package-input sourceTreeDigest:
`09ea726512ea31362c95d12f34722de360367bc0772105de7df9f39cbcce03ea`

The handoff has the sorted package-relative source manifest and documented digest
algorithm, explicit sourceDirty=true, exact exports and verification commands,
caller-supplied Atom run evidence, actual npm/pnpm clean-consumer results and the
required future design-reference location. The package contains generated CSS,
contract, package metadata, README/changelog, Apache license and original notice.
It contains no prototype `design/`, source captures, node_modules, profiles, test
artifacts or handoff. Source digest and tarball SHA were independently recomputed;
packed CSS matches Atom browser/reader and both installed consumers byte-for-byte.

Final candidate screenshots and UI result:
`.artifacts/extension-ui/verification/shared-ui-workflows-20261018/`

This includes `showcase-960.png`, `showcase-360.png`, `showcase-zoom-200.png`,
`atom-selected-960.png`, `atom-selected-360.png`, `atom-stale-360.png`,
`atom-export-dialog-360.png`, `atom-imported-reader-960.png` and
`atom-imported-reader-360.png`. These are real candidate baselines, not
human-approved designs. The versioned artifact directory also retains clean
npm/pnpm consumer screenshots/results. Private work logs and initial-change
protection records remain under `.artifacts/extension-ui/work/`.

Actual Capture integration, independent human usability, Store/release and
publication remain unverified/out of scope. Use the exact consumer commands in
the [design workflow](../design/extension-ui.md#stateport-consumer-update) only in
a separately authorized StatePort change.
