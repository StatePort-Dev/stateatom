# Final-host-props experiment implementation

Authorization: autonomous roadmap continuation. Design: matching spec in `../specs/`.
Keep the failed ref probe and its original counterexamples. No default enablement.

1. Source inspected: pinned React 18.3.1 createElement and JSX runtime factories
   create new ordinary props objects; React DOM createInstance/updateFiberProps
   carry exact props; commitUpdate applies changes; four placement functions attach
   actual host nodes. Hydration and portals remain outside the first scope.
2. Add guarded development vendor-input transforms through Vite's existing esbuild
   dependency optimizer. Exact source hashes, versions and expected function/return
   counts are mandatory. Preserve original return values, exceptions and evaluation;
   no installed dependency writes. A contract mismatch is explicit unsupported.
3. Native RED harness uses unchanged original P2/P1, then implements observer WeakMaps
   factory props→JSX construction IDs and actual host node→final props. Observe
   attachment/update only after native renderer operations; initial detached nodes
   remain pending. No injected ref, component Hooks or extra expression evaluation.
4. Root/container identity, native node identity, mutation epochs, retention, source
   and stop controls. Clone/copied/manual element props unknown; equal values cannot
   fill an identity gap. Preserve all existing ref/introspection/StrictMode controls.
5. Validate actual browser behavior off/on and measured budgets; independent review.
   Keep fullPath false. Only a verified final-host edge permits the next exact
   request/consumption binding experiment; no full-HTTP claim from this test alone.
