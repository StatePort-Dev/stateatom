# V02.3 successful explicit inspection state

> **For agentic workers:** Use superpowers:executing-plans inline, ONE whole bounded-parent review after actual verification.

**Goal:** remove the immediate second deep observation after successful explicit manual inspection/Inspect again, preserving evidence/identity/error/context behavior and measuring the exact new candidate.

**Architecture:** keep runtime inspection and all native guards intact. The UI's immediate state read uses an additive state-only `refreshIdentity` check when explicit inspect-selector succeeded in the same tab and selection intent: verify native DOM node/property/value without rerunning deep observation or action metadata. Error/replaced-intent recovery keeps deep refresh; ordinary refresh/invalidation/picker behavior is unchanged. This creates no cache and changes no evidence label or timestamp. Node/value replacement still marks Stale before presentation. Render-occurrence snapshots conservatively retain ordinary deep refresh; identity-only returns DEEP_REFRESH_REQUIRED and UI retries before rendering only if context is unchanged. No marker/instance guard is removed.

**Tech Stack:** existing Atom UI/Node tests, current native packaged browser harnesses; one additive boolean DTO option, no dependency or visual design changes.

**Spec:** scope-review-1,09-validation V02; diagnostic102 found state.refreshDeep=true immediately after successful inspect-selector, ~240ms median on both hosts. This does not prove every target miss's cause. Candidate .60/native history stays unchanged; changes require new .61/UI2 package (superseded by .62 after render-occurrence fallback correction) and actual acceptance. User authorized autonomous main/local commits; no publication/SDK/other repository.

## Task1 — pin exact snapshot and recovery boundaries

**Files:** modify `tests/atom/inspector-ui.test.mjs`, `packages/atom/src/ui.mjs`, runtime/transport/types, strict browser consumer; create `tests/atom/inspection-identity-refresh.test.mjs`. Reuse existing source runtime fixture, no new test framework.

- [ ] RED: for manual lookup and Inspect again, one explicit inspection followed by shallow metadata, retaining its exact native point/read time/Unknowns. A real source-runtime control counts exactly the original explicit DOM/deep-read pair rather than a third deep read. No artificial delay benchmark assertion.
- [ ] RED: failed inspection keeps deep recovery and original error; late tab/selection/property change cannot borrow the success flag; ordinary refresh/invalidation still deep, existing no-app-action/ownership tests retained.
- [ ] GREEN: track only local successful completion plus captured tab/selection intent after clearing; immediate load uses identity-only state (no deep/script/action re-observation) only if still matching. Preserve existing error/finally and tab behavior, no runtime/native guard removal or target rebinding. Node/value replacement after a snapshot still marks Stale rather than silently rebinding; explicit next inspection verifies the new node. Preserve active-window/editor/history/permission skip guards.
- [ ] Focused inspector/UI/runtime/observation checks, syntax/diff, then local commit. No CSS/tokens/sharedUI change. Update Atom changelog/package and lockfile to new .61 identity before packing.

## Task2 — qualify .61 and repeat unchanged measurements

**Files:** existing package metadata/changelog/lockfile; new numbered completion record and task-index/status/roadmap.

- [ ] Full source suite, packed strict types/admission/build on .61 and exact installed pair/both hosts. Preserve every original failure; no hiding misses behind counts.
- [ ] New .61 handoff passed to existing `basic-observer-performance-native.mjs` with unchanged fixture20GET,30 measured/3warmup blocks, three modes, all original thresholds and stricter zero-gap check. This preregistration changes only candidate identity deliberately; .60 results remain original, not overwritten. Full V02/modes/corpus stay open even if this scoped route passes.
- [ ] Actual two-host native node/value replacement identity-guard control, then request phase probe on .61 to verify immediate state.refreshDeep=false and reduced observed phase, separately diagnostic, not a target substitute. Run other changed-area native controls only for concrete context/reporter regressions exposed by affected UI handlers; no broad P04 redo.
- [ ] Compare raw distributions/identities and any remaining target misses. No workload scaling, warmup tuning, denominator swap or unapproved waiver.
- [ ] ONE fresh-context whole V02.3 review, one material correction pass at most with RED/GREEN and relevant suite. Commit results/dependencies and name ONE next bounded unresolved item;19/29 remains until actual whole-task acceptance.

Review Focus: only a successful same-intent snapshot can skip redundant deep work; failures/context changes must not borrow success. Identity-only state retains exact evidence, stale/unknown semantics and permission/capability/native DOM checks; no live/current claim is introduced. Native package and unchanged measurement thresholds are separate from source tests; target misses stay open.

Preregistered correction before .62 measurements: .61 Basic plain-DOM timing improved but whole-parent acceptance is pending because source inspection exposed a render-marker guard omitted by identity-only DOM equality. Keep marked/render snapshots on the existing full deep path, with a same-load-generation UI retry. Test missing-refusal/retry RED→GREEN and late-tab suppression. Preserve all .61 artifacts/measurements as scoped historical data, mint .62 and repeat exact qualification/measurement; do not rebuild .61 under its old name.
