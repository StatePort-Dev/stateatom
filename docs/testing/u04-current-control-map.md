# U04 current screen/control map

This is a reconciliation of supplied reference states with actual controls, not a
new design or a claim that prototype simulation shipped. It uses the unchanged
`packages/extension-ui/design/{README_RU.md,docs/HANDOFF_RU.md,design/SCREEN_INDEX.md}`
and current Atom source. I02 current93, affected95 picker/Capture/About, and their
exact raw identities are recorded in completion332/334/337/344/345/347. Candidate96
changes only the property-refresh guard348; its native qualification is pending.
**This map is not yet whole-U04 acceptance.**

## Reference states and enabled operations

| Reference | Actual control/operation and result boundary | Existing evidence |
| --- | --- | --- |
| 00 Start here | Documentation; no simulated runtime page or setup authority | Supplied index |
| 01.1 Inputs | Dependencies property cards; picker/`inspect-selector`, `state`; copied expression/read or explicit missing source, not arbitrary writable dependency | 324,332/334,344 |
| 01.2 Draft | Editing options → On Apply; `input-controller` retains local valid/invalid versions; Apply/Discard are explicit | U02/21, current93 Settings336/337 |
| 01.3 Applied | `inputs-apply`; only acknowledged changes become applied. Network rule waiting/delivered is separate from app effect | Same current93 native21, historical U02 queued/partial controls |
| 01.4 Restored | `inputs-undo`/`inputs-baseline`; revision refusal remains visible, no server rollback promise | U02/21,336/337; independent-app full baseline still V03 |
| 02.1 API Fields | Source → Editing options → Network responses; typed scalar leaf controls; current resource revision/validity | `input-ui.mjs`, U02/21,336/337 |
| 02.2 API JSON | Prototype whole-root editor is not released. Existing bounded scalar-leaf patching is the allowed writer; no fake JSON tab or arbitrary root replacement | Existing working deviation `features/input-field-ui.md`; U02 catalogue unchanged |
| 02.3 Changes | Dirty field/last-read details, proposed value, Apply/Discard/Undo and operation status; no simulated three-tab response editor | Same working mapping and current93 actual editing |
| 03.1 Handlers | Actions; source declarations/native registrations, source open/anchor; evidence labels distinguish source from invocation | A03/34, A05/51, current93 Action9 in337 |
| 03.2 Hooks | Supported source relations only; explicit absent/unsupported cases. No global hook census | A03/A04 completion, current Actions surface332/337 |
| 04.1 Capture Ready | Official host only; preflight checks actual bridge/version/target; Start disabled until ready | Actual I02 Chromium38/Google40,337 |
| 04.2 Recording | `start_reload` or explicit `start`; real Capture owner, Stop/Discard; Atom disposal cannot stop foreign capture | Same matrix; packaged Desktop347 |
| 04.3 Interrupted | Actual worker/disconnection/error phase; Retry Stop or Discard where admitted; no silent recording restart | I02 interruption controls337 |
| 04.4 Review in Desktop | Capture says review is ready in Desktop; existing Desktop review receives real draft, no fabricated Atom review | Actual native bridge/I02 and packaged Desktop347; typed Review API assistance declared |
| 04.5 Saved receipt | Phase `saved`, actual Card revision, immutable source/checkpoints; not a local Atom report |345 update/cold runtime,347 actual packaged Save/cold read |
| 04.6 Desktop Review | Host-owned existing workflow, not copied into public Atom | Same real draft/Review/Save evidence; no new manual Desktop usability claim |
| 04.7 Floating controls | Host layout operation preserves target and starts a new inspector session; Capture lifecycle remains independent | Host workspace-launch tests; I02 close/parallel ownership; no prototype recording simulator |
| 05.1 Domains | Advanced connection options → `connect-site`/`forget-site`; actual browser origin grant distinct from editing | F02/P03/85; current93 permission/Settings337 |
| 05.2 Capture settings | Existing information/setup dialog; origins and Start without reload are explicit; unavailable Desktop does not disable Atom | Actual I02 unavailable/incompatible/connected routes337 |
| 05.3 Source maps | Source → `source-map-acquire`, lookup, anchor, cancellable source analysis; current loaded script association only | P02/P03/85, warm source340/341 and V02/346 |
| 05.4 Build mismatch | Disconnected/Rejected/Stale map state, useful safe error; no fallback exact-source badge | P02/P03/85 and V02 archive/identity controls346 |
| 05.5 Local maps | `source-map-import` file/bundle, `source-map-clear`; bounds/no upload; acquisition independent of permission to edit | P02/P03/85; retained parser boundary proofs |
| 05.6 Listeners/hooks | Actions and explicitly armed Action Trace; start/stop/clear, event/body/leave within supported native callback scope | Mandatory A05 completion, actual official93 Action9/337 |
| 05.7 Local explanation | Per-property collapsed opt-in and Actions disclosure; request/cancel/unavailable/template fallback, optional English model | Actual supported8+8 and unavailable3+3,334; offline/cancel/equal-value target/zoom |
| 05.8 Connections | Page connect/disconnect; receipt/manual helper pairing, source open; Capture bridge readiness; About exact component receipt | F03,332/334,337,347; installed independent source/guide remains V03 |

