# P01.1 — native anchor/source-provider contracts, source and pack only

2026-10-21; base63c4173 plus checked source. Bounded increment COMPLETE; P01 is NOT
complete. Exact final local Atom .20261021.31/UI .20261018.2. No source-view UI/native
minified mapping/framework acceptance, SDK, publication or other repository change.

## Implemented source boundary

Native registration metadata now explicitly carries its existing line/column BOTH
one-based, selected backend document/node and the ACTUAL EventListener.backendNodeId
when available. No additional CDP command or handler-description/source/closure/getter/
function execution is introduced. Existing snapshot IDs/times, execution not-observed
and stale-target checks remain. Missing/different listener backend means Unknown/
Unsupported and no selected-node registration graph evidence; raw metadata retained.

core/source-anchor.mjs constructs a scoped generated-anchor/1 only for a current
selected-element native registration with matching context/backend/run/inspection/
source epoch and one loaded script/frame/executionContext/native hash/range. Output
uses line1/column0. Delegation/static/component candidates, stale/missing coordinates,
wrong frame/script/occurrence and special inline/sourceURL/offset cases stay explicit.
Artifact match remains independent; even Exact artifact match does not establish
invocation, callback-object identity, disabled/property producer or HTTP ancestry.
No source text/URL/closure is copied into an anchor. Local factory handle/current
fingerprint prevents clones/imported history acquiring current status by JSON alone;
construction does NOT authenticate or independently attest the underlying metadata.
Future runtime operation must use/refetch its private current collector data, never
reconstruct current evidence from an imported report.

core/source-provider.mjs accepts ONLY bounded serialized explicit file data, not app
objects. Browser-safe/no fs/network/eval. Existing4MiB input/512files/3MiB source/name
budgets, cancellation and construction budget retained. Map/IDE-owned are source-set
labels; ownerDigest is not independent artifact authentication or a new IDE adapter.
Duplicate names retain index-specific virtual keys, hostile paths are inert labels,
sourceRoot is not followed, missing content differs from empty text. Explicit content
has a UTF8-original-source-text digest, separate from generated/V8/raw-map domains.
Default serialized metadata omits source bodies. Close stops reads/clears private
retention; it does not erase already returned strings. Parent session owns expiry;
no production permission duration/scope or persistent cache is introduced.

Neither new pure module is imported into the product or exported by final archive
.31 yet. The archive delta is the native metadata/target-admission correction. Old
manual source-map lookup remains not linked to element. These source contracts are
preparation for the real runtime/UI operation, not delivery of the P01 user workflow.

## Reproduced failures and preserved candidate history

- Source metadata ID/hash validation could implicitly call toString on a forged
  object. RED reproduced it; explicit primitive-type checks now prevent coercion.
- Initial .30 preparation inferred registeredNode from the requested DOM object.
  Official CDP docs confirm getEventListeners depth concerns a subtree and the
  actual registration node is EventListener.backendNodeId. A counterexample with
  missing/other backend reproduced the false selected-node classification.
- Fix uses that ACTUAL field, never a selected-target fallback. Unknown targets
  remain unsupported candidates; runtime graph cannot add selected registration.
- First full .31 attempt exposed one positive worker mock missing that metadata.
  Its intended-positive fixture now supplies actual target104; previous assertions
  remain, and a NEW wrong-backend graph refusal control was added. No threshold
  relaxed or negative case changed into positive. Failed log retained.
- .30 tarball/host/source receipt remain immutable, superseded BEFORE acceptance.
  Its1917 source pass does not verify the corrected .31 contract; no .30 type/
  admission/native success is inferred. Final candidate/version is .31.

## Actual current checks, with limits

| Check | Actual result | Scope |
| --- | --- | --- |
| New source controls | 17 PASS | Anchor8/provider6/native2/worker1; not browser runtime |
| Focused selected/map/native/worker set | 60/60 PASS | Coordinate/context/backend/stale/privacy/current/graph controls |
| npm test | 1919/1919 PASS,0fail/skip/cancel | Current source, after backend/mock correction |
| Browser bundle of two pure modules | PASS,20575bytes/no Node imports | Source build only, no actual browser execution |
| Exact .31 packing | PASS | Original shared UI .20261018.2 unchanged |
| Packed NodeNext/browser TS consumers | 2/2 PASS,TS5.9.3 | Existing exported Atom contract; new pure modules are NOT exports |
| Package admission | 7/7 PASS | Exact pair/hosts/assets/types plus negative copies; not product workflow |
| Syntax and git diff --check | PASS | No UI/style change/screenshot claim |

Official CDP sources retrieved via Context7:
https://chromedevtools.github.io/devtools-protocol/tot/DOMDebugger
(raw listener position0-based, actual backend target and subtree retrieval semantics).
Source-map parser/acquisition/manual UI, permission policy and historical criteria
remain unchanged. Existing parser/map/native tests were included because this source
boundary consumes them; old whole-project/native campaigns were not repeated.

## Evidence / next ONE bounded item

Final handoff:.artifacts/atom/2026-10-21T18-10-36-138Z/atom-handoff.json.
Superseded immutable .30:.artifacts/atom/2026-10-21T18-00-52-676Z/atom-handoff.json.
Aggregate:.artifacts/p01/anchor-source/verification31.json and verify31.mjs.
RED/GREEN/coercion/backend/focused/full/pack/type/admission/bundle receipts/logs in
that directory. Admission actual:.artifacts/atom/compatibility/2026-10-21T18-12-20-999Z/.
Source .31 tests/type/admission prove their named scope, not source readiness by docs.

Next P01.2:wire current selected native anchors through the existing map session,
read-only operation, source provider and existing UI; revalidate target/metadata on
source view, preserve manual unlinked mode, then exact packed minified native and
wrong-map/stale/delegated/same-label controls. No user-entered generated coordinates
in that workflow, no IDE, no invocation or property-origin promotion. A supported
framework anchor/common pure analysis and whole P01 test/review remain later; no
root dispatcher/nearest-component fallback.15/29 original full tasks complete;
mandatory L02 and complete A02 remain unresolved. Local commits only.
