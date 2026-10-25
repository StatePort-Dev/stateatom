# A02.12 — product React19 argument forwarding preserves native semantics

BASEbcb734d. Bounded confirmed bug, not a new lineage feature or redesign. Scratch
source-only reproduction at `.artifacts/a02/product-native-forwarding/2026-10-25/`:
actual product transform on authored ReactElement grammar original/off0 app iterator
calls/on1; actual collector.tap1; actual observer disabled0/enabled2. No actual retained
vendor VM/browser/DOM/model executed in that diagnosis. Three source SHA values saved.

Root cause: three rest-to-spread forwards iterate telemetry-owned arrays through the
application's current Array.prototype[Symbol.iterator]. A catch cannot undo callbacks
or mutations. A02.10/11 new source recipes fixed their own paths, not these product
modules. Existing source/evidence remain historical; do not relabel them as corrected.

Chosen fix: captured native Reflect.apply with each function's own arguments object
(arraylike, never iterated). Vendor helper retains runtime receiver and exact dynamic
argument count/order; observer forwards to its private collector with its existing
captured nativeApply; collector captures apply at initialization and forwards its own
arguments to receive. Preserve function.length where possible (vendor2, API0,tap0),
return-original behavior, runtime admission/freshness/Stop, caught metadata failure,
getter/receiver/reducer/error controls. No new app reads, strong retained references,
callback wrappers or observer events. Fixed always-nine argument arrays were rejected
because they change per-event arity. Broad collector primordial hardening is outside
this demonstrated iterator bug; do not claim all hostile-intrinsic transparency.

Change ONLY src/engine/react19-vendor.mjs, observer.mjs, react19-acquisition.mjs for
behavior. New focused test/helper and experiments/react19-reducer/product-forwarding-
source-run.mjs for qualification, docs/current pointers. These three engine files
are not part of current327 issued Atom payload inputs: preserve those327 physically,
all native/raw/case/vendor pins and other oldsource. Preregister exactly3source deltas;
old56history reconciled53physical+3exactbaseGit, never as a new-run source fallback.
New source qualification always hashes actual corrected physical current sources.
No package/version/tarball change needed for an unchanged payload; no installed proof.

One task: regression RED for each actual chain boundary, minimal fix, focused and full
suite, commit source before one new retained React19.2.5 CJS sourceVM matrix. Bundle
actual current product observer with existing esbuild into VM, hash all bundle inputs
before execution; owned config/createElement cases original/off/on with late iterator
mutate/throw, getters/Proxy/exception, dynamic runtime/accessor/metadata failure and
admission/Stop controls. Synthetic metadata tests cover all9 native argument slots;
actual retained ReactDOM rendering is not simulated or claimed. Native React source
pin/recipe hooks unchanged; source execution only, VM not security sandbox.

Done: actual zero added app iterator callbacks, source outputs/sideeffects/exceptions
and metadata arity/receiver/order preserved; exact source/hash/result saved, source-free
reader and negative controls, ONE final fresh review/ONE tested I/C pass/no re-review.
Storage/ownership/state/selectedDOM/fullA02 and20of29 remain open. No browser/native
writer/ReactDOM/model/cert/installation/security/userprofile/SDK/otherrepo/publication.
