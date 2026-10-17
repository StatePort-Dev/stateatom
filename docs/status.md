# Project status

Last recorded baseline: **2026-10-17**.

StateAtom is an experimental project. The latest available prototype summary records **NARROW SCOPE** for the technical result and **NOT READY** for a public OSS alpha.

## Basis of this record

This snapshot records a maintainer-provided summary of Phase 2. The underlying source revision, individual case reports, and raw evidence are not included in this documentation baseline. These are reported observations, not an independent verification by the documentation package. A later result should include the revision and reproducible commands that support it.

## Reported observations

| Area | Reported result | Limit of the result |
| --- | --- | --- |
| Independent project-connected workflow | Browser and IDE builds and a narrow scenario ran without Desktop or a closed resolver in a fresh temporary directory | The offline dependency installation used an existing environment; a public-source build procedure has not been established here |
| Local interventions | The scenario exercised two API sources, repeated interventions, rollback, and Restore with a stale state | This does not establish every deep provenance path or a general restore guarantee |
| Extension-only entry | The attempt encountered an IDE-pairing requirement | The intended basic browser workflow was not available in that attempt |
| Complete deep paths | The reported result remains **0/6** | The summary does not establish the exact configuration and first unproven edge for each case |
| Diagnostic handoff | A harness created a bundle readable without IDE or Desktop | User-facing creation and export are not established by that result; the bundle is not a State Card |
| StatePort integration | A boundary and contract were described | The contract remains proposed and unverified |

The historical matrix used labels whose definitions differ from the intended extension-only mode: a previous A configuration allowed an IDE. Do not attach the 0/6 result to extension-only operation without inspecting the per-case conditions. Source access and runtime instrumentation must also be recorded separately.

Phase 1 remains recorded as partial and inconclusive. No later result is supplied by this baseline. The report did not establish a public release or integration into the main StatePort product.

## Next technical gate

Resolve the six deep-case results into explicit configurations, confirmed edges, first unproven boundaries, and causes supported by code or observations. Use existing evidence before rerunning cases.

If a bounded fix is justified, verify it on the original case and a control chosen before implementation. Otherwise, define the missing mechanism and the experiment needed to assess it. Do not infer infeasibility solely from missing implementation.

Browser-only access and user-facing save/export remain separate readiness work. Completing them must not silently upgrade the tracing result. Conversely, an IDE-connected success does not establish the same capability without an IDE.

## Updating this document

Add the revision, configuration, criterion, and evidence reference when changing a support claim. Preserve the old result or link to its retained record. Documentation changes alone do not move a case or release gate to pass.

## Repository import verification — 2026-10-17

The original documentation snapshot above remains a record of the earlier Phase 2 report.
The imported current source also includes later basic/diagnostic and Vue regression work;
the old browser-only `Pair IDE first` result does not describe this newer source.

Verified source baseline: `ad018c0d740f320f8dd55cdb0d2ddbff8673e7fd` (local source commit). No upstream Git revision
is claimed for the supplied directory snapshot; see [provenance](provenance.md).
The source commit was checked in a separate clean directory using only publication inputs,
fresh online public-registry `npm ci`, empty npm configurations and a new dependency cache.
No old build outputs, node_modules, vendor code, Desktop or closed resolver were copied.

| Check | Actual result and boundary |
| --- | --- |
| Install / build | 432 public packages installed; full browser/IDE/reader/fixture build and extensions-only build pass. All 490 non-root lock entries retained. |
| Existing unit/regression suite | 87 pass, 0 fail, 0 skipped; includes original suites, diagnostic lifecycle and Vue provenance regressions. No inherited lint/typecheck script exists. |
| Source-connected React P4 | Automated real Chromium MV3 picker and real VS Code Extension Host. Exact source selection confirmed through VS Code API. Three repetitions of left/right/joint interventions yield `[true, true, false]`; all are consumed and rolled back. Separate Restore returns `true`, panel shows Stale. |
| Current browser-only basic flow | 16 checks pass without IDE or SDK: DOM/property selection with Unknown source/deep provenance, local Save, reload/restart persistence, JSON Export, offline reader, hostile HTML as inert text, State Card rejection and Delete. These modules already existed before import. |
| Packaging / origin | Source licenses copied to each usable output; 26 actual IDE bundled dependency license texts retained. No symlink or binary source payload, private registry or external source path. |

Host configuration: Linux, Node 24.19.0, npm 11.17.0, Playwright 1.63.0 / installed
Chromium 153.0.8010.12 revision 1243 with sandbox enabled, VS Code 1.141.0,
open helper 0.1.0 and the included Vite/Babel development plugin. The IDE-free check
used an unchanged synthetic app without the plugin. No host browser or IDE binaries
are distributed. Network installation was verified; fresh OS provisioning was not.

These are automated UI checks, with harness setup/RPC explicitly separated in
[validation](validation.md). Raw temporary artifacts and credentials are intentionally
not published. The runtime bundle hashes before and after packaging edits match;
the build/notice changes do not alter the runtime checked by those workflows.
Manual Chrome UI installation, installed VSIX, Store, other IDEs/platforms, GitHub-hosted
CI execution and a repeat of the full deep matrix were not tested here.

**Product scope: NARROW SCOPE. OSS alpha: NOT READY.** The historical full deep-path
result remains **0/6**; synchronous observed fragments do not establish framework
commit, cache-version, async or complete provenance. Basic/export success does not
upgrade that result. Desktop integration remains proposed/unverified, and diagnostic
JSON is an evidence record, not a State Card or Replay. The original next technical
gate above remains separate work, not part of this repository import.
