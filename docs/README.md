# Documentation guide

These documents define StateAtom's project boundaries, target design, and development rules. They do not certify the current implementation. [Status](status.md) is the record of the latest available prototype results.

| Document | Purpose |
| --- | --- |
| [Repository layout](repository-layout.md) | Current product, tests, experiments and historical relocation map |
| [Architecture](architecture.md) | Components, operating capabilities, analysis approach, and lifecycle boundaries |
| [Evidence model](evidence-model.md) | What each claim means, what supports it, and how unknown or stale information is represented |
| [Experiments](experiments.md) | Local interventions, observation, cancellation, undo, and baseline restoration |
| [StatePort integration](stateport-integration.md) | Optional Desktop connection and the difference between evidence bundles and State Cards |
| [Validation](validation.md) | Case design, result accounting, verification, and release gates |
| [Status](status.md) | Reported prototype capabilities, unresolved results, and the next technical gate |
| [Decisions](decisions.md) | Adopted project direction and provisional implementation choices |
| [Provenance](provenance.md) | Actual source origins, license boundaries, dependency and exclusion inventory |
| [Licensing](licensing.md) | Intended license, existing notices, and publication requirements |
| [Security policy](../SECURITY.md) | Sensitive reports, data handling, and trust boundaries |
| [Contributing](../CONTRIBUTING.md) | Scope of contributions and review expectations |
| [Agent instructions](../AGENTS.md) | Operational rules for coding agents working in the repository |

## How to use the documents

For a first implementation change, read the architecture and the relevant behavioral specification. For an adapter, also read the evidence and validation documents. For a mutation or restore feature, read the experiment specification before changing behavior.

Project boundaries are recorded in decisions. Behavioral requirements live in the corresponding specification. Measured support belongs in status and revision-specific test results. A successful demonstration does not silently change a specification, and a specification does not establish that a feature works.

When a change affects a documented contract, update the contract and its verification in the same change. Keep historical experiment results attached to their original criteria. Correct errors with an explicit note rather than rewriting the recorded outcome.
