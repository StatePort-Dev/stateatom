# Project decisions

These decisions state the intended project boundaries. They are not a claim that the corresponding implementation is complete. [Status](status.md) records the available prototype evidence.

## Independent Atom

**Direction adopted.** Atom's local inspection, supported analysis, experiments, and evidence export belong in one independently usable open project. Basic operation must not depend on a StatePort account, Desktop installation, paid model, or private resolver.

Opening only a shell around a required closed analyzer would not satisfy this boundary. Optional source tooling and dev instrumentation are compatible with independence when their required implementations are also available as part of the open workflow.

## One official browser extension

**Target distribution.** The preferred distribution is one StatePort extension, built from the public browser source, with Atom and an optional Desktop connector. Existing Desktop Capture and Replay code stays in its own project boundary.

This avoids maintaining separate copies of the browser engine. A closed browser host should be introduced only if an identified requirement needs it, with its additional build and compatibility costs recorded. It is not a prerequisite for the current experiment.

## Shared implementation

**Direction adopted.** Fixes to Atom's engine, adapters, and interface belong in the public source of truth. Other consumers use a specific version or a documented connection; they do not maintain a copied implementation.

Logical module boundaries should follow actual responsibilities. Separate repositories, published packages, and a general plugin platform require a real consumer or demonstrated need. The architecture diagram is not a command to reorganize working code before testing it.

## Evidence before explanation

**Behavioral requirement.** An explanation must identify its evidence, execution context, and unresolved boundary. Observed, Code-linked, and Experimentally verified are distinct forms of support for a claim. None is a universal guarantee of root cause.

No dependency is inferred from equal values alone. Missing observations remain missing. An unchanged outcome after an applied intervention can be masked by other blocking conditions. See the [evidence model](evidence-model.md) and [experiment rules](experiments.md).

## Analysis stack

**Provisional implementation approach.** Start with existing useful analyzer code, TypeScript or ts-morph for source navigation and a bounded backward analysis, runtime adapters, and selective dev instrumentation where needed.

Peekly is a candidate source of browser inspection components. Its selection does not establish value provenance and does not require rewriting a working shell. Joern merits a limited evaluation only against a specific unresolved analysis gap and measured deployment cost. Neither reuse decision is a release dependency until validated.

The evidence contract should survive a change of analysis engine. A new engine must be assessed against the same cases and explicit support criteria.

## Relationship to StatePort

**Direction adopted; protocol unverified.** Atom exports a readable investigation and may hand context to StatePort through an optional, described connection. StatePort may use actual capture and replay to continue the workflow.

Readable evidence and reproducible application state are different artifacts. Desktop's presence must not become a prerequisite for an unrelated Atom operation. Exact transport, wire fields, and compatibility rules must be validated before being called a supported API.

## License direction

**Provisional pending source inventory.** Apache-2.0 is the intended license for new, original Atom code. Historical and third-party notices must be preserved. Applying a repository-wide license requires the work described in [licensing](licensing.md).

## Public claims

**Documentation rule.** Describe current capabilities from a recorded, revision-specific result. Describe target behavior as a design requirement. Keep future support, release dates, performance claims, and installation instructions out of current-capability sections until verified.

Changes to these decisions should state the affected behavior, evidence, and tradeoff. Routine implementation choices within the boundaries do not require a new decision document.
