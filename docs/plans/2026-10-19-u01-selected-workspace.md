# U01 selected-element workspace implementation plan

> For agentic workers: use superpowers:executing-plans for inline execution.

**Goal:** complete the remaining U01 normal inspector flow without adding U02 editing or new provenance claims.
**Architecture:** reuse the 440px Atom composition, validated inspection view, existing source-map and project operations, exact trusted extension entrypoints and passive reader. Both hosts consume the same package.
**Tech stack:** existing JavaScript, Node tests and repository Playwright MV3 harness.
**Spec:** docs/completion/04-inspector-and-experiments.md, U01; approved scope-review-1.

## Global constraints

- Stay on current main; local commit only. Existing U05 selection, compact title/parent and historical results count as completed work.
- Preserve evidence gates, snapshot semantics, Text/Disabled, UI peer/tokens, trusted URL checks and JavaScript execution semantics.
- No new design, SDK, external repository, publication, Live parameters or production permission decisions.
- Browser plugin is unavailable; use the repository Playwright native extension harness. Screenshots are agent-operated candidates, not human acceptance.

## Review Focus

- Late tab-list, state, property and model responses must not restore a different context.
- A missing requested host tab must not silently select an unrelated application or inspector.
- Helpful summary/source copy must not upgrade registered handlers, skipped operands, response presence or manual maps into causality.
- Reader fonts must load while script/network restrictions remain intact.
- Source entrypoints and advanced lookup remain usable by keyboard at narrow width and system scale.

### Task 1: Complete and verify U01

**Files:** packages/atom/src/{ui,template,action-ui,source-map-ui}.mjs, packages/atom/types/ui.d.ts, browser-extension/{inspection-view.mjs,panel.js,worker.js,reader.html}, examples/embedding-host/{inspect.js,worker.js}, focused Node/native tests, completion status and changelog.

**Interfaces:** initialTabId is an optional positive integer supplied by a host; it is admitted only from the runtime tab list. Presentation consumes existing validated records only. Clearing context invalidates pending presentation work before cleanup awaits.

- [x] RED: add regressions for pending picker cancellation, late tab refresh, property output clearing, equal-timestamp action contexts and missing host context; assert summary/source guidance and passive reader CSP.
  Run: node --test --test-isolation=none tests/atom/inspector-ui.test.mjs
  Expected: failures demonstrating current gaps.
- [x] GREEN: add four task entrypoints, concise result/next action, source guidance and advanced generated lookup; synchronous context clearing, host opener context and reader font-src self. Do not change runtime evidence or evaluation.
  Run: node --test --test-isolation=none tests/atom/inspector-ui.test.mjs tests/inspection-view.test.mjs
  Expected: all pass, historical evidence assertions preserved.
- [x] Add a current native U01 flow to existing embedding verification for both immutable hosts: selected opener, four real entrypoints, skipped operands, unexecuted handler/model absent, stale HMR, no editable input, imported historical reader/font/CSP, narrow/keyboard views. Reuse actual U05 native suite for selection/refinement.
  Run: npm test; npm run check:ui; npm run pack:atom; npm run verify:atom-types; npm run verify:atom-package; npm run verify:embedding; npm run verify:picker
  Expected: all pass for the final candidate; source/CI/native/agent visuals are reported separately. Adjust affected source-map driver to open advanced lookup.
- [x] Record exact package identity, configuration, fresh checks, historical credits and unverified boundaries; complete only U01 and select U02 next. Local commit; one fresh final review and one focused fix pass if necessary.
  Run: git diff --check
  Expected: clean.

**Commit:** feat(atom): complete selected-element inspector workspace

## Execution evidence

Final candidate .14 and scoped results are recorded in
[20-u01-selected-workspace](../completion/20-u01-selected-workspace.md).
One fresh reviewer found an Important concurrent property/refresh race; three
regressions failed before the guard fix, then passed, with 663/663 full-suite checks.
No Critical/Minor findings or declined judgments remained. Actions preserves all
32 assertions; successful standalone uses pointer activation and embedding uses
real keyboard activation. Original pointer timeout runs remain failed evidence,
not a claimed fix. Existing engine experiments retain their historical status.

Run: python3 .artifacts/u01/verify-evidence.py
Expected: exact final package/build source and all ten successful evidence records
match their retained hashes before the acceptance record is bound to delivery.
