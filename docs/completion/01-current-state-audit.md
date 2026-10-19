# Current-state audit

**Revision:** `f3a7a7e1ba43bea4e39954eaf49b95266822692b`  
**Date:** 2026-10-19  
**Method:** source and contract review, repository verification records, and read-only inspection of hosted CI.

## What this review establishes

The reviewed commit adds production source mapping on top of Action Inspector, a shared UI package and an embeddable runtime. The repository has moved substantially beyond the original prototype. Its public status records maintainer acceptance of a bounded alpha, not a generally released extension. [R02][R04]

This audit did not execute the current application. Native test counts below are **repository-reported results**. The hosted CI run for the exact reviewed commit independently reports successful dependency installation, `npm test` and `npm run build`. Its workflow does not run the browser/IDE/embedding suites. [R24][R25]

The review covered the package/build contracts, instructions and status, current runtime/platform/transport, source action resolver, explanation provider, map session/UI, inspector composition and their acceptance records. It is not a line-by-line security audit of every observer/compiler branch. The reference design was checked as a required dependency of the work, not reapproved visually or compared against live Figma.

## Implemented baseline

| Area | Existing implementation / recorded result | Remaining boundary |
| --- | --- | --- |
| Basic browser workflow | Selection, current Text/Disabled, local diagnostics, reviewed JSON export and passive reader; recent report records 26 native checks | Product entry remains development-oriented; broader production telemetry is not implied |
| React development inspector | Digest-bound source mapping, selected property/expression, supported recorded operands, IDE navigation, reinspection and Stale | Ordinary project onboarding and broader runtime coverage remain restricted |
| Complete HTTP path | Original P2 and distinct P1 reach one exact exchange and `/rules/quota` in the closed first-read profile | Only owned compilation, pinned dependencies, a fresh controlled browser and the first eligible read; later updates and arbitrary apps do not inherit it |
| Independent applications | Three preselected questions on React/Redux TodoMVC retained useful source/value fragments | This is not general store or HTTP ancestry; rerunning known fixtures is not a new unseen-app test |
| Actions | Direct functions, aliases, selected imports, inline candidates, `useCallback` and limited custom-hook callback returns | No executed-action path; member/prop callbacks and many hook forms are unsupported; no new positive Vue action support |
| Native listeners | Selected node plus document/html/body, bounded registration metadata | Not a complete ancestor/portal/shadow event path; registration is not invocation |
| Explanations | Deterministic action templates and experimental Chrome provider | Actual model was unavailable in the recorded run; output is limited to a finite set of literal sentences |
| Production source maps | `.map`, release ZIP, URL/manifest acquisition, per-script exact artifact checks and original-source excerpts | Generated line/column is entered manually; there is no production element/property producer anchor |
| UI foundation | `@stateport/extension-ui`, scoped tokens/primitives, supplied visual reference and current 440px inspector composition | Human visual acceptance and current cross-product parity need their own record |
| Embedded Atom | `@stateport/atom`, runtime/mount/client/platform contracts, standalone and distinct MV3 host | Earlier embedding acceptance used an older package; the latest feature combination needs fresh packed-host verification |

Sources: current status/setup [R02][R04], closed profile [R07][R08], actions [R09], production maps [R12], UI [R22], embedding [R19][R20].

## Important corrections to the old plan

### 1. `0/6` is historical, not the current total capability

The historical six-family matrix remains unchanged. The later closed-profile P1/P2 success is a different scoped result. Neither should erase the other. A task to “get the first full path from zero” would repeat completed work; a task to make supported paths work in normal development remains justified. [R02][R07]

### 2. The UI library and embeddable package already exist

The current Atom package is `0.1.0-candidate.20261018.3`, with exact UI peer `0.2.0-candidate.20261018.2`. The UI contract is 2.1.0; runtime/wire contract is 1. Package versions, UI contract versions and wire versions are distinct. [R21][R22]

The original 30-check two-host embedding report tested Atom `.1` and its earlier UI peer. It is evidence for that extraction, not proof of the new Action/AI/source-map combination. [R20]

### 3. Production source mapping is source exploration, not yet point-and-understand

The implementation explicitly offers a manual generated-position lookup. `Exact artifact match` verifies the chosen JS/map association; the interface separately says `not linked to element`. The current feature met a source-exploration minimum but not the desired QA workflow of clicking an element and receiving its relevant source context. [R12][R14]

### 4. Current local AI does not explain arbitrary findings

`core/action-explanations.mjs` supplies generic action facts and validates the model output against one of a few literal summaries. This is conservative but adds very little over a template. It cannot yet explain a multi-condition input result in ordinary language. Broadening this is a product/evaluation task, not an API-key task. [R11]

## Code-level delivery gaps

### G01 — Capability policy is spread across layers

`platform.mjs` and `runtime.mjs` separately recognize only the original loopback ports for privileged development operations. Other permitted HTTPS origins enter read-only mode. The bridge URL remains fixed to one local port, and transport validators duplicate some assumptions. This makes adding an ordinary project prone to inconsistent UI/runtime permissions. Consolidate policy without treating localhost or a configured origin as permission for destructive actions. [R15][R16][R17]

### G02 — User setup is still a test-environment recipe

