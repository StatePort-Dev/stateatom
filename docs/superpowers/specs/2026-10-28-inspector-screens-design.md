# Inspector screens and first-use UX

User request: replace the long inspector with distinct screens, audit UX/design,
and implement improvements for beginners while preserving expert utility.
User clarified that these are screens inside the extension, not browser windows.
Implementation choices are delegated by the request to perform the audit and changes.

Use four genuine tab panels: Inputs, Actions, Data & source, Evidence. Keep one
mounted inspector and the same selected tab/property so drafts, owners and evidence
remain intact. Never reattach, run observations, or change permissions on navigation.
Keep navigation visible, support arrow/Home/End keys and accessible relationships.
Programmatic links must reveal the destination screen and disclosure before focus.

Move browser connection above inspection. Start with choosing a page and connecting;
explain the next selection step. Hide editing machinery until there is a selection;
read-only users get a plain explanation and optional advanced editing disclosure.
Keep exact unknown/stale/source/observed distinctions. Move source setup and response
experiments into Data & source; diagnostics, raw records and trace into Evidence.
Keep advanced permissions and manual pairing collapsed. Do not change runtime,
permissions, package versions, published host or retained packages.

Reference: extension-ui/design README_RU.md, docs/HANDOFF_RU.md,
design/SCREEN_INDEX.md, screens/atom/01-inputs.png and 10-narrow-inputs.png.
Preserve 440px sheet, Inter, white surfaces, blue primary, existing brand and controls.
Document intentional deviations for navigation, onboarding and readable help.

Compared approaches: anchor links (current; overwhelm and lose navigation); separate
browser windows (rejected by user); mounted tab panels (selected). Do not remount on
switch: private draft loss and ownership cleanup would be a regression.

Checks: unit navigation/reveal tests, affected inspector/input tests, UI contract,
browser desktop/narrow/keyboard checks, real standalone extension smoke. Preview
transport is synthetic and cannot establish native inspection or novice usability.
