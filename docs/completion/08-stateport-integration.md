# Official StatePort integration — implementation plan

**Goal:** ship the same accepted Atom runtime and inspector inside the official StatePort extension, without a fork or regression in Capture.

**Architecture:** public Atom/UI packages are versioned inputs. The official host owns the manifest, worker entrypoint, shared debugger ownership and Desktop connector. Capture implementation and production identity stay in the host repository.

**Tech stack:** existing packed Atom/UI, MV3 host, Native Messaging consumer and existing integration harnesses.  
**Spec:** [release scope](02-release-scope.md), public [embedding contract][R19] and [existing host task][R30].

This document belongs in the public plan and contains no private implementation extracts or credentials. Execute host changes only in the authorized StatePort checkout. Read its current code and instructions before choosing exact host files; the public example is not a substitute for that checkout.

## Already done

Atom has a real embeddable package, exclusive debugger broker and a distinct public embedding host. The original native validation exercised mount/dispose, Basic/source inspection, IDE selection, diagnostics and resource contention. That report used an earlier tarball and does not establish the newest feature combination or the official Capture bridge. [R20]

Do not restart the extraction. Reconcile the consumer's actual dependencies first; a declared dependency is also not evidence that all integration paths passed.

## I01 — Reconcile the actual consumer and update the package pair

**Depends on:** F04 for the final intake; read-only consumer inventory may start earlier.  
**Owner:** StatePort maintainer in the official host repository.  
**Produces:** an exact public Atom/UI pair consumed by the real host with reproducible build metadata.

**Public inputs:** `packages/atom/package.json`, `contract.json`, packed declarations/assets, UI peer contract and current `atom-handoff.json`. Current baseline package versions are documented in [the audit](01-current-state-audit.md); use the actual later F04 outputs, not those numbers hardcoded into a new release.

**Host files to locate before edits:** extension package/lockfile, package intake/hash validator, worker integration, UI entrypoint, asset copying and build receipt, existing Atom/Capture verification scripts. Record their paths in the host task ledger; do not publish private source in this plan.

Work:

- Determine what is already connected and which exact artifact bytes are shipped. Preserve completed integration and old accepted artifacts.
- Compare package version, wire/features, UI contract/peer, exported paths, manifest needs and source receipt. The new UI contract may be incompatible with an older consumer even when Atom's wire version remains 1.
- Replace the pair atomically with a fresh versioned, hash-checked intake. Keep the one immutable tarball approach if already used; do not make releases depend on a mutable sibling checkout or floating Git branch.
- Update literal expected hashes/versions only from the verified handoff, not by disabling the validator. Assert all runtime/UI inputs of the official build come from that candidate pair.
- Load tokens/fonts/components/Atom styles exactly once and preserve font/asset relative paths and notices. No private CSS fork of shared primitives.
- Keep the current official extension ID, native-host allowlist and Capture contract unless a separately tested change is required. Do not accidentally use the public test host identity.

**Test cycle:** correct pair; wrong digest; incompatible UI peer; absent new feature; missing reader/font asset; old cached output; clean consumer build. Open Basic and an Action/source-map path from the actual official UI, not by sending a synthetic RPC directly.

**Done:** the host records and executes the selected pair reproducibly. No Store submission or release is implied.

## I02 — Unified lifecycle, permissions and Capture coexistence

**Depends on:** I01.  
**Owner:** StatePort, with narrow public API changes returned to StateAtom if necessary.  
**Produces:** one supported official extension workflow, with Atom usable without Desktop.

Work:

