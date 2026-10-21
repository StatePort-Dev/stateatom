# A05.3c Historical Action Reports Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Inline execution continues under the user's autonomous task/commit mandate; no implementation subagents.

**Goal:** preserve bounded action observations as explicitly passive historical evidence in the existing diagnostic and reviewed handoff workflows.

**Architecture:** share the existing trace grammar between live admission and a narrow historical codec. Keep source/registration actionBindings separate. First save/read diagnostic metadata; then add an explicitly versioned composed report profile so closed legacy profiles and original raw bytes remain unchanged. No new sharing service or replacement handoff UX.

**Tech Stack:** existing Node24/ES modules, JSON codecs, Atom runtime/native MV3, current shared UI primitives and owned browser/IDE harness.

**Spec:** docs/completion/02-release-scope.md (scope-review-1),05-analysis-and-actions.md,12-scope-decisions.md,45-a05-bounded-review-fixes.md; docs/evidence-model.md and existing U03/U06 report contracts.

## Global constraints

- Actual handler invocation evidence remains separate from source declarations and from unobserved consequences.
- Imported data gives no execution, permissions, source fetch/open, replay or mutation authority.
- Preserve historical criteria, old profiles and saved original bytes. No SDK, publication, other repo or redesign.
- No current source or freshness claim on import. Human review is not a blocker; screenshots stay candidates.
- Do not invent approved Live parameters, production grant scope/duration or a new handoff journey.

## Review focus

- A stale/mismatched selected property must never be made the effect of the separately observed action (Task1 scoped identity/reader control).
- Open collectors saved before a click are historical incomplete records, never active on import (Task1 armed/partial control).
- Unknown/malformed fields, orphan exits, wrong identities or accessor-backed input must not yield executable or promoted evidence (Task1 codec controls).
- A privacy copy must not retain omitted action identities/source symbols through another composed packet (Task2 overlap/redaction controls).
- A note, matching hash, restart or local import must preserve evidence bytes without acquiring a live source/collector relationship (Task2 note/restart/passive native controls).

### Task 1: Passive diagnostic observation record

**Files:** create core/source-path.mjs,core/action-trace-record.mjs,core/action-observation-report.mjs,tests/action-observation-report.test.mjs; modify core/diagnostic.mjs,packages/atom/src/action-trace.mjs,action-trace-ui.mjs,browser-extension/reader.mjs and focused diagnostic/runtime/reader tests.

**Interfaces:** shared parseActionTrace(value,identity,page) retains the current exact bounded grammar; existing package internal export remains compatible. createActionObservationReport(snapshot) returns a schema1 historical-action-observation or null for cleared/no trace. parseActionObservationReport(record) validates inert historical fields. Diagnostic optional runtime.actionObservation carries it. Source actionBindings retain execution:not-observed. No new public wire/API operation.

- [x] Write RED: actual runtime Arm/body/read→save-diagnostic→local open preserves bounded records; no args/token/authority/sourceCurrent. Old diagnostic roundtrip retains absence. Stale and armed snapshots remain historical, no causal property join. Malformed sequence/source/identity/extra authority refused; input getters not read. Passive reader exposes body/exit/source claims as untrusted historical text, without buttons/requests.
- [x] Run node --test --test-isolation=none tests/action-observation-report.test.mjs and affected action/diagnostic/runtime/reader suites; preserve decisive RED.
- [x] Extract the unchanged path/trace grammar, implement bounded record codec and optional diagnostic field, passive reader and truthful interim copy. Existing reviewed issue profile still excludes action execution; explicitly retain that limitation until Task2.
- [x] GREEN focused suites/npm test; new immutable Atom candidate, exact package/types and affected native save/open/reader checks. Shared compiler/observer is unchanged: do not rerun old finite campaigns without cause.
- [x] Record actual receipt/limits and local commit. This step alone is diagnostic storage, not whole report integration or A05 acceptance.

### Task 2: Reviewed report and privacy composition

