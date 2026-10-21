# Positive Vue source/property/action implementation plan

> **For agentic workers:** Use superpowers:executing-plans inline, task by task on current main. One whole-A04 review follows its declared matrix, not each incremental source/control commit.

**Goal:** Add a small positive Vue3 SFC selected-property/action workflow backed by actual native UI/source results, preserving old PARTIAL controls.

**Architecture:** Use the existing installed Vue SFC/template compiler to extract exact script/template spans and source binding metadata. A small source adapter supplies the existing bounded lexical action resolver; it does not parse a whole .vue file as TS or infer runtime callback identity. Keep the existing optional observer and its claim-level selected reads, with explicit absence of final committed producer/full lineage.

**Tech stack:** pinned Vue/compiler3.5.44, Babel7, Vite7, current Atom native MV3 hosts and actual contributor IDE. The prepared independent TodoMVC Vue uses its own locked Vue/router versions; retain that distinction and its immutable manifest.

**Spec:** docs/completion/05-analysis-and-actions.md A04, approved02-release-scope.md and12-scope-decisions.md. A05 remains mandatory/separate; A02 lineage unresolved.

## Global constraints

- No redesign, SDK, publication/push, changes in other repositories, account changes or fabricated independent-human acceptance.
- No application expression/getter/callback re-evaluation, branch forcing, transparent replacement store, borrowed React marker or nearest-component source attachment.
- Preserve original Vue Row/independent label/aggregate PARTIAL predicates and old evidence. New positive assertions are additive.
- Keep snapshot default, exact selected own marker/digest/instance, source revision and reinspection after normal user updates. Explain dynamic/aggregate/opaque boundaries.
- Native registration, static source declaration and actual invocation remain distinct. A04 cannot complete A05 by source links or fixture logs.
- Deadline remains2026-10-21T05:00UTC (09:00 Mauritius); stop starting new work at the deadline.

## Review focus

1. Two same-line/same-tag nodes and two component instances must not share a guessed source/selected read.
2. Compiler macros, modifiers, dynamic event arguments, v-for/slot scope and template overrides must not become unsupported false positives.
3. Exact original script/template ranges must survive inline SFC blocks, TS setup and renamed imports/composables.
4. Repeated application state/library updates and handler replacement must preserve old historical bytes, receiver/getter/exception behavior and current reinspection.
5. A real-library positive case must use its actual implementation; an opaque store refusal or a synthetic substitute does not pass the gate.

## A04.1 — bounded compiler-backed SFC source adapter

Files: create core/vue-source.mjs and tests/vue/source-actions.test.mjs; modify core/analyzer.mjs, core/action-analysis.mjs only at extraction/entry boundaries, src/engine/plugin.mjs only for exact own source markers/event-only targets; affected action/diagnostic/UI/runtime source-kind consumers.

Interfaces: a Vue compiler adapter consumes original file/text plus selected marker/tag; returns exact script/template spans and explicit admissible source-event descriptors, not executed callbacks. Reuse the existing lexical resolver for direct/aliased/imported functions and a synchronous composable's single literal callback return. Use a distinct vue-template mechanism end-to-end through freshness/UI/v1 export/reader. No JSX fiction in delivered evidence.

- [ ] Register meaningful positive/control unit cases before implementation: direct method, const alias, imported alias, composable callback; wrong digest/inherited marker/wrong same-line column/two rows; getter/dynamic directive/v-for/slot/spread/modifier boundary; unchanged old React forms.
- [ ] Run RED against current exclusion, implement minimal adapter/source-kind consumers and exact columns, run GREEN plus affected existing suites. Keep unsupported forms explicit; do not add a whole-app graph or component tree.
- [ ] Source-only bounded commit with evidence and parent A04 still open; one whole-A04 review waits for native matrix.

## A04.2 — positive real library and actual UI workflow

Files: new synthetic Vue action/property fixture and narrow native scenario under tests/fixtures/inspection/ and tests/integration/. Reuse current native ownership/immutable package/IDE utilities. Keep original short-loop source/control corpus unchanged; add separate native assertions, plus run the original short-loop when shared plugin changes justify it.

- [ ] Preregister direct/computed text/disabled, actual library read, normal repeated updates/two instances, ordinary method/composable, replaced source/handler, absent source/opaque store and aggregate boundaries before changing observation mechanism.
- [ ] Use actual real Vue/library implementations already locked or present in the prepared independent app; verify version/source provenance first. If a required library is absent, report that concrete gap instead of inventing install commands or replacing it with a transparent fake.
- [ ] Actual native picker→rendered positive value/read/expression→exact source-open IDE audit, normal trusted user updates and explicit reinspection. Compare observer-off outputs, callbacks/getter counts, thrown objects and scheduling under the supported synchronous boundary; do not substitute fixture logs for Atom invocation.
- [ ] Fresh local candidate/types/admission, meaningful affected source checks/native hosts, Basic regressions, existing Vue PARTIAL assertions and first/narrow candidate screenshots. No frozen historical verifier reruns or unsupported pass conversion.
- [ ] Publish framework/version/mode capability matrix and recorded limits; ONE whole-A04 read-only review, test fixes to actual Critical/Important findings, rule Minor findings. Local commit and next dependency.

Current state: plan preregistered while A03 whole-item review finishes; no A04 product code or new experiment has run yet.

A04.1 regression checkpoint: initial full source run retained one real legacy SFC
source regression (template without scriptSetup/id-class disambiguation), restored
against its original test, plus exact owned recipe pin mismatch after the Vue-only
plugin change and sandbox bind/spawn failures. Current recipe plugin and normalized
builder pins are refreshed mechanically; no compiler/observer/finite argument or
acceptance threshold changes. Run the finite current profile as a justified regression,
not a whole historical audit. Initial new explanation unit also had a missing local
import in the test; corrected without product predicate changes.
