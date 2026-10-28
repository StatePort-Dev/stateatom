# Selector error recovery

> **For agentic workers:** Use superpowers:executing-plans inline under existing autonomous approval.

**Goal:** Replace the observed null/unsupported implementation error with a bounded, useful selector recovery message.
**Architecture:** Catch only selection lookup failures in the existing page adapter; guard absent injected results at the runtime boundary. Keep native identity and context validation unchanged. Existing status UI renders the message.
**Tech Stack:** Existing JavaScript, Node test runner, owned Chromium for source-rendered checks.
**Spec:** Remaining U04 defect in279/280; autonomous remaining release authorization.

## Global constraints
No CSS/tokens/layout/permissions changes; no extra query/evaluation or app action. Page exceptions must not disclose arbitrary text or be misclassified as definite syntax errors. Preserve valid missing-node distinction and old snapshots/context guards. Changelog required. Source-rendered evidence is not a packed/official release claim.

## Review focus
Invalid root/shadow selector, absent script results, arbitrary page exception text, cross-tab late failure, successful reinspection. Cover each in tests below; actual browser checks cover real querySelector behavior and rendered message at narrow/desktop widths.

## Task1 — source fix and affected evidence
- [x] Add `tests/browser/selection-errors.test.mjs`: execute actual adapter in isolated VM with supplied lookup; malformed root/shadow lookup produces fixed helpful text without leaking/repeating; null match distinct. Add runtime absent-result/recovery tests with existing fixture and mounted UI late-error/recovery control.
- [x] Run affected tests RED and preserve exact failure.
- [x] Change `browser-extension/adapters.js` lookup catch and `packages/atom/src/runtime.mjs` missing-result guard only; add Atom Unreleased changelog.
- [x] Run affected suites and full existing npm test once. Preserve existing identity/context tests.
- [x] Run one owned source-rendered browser check, inspect screenshots against existing reference and unchanged UI baseline; no product package/native qualification implied.
- [x] One focused read-only review, one correction pass if required, local commit and record284. Reconcile next A02 finite admission assessment; no automatic build/publication.

## Ledger

Task1 baseb3db358: corrected RED6 failures;82affected/full6043PASS. Two source-browser setup failures preserved, corrected actual10PASS at390/1100, root13px; screenshot viewed against supplied narrow reference. No packaged/native extension result. Old three closed raw SHA256 values independently match. ONE review0C/0I/1M, label wording minor deferred, no correction or repeat.
