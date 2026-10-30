# Simple inspector entry — 2026-10-30

Follow-up to 361, base revision `27408ee`. The user explicitly rejected making
IDE setup part of the starting workflow. The intended route is open Atom, select
an element, read the result. Source access is optional and contextual.

## Change

- Toolbar keeps the existing picker and Settings icons. No Connect IDE button
  or source-connection banner occupies the first viewport.
- The existing selection CTA remains the starting action. A Basic property
  bundle offers page fields or recorded details; single-property Basic also
  opens Details instead of asking for IDE pairing.
- Connect IDE lives in Source. The contextual action inside the dependency
  explanation opens that section, focuses the same button and starts the same
  confirmation request directly. Cancellation and status are next to it.
- Existing IDE approval, exact identity refresh, draft preservation, timeout and
  context guards are unchanged. Opening the inspector does not contact the IDE.
- No token/primitives change or new design system. Header, Inter typography,
  tabs, spacing and native controls retain the supplied extension-ui references
  (`README_RU.md`, `docs/HANDOFF_RU.md`, `design/SCREEN_INDEX.md`). This explicitly
  supersedes 361's added toolbar action, not its pairing implementation/evidence.

## Checks

`node --test --test-isolation=none tests/atom/inspector-ui.test.mjs
 tests/atom/element-properties-ui.test.mjs tests/atom/production-ui.test.mjs
 tests/atom/project-connect.test.mjs` — **141 passed, 0 failed, 0 skipped**.
Covers Basic Details navigation without pairing, placement inside Source,
one-click pairing, unchanged native target refresh, cancellation, late replies,
tab changes, drafts and production permission behavior.

`npm run update:extension` succeeded, updating the existing `dist/browser`.
`git diff --check` passed. Helper code and the StatePort repository are unchanged.
No new install folder, push, publication or release requalification.

The actual mounted UI was rendered in Chrome on a separate HTTP fixture at
360×780 and 440×780. Start and first Basic result show no Connect IDE action;
opening dependency details exposes the contextual action. Enter starts it,
Source becomes visible with focus on Cancel connection, and Enter cancels while
leaving inspection usable. Temporary viewport override was reset.

Artifacts: `.artifacts/ui/2026-10-30-simple-inspector-entry/` contains
`start-360.png`, `result-360.png`, `source-pending-440.png`, scoped logs and the
browser build identity/checksums in `verification.json`. The fixture uses the
real UI with synthetic state and an inert helper request: screenshots are visual
candidates, not actual installed Chrome/VS Code pairing proof. That acceptance
remains pending; no denied extension-page automation was attempted.
