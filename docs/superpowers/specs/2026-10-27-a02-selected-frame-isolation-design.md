# A02.51 — exact selected frame eligibility

Source native-state-return-observer.snapshotFor(selected) currently audits/validates
ALL rows before filtering output links toselected. Existing source controls assert
lookupFrame(a) andlookupFrame(b) eachreturn1 exactlink. With controlled loss in an
unrelated row, the selected complete row is nevertheless rejected. This is a concrete
independent source defect to reproduce, not the established cause of50native failure.
50's raw reason only says complete current weak refs unavailable; whichref/GCcause
was not collected. Do not rerun/retune oldnative/readers or infer a GC remedy.

Scope selectedlookup eligibility to the exact row obtained from the current handles
WeakMap; keep audit metadata for allrows and all global validity guards. The global
snapshot remains conjunctive over allrows. Selected own refs must satisfy every old
identity/liveness/source/bound/returned/closed gate. No matching by name/value/id,
no fallback to another frame, stale token/window, or historical weak association.
No new strong retention, WeakRef behavior/GC flags, application getters/Proxy traps,
expression re-evaluation or native-source transform changes. App return values exact.

Owned synthetic controls may replace WeakRef with an explicit object-keyed test
fixture to model missing refs, restore the global immediately, and count derefs.
They do not run real GC, React/native/browser or prove actualselectedfield behavior.
Test both orderings, missingselected/nonselected roles, global invalid/seal/stop/stale
boundaries and opacity. Original tests and global positive/counterexample criteria
unchanged. FullA02fieldownership/effects/complete lineage stillopen.

One existing researchfile +new tests/docs, current327and82archives remain exact (the
observer is not in issued327manifest). Preserve old50case1734/raw/readers/failure and
19case672/image/refusal. The one observer path becomes historical against exactbaseGit
where referenced by50; do not rewrite originalinputs. Source-only correction needs
no package/native reacquisition. ONE final review and verifiedarchive/owncleanup.
Next work follows actual source evidence, not a guessed body-link qualification.