**Files:** new narrow core/handoff-action-evidence.mjs,core/handoff-action-presentation.mjs and focused tests; compose in core/handoff-files.mjs,existing handoff review/UI/reader modules. Reuse current reviewed/input/source profile codecs; no rewrite of their closed schemas. Exact helper signatures and allowed base profiles will be recorded after Task1's codec is fixed and those boundaries inspected.

**Interfaces:** consume Task1's actionObservation and exact saved diagnostic reference. Produce an explicitly versioned passive composed profile with an immutable base checksum and separately reviewed/omitted action packet. Existing file dispatch/store/reader accept the new profile; notes/privacy copies retain exact parent lineage. This is an internal format implementation choice, not a claimed preapproved new user journey.

- [ ] Pin exact public record/choice interfaces and allowed composed bases in this plan before Task2 edits; use existing privacy review controls rather than inventing replacement UX.
- [ ] RED for default exclusions, explicit selected metadata, omitted/replaced identities across packets, wrong parent/digest, duplicate JSON keys/oversize, note/privacy continuity and legacy unchanged bytes.
- [ ] Implement minimal codec/presentation and connect existing review/save/download/reader. No active action operation in passive code.
- [ ] GREEN source suites and exact two-host native reporter→restart→clean recipient with real saved action and no app/IDE/HTTP authority; narrow/keyboard candidates compared to retained reference. Relevant existing input/source reporter controls must remain intact.
- [ ] Update evidence/task-index/status/roadmap and local commit. ONE final fresh read-only review for this bounded report plan, one fix pass if needed, no per-subcase review loop or whole A05 claim.

## Scope self-review

This plan covers saved action evidence only. Original A05 production/native semantics/performance/async coverage, A02 lineage and L02 real-model gates remain open. Existing U06 flow is reused; no independent-human requirement added. Task2 interface pinning is an explicit dependency on the fixed Task1 record, not authorization to implement an unspecified alternative UX.

## Task2 internal interface decision (implementation choice, not a product approval)

The closed v2 profiles cannot acquire new action rows without changing their
validated policy. Compose a new `action-evidence/1` profile around an existing
minimal/reviewed/source/input base, following the existing input composition
pattern. Do not mutate the old schemas or pretend their absence tokens describe
the new component. New presentation states that the base omits action execution
and the separate packet carries any reviewed observation. Keep original source
reference SHA exactly bound to the diagnostic containing the action record.

**Core files / exact interfaces:**

- `core/handoff-action-evidence.mjs`:
  `createHandoffActionEvidence(diagnosticRaw, choices={}, {now=Date.now}={}) -> Promise<packetRaw>`;
  `parseHandoffActionEvidence(packetRaw) -> Promise<{record}>`;
  `redactHandoffActionEvidence(packetRaw, choices, {expectedParentDigest,now}) -> Promise<packetRaw>`;
  `handoffActionEvidenceFields(packet) -> fields[]`.
- Packet schema `stateatom.action-evidence`, version1: exact saved diagnostic
  reference, recorded status/freshness/lastReadAt/source-at-last-read, bounded
  dispatch/body/exit structure, reviewed scalar fields, context-join state,
  omission index and fixed historical/no-authority limitations. No sourceRaw,
  original trace or hidden excluded values. Structure uses generated ordinal
  references, not preserved private IDs. Missing/filtered/replaced context makes
  the original event/source join unverifiable. Never reconstruct missing data.
- Private field categories: `actionIdentities`, `actionSources`, `actionSymbols`,
  `actionNotes`; all excluded by default. Known enum/boolean/count metadata is
  retained. `includeCategories/includeFields/omitFields/replaceFields` use the
  existing review vocabulary; replacements are explicitly reviewer redaction,
  never observations. Native trace grammar is checked before projection.
- `core/handoff-action-report.mjs`:
  `composeHandoffActionReport(baseRaw, packetRaw, {expectedParentDigest,now})`;
  `parseHandoffActionReport(raw,{parentRaw}={})`;
  `appendHandoffActionFinding(raw,finding,{expectedParentDigest,now})`;
  `appendHandoffActionSource(raw,developerRaw,files,finding,options)`;
  `redactHandoffActionReport(raw,{baseReview,actionReview,omitActionEvidence},{expectedParentDigest,now})`.
  All creators return Promise<raw>; parser returns frozen `{record,trust,parentStatus}`.
