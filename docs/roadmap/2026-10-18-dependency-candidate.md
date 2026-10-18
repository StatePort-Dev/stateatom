# Dependency repair and clean developer-preview candidate

Release preparation on dirty main above
`bcde3d0f1572878df662db6bab79e65bc66dd6d0` found 15 dependency advisory records
(13 high, one moderate, one low). The first 273-file clean candidate is preserved
as a non-release baseline. Its fresh 408-test installation/build evidence is real,
but it is superseded for release preparation by the repaired dependency candidate.

The fixes are exact dependency pins, not new framework support: Vite 7.3.7,
@babel/core 7.29.7, Angular compiler/core/platform-browser 20.3.34,
Vue/compiler-dom/compiler-sfc 3.5.44, Svelte 5.57.2 and @vscode/vsce 4.0.0.
React/ReactDOM 18.3.1 dev, Playwright 1.63.0 and Node 24.19.0/npm 11.17.0 remain.
The vsce 4 package requires Node >=22, within the existing Node 24 requirement.
No force-fix, dependency suppression, audit omission or acceptance relaxation is
used. The complete updated dependency audit reports zero known vulnerabilities;
this is an advisory lookup at this checkpoint, not a code-security certification.

Primary upstream records include the [Vite advisory](https://github.com/vitejs/vite/security/advisories/GHSA-p9ff-h696-f583),
[Babel advisory](https://github.com/babel/babel/security/advisories/GHSA-4x5r-pxfx-6jf8)
and [vsce 4 release](https://github.com/microsoft/vscode-vsce/releases/tag/v4.0.0).
The audit preserves all returned records, including framework/transitive ones;
not every advisory establishes exploitable behavior in this localhost workflow.

## Compiler regression boundary

The compiler probe's old 7.1.9 implementation pin intentionally refused the new
version. The renewed pin verifies all 15 split dist/node JavaScript inputs for
exact Vite 7.3.7 rather than approving an arbitrary matching version string.
Changed/missing implementation bytes remain a refusal. The older frozen candidates
and their original pins/results remain unchanged.

Vite 7.3.7 warmup now bypasses the dynamic environment.transformRequest hook.
A first attempt to retain graph proposals from warmup was rejected: an equal-code
clone installed before warmup completion could obtain an Observed claim. Its RED
and rejected source are retained privately; that admission path was removed.
A warmup function returning void supplies no actual transform-result object witness.

The acquisition-only compiler harness now explicitly configures
server.preTransformRequests:false for its positive cold pipelines. Actual App/shared
workspace → stage → returned native result → completed wire/compiled-content
criteria remain required. A separate real warmup-cache mode stays Unknown.
Concurrent timestamp URLs also stay Unknown when Vite normalizes their request
identity; there is no same-URL/content fallback. Product dev-server configuration
is unchanged by this probe-only restriction. No readonly, source-equivalence or
complete field ancestry claim follows from these compiler checks.

The 413-test suite includes the preserved original request/cache/clone controls,
warmup refusal before/after completion and 15-input pin checks. A first native
attempt failed on missing App warmup acquisition. A second failed only because the
new timestamp control expected an empty record list instead of the explicit
Unknown records that were actually acquired. The final control requires the
Unknown status/reason, not absence of records.

## Packaging boundary

The helper's package license expression now describes its actual bundle as
(MIT AND Apache-2.0). Historical MIT source is not relicensed. Root licenses,
NOTICE and dependency notices remain included. Publisher remains local-research;
no Marketplace identity or account action is inferred from local packaging.
A source archive/unpacked extension/VSIX prepared locally is a review candidate,
not an established alpha or Store release. All emitted metadata and source hashes
identify this exact candidate separately from historical checks.

Original P2/P1 full HTTP acceptance remains NOT MET until the bounded parse-to-read
revision/dataflow verifier described in the [consolidated result](2026-10-18-roadmap-closeout.md)
exists and passes through the product UI. Agent-operated acceptance is the user's
authorized fallback; it is not independent human evidence.