- All debugger consumers must participate in the same ownership policy. Preserve exclusive use per tab initially. Do not keep a raw Capture debugger path that bypasses the coordinator while claiming arbitration.
- Adapt Capture's required commands through a vetted consumer-specific capability boundary. Do not broaden Atom's command allowlist to arbitrary CDP merely to fit Capture.
- Starting Capture while Atom owns the tab, and starting a deep Atom operation during Capture, must give a clear Busy/finish-current-operation result **before** any attach, injection, reload, cache change or interception.
- Atom panel closure disposes its view, not another consumer's capture. Runtime shutdown releases only owned resources. Worker restart restores stale metadata without fabricating live attachment authority.
- Desktop absent or disconnected leaves Basic/source-map/local-reader capabilities available. Source-connected operations depend only on the open source helper; Capture-specific failures do not become global “Atom unavailable.”
- Preserve default production read-only, source-map site opt-in and native permission gestures in the official host. Implement the same F05 two-confirmation Settings enablement for supported production changes; do not treat Capture connection or source access as that grant. Maps/Actions do not inherit Capture's sign-in material or response retention automatically.
- Verify trusted sender URLs and content-picker identities for the official paths. Neither a page nor a passive imported report can request arbitrary IDE, native-host or mutation operations.
- Render the same Atom UI and selected-tab context. Do not add a second Atom inspector or publish a second user-facing Store extension to avoid integration work.

**Native matrix:** Desktop absent; connected; disconnected during Capture; incompatible helper; Atom→Capture and Capture→Atom contention; tab navigation/close; worker-only stop/restart; denied/revoked site permission; official reader export; Basic on one tab while another admitted operation runs. For the completed baseline also exercise U05 picking, Live/Draft/undo, default read-only and F05 double-confirmed changes, Action Trace and the local-AI supported/unavailable routes on the same package pair. Check grant/lease cleanup without affecting Capture. Validate concurrency rather than assuming it.

**Done:** actual Capture still produces its real review/save result, and actual Atom still completes its declared free workflow. A mock competing consumer remains useful public regression but cannot replace this test.

## I03 — One official distribution and coordinated updates

**Depends on:** I02 and V01/V02; release decision follows V03/V04.  
**Produces:** a release candidate with explicit component versions, installation/update behavior and rollback instructions.

Work:

- Record official extension version, Atom package/source identity, UI peer/contract, source-helper/plugin compatibility and host bridge version in the build receipt and diagnostic About view.
- Ensure every delivery route packages that same accepted pair. A Desktop installer must not silently bundle an earlier Atom while a local developer build uses a newer one.
- Provide the standalone public build for independent use/contributions without presenting it as a second competing commercial distribution. Whether public npm artifacts are published is a separate release decision; local reproducible packages already support development.
- Exercise update from the previous accepted candidate and rollback without deleting host Capture data or changing historical diagnostic meaning. Do not auto-resume a mutating session after an update.
- Review permissions and Store disclosures against enabled capabilities. Runtime-loaded maps are data; executable application/extension modules are bundled at build time, not fetched from GitHub as code. [X05]
- Roll out only features verified in this official candidate. Local model use is optional and unsupported user devices retain normal inspection; implementing and validating O01 remains mandatory for the completed baseline. A narrower preview may precede L02/A05 or other unfinished work if its exclusions remain explicit. It is not an “all features” release.

**Done:** the chosen distribution is installable/updatable, component identities agree and the release matrix names its actual evidence. Publishing remains an explicit authorized step, never an automatic consequence of completing I03.

## Cross-repository workflow

Public feature change → public tests/package receipt → reviewed consumer intake → official native checks → release candidate. A consumer compatibility fix to Atom/UI goes back to their public source of truth. Changes to Capture stay in StatePort. External public pull requests must not execute with private consumer credentials or release secrets.

Shared UI changes require current Atom and Capture visuals on the same reference states. Record agent reference comparison and any human review separately; participation by another person is not a prerequisite. A passing geometry check does not override an actual rejected design decision. Figma remains a reference, not a runtime dependency or automatic publisher.

[R19]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/embedding.md "Embedding contract"
[R20]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/testing/atom-embedding-validation.md "Original embedding validation"
[R30]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/tasks/stateport-host-atom-integration.md "Existing host integration task"
[X05]: https://developer.chrome.com/docs/webstore/program-policies/mv3-requirements "Manifest V3 code requirements"
