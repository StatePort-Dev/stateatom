# Evidence model

StateAtom is an experimental UI provenance and inspection feature by StatePort. This document specifies a target evidence model, not a confirmed implementation or stable API. See [status](status.md) for available evidence about current behavior and [architecture](architecture.md) for capability boundaries.

The target question is specific: for a selected UI property in a particular update, which expression produced it, which transformations and state or query-cache revisions supplied its inputs, and which exact network exchange and response field supplied those values? Each connection needs its own support. A partial path is useful when its missing connections remain visible.

## Evidence belongs to claims

Evidence types describe support for an individual claim. They can coexist. They are not an ordinal confidence ladder, and the design does not assign a global confidence number.

| Evidence type | What it supports | What it does not establish |
| --- | --- | --- |
| **Observed** | An event or value captured in a recorded scope. | The value's ancestry or an unobserved execution. |
| **Code-linked** | A supported source path and its conditions at a particular revision. | That this path executed in the inspected update. |
| **Experimentally verified** | A scoped intervention and observed outcome under a stated baseline and controls. | Production truth, the root cause of a bug, or backend correctness. |

For example, an observed disabled button and a code-linked Boolean expression support different claims. An experiment may then support a claim that changing a supported local input changed that property's value under one baseline. These records do not automatically establish a response-field origin for that input.

Coverage and freshness are separate dimensions. A path may be code-linked but stale after a source change. An observed event may be current while upstream coverage is unknown. “Unknown” must include a reason where known, such as capture starting too late, missing instrumentation, unsupported transformation, unavailable source, or redacted content. It must never be presented as “no dependency.”

## Identity and scope

The following are logical record requirements, not a serialized schema or a promise that every adapter already provides them:

- A claim identifies the selected property, its owner, and the event or revision to which the claim applies.
- Source evidence identifies the source file, location, code revision, mapping method, and relevant conditions.
- Runtime evidence identifies the browser session, navigation, frame, component instance, and render or update where applicable.
- State and cache evidence identifies the relevant data revision, cache entry or state owner, and recorded read or write relationship.
- Network evidence identifies the exact exchange, capture scope, and field or transformation relationship when supported.
- Each record identifies its capture method and version, time or ordering information, and what was captured, omitted, or redacted.

An adapter must disclose identities it cannot supply. A timestamp can help order records; it cannot replace missing identity or prove that adjacent events are connected. Reused component names, source locations, URLs, and equal values are insufficient identifiers by themselves.

## Building a supported path

A source expression can contain several possible branches. Code-linked evidence describes those paths and their conditions. Runtime evidence must distinguish the branches actually evaluated in the inspected update. The display must not turn every statically reachable expression into an observed input.

A direct response-field or selector match also does not prove the exact property dependency. The path needs evidence connecting the selected property to its producing expression, the expression to its inputs, and those inputs through each supported transformation. Where a selector returns an object, access to that object does not establish that every field affected the property.

Keep the kind of connection explicit. A data dependency records a consumed value; a control dependency records a condition that selected a branch or outcome. Component ownership, source location, and event ordering provide context but do not establish either dependency by themselves. A trace must not silently convert one kind of connection into another.

Repeated primitive values are not provenance. A response containing `false`, a store holding `false`, and a property holding `false` do not establish a chain merely because their values match. Their identities, revisions, operations, and execution relationships matter.

A write creates a new value revision. It does not inherit the earlier value's data provenance merely because it uses the same store location. Preserve any supported data or control contribution from earlier values; an unrelated replacement starts a different lineage. The presence of an earlier response in session history is not enough to attribute a later overwritten value to it. When a transformation combines inputs, record which contributions are supported and which remain unknown.

## Exchanges, cache, and missing history

A URL alone cannot identify a network origin. Repeated requests can use the same URL while returning different values. The target model binds a claimed origin to the exact exchange and relevant response field, including the intervening transformations and data revisions.

A query cache may retain data from an earlier exchange. A later refetch does not become the origin of a rendered value simply because it is the most recent request. The cache revision consumed by the update must connect to the exchange that supplied it. If capture began after cache population, the design reports the existing value and unknown earlier origin unless independent evidence establishes that connection. It does not invent a request or reconstruct uncaptured events as observations.

Freshness checks should invalidate affected links after navigation, frame replacement, component replacement, hot module replacement, source revision changes, or relevant data changes. Retained historical evidence remains scoped to its original context. It must not silently become evidence for the current UI.

## Exporting a diagnosis

The target export is a read-only diagnosis that another developer, QA reviewer, or product manager can inspect without performing an intervention. It uses the same evidence model and implementation as the developer view; there is no parallel product-manager inference engine. Export does not imply replay, time travel, a State Card, or a story-point estimate.

A useful diagnosis records the claim, evidence types, context and revisions, supported links, unknown coverage, freshness, capture limits, and relevant experiment outcomes. It includes enough capture and adapter version information to assess reproducibility. Sharing should preserve the meaning of redactions and omissions without uploading all source, responses, or application state. The recipient must be able to distinguish a missing record from a recorded absence.

The basic extension is intended to remain independent of StatePort Desktop, an account, or a model. An optional IDE or source connection can supply code context; optional runtime instrumentation is a distinct capability. Neither should be assumed merely because the other is available. See [StatePort integration](stateport-integration.md), [security](../SECURITY.md), and [validation gates](validation.md).
