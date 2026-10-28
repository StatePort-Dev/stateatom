# Element properties without a global selector

Design proposal, 28 October 2026. No implementation or runtime proof is claimed.

## Maintainer direction

The user wants Text and Disabled visually separated, available together, without
choosing an active property. One selected element remains above the existing four
screens. Earlier direction remains: useful to a beginner, with inspectable technical
depth for an experienced developer; follow the supplied extension-ui design.

## Decision

Select an element once. Display each applicable, supported property as its own
result section. Both sections are visible simultaneously; opening details is local
presentation and must not change investigation ownership or retire another section.

A global dropdown, segmented switch or auto-selected 'most interesting' property
would preserve the unwanted selection step or hide another useful result. Repeating
the entire inspector twice would duplicate element context, actions and editing.
Use two property sections inside the shared inspector instead.

Illustrative composition (synthetic values, not captured evidence):

    Confirm order · button
    Inputs | Actions | Data & source | Evidence

    Text
    "Confirm order"
    [Recorded expression and observed inputs, when available]
    [Supporting records]

    Disabled state
    Disabled · disabled = true
    [Recorded expression and observed inputs, when available]
    [Supporting records]

Preserve the existing typography, tokens, source code panel and value rows. Remove
the global Property row. Keep CSS element selection as an advanced element tool.
Do not introduce invented explanations in the mockup or in empty states.

## Presentation rules

- Text and native disabled state are distinct recorded facts. `disabled=false` must
  not be labelled universally clickable/available: overlays, CSS, event handling,
  ARIA and other constraints are not established by that property.
- Show Disabled only when applicable to the selected element and supported by the
  acquisition. An ordinary paragraph does not get a meaningless disabled=false
  card. Unsupported acquisition must stay distinct from not applicable.
- Empty text is a known empty string, not an unknown value or absent result.
- Each section shows value first, then available expression/observed inputs. Missing
  causality gets one local explanation. One supported section does not make its
  neighbour supported; one missing explanation does not hide the other result.
- Source links and observed computations retain their distinct evidence meanings.
  A recorded computation alone does not establish a committed DOM producer.
- Detailed records expand within their section. Both result headings and values
  remain discoverable; there is no implicit active-property switch.

## Shared functions

- Actions belongs to the element once. A handler binding is not duplicated for each
  property and does not establish invocation or an effect on either property.
- Data & source keeps common sources/resources together, with exact property links
  only where established. Independently observed responses remain independent.
- Evidence groups claims by property within one element investigation. Each record
  retains its identities and freshness. Reports must preserve both sets explicitly.
- Use one shared input editor, not two editors competing for the same application
  input. An explicit experiment identifies which property it evaluates. Show any
  separately observed outcomes under the corresponding property; shared input
  presence or concurrent change is not dependency proof.
- Inspect again refreshes applicable property observations. Publish only records
  valid for the same selected node/document; do not call separately acquired
  computations an atomic snapshot. Display pending/stale state per result as needed.

## Current implementation constraints verified in source

- `packages/atom/src/ui.mjs`, property onchange: closes input UI, clears inspection,
  then sends `op:property` and reloads the selected state.
- `packages/atom/src/runtime.mjs`, property dispatch: stops action observation;
  changed property stops input ownership, records stale and begins a new inspection.
- Runtime input target identity and `input-controller.mjs` reply guards include
  property. `core/diagnostic.mjs` validates one text/disabled report target.
- `core/basic-analysis.mjs` builds its fallback around one selection.property/value.

Therefore mounting two existing inspectors, flipping the existing property setting
in the background, or copying one analysis into two visual cards is not a valid
implementation. The acquisition/state contracts must support property-scoped
results under one element identity before the UI can truthfully show both analyses.
This proposal does not authorize weakening existing identity/permission checks.

## Required implementation checks

1. Button with text and disabled result: both visible, separately explained.
2. Plain text element: no fictitious disabled result; empty text remains explicit.
3. One supported explanation and one unknown: correct local boundaries.
4. Node replacement/navigation/invalidation: no mixed old/new element results.
5. Different acquisition times: honest freshness; no fabricated atomic snapshot.
6. Shared input draft survives presentation-only detail expansion; edits still
   enforce ownership/revision/permission, with explicitly scoped outcomes.
7. One Actions view and a report that cannot conflate property evidence.
8. 360px layout, long values, keyboard focus and expanded technical details.

Next work is an element-scoped, multi-property acquisition/state design and its
compatibility boundary, followed by renderer changes. This is larger than a cosmetic
selector replacement. Existing public/runtime capability claims stay unchanged.
