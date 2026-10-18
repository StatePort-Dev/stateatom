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
Atom engine behavior. The present candidate implements the minimal visual base
from `01-stateatom-shared-extension-ui.md`; it does not claim to have ported every
screen or to match all reference screens. Future reconciliation still goes
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
2. `@stateport/extension-ui/components.css`

Read `@stateport/extension-ui/contract.json` for UI contract version `1.0.0`.
Package candidate `0.1.0-candidate.20261018.1` is independent of that version.
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

Rules are scoped; there are no global resets, external fonts or asset requests.
Adjacent content is unaffected. This is not Shadow DOM isolation from host-authored
rules. Consumers must avoid overriding shared primitives with conflicting rules.

## Values and explicit accessibility changes

The task supplies the Capture base: Inter/system stack, 14px/1.5 body, text
`#0f172a`, muted `#64748b`, canvas `#f8fafc`, white surface, structural border
`#cbd5e1`, the supplied oklch primary/hover, 6px controls, 8px/12px padding and
0.5 native disabled opacity. Inter is used only if present locally.

Additional geometry comes from the existing Atom panel: 12px small text, weight
600 emphasis, 10px panels with 20px padding, 4/8/12px spacing, 1px borders and
2px focus outline/offset. Existing Atom's 24/18/14px headings, 960px page width,
source rows, dialog/backdrop and responsive composition remain consumer rules.
No private Capture implementation or external icon/font asset was copied.

Accessibility changes are explicit in the package changelog:

- Enabled control boundaries reuse supplied muted `#64748b`, because structural
  `#cbd5e1` on white measured 1.48:1. The new boundary measures 4.76:1; structural
  panel borders retain the original color.
- Focus covers textareas and links too. Buttons/labels wrap long text; busy/error
  affordances include text and border shape. Panel header wraps at narrow sizes.
- Reader adopts shared 14px/1.5 body instead of its prior 16px/1.55; its own
  heading sizes and reader layout remain local.

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
generated CSS, contract, package metadata, README, changelog, LICENSE and NOTICE.
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
file bytes]` sorted by path. It includes all files in tokens/, styles/, scripts/
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
npm install --save-exact /absolute/path/stateport-extension-ui-0.1.0-candidate.20261018.1.tgz
# For a pnpm consumer:
pnpm add --save-exact /absolute/path/stateport-extension-ui-0.1.0-candidate.20261018.1.tgz
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
