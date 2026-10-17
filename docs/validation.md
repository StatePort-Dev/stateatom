# Validation

Validation must establish the behavior claimed by the particular feature. Passing a build, a unit suite, or an artifact checksum check does not establish a complete provenance path or a usable browser workflow.

## Record the actual configuration

Each result must identify the Atom source revision, application revision, relevant adapter versions, browser/runtime versions, and these independent capabilities:

| Capability | Record |
| --- | --- |
| Browser observation | Permission scope, frames, collection start point, and available events |
| Source access | Whether the project is connected and whether source identity matches the running build |
| Runtime instrumentation | Which probes or adapter hooks were enabled and when they started |
| Network history | Which exchanges were actually observed and whether relevant history was missing |
| Interaction path | User interface, public integration surface, or internal harness |
| External requirements | IDE, local helper, build plugin, Desktop, service, and any pre-existing cache |

Use descriptive configuration names. Historical labels such as A and B are not sufficient evidence of these capabilities. Preserve their original definitions and add a mapping when comparing old results with new configurations.

## Define the claim before the run

A case needs a selected instance and property, known expected behavior, the dependency or effect being tested, and a stated success criterion. Identify the first boundary that must be demonstrated: element-to-expression, expression-to-state, state-to-source, or an intervention's effect.

For a full-path claim, validate every required edge in the same relevant execution context. Joining independently passing fragments from different instances, builds, or data revisions is not a full-path result.

Use a fixture or oracle independent of the production analyzer to establish expected relationships. The analyzer must derive its result through its real interfaces. Test metadata must not supply the expected provenance to the implementation. Mocking an unavailable analyzer and asserting its output proves only the surrounding interface.

Choose a control case or a meaningful variation before changing the implementation. Prefer a different use of the same supported pattern over renaming one field. The case can be small; it must expose the behavior the fix is meant to generalize.

## Cases that constrain the design

This is a validation catalogue, not a list of implemented support.

| Case family | Required distinction |
| --- | --- |
| Multiple blocking conditions | An unchanged outcome after one intervention can coexist with a real dependency |
| Short-circuit evaluation | A possible branch differs from a branch executed in the selected update |
| Repeated responses | The same endpoint and equal values can belong to different exchanges |
| Query cache and local edits | The current value may descend from an earlier response or a later local write |
| Cross-file transforms | Aliases, selectors, helper calls, and shape changes require supported links or an explicit boundary |
| Multiple component instances | Source identity does not identify a rendered instance |
| Navigation and hot reload | Old references and interventions must not be applied to a new target |
| Missing source or history | Unavailable evidence must remain unknown rather than become a negative dependency claim |
| Framework and plain JavaScript cases | Support belongs to tested patterns and versions, not to a framework badge |
| Export and import | A user can create a reviewed bundle and read it without privileged execution |

For an intervention, also check an unaffected target or other appropriate negative control. Account for unrelated updates and pending work when interpreting a changed outcome. If those influences cannot be isolated, reduce the claim rather than marking it verified.

## Preserve execution behavior

Instrumentation checks must compare relevant application behavior with and without observation: returned values, thrown errors, call order and count, receiver binding, and branch execution. Add async or state-update checks where the adapter changes those boundaries.

Do not claim zero overhead. Measure the work introduced by an adapter when it could change timing, scheduling, or responsiveness. Record the test workload and method; do not invent a universal performance budget from a small demo.

## Account for results explicitly

Use the following run outcomes, while retaining any historical result vocabulary alongside its mapping:

| Outcome | Meaning |
| --- | --- |
| Pass | The stated criterion was demonstrated in the recorded configuration |
| Fail | The case ran and did not meet the criterion |
| Blocked | A required prerequisite prevented the criterion from being exercised |
| Unsupported | The implementation explicitly does not implement the required pattern |
| Not run | No qualifying execution was completed |

A separate diagnosis can explain why a failure occurred. It must not remove the case from the original denominator or convert it into a pass. A new subset evaluation must declare its scope and keep the original result visible.

Report the first unproven edge and link it to the code and relevant observation. Start diagnosis with existing evidence. Repeat a run when it resolves a named uncertainty or verifies a change; do not regenerate the whole artifact set merely to increase its size.

## Verify the actual workflow

Unit tests establish individual mechanisms. Integration tests establish that those mechanisms work together. A product workflow check must exercise the actual entry point and controls that users receive.

Distinguish a report created by a harness from a report created through the product interface. Distinguish a fresh working directory from a fully specified independent build: record dependency caches, local services, source mappings, and other inherited prerequisites.

For independent operation, run the claimed supported configuration without closed StatePort code, a Desktop process, or a private resolver. State any required open IDE helper or dev plugin. Check that absence or disconnection of optional Desktop integration does not disable unrelated Atom functions.

## Release gates

A narrow alpha may support a declared subset. It does not need to claim every case in the catalogue, but the scope must be explicit and useful.

Before describing a local workflow as supported, demonstrate it through its intended interface, include a control or independent variation, and publish its required configuration and known limits. For a tracing claim, identify which edges are actually supported. A partial path can be useful if its boundary is visible.

Before calling a release an independent browser alpha, demonstrate its declared basic workflow without an IDE. An IDE-dependent preview must be named and documented accordingly. These are separate claims.

Before open-source distribution, verify the source build instructions, dependency and asset notices, effective license, and the correspondence between the distributed package and its source revision. Confirm the security-reporting route and document relevant data handling. Release notes must describe the verified scope rather than the target architecture.

## Imported checkout commands and interaction boundary

From the root, `npm ci --no-audit --no-fund`, `npm test`, `npm run build` and
`npm run build:extensions` are the checked dependency/build/unit commands. CI runs
the first three with read-only repository permissions; it does not publish artifacts.
`npm run dev` starts the synthetic instrumented project for manual local use.

With host Chromium and VS Code available, run the following sequentially with the
fixture/IDE ports free: `npm run verify:browser`, `npm run verify:ide`, and
`npm run sanitize:artifacts`. The scripts create only their own disposable profiles
and outputs under ignored `.runtime/` and `artifacts/` directories. Never share the
runtime directory or pairing connection files. The sanitizer removes known own
pairing credentials from trace contents; it is not a universal personal-data filter.

The IDE check (`stateatom-phase2/demo.mjs`) uses actual panel Pair, picker, property
selection, Read evidence, Open in IDE, Run and Restore controls. Harness RPC configures
attach/property and reads state; it is not evidence of the corresponding toolbar UI.
The harness starts a real Extension Host and checks its exact active editor selection.
Its trial records and UI Stale check are scoped to synthetic React P4.

The IDE-free check (`stateatom-oss-alpha/browser-check.mjs`) uses actual Attach,
picker, Save, Export, Delete and file-reader controls, plus state/setup RPC. It
tests source absence and explicit Unknown rather than substituting an IDE stub.
It exercises saved-report persistence over a browser restart and an offline file
reader, with hostile text and a State Card input as negative controls.

These scripts are preserved automation; neither constitutes a human acceptance
test, Store installation, a complete deep-matrix rerun or a verified Desktop bridge.
See [status](status.md) for the dated results and source commit.
