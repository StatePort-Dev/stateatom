# Approved A02 writer-admission check

> **For agentic workers:** Use superpowers:executing-plans inline. Work on the existing main checkout under the user's task/verify/local-commit authorization.

**Goal:** Decide whether existing collector evidence can satisfy the approved title-lineage scenario without introducing general ownership infrastructure.
**Architecture:** Exercise the actual product collector with authored native metadata, compare same-value alias writes with observed reducer updates, and inspect the existing state/closed-first-read boundaries. No new provenance is inferred from these controls.
**Tech Stack:** Existing Node test runner and JavaScript collector, no new dependencies.
**Spec:** docs/completion/282-a02-first-release-scenario.md, explicitly approved by the user's subsequent instruction to execute remaining release work.

## Global constraints

- Preserve all old case/raw/protocol budgets and source history; no browser campaign.
- A02 remains incomplete unless full writer/transfer/commit and UI evidence is acquired.
- Source witnesses are synthetic metadata, not a native React/app qualification.
- Do not alter state, force app execution or weaken ownership predicates.

## Review focus

Same-value alias writes, changed-then-restored field writes and equal-text different rows must not become producer evidence. Observed reducer revisions may distinguish updates, but do not imply field origin. New source controls explicitly exercise these distinctions.

## Task 1 — precise feasibility result

Files: tests/engine/react19-acquisition.test.mjs; docs/completion/283-a02-title-writer-admission.md; task-index/status.

- [x] Record approval in282/index without marking A02 complete.
- [x] Add source characterization controls to the existing fixture: same-value alias write yields identical collector DTO and Unknown field origin; changed/restored alias also does; an observed replacement gets new update/result/revision IDs while unchanged second-row identity never supplies its field origin.
- [x] Run `node --test --test-isolation=none tests/engine/react19-acquisition.test.mjs tests/engine/react-state.test.mjs` (verify file existence). Controls pass on current implementation; no RED/fix claim is appropriate for correct existing Unknown behavior.
- [x] Inspect current react-state valueOrigin boundary and first-read closed-code admission; identify exactly why they do not supply ordinary writer exclusion.
- [x] Record outcome: finite implementation if supported; otherwise enforce282 stopping rule for A02 and continue an independent release item. Do not invent a new general ownership framework or demand another approval for routine work.
- [x] One scoped read-only review, preserve actual output and reviewed boundaries; local commit.

## Execution ledger

- BASE f531609. User explicitly approved282 and autonomous remaining release work; no publication inferred. Current official90/source6031 retained, no full-suite rerun for documentation/source characterization alone.

- Task1 result:35PASS, three current-source characterization controls; no implementation change or native run. Ruling corrected after ONE review0C/1I/0M: existing collector insufficiency alone does not invoke282 stopping rule. Finite bounded writer/escape-path assessment remains next A02 action; U04 is independent scheduling, not a scope waiver. No code correction or test rerun.
