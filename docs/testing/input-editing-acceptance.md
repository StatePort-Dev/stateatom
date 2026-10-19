# U02 field acceptance — preregistered execution matrix

This executes the original 18 rows in `../completion/u02-input-catalogue.json`.
It does not change that catalogue, its denominator or majority threshold. Working
implementation/testing decisions below are recorded before coverage evaluation.
Both Live and Draft must verify at least 10/18 rows; 11 are implementation targets.
A response rule, source model or document alone cannot pass a row.

The declared command is `npm run verify:input-acceptance -- <immutable-handoff>`.
It consumes the exact archive pair in isolated native Chrome hosts. Setup grants,
attach/selection may use harness RPC; editing, Apply and undo use actual packaged
field controls. No IDE, source instrumentation, account or closed API is needed.
The local examples' explicit preview is identified until final default-path checks.

| Registered rows | Native scenario / criterion per mode |
| --- | --- |
| response-hold, response-ready, response-quota, response-note | Synthetic ordinary GET account/permission app, typed field → waiting with app unchanged → app's explicit refresh → corresponding DOM output → UI undo → next app refresh restores original output. Note is an irrelevant-field control; no selected dependency is inferred |
| response-race-amount, response-race-label | Same `/api/race` family and alternating 5/99, slow/fast server behavior as the existing inspection fixture; two simultaneous exact URL requests complete out of order and the app uses the second requested result. A small separate shareable fixture exposes both fields and a normal app refresh button, which the original mount-only fixture lacks. Require changed corresponding output, ordered revision handling and UI undo on the next actual app refresh. Fixture adaptation is bounded evidence, not every ordinary app |
| react-form-text, vue-form-text | Existing ordinary React/Vue #form, actual framework validation #p5, new native field edits through ordinary events, both UI undo-last and baseline restore the app validation |
| native-checkbox, native-number, native-select | Existing synthetic native control fixture, actual event-handler outputs, editable valid value and both UI restoration paths |
| response-null, structural-json | Fixture contains these originals; neither becomes an editable scalar/root row. Explicit unsupported contract reason retained; no successful-write credit |
| react-prop, react-state-without-control, custom-hook-state, query-cache | No supported writable resource kind/adapter. Keep registered reason, check no such writer is surfaced; malformed wire proposals are separately refused before mutation, not counted as UI passes |
| readonly-control | Actual locked native control appears as unsupported, remains unchanged; no editable field |

The acceptance artifact names every row, mode, host, result and evidence checks.
Unsupported/failed/unverified remain separate from verified, and stay in the
18-row denominator. Per-host results are not added together to inflate coverage.
Meaningful validation also requires a masked two-blocker/grouped case, irrelevant
note control, repeated edits, baseline, current read with no implicit app request,
production default refusal, worker/debugger interruption and preserved legacy
experiment regressions. Existing scoped native lifecycle/timing controls may be
referenced by exact packet/result identity; changed source requires affected reruns.

Scheduling and delayed acknowledgement checks are declared in `verify:input-fields`:
actual native field effects/undos, rapid last-value coalescing, separate dispatch
and app latency, invalid input, mode hold, slow app handler, unchanged real reply
delayed behind an external snapshot, partial failure, ABA and unsent close. Its
native control actions/keyboard and declared fault instrumentation are retained.
Source out-of-order models remain a different evidence type. Screenshots remain
human-review candidates; an independent person is not a completion blocker.

Public feature availability and default UI are enabled only after positive
majority evidence, then rechecked without the preview option. F05 still owns
Settings' two confirmations and production grant lifetime/scope; the enabled
production path is not claimed here. Quick edits remain Observed, never the
legacy repeated-trial Experimentally verified result. A fresh whole-item reviewer
and one tested Important/Critical fix pass finish U02's own acceptance.