The documented path includes an unpacked extension, a separately launched helper, a copied pairing token, a source-folder setting, synthetic ports and multiple dev variants. The controlled first-read launcher has additional restrictions. These are valid engineering entrypoints, but not yet a repeatable installation flow on a user's existing application. [R04][R08]

### G03 — Read-only production does not inherit all development observations

After source-map event handling, `onDebuggerEvent` returns early for `s.readOnly`. Normal fetch-body handling and compilation-journal collection occur later. Therefore the existing HTTPS mode must not be described as a complete production network/console bug-report recorder. Implement any intended QA observations deliberately, with separate scope and retention. [R15]

### G04 — Source-connected analysis needs a browser-compatible source boundary

The action resolver currently imports `node:path` and `node:crypto` and runs with filesystem-backed project sources. Source maps can contain source text, but feeding them into a Node-dependent resolver inside the extension is not implemented. Factor supported pure analysis from source acquisition; do not build a second unrelated resolver. [R10][R13]

### G05 — Visible capabilities and declared contracts need consolidation

Current declarations and package README include `readOnlySites`; an earlier section of `docs/embedding.md` still describes empty runtime options and localhost-only behavior before a later addendum. The repository records that shipped declarations have not been compiler-checked. Update one canonical contract and verify compiled consumer examples. [R18][R19][R20][R23]

### G06 — Input experiments remain low-level and restrictive

The current feature set offers controlled response experiments and explicit rollback, while the main view labels observed values read-only. The product still needs a guided eligible-input editor. A captured operand is not automatically writable, a response overlay is not a backend write, and the existing storage/cache reset is not safe to offer indiscriminately. [R04][R15][R28]

### G07 — Positive coverage is narrower than the planned cross-framework product

React is the primary supported dev path. Vue PARTIAL cases are valuable negative controls, not positive Vue feature acceptance. Actions explicitly decline `.vue` source bindings. A release claiming positive Vue support needs its own cases and implementation, not a broader logo list. [R04][R09][R10]

### G08 — Important release checks are not in hosted CI

Only install/unit/build run in the checked workflow. Native browser, packed embedding, IDE distribution, type declarations, source-map permission UX and real Nano evaluations remain separate. Some reports also retain reader font CSP and IDE CJS `import.meta` warnings. Reproduce and classify these warnings; do not suppress them wholesale. [R12][R20][R24]

## Existing results to preserve

| Record | Reported scope |
| --- | --- |
| Closed first-read acceptance | P1/P2; 17 installed-helper UI checks, 15 native query checks, 5 session controls; bounded scope |
| Retained short loop | 106 checks; 20 PASS and 10 expected PARTIAL inspections |
| Original embedding candidate | 509 unit tests; 30 native two-host checks; earlier package/UI versions |
| Action candidate | 544 unit tests; 32 native action checks; Nano unavailable |
| Latest source-map candidate | 568 unit tests; 19 native source-map checks; 26 Basic and 11 React-host UI checks |
| Hosted CI, reviewed commit | Installation, unit suite and build succeeded; no native workflow job |

These figures are not additive measures of feature completeness. Each record names its own source/build/configuration. Future work should rerun the affected current candidate rather than copy these numbers into a new “all passed” summary. [R07][R09][R12][R20][R25]

## Recommended priority

First close capability/setup/contracts and a real user workflow. In parallel, prepare the exact public packages for consumer compatibility verification. Then extend ordinary-session analysis and production anchors against concrete tasks. Do not spend the next cycle proving the original closed fixture again or replacing the working inspector shell.

A useful first release can precede universal provenance. It cannot substitute manual generated-coordinate lookup for the promised point-and-understand production flow without naming that limitation. The distinction is encoded in [release scope](02-release-scope.md).

[R02]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/status.md "Current status and historical results"
[R04]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/README.md "Current user setup"
[R07]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/roadmap/2026-10-18-closed-first-read.md "Accepted closed first-read scope"
[R08]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/testing/first-read.md "First-read operating constraints"
[R09]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/testing/action-inspector-validation.md "Action Inspector validation"
[R10]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/core/action-analysis.mjs "Action source resolver"
[R11]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/core/action-explanations.mjs "Current template and local-model provider"
[R12]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/testing/production-source-mapping.md "Production source mapping validation"
[R13]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/packages/atom/src/source-map-session.mjs "Map acquisition and lifecycle"
[R14]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/packages/atom/src/source-map-ui.mjs "Manual source-map interface"
[R15]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/packages/atom/src/runtime.mjs "Atom runtime"
[R16]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/packages/atom/src/platform.mjs "Chrome platform and debugger leases"
[R17]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/packages/atom/src/transport.mjs "Transport validation"
[R18]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/packages/atom/types/runtime.d.ts "Runtime declarations"
[R19]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/embedding.md "Embedding contract"
[R20]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/testing/atom-embedding-validation.md "Original embedding validation"
[R21]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/packages/atom/package.json "Atom package and exact UI peer"
[R22]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/design/extension-ui.md "Shared UI ownership and reference"
[R23]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/packages/atom/README.md "Atom package README"
[R24]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/.github/workflows/ci.yml "Hosted CI definition"
[R25]: https://github.com/StatePort-Dev/stateatom/actions/runs/39165018688 "CI for reviewed commit"
[R28]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/packages/atom/src/template.mjs "Current inspector composition"
