# StateAtom completion plan

**Reviewed source:** `f3a7a7e1ba43bea4e39954eaf49b95266822692b`  
**Review date:** 2026-10-19  
**Scope revision:** `scope-review-1` — approved through the maintainer Q&A; see [decisions](12-scope-decisions.md).  
**Purpose:** turn the existing implementation into a supported, independently useful inspector and a reliable component of the official StatePort extension.

This is a delivery plan, not a new architecture or a release announcement. It reuses the public Atom runtime, inspector, design library, source-map implementation, IDE helper and test harnesses. Completed work is not assigned again.

The audit distinguishes implementation read in this revision, results recorded by the repository, and the hosted CI result for this exact commit. No native browser, IDE or local-model test was rerun for this document package. See [the audit](01-current-state-audit.md).

## Read and execute

1. Read [release scope](02-release-scope.md) and [current gaps](01-current-state-audit.md).
2. Reuse the [scope-adoption reconciliation](13-scope-reconciliation.md) and
   [completed F01 execution](14-f01-capability-contracts.md). Source exploration
   and canonical policy/packed declarations are credited, not reassigned. The
   single next item is **F02: real site/project origin policy**; it is not started
   by the F01 execution. Current implementation remains on the original dev
   origins plus host-opted-in read-only HTTPS.
3. Continue with **F02/F03**, **U05 visual selection** and **U01/U02** for ordinary projects, the normal inspector and Live/Draft editing. **U06** develops the QA/PM handoff before U03 finishes it; **F05** provides deliberate production enablement. In parallel, a maintainer can inspect the official host's consumed package versions under **I01**; integrating incompatible in-flight public contracts must wait for F01/F04.
4. Develop the remaining analysis and production capabilities through their named cases. Keep the existing closed first-read profile as a separately labelled regression.
5. Run the release matrix on one immutable candidate, then decide the distribution milestone. A green unit/build job alone is not a release gate.

Each work item contains its inputs, output, files, tests and stopping point. An engineer should implement one such item, run the listed checks, retain failures, and report the result before starting a dependent item. Technical choices within the specified boundary do not need repeated approval. Publication and changes to another repository remain separately authorized actions.

## Documents

| Document | Purpose |
| --- | --- |
| [01 — Current-state audit](01-current-state-audit.md) | What exists, what the reports prove, and the remaining product gaps |
| [02 — Release scope](02-release-scope.md) | Approved completion contract and mandatory feature-to-task coverage |
| [03 — Runtime, project setup and packages](03-runtime-and-onboarding.md) | Capabilities, real projects, open helper/plugin installation, type and artifact contracts |
| [04 — Inspector experience and experiments](04-inspector-and-experiments.md) | Shared design, direct interaction, safe input changes and readable handoff |
| [05 — Analysis, handlers and hooks](05-analysis-and-actions.md) | Ordinary React coverage, state lineage, positive Vue support and bounded action observation |
| [06 — Production and source maps](06-production-and-source-maps.md) | Element-to-source anchors, release bundles, corporate acquisition and production evidence |
| [07 — Local explanations](07-local-explanations.md) | Required local-AI delivery, optional user activation and deterministic fallback |
| [08 — Official StatePort integration](08-stateport-integration.md) | Paired package intake, debugger ownership, shared UI and one official distribution |
| [09 — Validation and release](09-validation-and-release.md) | CI, native tests, performance, privacy and release evidence |
| [10 — SDK ownership and later extensions](10-later-sdk-and-extension-points.md) | Production SDK belongs to StatePort; later Atom scope stays separate |
| [11 — Design acceptance map](11-design-acceptance-map.md) | Each reference screen tied to real runtime states and task ownership |
| [12 — Approved decisions](12-scope-decisions.md) | Item-by-item decisions, changes and details still to design |
| [13 — Current reconciliation](13-scope-reconciliation.md) | Completed increment, credited implementation, scoped checks and next item |
| [14 — F01 execution](14-f01-capability-contracts.md) | Canonical policy, packed declarations, exact checks and remaining boundaries |
| [15 — F02 execution](15-f02-origin-connections.md) | Exact connections, explicit development actions and permission invalidation |
| [16 — F03 execution](16-f03-installed-project-setup.md) | Installed normal-project setup, retained first-read failure and remaining acceptance |
| [Task index](task-index.json) | 29 active work items, dependency graph, owners and separate external SDK reference |
| [Evidence register](audit-evidence.json) | Pinned sources and the limits of this review |

## Milestones

Intermediate public previews are allowed, not an instruction to publish them automatically. These milestones sequence work; only M3 represents the full approved baseline.

| Milestone | Required result | Work items |
| --- | --- | --- |
| M1 — Everyday developer preview | Ordinary project setup, real visual picker, supported React source/values/handlers, Live/Draft editing and usable local records | F01–F04, U01/U02/U05, A01/A03, L01, applicable V/I tasks |
| M2 — Production/source-connected preview | Useful element/action source mapping without IDE; developed QA/PM handoff; default read-only and deliberately enabled supported changes | P01–P04, U06/U03, F05 and applicable V/I tasks |
| M3 — Completed approved baseline | All C01–C11 and O01/O02: positive Vue and ordinary state/query coverage, real Action Trace, validated local AI with model-free operation, same official product and clean automated/native acceptance | All 29 active items in task-index.json; no independent-human recruitment gate |
| Outside Atom | Production SDK belongs to the wider StatePort project; deeper additional frameworks and whole-app histories need separate scope | External S01 reference only; no dependency on M1–M3 |

A failed mandatory feature can remain absent in a labelled preview, not disappear from M3. A model-free fallback on an unsupported device is normal; a model-free-only implementation does not complete O01. C07's detailed UX still needs U06. Performance misses need explicit maintainer agreement.

## Working rules

- Preserve public source ownership: the analyzer and Atom UI do not move into a private resolver. The official host supplies resources, not analysis results.
- Use the existing `packages/extension-ui/design/` reference and Git token contract. Do not copy its simulated behavior into the product.
- Do not restart the UI-library or embedding extraction. Both exist. Update and verify them.
- Do not require a fresh npm install, full historical experiment sweep, or repository restructuring for every small change. Run the relevant regression slice; run the immutable release suite at its gate.
- Retain the distinction between code links, observed occurrences, controlled effects and missing information. Unknown is valid output but does not count as a positive feature result.
- Do not run two agents against the same mutable files. Parallel tracks need isolated worktrees and agreed contract boundaries; browser/IDE harnesses sharing ports run sequentially.
- Keep reports concise: changed behavior, exact revision and configuration, commands, results, limitations and the next task. Put raw private profiles outside public docs.

## Adoption in the repository

Adopted locally at `docs/completion/` and linked from `ROADMAP.md`; see the
[reconciliation](13-scope-reconciliation.md). Active dependencies exclude S01 and
require A05/L02. Historical checkpoints, feature specifications, the original
audit and evidence register are preserved. `partially-implemented` in the task
index credits an existing slice while leaving the named item's full acceptance
open; dependencies still gate its remaining work. `planned` does not mean that
all reusable underlying code is absent. No full work item is newly accepted just
because this document package was adopted.
