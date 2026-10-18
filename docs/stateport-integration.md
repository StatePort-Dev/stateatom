# StatePort integration

StateAtom is intended to work independently. StatePort integration is an optional consumer of its public evidence and inspection capabilities. This document specifies the intended boundary; the protocol, schema, UI export, and end-to-end handoff are not represented here as released or independently verified features. See [status](status.md) for the current evidence and [architecture](architecture.md) for the complete Atom boundary.

## Product boundary

The distribution direction is a public standalone Atom extension and one official StatePort host consuming the public `@stateport/atom` package, with an optional Desktop bridge. The official host is a separate consumer; Atom does not require the entire official extension or its Capture implementation to move into this public repository. Atom's inspector, analyzer, supported adapters, optional IDE tooling, local interventions, undo, and export remain independently usable. Sharing these capabilities should use a single implementation and evidence model rather than a separate closed analysis path.

Existing Desktop Capture, State Cards, Replay, and team or agent workflows remain separate StatePort capabilities. They may consume Atom evidence without becoming prerequisites for local inspection. Optional server workloads belong to the separate product and must not become an implicit requirement for ordinary Atom use. The integration should not require a second public extension, a cloud account, a closed resolver, or a model/API service.

These boundaries also govern naming. An Atom evidence bundle is not a State Card. A handoff does not establish replay availability, authentication transfer, or permission to act in another application. Describe each capability separately and show its actual availability.

## Readable evidence handoff

The proposed handoff is an open, readable evidence bundle. A consumer should be able to examine its observations, code links, experiments, exclusions, and unknown boundaries without an IDE or StatePort host. Reading an exported bundle must not require reconnecting to the originating page. A bundle may refer to source that is unavailable to the reader; that absence must be visible.

The bundle should retain the scope and identities needed to interpret each claim: relevant session and navigation context, component or state revision, source/build revision, acquisition method, and any invalidation or redaction. Use **Observed**, **Code-linked**, and **Experimentally verified** with the claim-specific meaning in the [evidence model](evidence-model.md). A consumer must not promote a possible code path into an executed path or broaden an experiment's conclusion.

An export should include a concise manifest of included and excluded material. Preview and redaction must precede user-directed sharing. Exclude raw credentials; avoid retaining authorization headers, cookies, tokens, and other secret material in the exported bundle. Where redaction removes a field or breaks a link, expose that limitation. A sanitized bundle must not imply complete provenance simply because it remains readable. Retention and sensitive-data handling are specified in [Security](../SECURITY.md).

## Connection and capability negotiation

Use a minimal, versioned handshake with explicit capabilities and compatible schema information. The exact messages and transport remain proposed. Capability negotiation should distinguish reading evidence, receiving live updates, requesting a capture, and requesting an intervention. A connection must not acquire every capability merely because it can receive a bundle.

Connection state should be visible, revocable, and scoped to the relevant session and project. Missing Desktop software, an incompatible host, a disconnected IDE, or a failed handoff should leave Atom's available local capabilities usable. A source connection may be required for a particular analysis operation; that requirement must not be presented as a dependency of the entire inspector.

Browser and page messages are untrusted input. Validate message shape, size, sender context, session identity, and requested capability at each boundary. A page must not gain arbitrary JavaScript execution, shell access, or filesystem reads through the connector. Source access is limited to the project the user explicitly connected. A file path, symbol name, or command supplied by inspected content is data, not authorization to resolve or execute it.

## Desktop and agent actions

Desktop actions require explicit user authorization for the workflow and a clear target. An authorized automated run can execute covered steps without another approval at each call. Opening a reviewable evidence bundle does not itself authorize capture, application changes, or sharing material with a team. Intervention requests must preserve Atom's preconditions, scope, cancellation, and stale-state behavior; see [experiments](experiments.md). Connector failure must not convert a partial intervention into a reported success.

State Card capture must originate from an actual user capture or an actual automated run. An agent may request a real capture when authorized, but cannot synthesize evidence that an unperformed run occurred. A request, generated scenario, or bundle assembled by a test harness is not itself proof of browser execution. Preserve the distinction between the instruction to run, the execution record, and the resulting artifact.

## Acceptance and documentation

Validate standalone operation with the StatePort host absent, permission rejection at each bridge, incompatible versions, interrupted handoffs, and redacted exports. Verify that exported evidence can be read independently and that consumers preserve unknown boundaries. A harness-produced artifact does not verify the application's export UI. [Validation](validation.md) defines the broader checks; [status](status.md) must distinguish reported tests from evidence reviewed in this repository.

Keep protocol choices and tradeoffs in [decisions](decisions.md). Reuse of connector or shell code requires the checks described in [licensing](licensing.md). No integration document should promise a fixed first-version schema or transport before review and implementation establish one.

The local embeddable contract, package and two-host validation workflow are documented in [Embedding Atom](embedding.md). This candidate does not establish integration into the official StatePort host.
