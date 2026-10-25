# A02.28 disabled source-tap collection boundary

Concrete defect retained in A02.26 and explicitly outside A02.27 hook-absent
native Off: createAppMainPropsObserver({enabled:false}) delegates tap events to
Main before checking its own enabled flag. The nested JSX input collector can
retain config/value IDs and metadata when a global hook remains installed.
Outer App/Main links stay0, so previous limited qualifications remain literal.

Fix ONLY disabled event delegation in the existing experimental App/Main observer.
When enabled is false, tap(kind,value,props,site) must immediately return the exact
value without delegating, reflecting application/metadata objects, reading getters,
changing any record or producing nested config diagnostics. mainInput.tap shares
the same boundary. Keep application return values/semantics unchanged.
When enabled is true, continue delegating even if the OUTER App path is invalid:
route-only/cached-props paths may still have a legitimate Main-local witness.
Do NOT gate delegation on outer live()/invalid; that would erase valid Main facts.

Modify only observer and its existing owned unit tests. No new files beyond docs/
registration; no observer schema/public contract/UI/design/SDK/vendor/transform/
driver/package change. Source baseline119 research; declared deltas exactly these
two files, remaining117/product327/priorraw immutable. Preserve historical native
A02.27 at9bf056c/c8350fc, sourceA02.26 and all raw/case/readers without re-execution
or retroactive PASS/current-version labels. Old prepared bytes retained in Git.
New source checks establish only the changed disabled API branch; no new browser/
native/model/installed-product privacy, performance or native-state acceptance.

TDD failing disabled-tap retained nested config1→0, metadata Proxy trap1→0,
plus healthy enabled-but-outer-invalid MainObserved1 regression control. Verify
exact return values and all nested config counters/invalid flags. Run affected
observer/transform/source/native-driver/guard source tests and one full npm suite;
no qualification campaigns. ONE fresh whole-item review, ONE tested I-Cfixpass if
needed/no rereview.11prior minors deferred;20/29/fullA02 unchanged. Localmain
commits only, no branch/push/cert/trust/profile/account/publication/SDK/otherrepo.
Archive own workspace CRC/allbytes/identity and protected-byte checkpoint.
Next ONE bounded state-origin premise selection from existing acquisition, or a
dependency-ready product gap; no generic provenance/ownership kernel.
