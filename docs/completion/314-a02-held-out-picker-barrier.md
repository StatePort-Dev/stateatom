# A02 — corrected held-out picker completion barrier

29 October2026. Case313 actual run
`.artifacts/a02/selected-list-route/2026-10-29T06-36-21-226Z/` is INCOMPLETE.
Its five earlier checks (private guards, create, changed, same-value, installed
source action) passed; the recorded sixth picker PASS is invalid as completion
proof and is explicitly withdrawn here without rewriting the raw.

Concrete cause: `held-out-picker-state.json` records picker.status=`resolving`.
The old driver accepted any status other than `picking` and compared the snapshot
against the earlier same-value inspection, preceding the source-link UI refresh.
It therefore accepted that older profile and dispatched the untouched-row
inspection while the picker's real onSelect was still inspecting. The runtime
correctly refused competing selection generations. This evidence does not show
a new product resolver or picker defect.

Correct only the driver: await `selected` for the exact new picker id, a snapshot
newer than the immediately preceding selection, and matching current profile
observedAt/revision. Source controls reject resolving/old/mismatched snapshots.
Do not add sleeps/retries or relax the runtime generation guard. Product bytes
remain exactly plugin12 and VSIX310; no repack or source account adjustment.

One new corrective native attempt with `--held-out-picker-settled` completes the
same313 cases, including the previously unexecuted untouched-row/unknown-code
controls. Preserve both raw runs. Native picker PASS is credited only when actual
terminal selection and current profile have both been acquired. Full282,
Original/Off/On/official and the whole-task count remain separate.
