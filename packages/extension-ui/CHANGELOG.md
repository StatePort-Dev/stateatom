# Changelog

## 0.2.0-candidate.20261018.2 — UI contract 2.1.0

- Add reusable header/body/footer, compact section navigation, read-only value,
  section-row, native disclosure and reference icon primitives.
- Add optional local Inter Variable registration in a distinct StatePort Inter
  family. Carry the unchanged OFL font, license, pinned revision and digests;
  no network font service or global selector is introduced.
- Match the reference condition surface #171f30, #e0e8f8 text and #b4c3da source.
- Expose the composition in Atom: selected element and value first, then compact
  property selection, source expression and observed rows. Move connection/setup
  into native disclosures and anchor reinspection/diagnostics at the bottom.
- Keep full source identity in accessible names/tooltips; navigate through the
  exact original source object. No runtime evidence or editable input is inferred.

## 0.2.0-candidate.20261018.1 — UI contract 2.0.0

- Align the visual base with supplied design/source/style.css and extension.css:
  white canvas, graphite #17191f text, muted #646c7a, structural #e5e8ee border,
  #0b5cff primary and #084ed8 hover, 13px body, 12px controls, 7px buttons,
  6px fields, 34px actions, compact neutral statuses and 28px icon buttons.
- Add shared brand/title/section heading, toolbar/navigation, code surface and
  data-row primitives, plus an exported unchanged supplied StatePort brand SVG.
- Incompatible visual contract: default typography, geometry and existing token
  values change. No names are silently removed. Consumers must opt into v2.
- Retain accessible focus and >=3:1 interactive boundaries using the reference
  subtle gray #8c94a2; the reference's light structural border is not used as
  the sole input boundary. Status meaning remains explicit consumer text.
- Atom uses the same primitives for a compact StatePort/Atom header, source
  expression surface, observed-value rows, diagnostics and reader. No simulated
  Capture, editors or writable state/props controls are introduced.

## 0.1.0-candidate.20261018.1 — UI contract 1.0.0

- First local candidate; no registry release.
- Subsequent UI work must follow the supplied repository `design/` reference
  set (documents, source, screenshots and artifacts); it is not shipped in the
  CSS tarball and its prototype evidence does not certify production behavior.
- Shared supplied Capture base palette, Inter/system stack, 14px/1.5 text,
  6px controls, 8px/12px padding and 0.5 disabled opacity.
- Additional geometry from the existing Atom panel: 10px panels, 20px panel
  padding, 12px small text, 600 emphasis, 4/8/12px spacing and 1px borders.
- Accessibility changes: a shared 2px focus outline with 2px offset now covers
  textareas and links too; labels/controls wrap long text; errors and busy states
  use text plus border shape. No evidence-status color mapping is introduced.
- Enabled controls reuse the supplied muted `#64748b` for their boundary instead
  of the supplied structural border `#cbd5e1`: the original boundary measured
  1.48:1 against white; the corrected boundary exceeds 3:1. Panel borders retain
  the base structural color. This is an explicit accessibility correction.
- Atom reader now follows the shared 14px/1.5 base instead of its local 16px/1.55.
  Atom keeps its own page widths, toolbar, source rows, dialog and headings.
