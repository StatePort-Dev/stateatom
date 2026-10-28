# Release decision — accepted current Active overhead

28 October 2026. This is an explicit maintainer acceptance of the measured
performance deviation, not a new measurement or a feature-completion claim.

## Authority and effect

The maintainer, after the current values and detached/attached distinction were
explained, instructed: «тогда считаем эти цифры приемлимыми и не беспокоимся он их.
Отметь в документах. Что еще осталось до релиза?»

The reported Active/off overhead is **accepted for the planned release**:

| Measured public host, exact Atom89/UI2 | Off median | Active median | Accepted overhead |
| --- | ---: | ---: | ---: |
| Standalone | 57.85 ms | 64.05 ms | 10.71737255% (+6.20 ms) |
| Embedding example | 59.30 ms | 75.50 ms | 27.31871841% (+16.20 ms) |

These values no longer block release and do not require further optimization,
profiling or another benchmark merely to reach 10%. The original 10% target stays
in the historical protocol; its measured result remains MISS, with the release
criterion satisfied by explicit maintainer exception. No new general 27.32% limit
is invented. Basic p95 <=1s, warm source/action p95 <=3s, privacy, correctness and
lifecycle criteria are unchanged. Unrelated regressions are not pre-accepted.

## Evidence boundary

The existing [record272](272-v02-current89-original-performance.md) and
[read-only analysis280](280-i02-current90-intake-release-path.md) retain the fixed
20 sequential HTTPS GETs x1024 bytes, counter updates and two final app frames;
30 measured samples per mode/host, 198 total rows and 66 active windows.
Raw SHA256 remains
`a31b7c29fc3c041bbfe2956b777ebf770110ec471239e2f78f54b817e177c78f`.
No raw, frozen case, reader, result, threshold or exhausted run budget is rewritten.

Current package90/official90 changed UI, with runtime/worker unchanged from89 as
recorded in278–280. This decision removes the recorded overhead blocker from the
current release plan; it does not relabel the89 run as a fresh90 or complete
StatePort performance measurement. The embedding example is not the complete
StatePort app. Off already loads the extension but leaves Atom detached; there is
no measured extension-absent versus installed-idle percentage. No element selected
or an inspector closed after Attach is not necessarily Detach.

## Remaining release work

Whole-task completion remains **21/29 (72.41%)**; all eight open tasks below retain
their other requirements and dependencies. This percentage is not remaining time.

| Task | Remaining result |
| --- | --- |
| A02 | One declared ordinary value-provenance path from producer write/response through state/props/parameters to selected committed target, with wrong-writer/refetch/alias counterexamples and positive development-plugin evidence. Existing partial/Unknown paths do not complete it. |
| L02 | Useful local derived explanation beyond the template, correct bounded fact references, fixed corpus quality and real-device offline/fallback/lifecycle evidence. Readiness and successful template-equivalent inference already exist; usefulness is still missing. |
| I02 | Reconcile and finish Atom/Capture coexistence on the final pair: ownership/contention, Desktop states, interruptions/permissions, reader and required editing/action/model journeys. Retain applicable exact-byte historical checks. |
| I03 | Matching extension/Desktop/helper/bridge distribution and normal install/update/rollback without Capture data loss. Store sender/native registration needs the actual assigned Store identity; do not invent it. |
| U04 | Final real control/error/busy/unavailable/interrupted journeys, keyboard/narrow/zoom and reference comparison. Correct or explicitly resolve the observed technical invalid-selector error. No redesign is implied. |
| V02 | Remaining lifecycle/privacy/resource and unchanged latency acceptance on final relevant inputs. The recorded Active overhead is accepted and no longer a blocker. |
| V03 | Normal documented installation and complete user journeys on at least two independent apps including non-React, within the declared Linux/macOS scope. Existing closed Original/Off/On incomplete evidence stays incomplete; no unchanged retry. Another human participant is not required. |
| V04 | Freeze the final artifact/contract/support ledger, carry this accepted deviation, resolve remaining dependencies and prepare truthful installation/release notes. This decision does not publish anything. |

The next single implementation item is **A02: select and bound one ordinary
producer-to-selected-value path using existing partial evidence and explicit
counterexamples**. Establish its concrete mechanism gap before editing; do not
restart the whole audit or old native campaigns. L02 remains a separate mandatory
product gap. Final integration/installation checks follow stable relevant inputs.
SDK, a new design, other-repository edits and publication are not part of this
documentation change.
