# V02.39 — exact90 isolated changed-UI evidence and release path

28 October 2026. Atom producer `69b8d86f6316544611bfd83f53d9bf921c79157d`, archive SHA256 `46b4d4d86461634a40ca28ff71a87def2be32b9d912d2d432fd7c2921a6451f6`, unchanged UI2. Tested repository snapshot `51d6752250a5d1dc273492b99a93355bfce98dc0`. Official host remains `711968a4e8821ca200d5c8967e1d149736b3d6df` / Atom89. No build or installed-app change in this stage.

## Actual result

Existing `scripts/native-browser.mjs` + `tests/helpers/native-inspector-ui.mjs`, exact immutable standalone/embedding builds, fresh test profiles, Chrome/153.0.8010.12, sandbox retained, synthetic HTTP loopback. No application target debugger owned by the driver, no IDE/model/trust setup. One successful native invocation, 06:34:31–06:34:40 UTC, exit0, **13 scoped checks PASS** (11 ordinary native checks plus 2 explicit timing controls). Neither full native acceptance nor performance acceptance is claimed.

Both hosts: actual Basic attach/selected value; picker cancel restores old observation without app action; close/reopen preserves runtime; malformed selector displays an error and valid selection recovers; close selected app then refresh settles `OK` with empty selection and a live decoy, repeated refresh stays empty; delayed tabs response cannot restore an old selection. Embedding additionally: unmount cancels its owned picker and remount restores the inspector.

Timing controls delay delivery of one **real, unmodified** native tabs response by wrapping the inspector's sendMessage promise after the ordinary checks; no fabricated runtime result. They are deterministic context-guard evidence, not uninstrumented timing or performance measurements. Missing-opener reopen is **NOT_RUN**: this native facade opens a new top-level inspector without old opener metadata; ordinary close/reopen was checked. Linux headless synthetic coverage does not establish installed-user, macOS, independent-application, official Capture coexistence or complete U04/V03 acceptance.

The malformed `[` selector yields `Error: Cannot read properties of null (reading 'unsupported')` in both hosts. Error visibility and recovery pass the registered checks, but this is an unhelpful implementation error, not a polished invalid-input message. `packages/atom/src/runtime.mjs:469` dereferences `selection.unsupported` after native script result; that runtime file is unchanged from89. No new runtime correction or waiver was made. Full error-state quality remains open under U04/V02; this observation is not called a proven new90 regression.

Two earlier setup failures remain raw: 06:30 hidden read-only checkbox; 06:31 ordinary Playwright's app debugger ownership caused Atom's native-resource Busy refusal. No product acceptance was earned from them. The final run uses the project's appropriate native harness. No repeated performance run, repack or user-process interruption.

Evidence: `.artifacts/v02/current90-ui/2026-10-28/native90-2026-10-28T06-34-31-550Z/results.json`, SHA256 `d02743a8f122b75c6f267d2a525fb02a2479738193c9cbaaa73793b306ee4c6c`, alongside frozen plan/driver/screenshots and equal before/after manifests. Old89/new90 archives/hosts and official36 files unchanged. Both owned browser PIDs1533994/1534533 absent after close; server closed. Profiles/raw failures preserved. Handoff remains `BUILT_NOT_VERIFIED`; do not relabel it full native PASS.

## Eight open tasks: baseline blockers, not eight optional roadmap projects

Authority: `stateatom/docs/completion/02-release-scope.md`, `12-scope-decisions.md`, current `task-index.json`, `08-stateport-integration.md`, `09-validation-and-release.md`, `11-design-acceptance-map.md`; focused release assessment `205-release-date-decision.md`; website `docs/release/2026-10-23-coordinated-launch.md`.

