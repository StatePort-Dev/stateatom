# A05.3b — bounded runtime/session plan review and fixes

2026-10-21, BASEa59fad1, exact Atom .20261021.17. This completes the bounded
runtime-races plan, not mandatory whole A05, production observation or release.
The original scope-review-1 criteria, historical outcomes and task dependencies
remain unchanged. Saved reports are next; the session UI still excludes this trace.

## One review and one fix pass

Read-only reviewer /root/a05_races_session_review (gpt-6-astra/high) reviewed
2abe1f7..a59fad1. Verdict: three Important findings, no Critical/Minor. Original
findings and every declined-to-judge root ruling are retained in
.artifacts/a05/runtime-races/review-final.md. No second review loop requested.

1. Helper stale/stopped states lost freshness, then successful IDE verification
   promoted them to sourceCurrent/Observed. review-red2.log preserves both actual
   runtime failures. Parser now preserves historical freshness; source verification
   cannot promote it; graph and mounted UI keep the boundary.
2. MAIN Object.getOwnPropertyDescriptor was dynamically resolved. Actual serialized
   function in an isolated VM invoked a later application override and global getter;
   review-descriptor-red.log preserves RED. Native Runtime.getProperties now admits
   only own data descriptors and retains direct function references. No helper
   accessor is invoked. Descriptor metadata uses the existing read capability;
   actual helper execution still requires inject. No hostile-page attestation.
   Every operation now binds uniqueContextId even with a selected node argument.
   A precise controlled node-resolution race and isolated regression variant reject
   transferring Arm to a context that reused the numeric ID.
3. Context-only retirement did not notify/persist root history and a completed local
   card ignored matching root freshness. review-red2.log preserves both failures.
   Persist/notify retirement; reconcile only matching nonce, keep body history stale,
   remove source navigation and reject an old retained source-button closure.

Initial isolated-test launcher failure (review-red.log) is not a product RED.
review-green3.log was interrupted: the new test gate intercepted initial inspection
rather than only the operation under test. The gate is now enabled after real
inspection. A later fixture run needed its simulated native context updated when
emitting context creation. These harness corrections remain separate from defects.

## Fresh evidence on the exact .17 pair

- npm test:1715 PASS,0fail/skip; review-full.log.
- Actual runtime18, mounted UI8, parser/descriptor9:35 PASS; review-green5.log.
- Seven isolated historical-bug variants rejected; baseline18 PASS:
  .artifacts/a05/runtime-races/2026-10-21T09-05-58-395Z/results.json.
- Exact immutable handoff:
  .artifacts/atom/2026-10-21T09-04-06-261Z/atom-handoff.json.
- Native two-host session matrix37 PASS (archive +18 cases per host):
  .artifacts/a05/session-native/2026-10-21T09-07-36-106Z/results.json.
  New actual controls: late descriptor override, helper-global getter, invalidated
  collector and stopped collector. Both hosts report zero extra descriptor/getter
  calls and historical terminal records without source buttons.
- Standalone read/inject-only attachment3 PASS, actions=[]:
  .artifacts/a05/read-inject-native/2026-10-21T09-10-04-389Z/results.json.
- Two strict packed TS5.9.3 consumers and7 package admission controls PASS.
- verification17.json verifies archive/build-source/input/workspace hashes, all
  registered cases, held real IDE reply, types and current logs. No input drift.

The first .17 native attempt passed archive +15 standalone cases, then the harness
waited for OK after its deliberately expected admission error without a new action:
.artifacts/a05/session-native/2026-10-21T09-05-09-330Z/results.json. Preserve FAIL.
After restoring the helper descriptor, explicit native Inspect again recovers
before the next registered case. Product bytes stayed .17; criteria were unchanged.

Actual390/1100 native candidates were inspected against the existing Actions/card
reference and previous accepted layout:13px base, native controls, alignment and
wrapping retained, no overflow. No CSS/token/primitives change. Changelog records
functional stale-state propagation. Screenshots remain candidates, not human
acceptance. The two hosts still use one synthetic Vue app; source edit is actual
full reload, not pure Vue hot replacement. No broader semantic/performance,
production, runtime callback-object identity or async/network causality claim.

## Next bounded step

A05.3c: save bounded observation metadata as historical diagnostic evidence and
integrate it with the existing passive review/report path. Preserve original
source-binding execution:not-observed and all old file bytes/profiles. Imported
records must never arm collection, resolve current source, replay or grant access.
Report-format and privacy choices must be designed in that task; not preapproved
by this document. Whole A05 and original acceptance matrix remain open.
