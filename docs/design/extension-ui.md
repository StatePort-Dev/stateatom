# Shared extension UI

`@stateport/extension-ui` lives in `packages/extension-ui`. It is a local package
candidate, consumed by Atom's panel and passive diagnostic reader. The root stays
private. No registry publication, npm scope ownership, Store release or successful
Capture integration is asserted.

## Ownership and boundary

### Required reference for subsequent work

The supplied [design folder](../../packages/extension-ui/design/README_RU.md) is
the required basis for further extension-ui development: documents, source
references, screenshots, test artifacts and related materials must inform future
changes. Start with [handoff and priority](../../packages/extension-ui/design/docs/HANDOFF_RU.md),
the [screen/source map](../../packages/extension-ui/design/design/SCREEN_INDEX.md)
and [visual comparison notes](../../packages/extension-ui/design/docs/VISUAL_REFERENCE_NOTES.md).
Use the local `design/figma-current.json` for recorded Figma entry points rather
than stale names in older notes. A local manifest is not fresh verification of
the live Figma file. Preserve supplied materials; document any necessary
deviation and its reason instead of creating an independent replacement design.

This is a prototype/reference set, not the production extension. Its simulated
Capture receipts, API edits and test artifacts do not establish real Capture or
Atom engine behavior. The present candidate aligns the shared native primitives and actual Atom
composition with this reference; it does not port simulated business logic or
claim to match every reference screen. Future reconciliation still goes
through the Git token/contract/changelog/consumer-verification procedure below.
Reference materials stay in the repository and are excluded from the CSS tarball.

The reference set was supplied by the user: 152 files, including its original
`CHECKSUMS.sha256`; all 151 listed file digests matched before adding it to Git.
The supplied files and notices are preserved byte-for-byte. The shared package's
Apache-2.0 notice covers its new implementation; importing this reference set
does not relicense historical material or turn its old test results into a fresh
production verification.

StatePort maintainers own the design and public UI contract. External changes
require PR/review. No CODEOWNERS file existed when this library was introduced;
this task creates no GitHub teams, rights or organization settings.

Git tokens are build inputs. Figma is a design tool, not a runtime dependency or
an automatic source-code update. No new Figma file is required. This library owns
the extension visual base only: native controls, labels/help/errors, surfaces and
neutral status presentation. Atom and Capture retain page widths, layouts,
business wording and evidence-status meaning. Desktop, website, replay and
orchestration are outside this contract.

## Public contract

Load exports in this order:

1. `@stateport/extension-ui/tokens.css`
2. `@stateport/extension-ui/fonts.css` (optional, used by Atom for consistent Inter)
3. `@stateport/extension-ui/components.css`

Read `@stateport/extension-ui/contract.json` for UI contract version `2.1.0`.
Package candidate `0.2.0-candidate.20261018.2` is independent of that version.
The only supported scope/theme/density is `[data-sp-ui]` / light / comfortable;
omitted theme/density attributes select these defaults. Unsupported theme/density
values have no defined behavior. Token and primitive prefixes are `--sp-` / `sp-`.

Within the scope, native `button`, `input`, `select`, `textarea`, `label`,
`fieldset`, `legend`, `summary` and links receive shared presentation. Dynamic
Atom source-navigation buttons therefore use the same implementation. Opt-in
classes include `sp-button-primary`, `sp-icon-button`, `sp-panel`, `sp-section`,
`sp-help`, `sp-error` and `sp-status`; `sp-button`, `sp-input`, `sp-label` also
name the corresponding primitives. There are no runtime JS wrappers or framework
dependencies. Importing styles cannot grant an action authority or change an
evidence claim.

Keep native labels; give icon buttons an accessible name. Associate help/error
text with `aria-describedby`; errors need explicit text and `aria-invalid`.
`aria-busy="true"` adds a dashed boundary/progress cursor, and the consumer must
retain visible busy wording. Set native `disabled` when activation must be
blocked. CSS does not implement disabling. Status text and live-region roles
belong to the consumer. Color never distinguishes Observed/Unknown/Stale.

Ordinary rules are scoped and there is no global reset. Optional `fonts.css`
registers the unique StatePort Inter family and reads the installed local WOFF2;
it has no host selector and uses no remote font service.
Adjacent content is unaffected. This is not Shadow DOM isolation from host-authored
rules. Consumers must avoid overriding shared primitives with conflicting rules.

## Values and explicit accessibility changes

