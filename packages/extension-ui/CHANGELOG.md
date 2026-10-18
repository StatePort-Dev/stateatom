# Changelog

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
