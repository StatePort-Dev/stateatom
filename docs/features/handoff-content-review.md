# U03.2b.3a — granular saved-source review model

New working implementation decision under the existing U03 plan, 2026-10-20.
This bounded increment is an **unimported data model**, not a new installed
profile or UI capability. It consumes strict saved v1 JSON; current `.17` remains
unchanged. Public rich codec/reader/UI follow separately. Original v1, minimal
profile, baseline/revision rules, evidence criteria and local limits stay intact.

`await createHandoffContentReview(sourceRaw)` returns a frozen controller with
`catalogue()` and `project(choices)`. The private catalogue is explicitly
`exportable:false`, contains filtered previews and never claims export readiness.
The projection has its own internal schema, source UUID/exact raw digest/time/
build/freshness/configuration, target value state, allowlisted field rows,
omissions/broken-context joins, original counts and fixed limitations. It is not
`stateatom.diagnostic`; current file import must reject it. No Chrome, fetch,
source resolution, active content, expression/getter evaluation or live lookup.

## Inclusion and field states

Choices are plain own-data `{includeCategories, includeFields, omitFields,
replaceFields:[{id,text}]}`. Fixed categories: selectedText, selectionDetails,
sourceLocations, sourceExcerpts, responseBodies, runtimeValues, networkLocations,
routePaths, originalNotes, diagnosticDetails, actionDetails, sourceMaps,
interventionValues. All private content starts excluded. Safe typed metadata
(statuses, numbers, booleans and declared digests) may be included by default;
selected disabled boolean may remain, selected text does not. A field override
can omit a category-included value. Replacement is always an explicitly labelled
**reviewer redaction string**, never a new observed boolean/value. Missing source
values remain unavailable; replacing them cannot invent data. No hidden original
or catalogue preview is copied into the projection.

Each row has a stable index-derived ID, generic label, source JSON pointer,
original evidence kind and fixed scoped explanation. No private filename, title,
URL or symbol is embedded in its ID/label. Content is `included`, `filtered`,
`omitted`, `replaced` or `unavailable`, with a reason when necessary. Preserve
Observed/Code-linked/Candidate/Experimentally verified/Unknown/Unsupported/Stale
as historical scoped claims. No field or checksum grants authorship, runtime
attestation, fix verification, source access or action authority.

Only enumerated v1 fragments are projected: selected condition/context; source
locations/expressions; runtime metadata/values/details; observed exchanges and
response excerpts; action source/registration relations; source-map association
metadata; legacy experiment values/acknowledgements. The v1 compilation journal is
explicitly omitted by this projection profile (including its script count); it
is not silently represented by a nearby runtime fragment. Unknown source keys, auth/
cookie/header/pairing fields and whole raw diagnostic objects are never eligible.
Known secret patterns/keys are filtered from eligible text/JSON before preview
and projection. Filtering is not complete PII removal; explicit user text and
all included values still require review. Declared digest fields preserve actual
hashes; hashes are data identity, not trusted observations.

URLs always lose credentials, query and fragment. Origins and route paths are
separate choices; arbitrary URLs embedded in text retain origin only. Relative
source paths and selectors are private choices, not automatic links. Source-map
metadata is a separate category and importing a map never opts it in; v1 already
excludes map/source bodies and original map filenames, so the model cannot recover
them. Response excerpts keep actual truncated/unknown state, never pretend to be
whole responses. Sensitive structured keys remain filtered even after opting in.

## Identity, joins, limits and missing features

Source UUID/raw digest binds the saved input, including whitespace. Field pointers
refer to that source, not a live page. A visible source location/value pair only
retains a historical fragment; it does not establish an execution/dependency.
Omitted/replaced/filtered/unavailable required fields make its context join
unverifiable. Network presence never becomes dependency proof; map lookup stays
not-linked-to-element; legacy experiment metadata lacks a new exact-occurrence
join. Keep local undo versus server rollback distinct. Do not fabricate absent
U02 history, A05 invocations or a P04 window from v1 or nearby current state.

At most2048 bounded field rows; strict v1/1 MiB input, existing tree budgets and
1 MiB projected JSON. Reject oversized exports without silently dropping reporter
identity/unknowns/expectations. Own descriptors, canonical dense arrays, unknown/
duplicate IDs/categories, overlapping conflicting replacement/omission, bad types
and oversized replacement text reject before reading getters. Returned snapshots
are detached/deep frozen. The original saved string remains unchanged.

Verification must exercise real projection bytes: synthetic PII/credentials in
all categories, defaults, opt-in, individual omit/replace, no nested raw leaks,
secret filtering, URL stripping, broken joins and unchanged original evidence
kinds, map consent independence, missing values, bounds, hostile strings and zero
network/actions. Full source suite plus exact `.17` package/entire-host identity;
no native rerun or rich-profile readiness credit for this unimported model.
