# Product-owned browser compilation observations

This is the next bounded prerequisite after [React private access guards](2026-10-18-react-write-progress.md),
not completion of original P2/P1 or a new resolver. Revision remains
`bcde3d0f1572878df662db6bab79e65bc66dd6d0` plus each run's dirty manifest.

## Actual capability

The extension owns a digest-only ledger from existing Debugger/Runtime events,
including dependencies, anonymous/sourceURL code, isolated worlds and scripts
created by inspection itself. It retains exact script/context/frame IDs, debugger
session, worker incarnation and navigation epoch. Resource classes grant no trust.
No bodies, URL paths/queries, source maps or raw CDP errors persist in this ledger.

Bounds remain 256 scripts, 64 contexts, 2 MiB per source, 8 MiB total hashed UTF-8
bytes, eight active source/hash acquisitions and a two-second/eight-turn inspection
drain. Startup bursts queue only metadata inside that same script bound. Missing,
pending, lost and over-budget history remains explicit. Initial attach is late;
worker restart interrupts continuity. Navigation while attached starts a new epoch.
Async responses cannot populate a different epoch or an ineligible tab record.

Snapshots belong to a selection generation/run/time and remain independent browser
observations. New compilation/hash/context events stale only that code snapshot,
not the app's separate source/DOM evidence. Inspect again captures a newer journal.
The product's existing freshness check also compiles helper scripts; those events
are included rather than hidden to manufacture a current/complete result.

The panel has a separate expandable compilation section. Diagnostic review/export
and the fresh passive reader retain counts, identities, gaps and historical scope.
The worker overwrites any page/resolver journal field with its own snapshot; imports
are untrusted data. Schema version 1 gains an optional bounded runtime.codeJournal;
older exports without it remain readable. Import always denies executable/effect/
source-equivalence/fullPath authority, even if an input asserts it.

## Difference from the native inventory experiment

The separate native harness additionally compares exact captured server receipts
and compiled bytes. This product journal does **not** have trusted server receipts,
response-to-script creator identity, complete target/worker coverage or invocation
history. A digest does not supply these. Readonly effects, alias lifetime, current
field ancestry and fullPath remain Unknown/false even if all captured hashes finish.
No unsupported path is counted as a complete trace.

## Retained failures and review

The first actual UI run passed 26 checks but disclosed a startup burst that exceeded
eight active requests. Those missing sources remained explicit. The successor uses
a metadata-only bounded queue instead of dropping eligible records or raising body/
concurrency budgets. Review also caught repeated overflow/duplicate events failing
to invalidate a previous snapshot, and acquisitions continuing during outside-origin
detach. RED controls reproduce each problem before its fix. Lifecycle review also
requires exact current tab-record identity after eviction/recreation.

## Commands

```sh
npm test
npm run build
HOST_UI_TAG=<unused> npm run verify:code-journal-ui
BROWSER_TAG=<unused> npm run verify:browser
SHORT_TAG=<unused> npm run verify:short-loop
IDE_TAG=<unused> npm run verify:ide
INDEPENDENT_TAG=<unused> npm run verify:independent
```

Native browser/IDE commands run sequentially, without another dev server. The first
UI tag `product-code-first-20261018` passed 26 actual checks, stable/no errors; it is
retained as the pre-queue/pre-review checkpoint, not final successor acceptance.
Browser plugin unavailable; pinned Playwright operates actual Chromium/MV3/VS Code.
No publication or administrative mutation is authorized by this local verification.

## Remaining original trace gap

Product-owned compilation **observations** now exist; a product-owned complete
executable/effect history still does not. The original P2/P1 cases require the
current field revision across native/opaque aliases. A collection of code digests,
exact object handoffs, equal values or absence of observed writes cannot prove it.
The next bounded decision is a trusted compiler-to-script binding/effect premise
for this one selected alias lifetime, with competing-producer controls; it is not
a blanket ownership certificate or a reason to change the historical 0/6.

## Verified regression checkpoint

