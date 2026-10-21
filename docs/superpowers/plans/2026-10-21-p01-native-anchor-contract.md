# P01.1 bounded native anchor/source-provider contracts

> Inline superpowers:executing-plans. No per-slice reviewer; ONE whole-P01 review only after its real product acceptance.

Base63c4173/main, user autonomy through2026-10-22T06:00Z. F02/U01/U05 prerequisites
complete. Scope completion/06 P01; source-map subsystem/parser/current acquisition
and evidence thresholds preserved. No publication/SDK/other repository/new redesign.

This increment creates the source contract and typed collector metadata, NOT the
completed select-element source UI or framework anchor. Native/page/historical and
artifact claims stay separate. Core parser/manual lookup still says not linked to
element. Do not rerun old whole-project experiments without a changed criterion.

## Native contract

core/action-native.mjs already returns CDP handler scriptId and line/column with BOTH
bases1. Confirmed current official CDP DOMDebugger.EventListener docs via Context7:
scriptId is handler code; raw lineNumber/columnNumber are0-based. This is registered
listener metadata, NOT invocation or callback-object equality.

Add registration.positionBase='one-based', selectedDocument/selectedNode backend
identities and registeredNode only for the exact selected target. These are already
read/validated locals; no new CDP command, source/description/closure/getter/function
read or application execution. Existing fields/results/history keep their meaning.

New core/source-anchor.mjs constructs stateatom.generated-anchor/1 ONLY for current
Observed dom-listener registeredOn selected-element, with matching typed registration,
actionContext/binding identity, selected backend identities, run/inspection/source
revision, source-map epoch and one loaded script. Normalize generated line1/column0.
Require script executionContext/frame/native hash/range metadata; accept only ordinary
external scripts with start0 and special=false. Inline/sourceURL/offset/unknown-frame/
unknown-script/delegated/stale/invalid coordinates remain explicit Unknown/Stale.
Artifact status/digest/domain stay separate; no hash-domain substitution. No source
text in anchor. Always execution not-observed, callback identity/property/HTTP producer
Unknown. A local opaque handle/fingerprint allows current-snapshot checks; clones/
imported history never become current by matching JSON. Construction is NOT attestation.

## Read-only source-provider boundary

New core/source-provider.mjs is browser-safe and performs no fetch/fs/eval/function
invocation. Accept a bounded serialized source-file set (JSON STRING only), sourced
later from selected map text or existing IDE-owned files, not application objects.
Schema stateatom.readonly-source-files/1:kind user-map|ide-owned, ownerDigest SHA256
label, files indexed in original order with source string/content string|null.
OwnerDigest is a backend-supplied identity label, NOT independent artifact verification.
The real map session remains responsible for Exact artifact match and lifetime.

Use existing MAP_LIMITS bytes4MiB/sourceCount512/content3MiB/name2048 budgets and
cancellation; preserve duplicate filenames by index-specific canonical virtual keys.
Never resolve sourceRoot/source names as URL or filesystem paths. No arbitrary-source
read by path, guessed imports, persistent cache or new IDE connection. Source content
gets a UTF8-original-source-text digest, distinct from generated/V8/raw-map domains.
Missing content stays unavailable; empty text stays an available empty file.
Metadata serialization excludes source bodies; explicit list/read stays session-local.
Close refuses new reads/clears private retention; no promise to erase already returned
strings. Parent session expiry/invalidation owns lifetime; no production grant policy
or new permission duration is decided here. Pure analyzer extraction/IDE adapter and
map/session wiring remain later slices, no second analyzer or source downloader.

## Task1 — source/collector contract, pack and local commit

- [x] RED/GREEN meaningful positive/counterexample checks:coordinate bases, exact
  selected occurrence, equal-label/wrong-script/context/frame/epoch/source hash,
  delegation, stale registration, inline/sourceURL offsets, invalid/missing range,
  opaque-handle clone/reflection safety and no property/callback/invocation promotion.
- [x] Native collector includes only already acquired backend identity/base data;
  retain existing closure-description/getter/no Runtime.callFunctionOn controls.
- [x] Provider tests cover explicit inert files, duplicate names/indices, hostile
  paths/sourceRoot not followed, byte/count limits, missing versus empty content,
  malformed/duplicate JSON/accessor/nonstring input without app callbacks, cancel,
  close, text-content digest and no source bodies in default metadata.
- [x] Browser-bundle check rejects Node/network/execution dependencies; focused/full
  source tests, syntax/diff checks. No new product UI/native quality claim.
- [x] Bump immutable Atom .31 only for the shipped native metadata addition; pack
  exact tarball, types2/admission7. The unused new pure modules are not archive
  exports until actually integrated; state this rather than implying shipment.
- [x] Record completion69/index/status/ledger, local commit. Next P01.2:wire actual
  selected native anchors through existing map session/read-only operation and UI,
  then real minified native/negative controls on the exact packed candidate. Framework
  anchor/full P01 remains a distinct later acceptance, never silently skipped.

Execution:completion/69. Final .31 source1919/focused60/new17, browser-source bundle,
types2/admission7 PASS. .30 immutable preparation superseded before acceptance:
actual EventListener.backendNodeId must identify registration; no fallback from the
requested DOM object. Missing/other target stays Unknown and produces no selected
registration graph. Positive worker mock gained the required actual target, existing
assertions retained; wrong-target graph refusal added. Coercion RED also fixed.
New pure modules remain unexported/unselected; no actual native/UI mapping yet.
Next P01.2 runtime/read-only UI integration and exact packed native controls.
