# Changelog

## 0.1.0-candidate.20261018.3

- Recompose the real inspector around the supplied design: selected target/value,
  compact controls, source expression, observed input rows, scoped evidence and
  progressive disclosures. Header and contextual footer stay visible as data scrolls.
- Use extension-ui 0.2.0-candidate.20261018.2 / contract 2.1.0 and its locally
  packaged Inter font. Keep browser connection, IDE setup, diagnostics and native
  experiments reachable through real shortcuts/navigation, without prototype actions.
- Retain Unknown/Stale text, source identity, exact occurrence and review/export
  controls. Source links show a short filename with full identity in the accessible
  name and tooltip; the same source range is sent to the IDE.

## 0.1.0-candidate.20261018.2

Adopt extension-ui 0.2.0 candidate / visual contract 2.0.0. Align the shared
inspector's white 440px sheet, header, typography, source block and observation
rows with the supplied reference. Keep host width/padding overrides, scoped IDs,
operations and all evidence wording. No runtime/platform/transport API change.
An empty app list renders an explicit unavailable state instead of sending an
invalid-tab state request. No runtime change.
The supplied brand SVG is preserved from extension-ui/design without relicensing.

## 0.1.0-candidate.20261018.1

Extract the existing Atom inspector into a root-scoped lifecycle mount. Preserve
its layout, evidence wording and shared extension-ui foundation. Replace global
selectors with inner-root selectors and generated IDs; the host controls container
width, padding and reader navigation. No shared token/primitive contract change.
Reference: supplied extension-ui design README/HANDOFF/SCREEN_INDEX; intentional
deviation: this remains the existing production Atom inspector, not a port of
simulated prototype screens. Screenshot candidates require human review.

## Unreleased — Action Inspector

Compact source-linked action cards, relevant hook/call disclosures and separate native
listener metadata use the supplied Actions reference and shared primitives. Optional
English local explanations remain experimental; deterministic explanations need no model.
No shared tokens or primitive contract changed.
