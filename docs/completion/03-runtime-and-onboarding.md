# Runtime, project setup and package contracts — implementation plan

**Goal:** connect normal projects and embed the current Atom package without duplicated policy, fixture-only setup or undocumented contracts.

**Architecture:** retain `createAtomRuntime`, `createChromePlatform`, the dispatcher/client and `mountAtom`. Extract only shared policy and type definitions needed by these consumers. Atom continues to own analysis; the host supplies scoped resources.

**Tech stack:** current JavaScript/ESM, Chrome MV3, Node/npm toolchain, existing build and browser/IDE harnesses.  
**Spec:** [release scope](02-release-scope.md), existing [embedding contract][R19], [project instructions][R01].

## Existing implementation

Runtime/transport/platform repeat synthetic-origin and bridge restrictions. Read-only HTTPS was added later than the original embedding contract. Public declarations exist, but their compilation was not part of the original acceptance. The package already has runtime/UI/platform/transport entrypoints, exact UI peer and tarball tooling. [R15][R16][R17][R18][R20][R21]

## F01 — One capability model and checked public contracts

**Execution:** complete for Atom `0.1.0-candidate.20261019.3`; see
[implementation, exact checks and boundaries](14-f01-capability-contracts.md).
Reuse this result; the following brief remains the acceptance contract.

**Scope reconciliation:** the preceding source-exploration increment is complete
and must be reused; see [credited work](13-scope-reconciliation.md). Consolidate
the current enforced read-only policy without claiming F05 enablement exists.
Represent unavailable picker/editing/trace/model capabilities honestly. A05/L02
are required later deliveries, not implied by source handlers or fallback output.
U02 owns Live eligibility/timing; F05 owns grant scope/lifetime; U06 owns handoff UX.
F01 must not choose those unresolved details as if already approved.

**Depends on:** none.  
**Produces:** a versioned capability response, one operation policy, checked consumer declarations and updated embedding documentation.  
**Consumes:** existing security grants, request envelopes and source/inspection availability. These are not replaced by a new plugin framework.

**Files:** modify `packages/atom/src/runtime.mjs`, `platform.mjs`, `transport.mjs`, `ui.mjs`, the corresponding files in `packages/atom/types/`, `contract.json`, `docs/embedding.md`; add `packages/atom/src/capabilities.mjs` and `tests/atom/capabilities.test.mjs`. Add type-consumer fixtures under `tests/atom/types/` and a narrowly scoped type-check command; these are proposed new files/commands.

Work:

- Inventory every existing operation and the resources/authority it requires. Keep observation availability separate from action permission: a source provider does not authorize writing source or mutating a page.
- Introduce `describeCapabilities(context)` as a pure projection of current target, source provider, instrumentation, policy, version and lease state. It returns feature availability plus a reason when unavailable. Use stable feature identifiers such as `basic.inspect`, `source.navigate`, `actions.source`, `experiment.response` and `production.maps`.
- Expose the projection through a validated `capabilities` operation. Additive wire-v1 evolution requires an explicit feature list so older hosts do not assume support from version 1 alone. Incompatible shape changes require a new contract version and refusal of incompatible consumers.
- Runtime enforcement calls the same operation-policy source. UI availability is advisory; changing the UI response or DOM cannot grant permission.
- Remove contradictions between the canonical contract, declarations, README and earlier prose. Keep old validation reports historical.
- Compile a minimal consumer of every exported entrypoint with the selected Node/TypeScript module resolution and a browser-consumer fixture. Add a pinned development-only compiler if absent. Do not convert the runtime wholesale to TypeScript.

**Test cycle:** write cases for Basic with no helper, connected source with no observations, instrumented but unsupported expression, read-only HTTPS, wrong origin, missing permission, foreign debugger lease, disposed runtime and older host without new feature support. Assert both visible reason and denied operation. Compile the consumer from the **packed** declarations, not repository-relative imports.

**Run:** existing `npm run verify:atom-contract`, `npm test`, `npm run build`; new declaration/capability tests; `npm run pack:atom` and packed consumer check. Run affected real UI/embedding checks after this contract changes.

**Done:** the same state cannot be shown as enabled by UI and denied due to an inconsistent mode definition; security denial still holds when called directly. Current Basic, source, experiment and map behavior is preserved. No permission widening is part of F01.

## F02 — Explicit site/project policy instead of fixture ports

**Depends on:** F01.  
**Produces:** scoped application connections that admit real supported localhost and HTTPS sites.  
**Files:** modify runtime/platform/transport, standalone `browser-extension/manifest.json` and `worker.js`, UI connection controls, `core/bridge.mjs`; add `tests/atom/origin-policy.test.mjs` and a native connection scenario under `tests/integration/`.

Work:

