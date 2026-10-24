# Actual browser and report entry implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans inline. No implementer agents; ONE fresh final whole-increment reviewer.

**Goal:** Execute actual toolbar inspector launch and native report file selection,
closing the two explicit entry-assistance gaps without repeating completed app work.

**Architecture:** One bounded owned-browser script clones accepted private installed
state, observes native toolbar input, then operates real inspector/reader controls.
Reuse existing native transport/desktop; product and package bytes unchanged.

**Tech Stack:** Current Linux/Chromium153/Xephyr/xdotool/CDP; exact70/UI2 and actual
V03.12 report; no new dependency or app server.

**Spec:** ../specs/2026-10-24-v03-native-entry-design.md

## Global Constraints

- Main19e3638, local commits, no branch/push/release/SDK/redesign/other repo.
- Original profile/report/old cases immutable; explicit cloned installed state,
  not fresh install. Exclude stale endpoint/locks, reject symlink clone inputs.
- Own display/child profiles/task-local XDG only; no user profile/global changes.
- No direct panel/reader creation/navigation, private action/import API, synthetic
  click or DOM file injection supplies native entry.
- 327 unchanged product inputs/kit/archive/installed identities verified; no build,
  full2616/source/codec/Vue/app repeat without an actual new source change.
- Historical FAILs/Unknown/full-baseline gates stay open; no human blocker/count upgrade.

## Review Focus

- Cloned state is identified as a copy of the accepted UI installation, not new installation proof; original bytes stay immutable and stale endpoints/locks are excluded.
- Toolbar and reader targets arise from actual bounded native actions, with no hidden direct navigation/private API/file injection.
- Browser/display ownership, callback/start failures, sessions and cleanup are explicit; no application debugger target is attached.
- Exact report content/identity and passive authority/network boundaries survive actual native import.
- Environment isolation and observed UI/privacy are scoped; no clean-OS/human/full-guide/fullV03 claims are inferred.

### Task 1: Execute the two native entry controls

**Files:** tests/integration/guide-entry-native.mjs,
docs/testing/guide-entry-case.json, record126/spec/plan/current routing. Reuse
scripts/native-browser.mjs and existing desktop without changing their defaults.

**Interface:** registered case pins accepted source result/profile regular-file
snapshot, exact report/kit/browser/helper hashes. Driver writes operator-request
with screenshot hash; one phase-matched X11 action file supplies only a point in
its owned toolbar. Reader interaction uses real visible controls and native chooser.

- [x] Capture normalized regular-file snapshot of accepted recipient profile; clone roots only and verify original/copy equality, no stale endpoint/locks/symlinks.
- [x] Implement bounded entry driver/owned cleanup and proof collection; syntax/identity checks. No product tests/builds or implementation-mirroring unit tests for orchestration.
- [x] Register exact case/driver/helper/guide/report/profile identities and new entry questions; commit before actual browser execution.
- [x] Run node tests/integration/guide-entry-native.mjs docs/testing/guide-entry-case.json. Expected: own live handle waits for agent's screenshot-grounded toolbar point, actual new inspector/reader targets, native file selection/exact historical payload, unchanged authority/no HTTP, original bytes intact/owned cleanup. Never restart a live handle on observation timeout.
- [x] Inspect native toolbar/inspector/chooser/reader screenshots and actual logs/results; retain any failure and explicit remaining assistance without a whole-guide/count claim.
- [x] ONE final fresh whole-increment review19e3638..head, at most one verified correction pass/no re-review.
- [x] Final scoped aggregate/metadata/corpus/local commit/clean tree; one next dependency-valid item, goal active until declared boundary.

Completion aggregate: `node .artifacts/v03/guide-entry/2026-10-24/verify-native.mjs`
(read-only recorded-result checks, no browser relaunch). Corrected actual case is
`docs/testing/guide-entry-case-environment-observation.json`; first case FAIL retained.

ONE review2Important fixed in one pass: desktop acquisition/close and final input
read-failure recording. Nine extracted-source synthetic controls PASS; native
evidence remains b794fb5, no product/suite/build/native repeat or re-review.
