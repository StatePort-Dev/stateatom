# Exact compiled-code effect-premise assessment

This follows [compiler-input acquisition](2026-10-18-compiler-input-progress.md)
and keeps the original P2/P1 full-field criterion unchanged. It is an acquisition
assessment, not product effect support or a completed HTTP path. Revision remains
the dirty `main` working tree above `bcde3d0f1572878df662db6bab79e65bc66dd6d0`.
The pre-implementation question/controls are in the
[spec](../superpowers/specs/2026-10-18-compiled-effect-premises.md).

## What the existing analysis actually covers

The native harness now optionally applies the existing strict `functionFragment`
to actual completed wire bytes, not original-source metadata or a normalized body.
Each report's full source digest must equal the Code-linked compiled receipt digest.
A function location in this report refers to compiled bytes, not an original IDE
range. The analysis does not strip observer calls or substitute a source summary.

The source helpers `calculateEligibility` and `selectAllowance` have conditional
syntax facts, with own-data, primitive and invocation premises still unverified.
The first is the selected P2 helper; the second is the existing P3 grammar control,
not a claimed P1 effect analysis or a held-out application. P1 stays the unchanged
selected-output control. Both **actual compiled bodies** are Unsupported under the
existing grammar: `Unsupported expression/effect: CallExpression`. Their observer
calls have no accepted readonly summary. Matching compiler bytes cannot fill that
effect boundary. Analysis is bounded to four logic-module digests per mode and
256 KiB per input, using the existing 160-step/12-depth grammar; only metadata and
digests persist. Omitted or unsupported analysis grants no authority.

## Native counterexamples

Two declared post-stage plugins insert operations into the original P2 helper:

- Direct `record.rules.quota = record.rules.quota`.
- `Reflect.apply(Object.defineProperty, Object, ...)` writing the same quota value.

A test-only DOM attribute set immediately after the operation is absent in both
baseline modes and present in each matching control. CDP DOM APIs inspect it; no
app expression/function/getter is rerun to obtain a result. This witnesses passage
through the inserted test section, not a product writer/field provenance event.

Original selected P1=13/P2.disabled=false, P3/P6 and the getter/error control outputs
stay equal to baseline, and the logic input/compiler/compiled-content link still
holds. Neither operation gains readonly, complete invocation/history, current-field
or fullPath authority. These controls demonstrate why unchanged UI, source metadata,
source guards and compiler correspondence are insufficient to certify no writes.

The grammar already refuses opaque observer calls before reaching these operations.
Passing these controls **does not** prove distinct recognition of every writer,
complete writer instrumentation or semantic transparency for arbitrary applications.
The original post-stage arithmetic rewrite and delayed cache clone remain separate
controls. The historical deep matrix is still 0/6; selected full HTTP remains NOT MET.

## Commands and evidence

```sh
npm test
npm run build
COMPILER_TAG=<unused> npm run verify:compiler-inputs
COMPILER_TAG=<different-unused> npm run verify:compiler-effects
```

Run native commands sequentially without another dev server. The ordinary compiler
command retains its nine checks. The effects command adds three boundary/control
checks, for **12 native checks**, not twelve supported effect paths. Browser plugin
unavailable; pinned Playwright/CDP operates actual sandboxed Chromium 153.0.8010.12
with Vite 7.1.9 and React 18.3.1 dev. There is no extension/IDE/UI run in this assessment.
Reuse the exact unchanged product UI/build evidence from the compiler checkpoint.

`compiler-effects-first-20261018` passed 12 checks, stable inputs/dependencies and
no errors. The final run additionally asserts marker absence in both baselines.
Root full tests/build from compiler acceptance remain **343 PASS/build PASS**;
this increment changes only the standalone harness, npm command and documents.
Read-only review re-ran **28 focused controls** (compiler model/hook plus existing
function-fragment tests), found no bounded-contract blocker, and did not run native UI.

## Next bounded task

Assess a readonly contract for the **actual observer wrapper calls in the compiled
P2 helper**, with exact callee identity and ordinary own-data/primitive premises.
Keep unknown calls, changed wrapper code, both post-stage writers and P1 control.
Until such a contract is supported, do not unwrap these calls in the analyzer.
Even a local helper contract would not establish complete cache/state/props alias
lifetime or all executable/history coverage; those remain separate full-field gates.
No product authority, release or publication is added by this assessment.


## Final clean-source checkpoint

`compiler-effects-final-20261018` passes all **12 native checks**, including marker
absence in both baselines, with 66 unchanged source-input and five unchanged
dependency hashes, no errors. The successor frozen source archive
`/tmp/stateatom-compiler-effects-candidate-20261018` contains **252 regular source
files**. Fresh locked public-cache installation with empty npm configurations,
**343 tests/build**, and **34 matching outputs** pass. This reuses the previously
verified public dependency cache; it is not a new empty-cache network install.

`COMPILER_TAG=clean-compiler-effects-final-20261018 npm run verify:compiler-effects`
from that archive also passes **12 checks**, stable/no errors, no Git revision and
an explicit sourceArchive flag. Metadata/logs are in
`.runtime/candidate-bootstrap/compiler-effects-final-20261018/`, root results in
`.runtime/compiler-probes/compiler-effects-final-20261018/`, and clean results in
the candidate's corresponding compiler-probes directory. The previous accepted
249-file compiler-input archive remains unchanged. Product executable outputs
remain identical to the separately accepted UI candidate; no new UI check is claimed.