- Replace duplicated fixed-port decisions with a validated project/site record. A record identifies canonical application origin, mode, source connection and permitted actions; it does not accept arbitrary URL prefixes or filesystem paths from the inspected page.
- Keep HTTPS/production default read-only. A trusted development connection can request specific development actions after explicit user approval. `localhost` alone is not approval to clear storage or send application actions. The separate F05 workflow allows production changes after two confirmations; F02 must expose that future distinction without enabling it implicitly.
- Cover ordinary `localhost`, `127.0.0.1` and IPv6 loopback dev ports. Additional hostnames need explicit origin approval. Do not silently expand to all HTTP sites or infer tenant permission from a registrable domain.
- Separate the application origin from artifact-server origin and local helper endpoint. The same record must not grant all three by accident.
- Validate local helper endpoints according to a documented loopback policy; retain the current default port as a convenience, not the sole working installation. No LAN scan, generic localhost proxy or arbitrary shell startup.
- Treat source navigation/definitions as separately authorized read-only operations, not as implicit application mutation. The current runtime groups them with denied production operations. A future source-connected production path may permit them only after a trusted workspace/build association; do not lift the production mutation guard as a shortcut.
- Navigation across origins invalidates the previous context and requires appropriate new authority. Revoking host permission ends the relevant operation and clears retained private source material.
- Retain public standalone defaults and let the official host opt into supported capabilities explicitly.

Chrome host permissions and debugger attachment are different requirements. `debugger` is not an optional manifest permission; avoid designing an impossible optional-permission request. Request site access using the supported host-permission mechanism and start attachment only through the intended user action. [X02][X03]

**Test cycle:** exercise two projects on different ports, two tabs with different modes, denied/revoked site access, origin-changing navigation during attach and source acquisition, malformed origin, look-alike hostname and helper endpoint rejection. Use at least one real non-fixture port and actual browser permission state. A mocked permission response is not native prompt acceptance.

**Run:** existing Basic, React-host and source-map native checks; new origin/connection checks; relevant contract suite.

**Done:** a supported application can be inspected without editing source code to match Atom's old fixture ports. Production remains read-only unless the separately implemented F05 grant permits the requested operation. Invalid/stale permissions cannot be recovered through retries or alternate entrypoints.

## F03 — Installable open development integration

**Depends on:** F01/F02.  
**Produces:** a supported helper/plugin setup for an existing app, a connection receipt and an executable independent-project example.

**Files:** modify `ide-extension/extension.mjs`, its package metadata and README, `core/bridge.mjs`, `src/engine/plugin.mjs`, current build/setup scripts, and root README. Add a public plugin package boundary only where needed for a user to install it without cloning this whole test repository; keep the implementation in one source location. New tests belong under `tests/integration/project-setup.mjs` and appropriate unit suites.

Work:

- Make the real installed VSIX path the supported distribution test, not only Extension Development Host. Retain the development-host path for contributors.
- Provide one documented development-plugin configuration for a normal Vite React project. Record tested versions and conflicts with existing transforms; unsupported bundlers are explicitly unsupported, not assumed compatible.
- Make source-folder/workspace choice explicit and bounded by IDE workspace trust. Never require `tests/fixtures/inspection` in a user's app.
- Reduce pairing copy/paste using a versioned connection receipt or a local URI workflow when supported. A receipt identifies this helper, workspace, origin, version and session. Protect any session secret; do not place it in URLs that enter browser history or exported diagnostics.
- Keep every required component open. The browser can still use Basic when the helper is absent, has a wrong version, or disconnects.
- Do not make the controlled first-read launcher the default installation. It remains an optional specialised profile with its existing restrictions.
- Provide detection and a clear repair action for plugin missing, source version mismatch, multiple workspaces, occupied helper port and source maps without source content. Do not automatically rewrite an application's configuration without user-authorized project edits.

**Test cycle:** install the built VSIX and plugin artifact into a clean, independently structured project; follow its README without a prepared Atom harness folder. Select a property, open the exact file/range, change ordinary app state, inspect again, edit source/HMR, disconnect and remove the integration. Assert no product-specific filenames, hidden source hints, leftover instrumentation or `.runtime` dependency in the application.

**Run:** affected `verify:react-host-ui`, `verify:short-loop`, installed-helper form of `verify:first-read-ui` as a separate regression, and the new project-setup native test. Any new command must be added and documented before claiming it was run.

**Done:** setup is reproducible on a real supported project. A packaging success does not claim compatibility with every compiler or framework release.

## F04 — Immutable package pair and consumer receipt

**Depends on:** F01; can proceed alongside F02/F03.  
**Produces:** reproducible Atom/UI candidates, a machine-readable handoff and a checked consumer manifest.

**Files:** existing `scripts/build-atom.mjs`, `pack-atom.mjs`, `pack-extension-ui.mjs`, `packages/atom/package.json`, `contract.json`, package changelogs/types, `packages/extension-ui` contract metadata and `examples/embedding-host/`.

