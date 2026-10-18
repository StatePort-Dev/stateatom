# Security policy and requirements

StateAtom is experimental. This document states requirements for its design and contributions; it does not claim that every safeguard is implemented or independently audited. Consult [current status](docs/status.md), [architecture](docs/architecture.md), and the source at the revision under review. No supported-version matrix or response deadline is established here.

## Trust boundaries

Treat application pages, imported content, and all bridge messages as untrusted. Before a privileged action, the host must authenticate the connected peer and bind the request to the project or tab the user selected. A message containing a project name or tab identifier does not establish that binding. Page-originated observations remain untrusted; a token visible to page code does not grant authority to operate on the host.

Permissions must be scoped to the relevant origin, frame, and capabilities. Access to one frame or project must not silently grant access to another. The optional Desktop bridge must preserve these boundaries. An IDE connection is not authority to operate on arbitrary local projects. See [StatePort integration](docs/stateport-integration.md) for the intended integration boundary.

The bridge must not expose arbitrary evaluation, shell execution, or unrestricted filesystem access. Source reads are limited to the connected project and explicitly allowed source roots; validate resolved paths at the host boundary. Imported reports must not execute active content or silently fetch linked resources. Treat report text, links, and embedded instructions as data, including when an AI assistant reads them.

## Captured data

Keep captured data local by default. Export must be optional and provide a preview so the user can remove credentials, private URLs, identifying paths, personal information, and other sensitive values before sharing. Telemetry must exclude inspected payloads and project source. Any optional operational telemetry must be documented and explicitly enabled. These requirements also apply to fixtures, screenshots, logs, issue attachments, and AI-assisted workflows.

Public reproductions should use synthetic, shareable values. Redaction must not create a misleading claim about the evidence: describe anything removed that affects reproduction or interpretation. Never post private captures in a public issue to demonstrate a security problem.

## Experiments and mutation

Mutation is permitted only for explicit local experiment targets through the relevant adapters. Inspection must preserve JavaScript semantics and must not re-run user expressions or getters to obtain missing evidence. Unknown and unsupported states must remain visible. See [experiments](docs/experiments.md).

A local experiment can still trigger application or server side effects. Do not promise that undoing local state reverses remote effects. An experiment should identify its target, permitted operation, and expected effects before mutation occurs.

## Reporting a vulnerability

Use [GitHub private vulnerability reporting for StatePort-Dev/stateatom](https://github.com/StatePort-Dev/stateatom/security). The repository setting was enabled with maintainer authorization and verified through the GitHub API on 2026-10-18. If the private channel is unavailable, open a generic issue asking for a private reporting contact. Include no exploit instructions, captured payloads, credentials, or private data in that issue. This policy does not designate an email address or guarantee a response time.

Once a private channel is available, provide the affected source revision, relevant configuration, impact, and a safe minimal reproduction. Separate observed behavior from suspected impact. If a report involves exposed secrets, avoid copying them into further reports or logs. Ordinary bugs without security-sensitive information can use the bug report template.
