# @stateport/extension-ui

Local candidate shared CSS for native HTML extension interfaces. No registry
publication or ownership of the npm scope is asserted. StatePort maintainers own
the design and public contract; external contributions require PR/review.

Further work must use the supplied repository reference set at
`packages/extension-ui/design/`: start with `README_RU.md`, `docs/HANDOFF_RU.md`,
`design/SCREEN_INDEX.md` and `design/figma-current.json`, then consult the relevant
source, screens and artifacts. Preserve references and document deviations. The
set is a UX prototype and historical evidence, not production capability proof.
It is kept in the source repository and is intentionally excluded from this CSS
package. The current minimal candidate does not claim a complete screen port.

Load `@stateport/extension-ui/tokens.css` followed by
`@stateport/extension-ui/components.css` through your bundler, or copy their
resolved export files into your extension. Wrap the interface in
`<div data-sp-ui data-sp-theme="light" data-sp-density="comfortable">`.
The only supported theme/density is light/comfortable (also the defaults).
For consistent reference typography, also load `@stateport/extension-ui/fonts.css`.
Its optional `@font-face` registers only the distinct `StatePort Inter` family;
it does not redefine host fonts. When copying files, preserve the relative asset
path `assets/fonts/InterVariable.woff2` next to that CSS. The font export resolves
to `@stateport/extension-ui/assets/fonts/InterVariable.woff2`. Preserve the included
OFL license and provenance under `assets/fonts/`. All font requests are local;
no CDN or font service is used. Without this opt-in, the system stack still works.

Native buttons, fields, labels, fieldsets and focus states work within the scope,
including dynamically inserted controls. Classes `sp-button-primary`,
`sp-icon-button`, `sp-help`, `sp-error`, `sp-panel`, `sp-section` and `sp-status`
are opt-in. Label every field and icon button. Connect help/error with
`aria-describedby`, set `aria-invalid` on invalid fields, and include explicit
error/status text. Status is neutral; consumers own its meaning and announcements.
Use `aria-busy="true"` with visible busy text; add native `disabled` when actions
must be blocked. CSS alone cannot prevent activation.

```html
<div data-sp-ui>
  <section class="sp-panel" aria-label="Connection">
    <label for="origin">App origin</label>
    <input id="origin" aria-describedby="origin-help">
    <p id="origin-help" class="sp-help">Use an explicitly authorized local app.</p>
    <button class="sp-button-primary">Connect</button>
    <p class="sp-status" role="status">Disconnected</p>
  </section>
</div>
```

No popup width, inspector layout, evidence semantics, engine or Chrome API is
included. Adjacent host content outside the scope is unaffected; this is CSS
scoping, not Shadow DOM protection against a host's own CSS.

Sources: `tokens/tokens.json` is the sole value source. Run `npm run build` from
this package with Node 24; no install, fixture build or dependencies are needed.
`npm run check` detects generated drift. Generated `dist/*.css` must not be
edited. `npm pack` rebuilds and includes only exported assets, this documentation,
contract, changelog, license and notice. Showcase/tests/build sources are not
distributed. Repository showcase: `showcase/index.html` after a standalone build.

Contract `2.1.0` is in `@stateport/extension-ui/contract.json`. Breaking selector,
export, scope, state or token changes require an incompatible contract version.
Every visual change requires a changelog entry and consumer visual verification.
Pin the candidate package version and review its handoff/hash before updating a
consumer; automated updates may prepare PRs, never update production unchecked.
First screenshots are candidates for review, not human-approved designs.

The v2 visual base follows the supplied reference: white/graphite/blue palette,
13px body, 12px controls, 34px buttons, compact neutral statuses, code surfaces
and data rows. Additional primitives are `sp-brand`, `sp-brandmark`, `sp-title`,
`sp-section-title`, `sp-code`, `sp-code-location`, `sp-data-row`, `sp-toolbar`,
`sp-nav` and `sp-button-subtle`. The unchanged supplied brand artwork is exported
as `@stateport/extension-ui/assets/stateport-mark.svg`; preserve its origin.
V2 changes default geometry and token values and requires deliberate consumer
upgrades; the earlier v1 candidate remains unchanged.


Inspector composition primitives mirror the supplied reference: `sp-extension-header`,
`sp-extension-body`, `sp-extension-footer`, `sp-section-row`, `sp-subnav`,
`sp-disclosure`, `sp-value`, `sp-icon` and `sp-button-secondary`. The consumer
owns the flex column and its bounded height. Labels, values and navigation remain
native HTML; styles never make a read-only value editable. The repository showcase
includes a synthetic example alongside the isolated native controls.
