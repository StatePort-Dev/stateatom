# P01.3a React host native carrier Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline. No per-slice
> reviewer; ONE whole-P01 review only after its actual full acceptance.

**Goal:** test whether the exact selected React18.3.1 host's current callback slot
can supply a native generated function location without executing app functions.
**Architecture:** bounded CDP own-data descriptors on the exact MAIN-world selected
node, matching React-compatible own Fiber/props suffix and Fiber host/backend. Read
only onClick/onClickCapture function metadata; reject getters/proxies/ambiguous slots.
This is NOT renderer attestation, invocation or complete P01/product delivery.
**Tech Stack:** existing CDP/Chromium153, pinned React18.3.1, existing esbuild/map parser.
**Spec:** docs/completion/06-production-and-source-maps.md P01; scope-review-1.

## Global constraints

Base adcadd4/main. Local work/commits only until2026-10-22T06:00Z; no push/SDK/other
repo/redesign. Preserve .34/UI .2 runtime and all historical evidence while probing.
No Runtime.evaluate/callFunctionOn/getter/handler/string-source execution in collector;
no closure reads, root dispatcher/nearest component inference or first-name match.
Only exact selected host, own descriptors, native FunctionLocation and explicit
backend/frame/context/snapshot. Source positions do not become callback identity.
Native handles are group-local and never persisted as durable object identities.
Metadata is page-owned/untrusted, not a renderer/version certificate. Success on
pinned real React establishes ONLY that finite adapter profile; fake structures do
not independently attest React. Return that boundary even on positive records.

## Review focus

1. Getter/Proxy candidate carriers/functions: refuse without executing traps/getters.
2. Duplicate suffixes/wrong Fiber stateNode/root/unmanaged target: no selected binding.
3. Bound/native function with no native location: Unknown, never follow target/closure.
4. Rerender/removal/node replacement or cancelled/late read: no stale coordinates.
5. Same-source different closures: same location allowed, object identity still Unknown.

### Task1 — finite reusable collector and real native feasibility (not UI delivery)

Files:create core/action-react-host.mjs, tests/action-react-host.test.mjs,
tests/fixtures/production-source-mapping/ReactHostCarrier.js,
experiments/actions/react-host-carrier.mjs; add one repository command.

Consumes:CDP send(method,params), selected selector/native document/node, explicit
MAIN executionContextId/frame identity, abort/current guard. Produces async
inspectReactHostActions(send,selector,identity,expected,{signal,current}={}):metadata
rows only, generated positions BOTH1-based, own callback property/source snapshot,
execution not-observed/callback identity/property producer Unknown. Missing profile
or function location returns explicit Unknown. Not imported/exported by product yet.

- [x] Write RED tests: exact selected Fiber stateNode and matching own props yield
  location; onClickCapture distinct; wrong node/suffix/duplicate/getter/proxy/invalid
  location/bound function/changed marker/cancel/stale guard refuse. No description,
  source, closure or Runtime execution call. Release group on success/failure.
- [x] Implement only that collector; GREEN meaningful tests and full npm test.
- [x] Register/freeze exact driver/fixture/vendor/plan/.34 package/host inputs before
  real probe. Browser plugin/skill absent; existing sandboxed native extension UI
  harness, Atom-owned app debugger only. No parallel app-target CDP facade/install.
- [x] Actual minified pinned React18.3.1:two same-label functions and same-source
  closures, MAIN vs isolated wrapper, getter-slot/handler, proxy-props/function,
  duplicate carrier, wrong Fiber target, unmanaged/root, bound handler, rerender.
  Known fixture counters/actual later click oracle separate from passive collector.
  No callback/getter/trap counts during source reads. Artifact bytes and mapped
  original function line checked separately; no product source-view claim.
- [x] Preserve failed attempts. If protocol unsupported, record exact gap; do not
  force function execution or use a weaker source/closest-component substitute.
  If finite positive, document exact scope and next P01.3b runtime/UI integration;
  archive .34 runtime unchanged, whole P01 still open. Local commit after checks.

Task2 is intentionally not implemented before actual Task1 evidence:extend the
current private source operation/anchor model/UI to this supported carrier, then
common pure bounded analyzer and remaining whole-P01 controls/review. No runtime
framework support is credited from source tests or this protocol experiment alone.

Ruling: autonomous task authorization covers routine bounded technical choices and
inline execution; do not add a new permission checkpoint. Cost if wrong:adapter
remains isolated/unshipped until evidence permits product integration.

Execution: completion71;7new/22focused/1944full source PASS;16native checks/17cases on pinned React18.3.1. Original .34 archive/hosts unchanged; explicit test sidecar, not product support. One missing-isolated-context attempt retained; empty isolated-world setup added. Source replacement RED→GREEN adds second descriptor/location read. Whole P01 remains open. Protocol copy retained after actual run with matching registered hash.
