# Launch evidence claim separation implementation plan

> **For agentic workers:** REQUIRED superpowers:executing-plans inline. ONE final fresh read-only whole-item review, no implementers/per-task reviewers.

**Goal:** Add an honest versioned description of retained launch claims without altering strict refusal.
**Architecture:** Pure scoped annotation over immutable strict helper; separate finite read-only dataset verifier/writer with declared historical Git matches.
**Tech Stack:** Existing Node24/crypto/fs/Git, no browser/model/dependency changes.
**Spec:** ../specs/2026-10-24-launch-evidence-lanes-design.md

## Global Constraints

- Main/local/latestOct25evening/scope-review-1/20of29/fullA02 open.
- No native/app/model/old case/source/result rewrite/product/UI/SDK/otherrepo/trust/publication changes.
- Legacy status Incomplete/METADATA_ARGUMENTS stays acceptedfalse; no changed acceptance policy or new live proof.
- Observation source revision/raw/case hashes separate from current analysis revision; HistoricalClosedRun/current state Unknown.
- Frozen380 inputs: current physical vs only three declared exact historical Git matches; no generic fallback or digest waiver.

## Review Focus

- Derived comparison must not promote missing fields, an extra failed predicate or an altered legacy status into Observed claims.
- Original invocation, displayed text and parsed runtime argv must remain different claims with explicit omissions/unknowns.
- Current analysis revision cannot overwrite historical observation revision or imply a live/executable state.
- A historical source match must be restricted to declared files and exact frozen bytes, never mask runtime/vendor drift.
- Annotation must omit unrelated/private input content and preserve raw/case/status immutability.

### Task 1: Pure historical claim annotation

**Files:** new experiments/launch-evidence-lanes.mjs, tests/engine/launch-evidence-lanes.test.mjs; completion150/current metadata.
**Interfaces:** describeLaunchEvidence({result,caseRecord,provenance,analysisRevision}) -> frozen schema/annotationKind/sourceOnlyAnalysis/nativeReexecuted/legacy/claims/unknowns/freshness/fullA02. provenance includes rawSha256/caseSha256/observationRevision/inputsVerifiedtrue/physicalInputCount/historicalInputs. Invalid input returns status Refused/claims[]; valid status AnnotatedRetainedFactsOnly, legacy.acceptedfalse. Existing strict guard unchanged.

- [x] TDD missing-module RED; coherent retained-record copies and isolated status/scope/failure/identity/metadata/missing text/provenance/cleanup/secret/mutation controls. Implement claim-level historical DTO, no original guard edit. Focused `node --test --test-isolation=none tests/engine/launch-evidence-lanes.test.mjs` -> PASS.
- [x] Full npm test/retained source/raw integrity -> PASS; local source commit/task-done. No fresh native proof.

### Task 2: Finite retained-dataset verifier and annotation artifact

**Files:** new experiments/launch-evidence-lanes-run.mjs, tests/engine/launch-evidence-lanes-driver.test.mjs; completion150/current metadata; fresh ignored output.
**Interfaces:** consumes describeLaunchEvidence; CLI CASE OUT. verifyLaunchEvidenceInputs(expected,{revision,allowedHistorical}) -> {physicalCount,historicalInputs,verified}; writeLaunchEvidenceAnnotation(out,annotation) wx. Actual case path only browser-launch-witness-case.json; raw SHA pinned; only three exact registered Git inputs allowed.

- [x] TDD unknown CLI/hash drift/declared historical match vs undeclared/bad blob/case/raw alteration/output nonoverwrite/error privacy RED→GREEN. Implement finite read-only source verifier/writer, no launcher import. Focused/full checks -> PASS and source commit.
- [x] Run ONCE on retained dataset to fresh output; independently verify output/provenance/380 physical+Git distinction/raw4/source invariants and negative controls. This is post-run analysis, not another native experiment. Relevant aggregate/local commit/task-done.

## Final closeout

- [x] ONE fresh final review; effect regrade, one tested I/C correction pass maximum/no rereview. All rulings/Minors explicit, archive own workspace, clean final checkpoint and one next dependency without automatic app/threshold authorization.