| Task | Why required / exact remaining result |
| --- | --- |
| A02 | C03: bounded ordinary state/query→parameter→selected producer lineage and writer/alias/refetch counterexamples. Existing source/partial native research does not close the user-result gap. |
| L02 | O01: useful real-device local derived explanation, factual/concision/usefulness corpus and current lifecycle/fallback. User activation is optional; implementation/validation is mandatory for the baseline. Current readiness/lifecycle is not useful-output acceptance. |
| I02 | C08: actual official Atom/Capture coexistence matrix on accepted current pair, Desktop absent/connected/disconnect, BUSY before effects, permissions/restart/cleanup and real Capture review/save. Current89 reporter10/worker2 are scoped results. Public embedding90 is not the official host. |
| I03 | C08/C10: consistent accepted pair in extension and Desktop, helper/bridge contracts, normal install/update/rollback without Capture data loss. Store channel/ID remains a separate distribution dependency. |
| U04 | Current pair reference/runtime journeys and success/unavailable/rejected/busy/interrupted states in both public and official UI, including keyboard/narrow view. This13-check slice does not replace the full matrix. |
| V02 | Lifecycle/privacy/resource boundaries and original latency/Active overhead targets, including **still-failing performance89**. No exception authorized. |
| V03 | Clean documented setup and required real flows on at least two independent applications including non-React, original Linux/macOS targets, supported model/fallback. No extra human participant is required. Closed development276 Original-only result remains INCOMPLETE; Off/On/parity unvisited. |
| V04 | Final exact candidate ledger with all mandatory evidence and supported claims, update/rollback/distribution state. A report cannot substitute for A02/L02/V02. |

All eight have `optional:false`; completed count stays21/29. This is the approved complete Atom baseline and the documented coordinated site scope (Capture/Atom/Atlas/Play/Accept together without unfinished badges). It is not a claim that every narrower possible StatePort maintenance release must deliver the whole baseline. Current request has not selected an explicit narrower preview or revised coordinated site claims; no scope waiver can be inferred. Documents permit an explicitly narrower preview in principle, but the earlier Basic-only recommendation was withdrawn and is not revived here.

Separate roadmap/non-gates: production SDK is outside Atom completion; deeper general framework coverage/universal ownership graph/cloud Atom/automatic fixes are not this baseline; human adoption/time-savings research and independent human recruitment do not gate automated product acceptance. Public npm publication and a second Store extension are not required substitutes for the single official distribution. Website-only design, commerce and production-deploy gates remain their own checklist; they are not counted among these eight Atom tasks.

## Exact performance blocker and next decision

Report272: one complete89 measurement,198 rows/180 measured/66 active windows, guards/cleanup PASS. Basic p95 standalone399.1ms and embedding416.5ms meet1s. **Active/off overhead standalone10.71737255%, embedding27.31871841%, both exceed10%.** Raw SHA `a31b7c29fc3c041bbfe2956b777ebf770110ec471239e2f78f54b817e177c78f`. One measurement/one reader consumed; no repetition or workload/threshold change.

Previously selected profiling269 → publisher dirty-follow-up coalescing270 → package89/measurement272 has already been executed. Its source operation reduction is not proof of native cause/speedup. Latest next steps were official89 intake, UI refresh fix277, package90 and this UI check. **No concrete new post89 performance mechanism/fix and preregistered next measurement is recorded in those current documents.** Some task-index next-step strings still point to already-closed earlier steps; they are historical, not fresh approval to rerun.

Consequently the next performance work must first propose one bounded, evidence-backed diagnostic or source hypothesis addressing the remaining overhead, with explicit provenance/stopping rules and no repeated unchanged gate. This is a new engineering step to be selected, not an existing approved fix to execute blindly. UI90 changes no runtime/worker bytes; it cannot qualify as a performance premise.

## Finite path onward

1. Consume this changed-UI evidence for exact90; no repack is needed for unchanged product inputs. A bounded official90 intake may follow the existing integration path, preserving89/rollback, but does not close performance or full coexistence.
2. Resolve substantive A02, useful-output L02 and remaining V02 performance gaps with their actual completion criteria. Do not spend another cycle packaging unchanged code in place of those results.
3. Once those candidate inputs stabilize, complete the current official I02/U04 matrix and I03 update/rollback, then V03 normal setup/independent-app acceptance and V04 ledger against that same accepted candidate. Coordinate website claims/artifacts and its own release checklist.
4. Store/native-host channel work still needs the assigned Store ID and audited grants/registration routing; payments/dashboard actions remain outside this stage. No production, Store, payment or Reddit action occurred.

Native evidence copies omit profiles; original synthetic profiles and raw output remain in the release coordinator task. `native90-preservation.json` verifies all270 current product source inputs and three closed raw results without rerunning their collectors/readers.
