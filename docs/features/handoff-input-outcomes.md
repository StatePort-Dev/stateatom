# U03.2c.1 — unimported U02 outcome capture model

New working implementation under the existing U03/U06 journey and autonomous
scope; not prior interview approval or an installed capability. Current .23 and
strict v1/public handoff profiles remain unchanged. No capture/runtime/UI import,
permission, source lookup, action, SDK or new observation window in this slice.

## Existing facts and limits

Source: core/control-ledger.mjs, core/response-ledger.mjs, the two Atom editors
and runtime openInputs/save-diagnostic. Native and response acknowledgements have
separate phases; both keep consumption/effect unknown and applicationRestored
false. Native applied-after descriptors are actual acknowledgements. Response
outcomes can retain explicit delivery receipts; they are not API consumption or
selected-property dependency. Pending/partial/failed/unconfirmed/after-close and
undo/baseline are distinct outcomes, never a global verified result.

Runtime deliberately gives the input target build:null; diagnostic identity.build
is a collected-sample hash. These are separate domains, not an equality gate.
Editor target/observation can change value/time after editing, while the diagnostic
still records the original selected observation. Keep both, never rewrite either
or imply a transaction timestamp that the ledger did not record.

v1 has no native document/node or input history. Existing retained runtime summary
keeps only last8 transaction id/kind/phase/outcomeCount, no full prior context or
omitted total. It cannot restore full outcomes or join to a fresh selected event.
Historical request/control descriptors are not backfilled from current resource
rows by resourceId. Native after descriptors and explicit delivery receipts retain
only their own actual recorded identities; missing before/locator/revision stays
not-recorded. Current writable/rule/plan/undo/permission flags grant no file authority.

## Internal factory, not a public file format

New core/handoff-input-outcomes.mjs exports async
createHandoffInputOutcomes(diagnosticRaw, capture, {includeCategories=[]}={}).
It returns deeply frozen plain data, schema stateatom.handoff-input-outcomes/1,
exportable:false, executable:false. No raw diagnostic or raw snapshot clone in
output. Exact UTF8 source digest and a digest of the bounded supplied capture bind
content only; they are not authorship or native-capture attestation.

capture:null explicitly means not-recorded, not zero edits. Otherwise exact own
capture fields: kind (editor-snapshot/runtime-summary), sourceKind (dom-control/
json-response), capturedAt, snapshotRevision, selectionContext,
investigationContext, snapshot. Selection context has tabId/origin/run/document/
node/frameId/selector/property/selectionObservedAt/inspectionGeneration/
sourceGeneration/leaseEpoch. Investigation context has the same fields plus
investigationId. Contexts may be null; never infer missing fields from v1.

Future runtime integration must freeze these keys from its actual selected object
and editor-open ownership, with source/lease/inspection generations, BEFORE an
await. Current runtime does not supply that new guard. Captured time must equal
diagnostic.createdAt and original selected time must equal diagnostic.capturedAt;
shared diagnostic fields must agree. A recorded nonempty diagnostic run must agree;
missing diagnostic run remains missing in its source reference. Native frameId is
a separate actual runtime ID, never recovered from v1's frame0 or a component name.
Future/contradictory capture clocks remain unjoined; no inferred transaction time.
Editor snapshot target must match physical context; its later value/time remains a
separate observation. Exact ledger revision/investigation must agree. No current
value/build/React instance is inferred. Context consistency is a supplied claim,
not verified runtime acquisition in this unimported model.

Only a complete editor-snapshot can be capture-context-matched. Missing/changed
context, generation, node, document, run, native frame, selection/time or revision
produces unjoined with explicit reasons, no attached transaction details. Retained
runtime summaries always stay unjoined/summary-only: available counts can be shown
but omitted totals/details are unknown. Explicit null capture stays not-recorded.
Stale/closed/tainted/cleanup states remain historical; matching context does not
revalidate execution or the original snapshot.

## Bounded data and privacy

Copy own enumerable inert JSON descriptors before the first await; no getters,
toJSON, sparse/decorated arrays, prototype keys, nonfinite/-0 scalars or functions.
In-process Proxies are not observation adapters; the supplied runtime boundary
must already be inert JSON. Private capture limit1MiB, depth20/nodes65536/string16384. Refuse excess;
no truncation, baseline mutation or relaxed old format. Native≤32/current resources,
response≤128; history≤64, outcomes≤32 native/≤128 response; response pending≤32,
native pending one batch. Preserve actual recorded counts, unsupported/truncated
flags and unknown earlier history; these bounds do not change U02 catalogue/ledgers.

Default projection keeps ordinal/kind/mode/phase/count and literal scoped status
metadata only. Four explicitly included categories: inputIdentities, inputValues,
inputLocations, inputErrors. Optional data is represented as omitted/included/
filtered with own value only when reviewed. Reuse known-pattern filtering; URL
credentials/query/fragment never enter review output, filtering is not full PII
sanitisation. Do not replace an identity with filtered text and then call a join
known. Original record IDs/values/locators are never invented; local ordinals are
labelled ordinals. Missing mode/afterClose/transaction time/application-restoration claim and
optional notice list stays not-recorded/null, distinct from explicit false/empty.
Include choices snapshot before await. Output budget1MiB; reject excess explicitly.

This model cannot save/export/import/enrich installed reports. Later tasks must
add actual atomic runtime capture, explicit compatible public format and granular
normal review/storage/reader integration, plus native outcomes from actual U02
operations. Model fixtures and test counts do not complete that acceptance.
