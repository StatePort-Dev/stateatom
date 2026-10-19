# Current work and approved-scope reconciliation

Date: **2026-10-19**, Indian/Mauritius. Source: clean tracked runtime at
`f3a7a7e1ba43bea4e39954eaf49b95266822692b`; this continuation changes documentation
only. The supplied completion directory was untracked on entry and is preserved.
Scope authority: [02](02-release-scope.md) and [12](12-scope-decisions.md),
`scope-review-1`. This is a focused reconciliation, not a new project audit.

## Current bounded item

The last implementation item is the
[production source-mapping increment](../superpowers/plans/2026-10-19-production-source-mapping.md).
Its source-exploration alternative is complete within its original scope. The
approved baseline now additionally requires selecting real production elements
to reach supported native/framework handlers and matching source. That remaining
work belongs to P01; it does not invalidate or restart the completed increment.

The runtime still denies production changes. Scope approval requires a future
F05 implementation, not removal of the existing guard in this continuation.
No publication, SDK, other repository or new visual design is part of this item.

## Credited implementation and remaining work

Reuse the [original audit](01-current-state-audit.md) for the wider inventory.
The following credits identify reusable slices, not completed baseline items.

| Items | Credit retained | What still prevents full acceptance |
| --- | --- | --- |
| P01 | Loaded-script identities, exact JS/map association, source excerpts and explicit `not linked to element`; `core/source-maps.mjs`, Atom map session/UI | Native and framework element-to-handler anchors in minified apps; manual coordinates do not pass |
| P02 | Bounded local `.map`/ZIP import, manifest/digest checks, missing-content output, expiry and stale cleanup | Bundle preparation, normal multi-chunk workflow, companion-source policy and tested responsive parsing |
| P03 | Explicit permitted-URL acquisition, omitted credentials, redirect refusal, local-file fallback and read-only operation guard | Actual HTTPS/native permission grant, denial and revocation; corporate error/local-fallback workflow |
| A03 / A05 | Existing Action Inspector source links, bounded hooks and native registration metadata | A03 broader callback cases remain; A05 actual invocation/event/instance evidence is absent, not satisfied by registrations |
| L01 / L02 | Deterministic action summaries and experimental local provider with unavailable-model fallback | L01 property/condition explanations; L02 useful real-device inference and fixed-corpus evaluation remain mandatory |
| U03 / U06 | Browser-only save/review/export and passive reader already exist | U06 must develop the reporter/recipient UX before U03/P04 full handoff acceptance |
| U05 | Existing picker and token/selection path, including the extracted production picker | Full hover/refinement/cancel, exact-instance and no-app-action matrix in both current packed hosts remains open |
| U02 / F05 | Existing supported local experiments and Restore; production mutation denial | Most declared eligible inputs in Live plus grouped Draft/Apply, undo-last, consumption/result states and two-confirmation production authority remain open |
| F04 / I01 | Atom/UI extraction, packages, exact peer and earlier two-host acceptance already exist | The earlier `.1` package report is historical; current `.3` plus current UI/features need immutable paired-consumer proof; official-host intake is separate |

The retained closed first-read P1/P2 result is complete only for its declared
controlled profile. The historical six-family **0/6** and Vue PARTIAL controls
remain unchanged. Neither is reassigned as a fresh mechanism experiment here.

## Active requirements and dependency rulings

- **L02/A05 are mandatory.** V03/V04 and final integration/design acceptance
  retain their dependencies. Model use is optional; real model validation is not.
- **SDK S01/O03 is outside Atom**, with no active dependency or Atom release gate.
- **U02 includes Live and Draft/Apply.** Its eligible-input catalogue, denominator
  for “most inputs” and commit timing must be recorded in U02 before evaluation.
  No debounce value or adapter atomicity has been chosen by this reconciliation.
- **F05 follows F02/U02.** Production starts read-only; two sequential Settings
  warnings/confirmations are required to enable supported edits. Grant lifetime,
  target/operation scope and navigation/restart/update behavior remain F05 decisions.
- **U05 is the picker**, following F01/F02. U01 may develop its existing inspector
  slice before the picker, but its final scope requires U05. This separates early
  work from final acceptance without introducing a U01/U05 dependency cycle.
- **U06 is handoff UX**, following U01/U05; U03 and P04 require it. The specific
  reporter/recipient journey is unresolved. Existing export does not decide it.
- **Another human is not a gate.** Clean installation, actual UI, independent
  application code and real-device model checks remain required; agent operation
  is labelled separately from optional independent-human evidence.

These dependencies already appear in the approved task index and are retained.
P01–P03 are now marked `partially-implemented` with explicit credit and remaining
acceptance. No full baseline task is marked complete from documentation alone.

## Verification used for this continuation

The [production-map validation record](../testing/production-source-mapping.md)
records the implementation on baseline `7ac4261` plus its reviewed dirty overlay,
subsequently committed as `f3a7a7e`. This continuation checked the retained JSON
results and matched their recorded input hashes against current files:

| Existing run | Recorded result, not a rerun | Current input check |
| --- | --- | --- |
| `.artifacts/production-source-mapping-2026-10-18T20-38-42-530Z/result.json` | MV3 Chromium 153.0.8010.12, 19/19, no recorded errors | Companion `source-manifest.json`: 27/27 hashes match |
| `.runtime/browser-runs/2026-10-18T20-39-16-115Z/native-A.json` | Browser-only 26/26, `inputsStable: true`, no recorded errors | `inputs`: 138/138 hashes match |
| `.runtime/react-host-ui-runs/2026-10-18T20-43-41-922Z/results.json` | React/open IDE UI 11/11, `inputsStable: true`, no recorded errors | `inputs`: 137/137 hashes match |

Fresh focused command on Node 24.19.0:

```sh
node --test --test-isolation=none tests/source-maps.test.mjs tests/source-map-diagnostic.test.mjs tests/atom/source-maps.test.mjs tests/atom/read-only-sites.test.mjs
```

Result: **24 passed, 0 failed/skipped**. This is a unit/API harness check of maps,
identity/invalidation, safe diagnostics and read-only denial, not fresh native
permission/UI evidence. Full unit/build/native suites and old experiments were
not repeated for documentation changes. The earlier 568-test/build result stays
in its original record; no new full-suite result is claimed.

Local consistency checks cover JSON parsing, unique task IDs, valid acyclic
dependencies including final-scope dependencies, suggested-order consistency,
mandatory gates, local Markdown links and whitespace. Original 01/audit-evidence
and approved 02/12 are byte-preserved. No delivery state is upgraded to integrated,
released or user-verified. Screenshots keep their existing review status.

## One next item

**F01 — capability and public-contract consolidation** has no prerequisites and
is not implemented: there is no canonical `capabilities.mjs` or packed-declaration
consumer check. Follow its [bounded brief](03-runtime-and-onboarding.md#f01--one-capability-model-and-checked-public-contracts):
inventory existing operations, consolidate enforced policy without widening it,
expose versioned availability/reasons and compile consumers from packed exports.
Reuse existing Basic/source/maps/experiment paths and their controls. This
continuation ends here, before starting F01 or dependent feature work.
