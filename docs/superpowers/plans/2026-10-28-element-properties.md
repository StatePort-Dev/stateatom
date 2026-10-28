# Element properties Implementation Plan

> Execute inline with superpowers:executing-plans; one independent final review.

**Goal:** Show text and applicable native disabled state together for one selected element.
**Architecture:** Add an opt-in element result bundle to the existing request/state contract.
Keep the legacy primary property for explicitly scoped editor/experiment compatibility;
never flip it to collect the other result. Acquire secondary results with the existing
native identity and observation helpers, then bind each analysis to its own selection.
One shared UI/editor/actions view renders property sections and grouped report evidence.
**Tech Stack:** Existing vanilla JS, shared scoped CSS, Node tests, native Chromium harness.
**Spec:** ../specs/2026-10-28-element-properties-design.md

## Constraints

Same branch and preserve earlier owned UI work. No source engine/probe changes or
re-evaluation of user expressions. Separate acquisition times and stale/unsupported
results remain explicit. No publication or official-host intake. Use supplied reference.

## Review focus

Node replacement between observations; secondary value changing while primary stays equal;
missing/unsupported disabled acquisition; invalidation after input edits; nested report
redaction and mixed evidence; legacy clients without elementProperties opt-in.

## Tasks

- [x] Add bounded property-bundle acquisition/projection and RED→GREEN tests for exact
  node guards, applicability, independent analysis, no primary property mutation and stale.
- [x] Integrate optional elementProperties requests into runtime acquisition, state refresh,
  lifecycle expiry/invalidation, diagnostic save and types. Existing clients keep behavior.
  Add runtime integration controls for both values, one-property invalidation and replacement.
- [x] Add shared property-result renderer; move experiment-specific property selection into
  Advanced response experiments. Render both results and grouped Evidence without duplicate
  editors or source/action ownership. Preserve fallback for older single-property hosts.
- [x] Retain optional scoped property records in diagnostics and passive reader, validating
  nested records and removing all optional excerpts on export omission. Verify parser/tests.
- [x] Run affected tests, build source runtime/UI into isolated extension, native multi-property
  checks, controlled source-linked renderer checks, narrow/keyboard/draft cases. Independent
  review and fixes, changelog/audit, local commit of scoped work, open final native demo.

## Interfaces

`collectElementProperties({selection,analysis,identify,observe,resolve,isCurrent,now})`
returns `{schemaVersion:1,properties:[{property,status,selection?,analysis?,reason?}]}`.
`elementPropertyRows(state)` projects only matching current or explicitly stale rows.
Requests opt in with `elementProperties:true` on inspect-selector/pick/refine-pick.
Runtime state exposes `elementInspection`; stale state retains historical values with
source analyses removed. Diagnostics retain sanitized property records under
`runtime.elementProperties`; legacy primary target remains explicit and unchanged.

## Ledger

Approved by user: implement then launch/show. Previous UI edits are owned by this task
history; shared checkout has no unrelated modified files at plan start. Root docs and
reference requirements inherited and source contracts reread. No automatic worktree switch.

Ruling: keep the existing legacy experiment/editor primary identity, but fall back to
Text when that explicit Disabled outcome is inapplicable to a newly selected element.
This avoids silently switching properties for collection and keeps ordinary selection
available. A legacy host without opt-in results retains its existing primary rendering.

Final review: four concrete issues reproduced and fixed with regression controls;
report tab/run/page mismatches are also rejected. Full suite 6245 PASS; native 19 PASS;
controlled editor 8 scenarios PASS; final renderer 79 checks plus scoped renderer tests
PASS. Evidence and exact paths are recorded in docs/design/2026-10-28-inspector-ux-audit.md.
Source bundle and demo use /tmp/stateatom-element-properties; immutable intake is intact.
