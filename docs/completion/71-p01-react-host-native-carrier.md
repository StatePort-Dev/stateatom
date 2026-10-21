# P01.3a — finite native React host callback carrier

2026-10-21; base adcadd4/main plus checked source. Bounded collector/protocol
experiment complete; whole P01 and product framework source support remain OPEN.
The final .34/UI .2 product/archive/runtime are unchanged. No redesign/SDK/push.

## Question and implementation

The existing JSX/Vue resolver supplies source declarations and explicitly lacks
runtime transfer/function identity. Native React root dispatchers do not identify
the selected application's callback. This work tested a different, explicit carrier:
the exact selected host's own React-compatible current-props callback slot.

New internal core/action-react-host.mjs uses the existing owned CDP send interface.
It requires an explicit MAIN execution context/frame and selected native document/
backend, resolves only that node, and reads native own data descriptors with preview
off. One matching own __reactFiber$/__reactProps$ suffix, host tag/type and native
Fiber.stateNode backend must agree. Only onClick/onClickCapture data-function slots
with native [[FunctionLocation]] can supply generated coordinates, both1-based.
Accessor/Proxy/ambiguous/missing/bound/native-location cases stay Unknown. No ancestor,
closest component, root dispatcher, source-name search or closure/target-function walk.

Two carrier/location reads plus before/after native DOM checks and caller cancel/
current guards prevent changed coordinates or same-selector replacement becoming
current output. Equal positions never imply callback-object identity: native remote
handles are temporary group-local references and are not persisted as durable IDs.
24-command/512-descriptor bounds; only two click slots, no heap/tree crawler. Groups
are released in finally. Output contains metadata, not native object IDs, function
descriptions/source/closures or application values. No Runtime.evaluate/callFunctionOn,
getter or handler execution in this collector. It is not imported into .34.

Important distinction: Observed describes this own slot/native-location read.
The private field shape is page-owned metadata, not independent renderer identity
or version attestation. Every row keeps frameworkVersion:not-attested, callback
identity/property producer Unknown and execution:not-observed. A compatible forged
shape cannot establish an authenticated React renderer. The actual pinned React18
fixture below establishes the finite tested adapter path, not arbitrary framework
universality or current renderer/version certification in another application.

## Actual source and native results

- 7 new source tests,22 focused and1944/1944 full source tests PASS (0fail/skip/cancel).
- A new same-node callback-replacement test first returned old coordinates. RED
  justified the second carrier/location read; GREEN now returns Stale. Existing
  source/anchor/native criteria were preserved.
- 16 native checks over17 cases PASS in sandboxed Chromium153.0.8010.12, with actual
  pinned React18.3.1/ReactDOM18.3.1 production package hashes registered before run.
- Two same-label host buttons returned distinct native function positions. Actual
  Debugger.getScriptSource UTF-8 bytes matched registered minified JS; separate
  registered map bytes resolved each position to its own original handler line.
- Actual same-host React rerender changed the callback position to the second
  handler. Two different factory closures retained equal source coordinates while
  callback-object identity stayed Unknown.
- Actual getter-slot, getter-handler, Proxy-props, Proxy-function, duplicate carrier,
  wrong Fiber host and bound function cases returned Unknown without increasing any
  passive callback/getter/trap counter. MAIN wrapper worked; isolated wrapper did not
  acquire its private carrier. Root and unmanaged nodes borrowed no nearest handler.
- Passive source reads kept first/second/getter/trap counters0. A separate, later
  trusted real React click incremented only first:1; it is the synthetic fixture's
  dispatch oracle, not invocation evidence collected by Atom or the source reader.
- onClickCapture has source/unit coverage only at this checkpoint; the native
  positives exercise onClick. No actual capture support is newly shipped or claimed.

The probe runs through the existing native extension-document harness. Atom retains
the only app debugger attachment; no parallel app-target CDP facade. Browser plugin/
browser skill are unavailable. The owned disposable copy of exact .34 standalone
adds ONLY bundled probe.mjs; original worker/panel/assets remain byte-identical.
Original standalone AND embedding hosts/tarballs/installed pair were checked
unchanged. This explicit test sidecar is NOT an exact-product UI integration claim.
No .35 package or framework source operation/card was produced here.

First native attempt retained two real positive checks then stopped: no isolated
world existed yet. The driver now explicitly creates an empty owned isolated-world
setup context before that control. Final probe passed all16 with frozen before/after
inputs. The setup helper and fixture reads/rerender/click are separate test phases;
the passive collector contains no app evaluation. Neither a missing context nor a
unit mock was counted as a passed native negative.

## Evidence and next bounded item

Plan:../superpowers/plans/2026-10-21-p01-react-host-carrier.md.
Actual:.artifacts/p01/react-host-native/2026-10-21T19-11-48-874Z/results.json.
Preserved partial:.artifacts/p01/react-host-native/2026-10-21T19-11-02-282Z/results.json.
Aggregate:.artifacts/p01/react-host-source/verification.json; reproduce with
node .artifacts/p01/react-host-source/verify.mjs. Source RED/GREEN/replacement/focused/
full and native logs hash-recorded there. Driver/fixture/vendor/plan inputs were
registered and unchanged during each run. The protocol copy was retained after
the successful run while matching its recorded hash; no earlier-copy time asserted.

Context7 official CDP references:Runtime.getProperties own descriptors/internal
properties and group inheritance; DOM.resolveNode executionContextId/objectGroup:
https://chromedevtools.github.io/devtools-protocol/tot/Runtime and
https://chromedevtools.github.io/devtools-protocol/tot/DOM. Documentation did not
establish no getter/Proxy effects; the actual controlled native cases above did.
Pinned local ReactDOM18 source getListener/getFiberCurrentPropsFromNode supplies
the adapter rationale, not a global runtime authenticity certificate.

Next ONE item **P01.3b**: integrate this finite selected-host carrier into the
existing private source operation, shared anchor/map/provider model and Actions UI;
then exact packed two-host real picker/minified/negative/current/lifecycle controls.
Keep unverified renderer/version and callback identity explicit. Common browser-safe
pure source analysis, same-file/two-bundle and remaining whole-P01 acceptance/review
remain after that. P01 stays open,15/29 full tasks complete; A02/L02 gaps unchanged.
