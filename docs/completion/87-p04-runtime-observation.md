# P04.2 — Private runtime observation admission

Started2026-10-22 from cfbfda7, after committed pure P04.1. Approved completion06
P04, scope-review-1 and U06 H07-H09 remain authoritative. Implementation working
spec/plan: ../superpowers/specs/2026-10-22-p04-runtime-observation.md and matching
plans document. Parameters are executor decisions, not new maintainer approvals.

The private per-tab controller uses the committed bounded ledger behind explicit
Start and an authenticated inspector/session/view. It requires current native
selected document/node/property, MAIN context/loader, owned attached debugger and
site access; it neither attaches nor grants editing. Read/Stop/Clear use exact
owner and nonce. Generic state hides another live owner's records/nonce. Lifecycle
loss ends the owned window; eviction removes its timer/controller too. Same frozen
snapshot participates in the existing3-tab/5MB unsaved state limit. Restored
recording becomes historical stopped data with unknown end and pending completions
unobserved; no owner resumes. Malformed restored data is discarded safely.

Native projection is separate from the legacy JSON-body collection. Each admitted
request retains only its occurrence token and paired monotonic/epoch start mapping,
closed method/origin/status/timing/outcome; MAIN exceptions retain closed class and
origin/position. No header/body/query/source/error message/stack is projected. Child
frames/workers/unknown native identities are outside this finite coverage. DOM
checkpoints, reporting profile, UI and reader are later P04 work, not implied here.

## Preserved discovery and corrections

Initial source runtime RED refuses the unimplemented operations. Native adapter
initial RED is a missing module, not19 independent semantic failures. One source
clock-order assertion initially used a pre-window timestamp and was corrected to
exercise an in-window pre-request terminal time. Actual negative total duration,
pre-Start/future and foreign identities remain refusal controls.

Runtime source controls found a corrupt persisted recording could break startup,
and a late Read of A could act on replacement B. RED/GREEN preserve both; the
latter now returns STALE_TARGET without stopping or publishing over B. The first
race test driver awaited B behind its blocked native DOM queue; its empty/stalled
attempt is retained separately from the meaningful red2 ordering control.
Generic state ownership RED first hit strict owner DTO validation; red2 demonstrates
actual cross-view record exposure before the projection guard. Private dispatcher
controls inspect its direct refusal reply; the pre-existing unowned client receives
INVALID_MESSAGE from that short non-enveloped denial, not claimed as a new success.

Issued48: full2224 source PASS,53 focused PASS,packed types2/admission9/build PASS.
Actual native runs at10:24:25.576 and10:25:48.542 each fail after2 checks on the
standalone successful request completion. The second retains closed actual native
metadata: request1570864.911221, response1570864.913590, finish1570864.913493.
The executor's phase-order assumption was false in Chrome153. No claim is made
about why native phases have this order. Current correction preserves both actual
normalized times and explicit timingOrder, requiring completion >= admitted request
start rather than inventing/clamping it to response time. Captured pair and ledger
controls fail before correction. Historical P04.1 and48 packages/results unchanged;
new49 contains the fix. Parent evidence/identity/privacy/budget criteria unchanged.

Verification artifacts: .artifacts/p04/runtime and .artifacts/p04/native-runtime;
current final results will be recorded after the exact49 source/native checks.
P04/C07 remain open;18/29 whole tasks unchanged. No SDK/publication/other repository,
redesign, or independent-human gate.

## Further actual qualification

Native49 failure at10:30:42.001 reaches successful/503/redirect completion, then
refuses a fractional loadingFailed timestamp as future against the integer host
wall sample. Issue50 uses precise monotonic epoch host time; future/drift remains
a refusal, not a tolerance. Its native result10:36:27.702 passes9 checks across
both actual hosts, including missing prehistory, real requests/phase ordering,
HTTP vs transport outcomes, MAIN error vs child activity, pending Stop without
abort and actual private Port loss. Fixture actions are explicit authorized MAIN
script calls, not manual input or the future product observation controls.

A global Date.now override invalidated unrelated platform leases (CANCELLED), so
that failed attempt is not meaningful clock RED. The private helper missing-export
RED and fractional source control are separate. The source fixture now emits precise
epoch event stamps; integer generated stamps falling before a precise Start remain
refused, rather than being relaxed into the window.

Final source controls distinguish debugger context loss from actual permission
removal, and find a second Read race after its delayed storage acknowledgement.
The first51 coalesced shared flush creates a regression in the original browser
worker criterion: detach waits behind the deliberately blocked inspection write.
Full51 stops there with no summary; the owned session was interrupted withCtrl-C
(exit130), not labelled a pass. No original test or threshold is changed.52 restores
independent writes with a generation check: a superseded write repairs from latest
bounded state before acknowledging, using no historical-payload queue. Read also
checks its owner and immutable result after storage. Original browser regressions2
PASS plus the stronger independent-Stop/replacement/persisted-B control PASS.
The attempted process-fd lookup found no matching visible process; actual cleanup
used the known owned exec session only. No unrelated process was stopped.

## Current52 result

Current immutable candidate `.artifacts/atom/2026-10-22T10-47-14-633Z/atom-handoff.json`
is Atom0.1.0-candidate.20261021.52 / UI0.2.0-candidate.20261018.2; API/wire1 and
UIcontract2.1 are unchanged. The ledger/native adapter are now in the runtime;
new private operation types and capability discovery describe admission only.

- `npm test`:2231 PASS,0fail/skip/cancel,84586.451067ms.
- Focused original browser-worker plus ledger/native/runtime/transport controls:
  121 PASS, including99 foundation/owner controls and22 unchanged worker controls.
- Packed NodeNext/browser type consumers2, package admission9 and build PASS.
- Fresh exact52 native runtime9 PASS at
  `.artifacts/p04/native-runtime/2026-10-22T10-49-55-648Z/results.json`.
  Both hosts use actual imported profile CA/native site grant and actual private
  Port. No TLS bypass or app-target test debugger. Start leaves fixture counters
  unchanged; successful raw metadata include the actual excluded child exception.
- Fresh exact52 existing F05 backend27 PASS at
  `.artifacts/f05/native-backend/2026-10-22T10-50-47-600Z/results.json`.
  This separate regression uses its documented self-signed TLS bypass/preapproval;
  it proves neither P04 ordinary permissions nor Settings UI/H09 active collection.

Aggregate `.artifacts/p04/runtime/verification52.json` binds current source/test/
driver hashes, exact tarballs/install/complete hosts, logs and scoped historical
48/49 failures/50 native pass. First51 shared-flush hang is preserved; the52 full
and original controls actually finish. No old result is upgraded to current proof.

P04.2 is complete only as private runtime admission/metadata/lifecycle/cache work.
P04/C07 and H07-H09 remain open;18/29 whole tasks unchanged. No product collector
controls, native DOM checkpoint collection, public observation file/profile or
reader/export acceptance yet. One whole-P04 review belongs at parent acceptance.
Next bounded P04.3: explicit selected native read checkpoints, a read-command fence,
and exact private snapshot capture for the existing handoff; public profile/UI/
reader integration follows that boundary. No redesign/SDK/publication/other repo.
