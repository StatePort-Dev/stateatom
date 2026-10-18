# Extension UI reference alignment — 2026-10-18

The user requested visual alignment of the shared library with its supplied design,
with the same changes applied immediately to Atom. This is an implementation of
that existing design, not a new concept or a port of simulated product features.

## Reference and scope

Read `packages/extension-ui/design/README_RU.md`, `docs/HANDOFF_RU.md`,
`design/SCREEN_INDEX.md`, source/style.css and source/extension.css. The compared
images are screens/atom/01-inputs.png, 10-narrow-inputs.png and
screens/extension/01-capture-ready.png. The supplied reference set is immutable;
its original checksums remain the origin record. Figma entry points remain in its
local manifest; no live Figma modification/verification is claimed.

The current Atom implementation is the shared `packages/atom/src/` mount, used
by both the standalone browser extension and an independent embedded host. Work
belongs there, not in the obsolete browser panel layout. Runtime, platform,
transport, analyzer, data sources and framework support are outside this change.

## Reference mapping

| Reference | Shared extension UI | Actual Atom |
| --- | --- | --- |
| White/graphite/blue base | #fff surface, #17191f text, #646c7a muted, #e5e8ee lines, #0b5cff primary/#084ed8 hover | Same exported tokens |
| Inter/system and code typography | 13px body; 12px controls; 11px help/code; 10px neutral status; system mono fallback | Locally bundled unmodified Inter Variable + OFL; system mono fallback |
| 34px rounded actions | 7px button / 6px input radius; 7px/11px padding; 28px icon button | Existing native actions preserved |
| Brand and product bar | Shared brand/mark/title classes and unchanged supplied SVG export | Inline same SVG; StatePort/Atom header, actual Basic/Source-linked/Instrumented mode |
| Dark source expression | sp-code and sp-code-location with #171f30 / #e0e8f8 | Actual code-linked locations and expressions; real Open in IDE |
| Compact input rows | sp-data-row and section headings | Actual read-only observed-value rows; unknown remains unknown |
| 440px inspector sheet | Library owns no page width | Atom default 440px, responsive inner padding, host width/padding overrides retained |

Token values are maintained only in tokens/tokens.json. New layout families are
scoped under data-sp-ui; Atom composition remains scoped under data-atom-root.
No global reset, account dependency or private Capture implementation is added.

## Deliberate differences and accessibility

The reference includes simulated writable inputs, Capture, response draft editors,
Summary and a Free receipt. Atom does not gain these operations through styling.
There are no pretend Capture tabs, Free entitlement badges, Apply/draft controls,
or fabricated values. Actual selection, browser connection, source navigation,
observations, experiments, diagnostic review/export and reader remain available.
All evidence wording is retained and limits stay visible. Sources and observed
values precede the detailed evidence-boundary descriptions; advanced details
remain native disclosures. Connection controls are native disclosures after the data. Inputs/Evidence/Diagnostics
are actual in-panel navigation, not simulated Response/History tabs. The short
source name retains its full file/range in the accessible name and tooltip.

Interactive boundaries use the reference's darker #8c94a2 subtle gray to meet
>=3:1 on white instead of its low-contrast structural border. Focus uses a 2px
primary outline; labels and long buttons wrap; native disabled stays at 0.5.
Neutral status text, not color, carries evidence meaning. No faux confidence
scale is introduced. Inter is packaged locally; system mono rasterization can still differ.

Visual QA also found an existing empty-start error: mount requested state with no
valid local tab. The UI now renders the explicit unavailable view instead of
sending that invalid request. A native browser RED/GREEN control retains this
case; runtime and debugger lifecycle are unchanged.

## Versioning and verification

UI candidate `0.2.0-candidate.20261018.1` uses contract `2.0.0`: the defaults and
token values change incompatibly, while existing names are retained. Atom
candidate `0.1.0-candidate.20261018.2` pins the new peer. The previous tarballs,
handoffs and screenshots remain unchanged. Every visual change is in changelogs.

The flow under test is showcase/native controls and real Atom selection → source
and observed data → Stale/reinspection → reviewed export → passive reader.
Use `npm test`, `npm run build`, `npm run verify:extension-ui`, affected IDE
workflows, then package and verify the independent embedded consumer. Native
checks run sequentially when they share app/IDE ports. Browser plugin is absent;
the existing sandboxed Playwright MV3/VS Code harness is used.

New results and before/after images are retained under
`.artifacts/extension-ui/restyle-20261018/` and unique UI run directories. The
initial current-source UI baseline is `verification/reference-before-20261018/`.
Human visual acceptance, arbitrary browser/OS scaling and actual StatePort
Capture integration remain separate. No publication or push is authorized.

## Review and retained controls

Read-only review found stale Atom compatibility metadata and a navigation cascade
conflict. A Node contract RED/GREEN test now binds the exported Atom contract,
peer and actual UI contract/version. A real Chromium RED/GREEN check covers muted
inactive navigation links and the current location. The exported payload inventory
also names the SVG. The empty-app startup control failed before its UI-only fix.

The first packed-host run retained a FAIL because `innerText` inserts a newline
between the new expression/value flex columns. Tests now assert the exact pair in
the same li and require its value code element to be visible; expected values,
source navigation and fresh occurrence criteria are unchanged. This is an updated
presentation assertion, not a relaxed provenance criterion.


## Composition correction — candidate .2 / contract 2.1.0

Maintainer feedback correctly identified that the first v2 pass still looked like
a stack of setup forms. Functional QA below did not establish visual fidelity.
The correction uses the runnable `design/index.html` panel at 1440×960 (440px panel)
in addition to the supplied screenshots. No original design file was edited.

| Previous mismatch | Current implementation |
| --- | --- |
| Setup precedes data; source starts near y=631 at 440×900 | Selected target/value first; expression near y=300; setup is disclosed below |
| Font stack names Inter but no file is available | Optional namespaced local Inter Variable, pinned official revision, unchanged OFL asset |
| Long top forms and a generic heading | Compact target heading/value, property selection and section navigation |
| Plain source path and generic Open button | Filename/line source link, supplied external icon, explicit Code-linked label; exact original source object |
| Values scattered across plain text lines | Aligned mono names and neutral read-only value chips using shared primitives |
| Actions scroll away in a tall document | Fixed header/product rail and contextual footer; only the body scrolls |
| Whole-page details stack | Compact evidence summary with full scope text and advanced controls in native disclosures |

There are no editable boolean toggles, Apply/draft states, pretend Capture controls,
or invented ancestry. Those prototype operations need their real implementations.
The property selector and navigation labels reflect supported Atom operations.
The selected title uses short recorded button text when available, otherwise the
recorded selector; it never fabricates a component name. Snapshot time and Not live
are visible beside the anchored actions, rather than pushing the source downward.
The standalone host sets viewport height; embedded containers set their own height.
Button types prevent accidental submission of a surrounding host form.
