# Inspector screens implementation plan

> Execute inline; preserve unrelated concurrent engine changes. One independent final review.

**Goal:** Separate inspector screens and make first use actionable without hiding expert evidence.
**Architecture:** One mounted view; local section navigation owns only visibility/focus. Existing client and evidence lifecycle remain unchanged.
**Tech Stack:** Existing vanilla JS, scoped Atom CSS, shared extension-ui tokens, Node tests and browser checks.
**Spec:** ../specs/2026-10-28-inspector-screens-design.md

## Constraints and review focus

No runtime/permission changes; no package/release claims. Keep drafts mounted; reveal
cross-screen destinations; preserve selected screen on refresh; no hidden focusable
panels; no narrow horizontal overflow. Preserve parallel engine changes.

## Tasks

- [x] Add failing section navigation tests for exclusivity, keyboard, prefix IDs,
  cross-screen reveal and draft preservation; run node --test tests/atom/section-navigation.test.mjs.
- [x] Add packages/atom/src/section-navigation.mjs, integrate ui.mjs and template.mjs.
  Move existing source/evidence tools into their matching panels. Add first-use help
  and progressive disclosure. Update atom.css and Atom CHANGELOG.
- [x] Run affected inspector/input tests and check:ui. Capture before/after source UI,
  test desktop and 360px navigation, keyboard/focus and context preservation.
- [x] Build source extension, run native smoke, open updated local UI for user.
  Record audit findings, deviations, actual checks and limits; final independent review.

## Ledger

- Baseline f2b726e; concurrent engine changes excluded.
- Confirmed original navigation only scrolls; disconnected view exposes disabled input
  editing/Undo and connection below all sections. Browser audit uses actual source UI
  with labelled synthetic transport at 127.0.0.1:4179; native verification separate.

- Maintainer correction: remove duplicate large selection button and its explanation;
  preserve toolbar picker. Added targeted regression and native check.
- Independent review: two UI regressions corrected; legacy helper disclosure path
  corrected. 16 native checks PASS, targeted tests PASS, check:ui PASS.
- Full suite 6139/6141; two concurrent compiler recipe digest failures, left intact.
- Detailed audit: docs/design/2026-10-28-inspector-ux-audit.md.


### Follow-through: core Atom value

- [x] Review full workflow independently, not only individual complaints.
- [x] Bring existing expressions/observed values to the first level.
- [x] Keep Basic honest and hide inactive editing machinery.
- [x] Preserve draft visibility, permissions, source/evidence boundaries.
- [x] Check real native Basic and controlled supported/editor renderers separately.
- [x] Record reference deviations, fresh screenshots and verification limits in audit.


### Maintainer-requested five fix-review passes

- [x] Shared selected element above tabs; bounded context and independent screen scroll.
- [x] Compact context and readable long recorded values; 360px/short-window review.
- [x] Target-scoped scroll without screen/draft loss; same-target refresh control.
- [x] Empty/stale/partial Actions, history retention and source-options navigation.
- [x] Connection/picker feedback, focus and expanded ARIA; independent final review.

Final:167 behavior +4 shared UI checks, native24, synthetic renderer16 and controlled
editor8 PASS; check:ui/diff check PASS. Native cancellation wait and preview favicon
setup failures retained in audit. No official package or engine mutation.
