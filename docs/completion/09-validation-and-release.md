# Validation and release — implementation plan

**Goal:** verify every required outcome against the actual candidate, through declared supported environments and the real user interface.

**Architecture:** retain the unit/native harnesses, group checks by changed capability and join evidence on an immutable candidate. Do not replace the test framework or historical evaluation model.

**Tech stack:** existing Node tests, Playwright/Chromium, real VS Code helper, packages and GitHub Actions.  
**Spec:** [approved scope](02-release-scope.md), recorded CI [R24], native records [R09][R12][R20].

## Delivery evidence

| Label | Meaning |
| --- | --- |
| Source reviewed | Code was read; behavior not necessarily executed |
| Unit/contract tested | The stated isolated assertion passed |
| Native verified | The actual browser/IDE path passed on identified artifact bytes and versions |
| Agent-operated UI acceptance | An agent completed installation/task steps through the real interface |
| User verified | An independent person actually completed the task; optional evidence, not a baseline gate |
| Host integrated | The exact package pair passed with actual StatePort/Capture |
| Released | The specifically authorized publication occurred |

A second person is not required for baseline completion. This does not waive clean installation, actual UI operation, real-device model evaluation or independent **application-code** coverage. Never rename agent automation as an independent human study.

## V01 — CI, packed declarations and native lanes

**Depends on:** F01/F04.  
**Produces:** useful per-change checks and a fuller immutable-candidate lane.  
**Files:** existing workflow, package/build scripts and integration tests. Add small orchestration only for actual selection, locking and reporting needs.

Work:

- Preserve install/unit/build as the fast lane. Add deterministic UI generation, compiled public declarations, export and peer checks.
- Add native browser lanes for Basic/picker/save/export/reader, production maps and packed embedding. Loading a real MV3 extension is required; all-Chrome mocks remain unit tests.
- Use a graphical IDE lane or a reproducible maintainer job for actual installed VSIX acceptance. Keep Extension Development Host loading separate. Mark missing environment as blocked, not passed.
- Keep the first-read profile an explicitly limited regression. It does not pass general-project or latency gates.
- Run shared-port native harnesses sequentially with unique tags and isolated profiles. Freeze source/build inputs during candidate acceptance.
- Rebuild and check the exact pair after UI/Actions/maps/transport changes. Old tarball results do not certify new bytes.
- Keep external PR jobs read-only and free of private host/release secrets. Fix recorded CJS `import.meta` and reader font/CSP defects in their proper boundaries rather than suppressing warnings or loosening CSP globally.

**Changed-area checks:** picker/UI → selected-instance, no-app-action, layout and affected inspector flows; edit policy → Live/Draft/F05 and recovery; engine/action observation → semantic/control plus actual UI; model → fixed fact corpus and actual-device path; package → clean tarball/types/two hosts; host → real Capture coexistence. Final full-baseline candidate exercises every required row below.

**Done:** the summary says which lanes ran and what they establish. A green fast lane alone cannot make the candidate releasable.

## V02 — Lifecycle, privacy and performance

**Depends on:** F02 for the base controls; completed-baseline acceptance also includes F05, U02/U05, A05 and L02.  
**Produces:** boundary tests and mode-specific resource measurements.  
**Files:** existing Atom/browser/engine/integration tests and the modules owning each discovered defect.

| Boundary | Required result |
| --- | --- |
| Selection/instance | No pending result attaches to a different node/tab; old reports stay historical |
| Picker | Correct hover/refinement/cancel; no app action from selection in supported paths; owned cleanup |
| HMR/navigation/context | Actual invalidation and live source-edit tests; no stale source/action binding |
| Worker restart/update | No persisted lease authority or auto-resumed mutation; apply the documented F05 grant policy |
| Foreign Capture/debugger | Busy before effects; Atom cleanup leaves other ownership intact |
| Maps/archives | Bounded parse/memory/time; no traversal, arbitrary fetch or code execution |
| Source/IDE | Trusted workspace and build; reject escapes, wrong versions and stale connections |
| Export/model | No implicit credentials, private URLs, source-map payloads or raw bodies; explicit reviewed excerpts preserve omissions |
| Instrumentation | Original calls, receivers, exceptions, getters, skipped branches and Promise behavior retained |
| Live/Draft | Coalescing, valid commits, revision guards, grouped partial failure, undo-last and baseline return |
| Production changes | Read-only initially; first confirmation insufficient; second authorizes only the chosen supported scope; revocation enforced |
| Action Trace | Actual event/handler instance, bounded observation; no causal claim from timing alone |
| Retention/delete | Remove only owned material; no Capture data cleanup under Atom authority |

Measure observer-off, Basic, active dev analysis, source-map lookup, Live edits, Action Trace and model use separately. Use the same workloads and hardware, interleaved runs and raw distributions. Record gesture-to-useful-content latency, workload degradation, buffer growth, parsed-source memory proxy, cancellation and package size. Do not attribute whole-browser memory to one subsystem.

**Approved targets:** Basic p95 ≤ 1 second; warm source/action p95 ≤ 3 seconds on the declared reference corpus; active-observation median workload degradation ≤ 10%. Preserve tail effects. Larger initial indexing needs responsive progress/cancel. A miss remains open unless the maintainer explicitly accepts the documented deviation. Do not use a scope rewrite or post-result workload reduction as a waiver. Model download and real inference have their own separately reported timings.

**Done:** no unresolved critical boundary defect in enabled routes; targets met or an explicit maintainer deviation recorded. Test success is not a universal security certification. A defect gets a regression and new candidate, not a suppression to preserve a green count.

