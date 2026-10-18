# Working on StateAtom

StateAtom is an experimental UI inspection project being prepared for independent open-source distribution under the StatePort brand. Read [current status](docs/status.md), [architecture](docs/architecture.md), and the relevant source before changing behavior. The root README records the imported layout and local commands. Use package.json and the lockfile as the command and version sources; if a required command is missing, report that gap instead of inventing one. No public release is established.

## Scope and ownership

Keep changes within the requested task. Preserve unrelated work, existing experiment criteria, and source history. Explain a necessary change in direction before expanding scope. Stop a broad redesign when it exceeds the task; identify the concrete unresolved issue and propose a bounded next step.

Ordinary implementation and reversible edits can proceed under the task's authorization. Do not add an approval step to every small change. Publication, releases, account changes, and other external mutations must have appropriate explicit scope. Never infer authority to publish from authority to edit.

The target public scope includes core behavior, browser integration, adapters, and optional open IDE/development integration. Use one official extension with an optional Desktop bridge as the integration direction. Keep StatePort Capture/Replay and team or agent orchestration separate. Atom must not require an account, a closed resolver, or a paid AI API. See [StatePort integration](docs/stateport-integration.md).

## Correctness and evidence

Preserve JavaScript semantics. Do not re-evaluate user expressions or getters, force a skipped branch, or turn an unknown result into a known value. Associate observations with the exact event, frame, instance, and revision. A nearby execution or a similarly named component is not evidence for the selected occurrence.

Use the [evidence model](docs/evidence-model.md). “Observed,” “Code-linked,” and “Experimentally verified” describe scoped kinds of evidence, not a global confidence ladder. Retain missing, unsupported, ambiguous, and stale states explicitly. Never lower acceptance thresholds or count unsupported paths as passed to make a result look complete.

An AI assistant may implement a change or request an authorized automated capture. It must not fabricate run evidence, State Cards, screenshots, logs, or successful checks. A fixture demonstrates only what the fixture exercises; a smoke check does not establish a broad feature claim.

## Verification and reporting

Choose meaningful checks for the behavior changed. Preserve the original failing or control case when fixing behavior. Report the actual commands, revision, configuration, and results, including whether evidence came from a user interface or a harness. Explain checks that could not run and what remains unverified. Test counts alone do not establish correctness.

Read [contribution guidance](CONTRIBUTING.md), [security requirements](SECURITY.md), and [licensing guidance](docs/licensing.md) before sharing code or captured data. Preserve origin records and existing notices. Do not relicense historical code automatically. Keep public examples synthetic and shareable, and describe limitations in plain English without claiming unreleased support.

## Shared extension UI

Use `packages/extension-ui` for the extension visual base shared with StatePort.
Further extension-ui work must be based on the supplied documents, source
references, screenshots and other artifacts in `packages/extension-ui/design/`.
Start with its `README_RU.md`, `docs/HANDOFF_RU.md` and
`design/SCREEN_INDEX.md`; use `design/figma-current.json` for the recorded Figma
entry points. Preserve this reference set. Reconcile proposed UI changes with it
and document deviations; do not independently invent a replacement design.
The reference is a UX prototype: its simulated states and historical test results
do not establish production capabilities or fresh verification in Atom/Capture.
Read [the UI contract and workflow](docs/design/extension-ui.md) before changing
tokens or primitives. StatePort maintainers own this contract; external changes
require PR/review. Git tokens are authoritative; Figma does not update code.
Keep CSS within `[data-sp-ui]` with `--sp-*` / `sp-*` names. Edit token sources,
never generated CSS. Preserve Atom-specific layout and all evidence semantics.
Every visual change requires a changelog entry; breaking contract changes require
an incompatible contract version. Verify scope/keyboard/narrow views and affected
Atom workflows. Functional checks do not establish visual fidelity: compare the
rendered first viewport, typography, layout, alignment and controls against the
supplied HTML/screens and record necessary deviations. Screenshots are candidates
until reviewed by a human. Local
tarball preparation does not authorize publishing or modifying StatePort.