Work:

- Keep Atom API/wire version, package version, UI package version and UI visual contract distinct in the handoff. Record exact source digest, package bytes and exported assets.
- Every changed distributed artifact gets a new package candidate version. Do not replace the bytes of `.1`, `.3` or any already-issued candidate under the same identity.
- Resolve exactly one compatible UI peer; include tokens, components, fonts and reader assets by declared exports. Do not copy private consumer implementation into public packages.
- Build standalone and embedding hosts from an installed tarball pair in a clean consumer. Verify no imports escape into the sibling source checkout and no Node/compiler/IDE dependencies enter browser exports.
- Re-run the relevant latest features in both hosts. Old extraction reports do not establish that new source-map operations, new UI peers or model controls work in the packed combination.
- Preserve source/third-party notices. Do not relicense historical code or include private profiles/design demo data by accident.

**Test cycle:** wrong UI peer, wrong package hash, old contract, missing export/asset, stale declarations, clean install and artifact-only browser builds. Confirm Basic/save/export and a real source-connected action in both hosts. Source-map read-only opt-in must remain absent unless the host enables it.

**Run:** `npm run pack:atom`, `npm run verify:embedding`, `npm run check:ui`, applicable Actions/maps/native regressions and the new declaration check from F01.

**Done:** a consumer can identify and reproduce the exact accepted pair. Official StatePort intake is a separate task in [08](08-stateport-integration.md), not an implied result of packing.

## F05 — Deliberately enable production changes

**Scope:** mandatory under C05 and the approved production policy.  
**Depends on:** F02 and U02.  
**Produces:** a real Settings flow with two sequential warnings/confirmations, enforced scoped authority and visible revocation.  
**Files:** the capability/policy module from F01, `packages/atom/src/platform.mjs`, `runtime.mjs`, `transport.mjs`, `ui.mjs`, `template.mjs` and public types; add `tests/atom/production-change-policy.test.mjs` and a production-like UI control suite. Keep private host integration in I02.

Work:

- Read-only is the initial production state. Present two distinct steps in Settings: first the risk of affecting a live application, then the specific target and limits of local undo. Do not combine them into a prechecked consent box or enable edits after the first step.
- Record the approved target and operation scope independently from site/source access. An imported diagnostic, page message, model output, paired IDE or successful map match cannot enable changes.
- Define the exact grant lifetime and navigation/restart/update behavior before implementing it. The scope review approved the two-confirmation option, not those lifecycle details. Select a conservative bounded policy and document it in the contract; do not issue a global cross-origin grant. Release updates must not auto-resume mutations.
- Enabling the mode exposes supported Live and Draft/Apply actions but executes nothing. Keep an always-visible production-change state and an immediate return-to-read-only control. Revocation stops admitting new edits and completes or explicitly reports cleanup of owned pending operations.
- Runtime and the host-owned lease check the same grant before each mutation. Missing capability, wrong target, changed revision, denied browser permission or foreign debugger ownership still refuses the operation.
- Do not claim that browser-side response replacement is a backend write, or that it has no possible server consequences. Do not implement arbitrary backend commands. Reload, cache resets and supported reruns retain the actual consequences and confirmations required by the selected experiment plan; Live typing must not silently reset storage on each keystroke.

**Test cycle:** no grant, first warning only, both confirmations, cancel either step, different tab/origin, expired or revoked grant, direct forged operation, navigation/restart, two open Settings views and a foreign lease. Exercise both Live and Draft/Apply on a controlled production-like app; verify default denial and successful admitted change are separate assertions. Cancelling or refusing authorization must not reload, clear data or invoke app handlers.

**Done:** supported production changes work only through the two-step Settings enablement and real runtime enforcement. The UI names the target and rollback limits. Read-only inspection and Action Trace need no mutation grant. Actual production customer data is not used to prove this gate.

## Review focus

Check permission-to-capability consistency, origin changes during asynchronous work, workspace-secret handling, packed declaration resolution and stale artifact/version reuse. Any unknown build/connection state is presented as such; there is no “best guess” automatic attachment.

[R01]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/AGENTS.md "Project instructions"
[R15]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/packages/atom/src/runtime.mjs "Atom runtime"
[R16]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/packages/atom/src/platform.mjs "Chrome platform and debugger leases"
[R17]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/packages/atom/src/transport.mjs "Transport validation"
[R18]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/packages/atom/types/runtime.d.ts "Runtime declarations"
[R19]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/embedding.md "Embedding contract"
[R20]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/testing/atom-embedding-validation.md "Original embedding validation"
[R21]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/packages/atom/package.json "Atom package and exact UI peer"
[X02]: https://developer.chrome.com/docs/extensions/reference/api/permissions "Chrome extension permissions"
[X03]: https://developer.chrome.com/docs/extensions/reference/api/debugger "Chrome debugger API"
