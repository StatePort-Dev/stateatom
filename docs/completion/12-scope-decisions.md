# Scope approval record

**28 October supplement to decision 26:** explicit maintainer agreement accepts the current measured Active overhead for release; [decision and limits](281-active-overhead-maintainer-acceptance.md). No new universal threshold, fresh measurement or whole-task acceptance is implied.

**Scope revision:** `scope-review-1`. This record reflects the maintainer's item-by-item scope decisions, not new repository inspection or executed tests. The [approved contract](02-release-scope.md) is normative for delivery; the [audit](01-current-state-audit.md) and evidence register remain the original revision-specific record.

## Decisions

| Question | Topic | Decision | Meaning |
| --- | --- | --- | --- |
| 1 | C01 | Required | Basic without IDE, Desktop or account; select, inspect, save, reopen and export. |
| 2 | C02 | Required | An ordinary supported dev project, not only fixtures or a research launcher. |
| 3 | C03 | Required | Supported property expression, relevant observed inputs and a readable explanation. |
| 4 | C04 | Required | Application handlers and relevant hook relations, separate from observed execution. |
| 5 | C05 | Required with addition | Both Live and Draft/Apply; Live for most inputs in the declared editable scope; undo and baseline return. |
| 6 | C06 | Required | Production source-connected workflow with matching private/local artifacts, without mandatory IDE or generated coordinates. |
| 7 | C07 | Required; UX unresolved | Develop a convenient reporter-to-developer journey separately; technical export alone is insufficient. |
| 8 | C08 | Required | One public Atom engine/UI, shared UI foundation and the same tested package in the official host. |
| 9 | C09 | Required | Universal Basic plus positive React/Vue cases. Deeper other-framework adapters are not a baseline gate. |
| 10 | C10 | Required | Reproducible distribution, checked updates and rollback, and matching release evidence. |
| 11 | O01 | Required delivery; optional use | Implement and validate local AI. No model/account/API-key requirement for ordinary inspection; fallback does not complete AI delivery. |
| 12 | O02 | Required | Observe actual handler execution and separately established consequences for bounded supported interactions. |
| 13 | O03 / S01 | Outside Atom | Production SDK belongs to the wider StatePort project; not an Atom implementation or release task. |
| 14 | Production policy | Required with addition | Read-only by default; users can disable it in Settings after two sequential warnings and confirmations. |
| 15 | Automatic bug fix | Excluded | Atom does not automatically generate and apply source-code fixes as a baseline feature. |
| 16 | Whole-app graph | Excluded | No application-wide graph is required; local selected-element investigation remains in scope. |
| 17 | Effort estimate | Excluded | No automatic hours/story-point estimate; evidence for team discussion remains useful. |
| 18 | Cloud backend | Excluded | No separate Atom cloud service; local export, corporate artifacts and StatePort integration remain. |
| 19 | UI-framework rewrite | Excluded | Keep the current UI foundation; implement the approved design without a compulsory framework migration. |
| 20 | React positive coverage | Required | Ordinary-session text/conditions/form/query-state/refetch/re-render cases outside the controlled first read. |
| 21 | Vue real-library case | Required | At least one positive property/data path through a real library used by an independent application. |
| 22 | Production minimum | Required | Native and one supported framework handler mapping in minified builds, including element selection rather than manual coordinates. |
| 23 | Independent applications | Required | At least two independent apps, one non-React, with preregistered useful answers and a held-out structural control. |
| 24 | Independent human participant | Not required | Clean installation and real UI acceptance may be agent-operated; do not call that an independent human study. |
| 25 | Result latency | Required target | Basic p95 ≤ 1 second; warm source/action p95 ≤ 3 seconds. Deviations need explicit maintainer agreement. |
| 26 | Application overhead | Required target | Active-observation median workload degradation ≤ 10%; keep distributions/tails; deviations need agreement. |
| 27 | Snapshot default | Accepted for current scope | Snapshot with explicit reinspection; continuous observation of every value is not required. Live editing remains mandatory. |
| 28 | Intermediate public releases | Permitted | Narrower previews may ship with clear limits; they neither complete nor shrink full scope. Each publication still needs authorization. |

**Supplement before question 24 — C11:** visual page-element selection is mandatory. The original U01 assumed a selected target but did not specify a complete picker UX. U05 now owns hover outline/label, actual click target, nested refinement, cancel/reselect and supported no-app-action behavior. This was an explicit addition, not evidence that the old task already covered it.

## Changes to the implementation plan

- C01–C10 stay mandatory; C11 is added. O01/O02 retain their identifiers but are promoted to mandatory delivery. User activation of the model remains optional.
- U02 now includes Live and grouped Draft/Apply, undo-last and baseline return. Normal Live updates must not require an Apply-equivalent click.
- F05 is a new task for two-confirmation production enablement and its runtime policy. Production reporting and source access do not activate it.
- U06 is a new UX task before completion of the QA/PM handoff. The user approved its purpose, not an unexamined screen flow.
- U05 is the new visual-picker task. U04/V03 and source/action paths include actual picker acceptance.
- A05 and L02 are mandatory. Inadequate execution evidence or an unavailable real model may block their completion, but does not prevent a clearly narrower preview.
- S01 moves out of Atom's active task list into a non-gating external StatePort reference. The existing open **development** plugin/helper remains mandatory under C02.
- V03 checks clean installation, real UI and independent applications. It no longer requires recruiting another person. Agent-operated acceptance is labelled as such.
- Approved performance targets require explicit agreement for exceptions. Merely recording a missed target does not waive it.

There are **29 active work items** after removing S01 and adding F05, U05 and U06. These are plan identifiers, not automatically created GitHub issues.

## Implementation details still to resolve

The following were not settled by the yes/no review. Resolve them in their owning tasks, rather than presenting a new choice as already approved:

| Detail | Owner | Fixed constraint |
| --- | --- | --- |
| Live input catalogue, majority coverage denominator and edit timing | U02 | Most inputs in the declared scope; no Apply for normal Live edits; valid values, visible consumption and undo |
| Production enablement scope/lifetime, navigation and restart policy | F05 | Read-only initially; two Settings warnings/confirmations; no accidental cross-target grant or unsafe auto-resume |
| Reporter/recipient information architecture and handoff steps | U06 | Useful QA/PM-to-developer workflow, local/passive sharing and preserved evidence |
| Interaction details beyond the supplied picker/design reference | U05/U04 | Direct visual selection, refinement, cancel, exact instance and supported no-app-action behavior |
| Exact supported versions, devices and platform labels per candidate | F03/V03/L02 | Verify real routes; do not infer support from package presence or a model mock |

No new AI account, cloud service, privileged diagnostic endpoint or framework rewrite is authorized by these choices. Source maps do not become execution history; Live edits do not become continuous monitoring or causal proof.

## Using this revision

Replace the earlier proposed completion documents and reconcile local task changes instead of restarting development. Update active tasks that still describe L02/A05 as optional, S01 as Atom-owned, production mutation as impossible, or independent people as a release blocker. Do not rewrite previous test outcomes or append fabricated approvals to historical artifacts.

The maintainer permitted intermediate public releases in principle. Publishing a specific candidate, changing another repository or modifying account/Store settings still requires the corresponding explicit task authority.