The original v1 Capture base is retained in the historical changelog. V2 uses
values directly from the supplied `design/source/style.css` and `extension.css`:
white canvas/surface, `#17191f` text, `#646c7a` muted, `#e5e8ee` structural lines,
`#0b5cff` primary / `#084ed8` hover, 13px body, 12px controls, 7px buttons,
6px fields, 34px actions, 28px icon buttons and compact 10px neutral status text.
Expression surfaces use `#171f30` / `#e0e8f8`, with `#b4c3da` source text.
Optional `fonts.css` serves the unmodified Inter Variable locally, under its
original OFL 1.1 license; the distinct family name avoids changing the host.
Keep `assets/fonts/InterVariable.woff2` relative to the copied font CSS and carry
its license/provenance. The supplied system code-font fallback is retained. All library geometry and
colors are semantic tokens, generated from JSON.

Shared brand/title/section headings, toolbar/navigation, code blocks and data rows
extend the primitive set. `assets/stateport-mark.svg` is an unchanged copy of the
supplied artwork and an explicit package export. Atom inlines the same artwork
so embedded hosts need no asset URL resolution or Chrome-specific image access.
The artwork origin is retained in notices without relicensing the supplied set.

The visual contract is bumped to 2.0.0 because defaults and token values change.
No v1 artifact is overwritten. Atom's own composition now follows a 440px sheet,
StatePort/Atom header, source-expression block and observed-value rows; its host
can still override width/padding. Actual controls and evidence wording remain.
Prototype-only Capture, editable state/props and draft/delivery UI are not added.

Accessibility deviations from the reference remain explicit: interactive
boundaries use its darker `#8c94a2` subtle gray to reach at least 3:1 on white,
focus uses a 2px primary outline, long labels/buttons wrap and statuses keep their
textual meanings. Busy/error affordances retain visible text and border shape.
See [reference alignment](extension-ui-reference-alignment.md) for scope and QA.

## Build and local development

Keep the repository's Node 24.19.0 and npm 11.17.0. No new package manager or UI
framework is introduced. The standalone generator uses Node's standard library
and needs neither install nor fixtures:

```sh
npm run build:ui
npm run check:ui
# Equivalently, from packages/extension-ui:
npm run build
npm run check
```

`tokens/tokens.json` is the sole value source; `styles/components.css` refers to
tokens. `scripts/build.mjs` writes deterministic `dist/tokens.css` and
`dist/components.css`; never edit generated files. Standalone `npm pack` runs
the package's prepack build. The packed library deliberately contains only
generated CSS, the supplied brand SVG, contract, package metadata, README, changelog, LICENSE and NOTICE.
Source generation/showcase files remain in Git, not in the tarball.

Root `npm install` links the file dependency recorded in package-lock.json.
Atom `npm run build:extensions` builds the UI and resolves its exports, then
copies them beside panel and reader. Both independently usable outputs include
the UI license/notice in `extension-ui-licenses/`. No engine, Chrome API, IDE or
Desktop dependency is pulled into the package.

Open `packages/extension-ui/showcase/index.html` after building for all common
states and adjacent native host controls. To verify:

```sh
npm test
npm run build
UI_TAG=<unique> npm run verify:extension-ui
BROWSER_TAG=<unique> npm run verify:browser
HOST_UI_TAG=<unique> npm run verify:code-journal-ui
```

The UI harness records real sandboxed Chromium at 960×900 and 360×900, checks
keyboard focus/disabled skipping, labels, help/error, hover, text/boundary contrast,
long content and every computed property of adjacent host controls with and
without shared CSS. CSS zoom 200% at 720×900 exercises reflow; it is not an OS
scaling or browser-chrome zoom certification. Browser/IDE workflows separately
test selection, source navigation, freshness and reviewed save/export into a
fresh reader. First screenshot baselines are candidates for human review.

## Immutable local handoff

```sh
npm run pack:ui
# To include existing executed Atom/UI results in the handoff:
npm run pack:ui -- --verification-evidence=/absolute/path/verification-evidence.json
```

This builds/checks UI, runs `npm pack --json --ignore-scripts` on the standalone
package, checks an exact payload allowlist, compares two tarball hashes and
installs the tarball offline into fresh `/tmp` consumers using npm and available
pnpm. Export resolution must stay beneath each consumer's installed node_modules.
Real Chromium renders copied installed styles with keyboard/viewport checks;
only files in that clean consumer's public directory may be requested.