## V03 — Clean installation, real UI and independent applications

**Depends on:** F03, U02/U03/U05/U06, A01/A03 for the first developer path. Full baseline additionally includes A02/A04/A05, P01–P04, F05 and L02.  
**Produces:** clean-install and user-workflow records that may be agent-operated, plus transferability evidence. Another person's participation is not required.

Work:

- Prepare at least two independent applications, including one non-React. Preregister questions and reserve a structurally different control before tailoring the resolver. Known TodoMVC cases remain regressions.
- Install from the candidate artifacts and documented guide in clean test profiles. Do not rely on unpublished source hints, fixture-only paths or preconfigured private state. An agent may operate all steps, including reporter and recipient in separate sessions.
- Complete the actual visual picker flow, identify a condition, inspect handlers/hooks, distinguish skipped/unknown inputs, use Live and Draft/Apply, undo and return to baseline, record a real action, connect a matching production artifact and reject a wrong one, then perform the developed QA/PM handoff.
- Test production first in read-only, then the F05 double-confirmation option on controlled data. Recorder setup must not grant editing. Verify both default refusal and an eligible admitted operation.
- Evaluate the local model on an actual supported device and retain an unavailable-device fallback case. Lack of a suitable device leaves O01 validation incomplete, not waived. A narrower preview may still be released.
- Record points where the guide fails, exact useful answers, needed assistance and limitations. An agent-assisted run does not establish human adoption or time savings; those claims would need a separate study.
- Retain the original plan's Linux and macOS installation targets. Scope discussion did not newly approve a broader OS matrix. Name the tested platform scope per release; Windows requires its own real helper/extension evidence, not package presence.

**Done:** the required clean installation and task paths pass on the declared environment, including the independent-code positive gates. If not, the full baseline stays incomplete or only a narrower preview ships. No recruitment requirement or independent-human sign-off is added.

## V04 — Candidate ledger and authorized publication

**Depends on:** V01–V03 and I03; the completed baseline also requires every mandatory item in [task-index.json](task-index.json), including F05, U05/U06, A05 and L02.  
**Produces:** a coherent candidate manifest, current support table and reviewed distribution artifacts.

Work:

- Record source revision/dirty state, exact component identities, permissions/grants, features, frameworks/platforms, checks and limitations. Input drift invalidates candidate-level acceptance.
- Keep the original audit and historical reports unchanged. Current status/roadmap should distinguish approved scope, implemented capability and tested/released states. No old `0/6` or later bounded success is rewritten by scope approval.
- Provide installed-user instructions, distinct from research/contributor commands. No hidden first-read launcher requirement behind “one click.”
- Package the public standalone and official host from accepted dependencies, including notices and assets but excluding private profiles, tokens, unreviewed app sources and private host code. Keep the current license boundary unless a separately authorized review changes it.
- Exercise update/rollback and schema compatibility without erasing Capture data or upgrading historical evidence. Do not auto-resume edits after update.
- Identify the release kind: a narrower preview with explicit unfinished requirements, or the completed approved baseline. O01/O02 cannot remain labelled optional implementation work in the latter. The production SDK never gates Atom.
- Publish only with explicit authorization for the exact artifact/destination. Permission to make intermediate releases in principle is not an instruction to publish now.

Ledger fields include `scopeRevision`, `releaseKind`, `requiredRequirements`, `unmetRequirements`, `sourceRevision`, `artifacts`, `contracts`, `checks`, `operatorKind`, `performanceDeviations`, `knownLimitations` and `distributionStatus`. Human-study fields are optional, never filled from automation.

**Done:** documentation, artifact and enabled features agree. Every mandatory baseline requirement has actual acceptance evidence or the release is explicitly narrower. Runtime-unavailable local AI on some devices remains normal; implementation/real-device validation of the feature must still be complete for the baseline.

## Final acceptance matrix

| Journey | Standalone | Official host | Required proof |
| --- | --- | --- | --- |
| Basic inspect/save/export | Required | Required | Real UI; no IDE/Desktop/account; fresh reader |
| Visual picker | Required | Required | Hover, nested refinement, exact target, cancel, no app action in supported paths |
| Ordinary React | Required | Same supported cases | Installed open helper/plugin; updates and source/value/action identity |
| Positive Vue | Required | Same supported cases | Template/composable/instances and a real-library positive property path |
| Live and Draft/Apply | Required | Required | Declared most-inputs target, observed consumption, undo/baseline and partial failures |
| Default read-only production/maps | Required | Required | Real permission flow, exact artifact plus independently established anchor |
| Intentional production changes | Required | Required | Two Settings confirmations, bounded capability and revocation; controlled test environment |
| QA/PM handoff | Required | Required | U06-developed reporter-to-recipient workflow through real UI |
| Local AI, user opt-in | Required delivery | Same | Real useful model inference plus full fallback; no cloud/API keys |
| Action Trace | Required | Required | Actual handler instance/invocation; consequences supported separately |
| Closed first-read | Scoped regression | Only if exposed | Original criteria, not general-project acceptance |
| Capture | Not implemented here | Existing behavior required | Actual Desktop review/save and debugger coexistence |
| Production SDK | Outside Atom | Separate StatePort work | No Atom release dependency |

[R09]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/testing/action-inspector-validation.md "Action Inspector validation"
[R12]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/testing/production-source-mapping.md "Production source mapping validation"
[R20]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/testing/atom-embedding-validation.md "Original embedding validation"
[R24]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/.github/workflows/ci.yml "Hosted CI definition"
