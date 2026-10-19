# U05 execution ledger — visual picker

Base: 1aa4b24; approved scope-review-1, U05 in completion/04. Current main;
no branch switch, SDK, redesign, publication or other repository work.
F01–F04 and their historical evidence remain credited.

Brief: replace immediate/retargeting page picker with exact native hover/select,
parent refinement in the existing inspector, Escape/cancel/restart, bounded
identity and explicit unsupported outcomes. Preserve CSS selector advanced path.

Ruling: use the already-owned Chrome debugger Overlay inspect mode, not late
page event suppression. Probe confirmed exact nested node and zero earlier
window capture/bubble pointer/mouse/click events, including held mouse release
following mode cancellation. Cost if unsupported: picker must refuse explicitly;
there is no unsafe page-listener fallback. No new browser permissions.
Browser-owned highlight/label intentionally follows Chrome; inspector refinement
uses existing shared native buttons. Reference: supplied README_RU, HANDOFF_RU,
SCREEN_INDEX, Figma manifest, source/app.js Select element entrypoint and current
440px Atom composition. No shared token or primitive change.

1. RED→GREEN: bounded native ancestor index and picker controller, exact document/
   backend node binding, nested/repeated/duplicate-ID controls, removal/replacement,
   timeout/cancel/restart, unsupported frames/closed roots, cleanup/foreign leases.
2. Integrate with current runtime policy/transport/types and existing inspector.
   Pick requires attached owned tab; cancel remains cleanup. Old page observations
   cannot activate native picker or supply backend identity. Use additive feature
   discovery; retain API/wire1. New distributed bytes require new Atom candidate.
3. Register native verify:picker; run Basic without IDE through both packed hosts,
   real pointer hover/click and ancestor UI, early capture/bubble handlers, disabled/
   tiny/repeated/moving targets, Escape/restart, navigation/revocation and cleanup.
   Run relevant existing browser/embedding, declarations/package/unit checks; no
   specialised F03 experiment restart. Compare rendered inspector viewport to
   supplied reference; screenshots are agent-reviewed candidates.
4. One fresh final review under executing-plans, meaningful fixes RED→GREEN,
   final evidence/report/task-index update and local commit; one next item U01.

Expected: new refusals fail first, then pass. Native controls must not invoke app
handlers for tested supported gestures. Unknown is not a pass for unsupported
selection, and selector reuse/equal replacement cannot substitute another node.
Pre-flight: native events → bounded path index → exact inspection guard → UI
refinement and cleanup. Probe artifacts: .artifacts/u05-probes (not acceptance).

Execution decisions and evidence:

- Native negative controls retained: old .8 earlier window listeners; full
  Overlay.disable release; frontend-ID resets; actual Escape key propagation.
  Cleanup leaves passive Overlay only; native DOM metadata readers serialize per
  tab. Engine/plugin/evidence rules stay unchanged. Escape exclusivity is
  Unsupported, with explicit UI wording and safe inspector Cancel.
- One fresh review found three Important lifecycle races: overlapping refine
  errors poisoning the successor, refinement request abort not propagated, and
  pre-session tab switch not aborting admission. Fixed with per-selection
  controllers/identity guards, request cancellation, and owned UI start signals.
  An additional final-storage cancellation window was reproduced and fixed in
  .10. Isolated overlap RED, actual UI admission RED and storage RED are retained;
  49 focused review controls and 649 full tests pass. No second reviewer cycle.
- Issued .9 remains immutable; final Atom .10/UI .2 built through F04 packaging.
  Both packed hosts pass all 33 native picker controls on Chromium153, sandbox
  enabled, no IDE/helper; native actual permission withdrawal included. Driver
  changes wait for native admission/UI refresh, retaining failed runs and original
  substantive assertions. Both-host existing embedding/IDE/export cycle passes35.
- Strict packed consumers2, package admission/refusal controls7, unchanged UI check
  pass. Current Basic/Actions regressions are bounded checks of the changed picker
  and shared DOM metadata queue, not new F03/F04 campaigns or A05 acceptance.
- Actual packed demo smoke passes nested selection, keyboard parent refinement,
  UI Cancel and normal resumed app click/submit. Human demonstration is prepared,
  not claimed as already performed. Viewport/reference comparison is agent-operated;
  screenshots remain human-review candidates.

Final: U05 complete on Atom .10/UI .2. Full649, native picker33, two-host/IDE35,
Basic26, Actions32, strict consumers2 and package controls7 pass. Native final
run 2026-10-19T16-00-09-603Z binds the final helper hash; the shared select()
readiness failure and earlier native33 pass remain retained. Demo smoke passes.
No further implementation in this increment. Next unfinished item: U01.