## Additional approved journeys and control families

| Family | Current entry/operation | Refusal/interruption behavior |
| --- | --- | --- |
| Picker | Select page element → `pick`; Cancel → `cancel-pick`; parent/ancestor → `refine-pick`; advanced CSS → `inspect-selector` | Busy, replaced node, invalid CSS, cleanup failure; final95 manual selection retires old ancestors344. New independent SVG-parent failure348 remains open until96 native proof |
| Live | As I type,250ms valid text/number coalescing; Enter/blur commit; native choice change; held draft requires Apply/Discard | Invalid intermediates stay local; stale/external revision rejects; unknown ack never shows success. Timings are the implemented U02 policy, not inferred from the scope interview |
| Production | Settings two steps → begin/advance/confirm, visible10-minute tab/page grant and revoke | First step/cancel/close gives no authority; navigation, issuer close, timeout and browser denial revoke/refuse. Original actual expiry retained, not rerun336 |
| Historical diagnostics | Details → Save report → `save-diagnostic`; library open/delete; reviewed export/omit/download; passive reader | Retention8/2MiB/7days, explicit omission and malformed/unsupported import; no resumed collection |
| QA/PM report | Prepare current/saved issue; reporter words/categories → Review → `save-handoff` or reviewed download; separate recipient reader | Pending review disabled; edits invalidate prepared bytes; explicit simple fallback does not pass detailed acceptance; current95 changed-path failure and pending96 are348 |
| Observation window | Start/read/stop/clear owned production observation; review observations and omissions | Window bounds, stale owner/context, no inferred event causality or editing grant; completed P04 controls retained |
| Legacy controlled trials | Advanced bounded JSON variants, `experiment`/`deep-experiment`/`restore` only under actual capability policy | Unsupported/Busy/permission refusal and stale restoration; no arbitrary code or source causality claim |
| Navigation/recovery | Dependencies/Actions/Source/Details, actual section focus; Refresh, Reopen inspector, source repair | Pending drafts preserved; unavailable source/model affects its own feature. Tab cleanup94 and manual-picker95 regressions retain exact native evidence |

Implementation pointers: `packages/atom/src/{ui,input-ui,input-controller,
production-ui,source-map-ui,action-ui,handoff-ui,observation-controller,
element-properties-ui,section-navigation}.mjs`. Official navigation/About/Capture
remain in host `atom-page.ts`, `atom-build-details.ts`, `capture-view.ts`; their
source controls do not become native evidence by being listed here.

## Composition and visual evidence

The one selected element above four real mounted sections, collapsed Element
details and primary values follow the user's feedback and the existing28October
editing-restoration contract in `docs/design/extension-ui.md`. Prototype-only
arbitrary state/props/whole-JSON writers and fake Capture controls are not copied.
These are the existing documented working adaptations, not newly invented scope
approval. Shared Inter13px, locally bundled fonts, dark source blocks, neutral
unknowns, blue actions, native disclosures and visible focus remain unchanged.

Agent comparison revisited the supplied390px `10-narrow-inputs.png` against actual
official93 property/model and Settings scope images, plus95 About347 and Capture345.
The white sheet/header alignment, wrapping and fixed footer/owned scroll remain
readable. Differences are real current values, four-section navigation, precise
permission text and optional model facts instead of simulated business data.
Current93 retained440/390 and real200% zoom/key controls cover the unchanged UI
base;95 adds invalid-selector/manual-selection and Capture switching, plus About
keyboard/Escape/receipt link. Screens are agent-reviewed candidates; no human or
live-Figma approval is claimed. No reference file/token/primitive was changed.

Current report/reader first viewport, keyboard and actual navigation are the
remaining changed-path join in348. Do not close U04 from this inventory alone.