- Public wrapper keeps common report/additions/privacy fields and the allowed
  base's existing extras. Add `actionBaseHeader` (original profile/id/time/revision/
  lineage), `actionBaseDigest` (canonical component checksum), `actionEvidence`,
  `actionPrivacy`, `actionEvidenceDigest`, `actionLimitations`. Reconstruct and
  validate the exact old base component with its original parser. Top lineage
  binds the actual parent artifact; component continuity is checked separately.
  Allowed bases: minimal-snapshot/1,reviewed-snapshot/1,source-evidence/1,
  input-evidence/1. Nested action wrappers are refused.
- Privacy must propagate metadata overlaps in both directions: action identities
  ↔ base selection/action/diagnostic context; action sources ↔ source locations
  and excerpts; action symbols ↔ action declarations/excerpts; action notes ↔
  diagnostic context. Existing source/input privacy codecs then propagate their
  own overlaps. A whole action omission removes related repeated metadata too.
  User-entered words remain explicitly reviewable; no general PII guarantee.
- Existing source-review creator gains an explicit internal
  `separateActionEvidence:true` choice only for assembling the new wrapper. The
  ordinary closed-profile creator continues refusing silent action loss. Pass
  original raw diagnostic to retain its exact digest; do not strip/re-serialize it
  to bypass this guard. Never make an uncomposed intermediate base downloadable.

**UI / presentation interfaces:**

- `core/handoff-action-presentation.mjs`: category labels, field labels,
  `handoffActionSummary(record)`, `handoffActionText(record,{advanced=false})`.
- Reuse `createHandoffReview` source fields for action catalogue via explicit
  category labels; add a packet-review mode for omission/redaction of an already
  reviewed action packet. Existing old catalogue rendering must stay identical.
- Existing Atom report dialog adds one optional historical-interaction privacy
  disclosure; current/saved-source paths use the same original diagnostic bytes.
  Existing review/save/download steps remain. Simple report explicitly excludes
  action/input/technical evidence; never silently falls back.
- Recipient privacy uses the existing base widget plus a separate action packet
  widget. Read choices as `{baseReview,actionReview,omitActionEvidence}`; retain
  developer-note/source-comparison workflows through wrapper-aware dispatch.
- `handoffBaseProfile`/source/input presentation unwrap action base metadata so
  current inputs and source comparisons stay visible and passive. Do not mistake
  absence of an action packet for absence of the old base's input evidence.

Task2 decisive tests additionally include action+input+source composed privacy,
base-only/action-only redactions, same explicit source bytes across default/full
choices, wrong diagnostic packet, notes preserving packet, duplicate keys and
structural tampering, report limits, full browser restart and clean recipient.

Task2 is executed as independently testable local commits: (2a) passive packet
model/privacy codec, (2b) composed profile/parent continuity, then (2c) existing
reporter/recipient controls and native acceptance. Source-only 2a/2b are not
installed features; do not repack or repeat native campaigns until connected.
Add `createHandoffActionReview(diagnosticRaw) -> Promise<model|null>` with
`model.catalogue()` and `model.project(choices)` for the current local review;
no private catalogue or raw original is embedded in a public packet. Packet
parser additionally accepts optional `{parentRaw}` to check privacy lineage.
ONE final report-plan reviewer still follows the integrated2c outcome.

Task2b clarification: preserve independently consented base fields when the new
packet merely excludes fields by default. Explicit privacy reductions propagate
known repeated metadata; unavailable prior redactions require conservative category
omissions. Required diagnostic reference identity/content hashes remain provenance
metadata, not a promise of general PII anonymisation. User-entered words still need
review. This refines internal privacy mapping; it is not a new handoff UX approval.
Export existing source-file snapshot helper internally for the wrapper so supplied
ArrayBuffers are copied before awaits under the same old byte/count rules.