Outputs are `.artifacts/extension-ui/<packageVersion>/<package-tarball>` and
`ui-handoff.json` beside it, excluded from Git and the tarball. A candidate
directory cannot be overwritten; after handing off different bytes, increment
the candidate version and update the lockfile/changelog. Do not reuse a version
for changed bytes.

The optional evidence file contains a `checks` array with actual `command`,
`status`, evidence path and result details; it is caller-supplied run evidence,
not generated by package preparation. Without it, the command list records only
the packaging/consumer checks actually executed by the pack script.

The handoff records package/contract versions, sourceCommit, explicit sourceDirty,
artifactFile/SHA-256, exports, commands and actual consumer results. Its
`sourceTreeDigest` is SHA-256 of UTF-8 `JSON.stringify(sourceManifest)`, where
`sourceManifest` is an array of `[package-relative POSIX path, SHA-256 of exact
file bytes]` sorted by path. It includes all files in tokens/, styles/, scripts/, assets/
plus package.json, contract.json, LICENSE, NOTICE, README.md and CHANGELOG.md.
This identifies package generation and payload inputs, including dirty bytes;
it does not identify the whole Atom consumer. Generated dist, showcase, tests,
profiles, screenshots and handoff are excluded. The separate artifact digest
identifies the packed bytes without a cyclic hash.

## StatePort consumer update

Transfer both files. Check the tarball SHA-256 against handoff; confirm package
version and compatible uiContractVersion. In the separately authorized StatePort
checkout, install the exact tarball (replace the path with the transferred file):

```sh
npm install --save-exact /absolute/path/stateport-extension-ui-0.2.0-candidate.20261018.2.tgz
# For a pnpm consumer:
pnpm add --save-exact /absolute/path/stateport-extension-ui-0.2.0-candidate.20261018.2.tgz
```

Bundle/copy both CSS exports; scope the intended UI with data-sp-ui, and remove
conflicting shared styles while retaining Capture layout and business behavior.
Review keyboard, labels, contrast, busy/disabled states, long translations,
responsive sizing and real Capture workflows before merging. The clean minimal
consumer check is not a real Capture verification. This task does not modify
StatePort or publish anything.

Breaking exports, tokens, selectors, supported states or scope/theme/density
require an incompatible contract version. Every visual change, however small,
gets a changelog entry and refreshed candidate screenshots. Automated consumer
updates may prepare reviewable PRs; they must not update production unchecked.


## Composition correction after visual feedback

The first v2 pass matched palette and some primitives but retained too much of
the earlier form-based layout. The current `.2` candidate adds shared header,
scroll body, footer, section rows, compact section navigation, native disclosure,
icon and read-only value primitives. Atom puts the target and source/values first,
folds setup and detailed explanations, and keeps contextual actions visible.
Its height follows the host container, capped at the viewport; standalone host
CSS supplies the definite height. Navigation scrolls only the inspector. The
prototype's editing/draft controls are not copied onto read-only observations.

## Atom editing restoration — 2026-10-28

The selected element stays above four mounted screens. Dependencies presents exact
recorded reads, with source navigation, and one separately scoped page-value editor.
The editor defaults to live native-control changes; Apply remains available for
held drafts and grouped changes. Last-read values live inside row details instead
of repeating the editable value. Exact duplicate source records are grouped across
properties; distinct locations are retained. Optional action explanations are folded.

Compared with `design/screens/atom/01-inputs.png`, the white sheet, Inter/system
hierarchy, dark expression, blue links, neutral values and disclosure rhythm are
retained. The deliberate differences follow user feedback: one element above tabs,
no global property selector, one editable value per row, and editing controls only
for actual runtime writers. The prototype's editable arbitrary state/API dependencies
are not implemented by assigning an unrelated page control to a recorded read.
No shared tokens or primitive contract changed. Screenshots remain agent-reviewed
candidates, not human acceptance.

Local checks used source UI/runtime/transport/platform bundles with candidate 90's
retained static assets in `/tmp/stateatom-dependencies/extension`, not a repackaged
release. Native React/VS Code evidence is in
`/tmp/stateatom-polish/native-1793206799783`: exact source navigation, all four
360px screens, live input effect on a real React button, Undo, drafts across tabs,
and no selected-header disappearance during edits. HTTPS synthetic-host evidence
is `/tmp/stateatom-polish/production-1793206656331/result.json`; two confirmations
still precede editing. The controlled DOM/ledger UI run exercised eight cases in
`.artifacts/u02/input-fields-ui/2026-10-28T16-50-42-828Z`.