`product-code-reviewed-20261018` passed **26 actual UI checks**, stable inputs/no
errors. The reviewed export contains **49 captured / 49 hashed / zero pending or
queued** scripts. Isolated-world/anonymous limitations remain explicit; none is
reclassified as trusted execution. Actual UI checks separately verify an exact
anonymous compiled digest, a stale old journal with unchanged app commit, newer
reinspection, late attachment, a new navigation epoch, reviewed download and
fresh offline reading. The prior React/Query/source-write/IDE checks remain in
the same 26-check workflow. Screenshots were visually inspected.

Separate affected workflows passed: **26 browser-only** checks, short loop
**20 PASS / 10 expected PARTIAL plus 106 UI assertions**, exact IDE intervention/
rollback/Restore, and all **three independent preregistered useful fragments**.
Commands, timestamps and logs are in `.runtime/code-journal-regression/`. Vue
PARTIAL remains a negative control, not supported Vue inspection.

Those native runs preceded the final current-tab-record and post-storage identity
checks. Their single-tab results are reused for unchanged mechanisms; final focused
controls and clean actual UI acceptance cover that lifecycle correction separately.
No thresholds or historical case denominators changed. No new native handoff claim
is inferred from compilation UI checks.

## Frozen successor acceptance

The final current-record fixes add checks before acquisition/completion/pump, after
SHA completion and after every relevant inspection/freshness await, including the
last storage write. Delayed hash, pending source, eviction/recreation, delayed
storage and refresh-acquisition REDs are retained. Final focused review passed
**26 controls**, with no remaining blocker identified in these deltas. That review
did not operate the browser.

Root **320 tests** and full build passed. The immutable
`/tmp/stateatom-code-journal-candidate-20261018` contains **241 regular source files**
with recorded modes and no old spike, inherited dependencies or build outputs. A
fresh locked public-cache installation used empty npm user/global configuration;
exact lock/dependency settings match the previously public-verified cache. This is
not a new empty-cache network install. Clean **320 tests/build** passed and all
**34 outputs** matched root. All three distributed outputs retain MIT/Apache texts
and NOTICE; the generated IDE inventory retains 26 bundled dependency licenses.

`HOST_UI_TAG=clean-product-code-20261018 npm run verify:code-journal-ui` from that
clean source passed **26 actual UI checks**, stable/no errors. Its checkpoint again
has **49/49 hashes, zero pending/queued**, with isolated/anonymous scope explicit.
All ten reviewed downloads were opened in a fresh standalone offline reader.
Final screenshot review confirmed the compilation limits and exact app source
remain visible. Node 24/npm 11 and Chromium 153.0.8010.12 use the documented native
Playwright/VS Code path; Browser plugin unavailable. Acceptance is explicitly
**agent-operated**, not independent human/manual/Store evidence.

Bootstrap/manifests/logs: `.runtime/candidate-bootstrap/code-journal-final-20261018/`.
UI/regression records: `.runtime/code-journal-regression/`. The safe allowlist
`.runtime/preview-acceptance/code-journal-accepted-20261018/` contains 17 files,
including ten exports and reviewed screenshots; profiles, credentials, raw IDE
logs and compiled/private staged source bodies are omitted. All 1,527 historical
and 241 old short-loop file hashes matched again. Documentation appended after
this source archive does not alter its frozen product/build identity.

A fresh read-only GitHub check still returned private vulnerability reporting
`enabled:false`. No administrative mutation, commit, push, public release or Store
submission occurred. That gate and publication remain separate from local technical
acceptance. The [selected-path assessment](deep-baseline.md#later-selected-path-assessment-separate-from-the-historical-table)
keeps the unchanged full-field criteria and the exact missing capability visible.

## Later administrative gate update — 2026-10-18

After the acceptance checkpoint above, the user explicitly authorized enabling
GitHub Private Vulnerability Reporting in `StatePort-Dev/stateatom`. The PUT
succeeded and a subsequent GET confirmed `enabled:true` at 2026-10-18T06:51:13.516963+00:00.
This supersedes the earlier disabled-channel status, without altering the frozen
candidate or historical verification records. No vulnerability report was submitted
and report delivery/response has not been exercised. This does not publish a release
or complete the remaining full-field/independent-usability gates.
