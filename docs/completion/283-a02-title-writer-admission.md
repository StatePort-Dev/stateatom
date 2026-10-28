# A02 — approved title scenario: existing collector and pending writer admission

28 October 2026, basef531609. The maintainer explicitly approved282 and autonomous
execution of remaining release work. Approval is recorded in282/index. This
bounded feasibility check does not implement or accept the title-lineage feature.

## Actual source result

Three new controls use the existing real `createReact19Acquisition` collector with
authored native metadata (not a browser/React execution). Combined existing
react19-acquisition/react-state suites: **35PASS,0fail/cancel/skip**. Command:

`node --test --test-isolation=none tests/engine/react19-acquisition.test.mjs tests/engine/react-state.test.mjs`

Log `.artifacts/a02/title-writer-admission/2026-10-28/source.log`.

1. After an observed reducer application, direct `alias.title='SAME'` produces the
   exact same serialized collector snapshot and event count as no field write.
2. A changed-then-restored field produces the same snapshot too. Final equality,
   native state object identity and queue/revision IDs cannot exclude that writer.
3. A separately observed immutable same-title replacement correctly advances
   update/result/revision and links its preceding input. The unchanged second row
   shares the ancestor state but acquires no selected-field provenance.

All controls correctly retain `fieldOwnership`, `selectedPropertyOrigin` Unknown
and `fullPath:false`. They pass without a product fix: this is a characterized
missing capability, not a newly fixed bug or RED→GREEN claim. Original corpus,
product implementation, artifacts and old native evidence are unchanged.

## Concrete missing inputs

- `src/engine/react19-acquisition.mjs` observes native dispatch/applied/state/commit
  identities, deliberately not application field reads/writes. Neither its
  snapshot nor committed-props match proves no alias write occurred.
- `src/engine/react-state.mjs` explicitly keeps valueOrigin Unknown because raw
  equal-value writes and opaque escapes are not excluded. It is no substitute.
- `src/first-read/verify.mjs` requires its own controlled launch, sole approved
  main-world bundle and complete admitted code history. Reusing its success on an
  ordinary dev page without those premises would weaken the retained proof.
- The retained TodoMVC source propagates the array/rows through React props,
  filter/map and callbacks; no existing bounded module supplies a title-specific
  all-writer/escape admission proof across those boundaries. Records191/202 only
  establish selected reference relationships in a research retention profile.
- Exact Item parameter/read/commit integration also lacks native acceptance:
  record209 remains INCOMPLETE, no new native edge follows from these controls.

Thus the required pair of premises is missing: (a) producer field-write identity
and complete bounded writer exclusion; (b) the original selected parameter/read
joined to the actual commit. Adding a DTO or choosing the most recent reducer does
not provide either. These observations do not prove such a bounded mechanism is
impossible; they establish that current mechanisms alone do not complete282.

## Disposition

**Existing collector insufficient; bounded writer/alias admission feasibility remains unresolved.**
The characterization does not establish that a finite solution needs general
ownership infrastructure, so282's stopping condition has not been reached. Next
A02 action: assess an explicit bounded writer/escape-path admission for the retained
reducer and App/Main/Item transfer, including unknown-code invalidation and known
framework boundaries. No generic framework, app freeze, retention policy, old native
retry or claim reduction is introduced. Specification approval is not evidence.

Continue independent releasable fixes under the same autonomous authorization:
next U04's already observed invalid-selector message, with a behavioral regression
and the existing context/privacy guards. L02 usefulness and the remaining final
integration/distribution/installed gates remain open. Whole21/29 unchanged.

## Review correction

One read-only review:0Critical/1Important/0Minor. Corrected premature stopping-rule
claim: an insufficient existing collector is not proof that a bounded solution
requires prohibited general infrastructure. Source characterization and35PASS stay
unchanged; no code correction or repeat. Independent U04 work is scheduling only.
