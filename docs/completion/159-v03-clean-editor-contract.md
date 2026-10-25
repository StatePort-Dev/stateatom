# V03.27 — existing clean-editor contract diagnosis (source-only complete)

Starts7686b16 after the bounded L02.13 attempt closed/nativeINCOMPLETE. This is one
read-only source diagnosis, not a new implementation plan, browser campaign or
redesign. L02 remains mandatory/open, whole20/29 unchanged. No browser/certificate/
account/userprofile/model/download/SDK/otherrepo/publication work in this step.

Question from [V03.26](154-v03-converged-restore-availability.md): why could resource
and clean editor move10→11 while applied history stayed10? Retained native samples
establish those values, not which source function caused that particular delivery.
The original exact per-edit cleanfield=own10 guard and exhausted native failure stay
unchanged. That experimental invariant is explicitly not approved general editor
policy; do not change working UX merely to make that old case pass.

Relevant current source:
- `packages/atom/src/input-draft.mjs`: `receive()` admits newer same-investigation
  rows; `output()` derives clean raw from current resource, dirty raw from local
  draft; conflicts preserve the draft's original resource. Matching own receipt
  clears only the submitted local version. Old observations cannot roll facts back.
- `packages/atom/src/input-controller.mjs`: same private scope/physical target/revision
  guard remains separate from model mutation. Admitted data is passed to the draft.
- `packages/atom/src/input-ui.mjs`: Observed is `entry.resource.value`; input field
  renders `entry.raw`. Undo/baseline follow backend ownership flags, not field text.
- `core/control-ledger.mjs`: newer external revision invalidates restoration ownership
  even if value later equals the old own value. History remains the old own receipt.

Actual source-only control invocation:
`node .artifacts/v03/clean-editor-contract/2026-10-25/source-contract.mjs`.
All target/authority/confirmation inputs are explicitly synthetic, created in memory;
no app, native writer, permissions, rendered browser or model is involved. Real
current ledger/draft modules execute these source controls:

| Source fixture phase | Current resource | Field raw | Own history after | Dirty/conflict | Undo |
|---|---:|---:|---:|---|---|
| Synthetic own acknowledgement | 10 | 10 | 10 | false/false | available |
| New external epoch | 11 | 11 | 10 | false/false | refused |
| External return, newer epoch | 10 | 10 | 10 | false/false | refused |
| Local20, then external12 | 12 | 20 | 10 | true/true | refused |
| Explicit local discard | 12 | 12 | 10 | false/false | refused |

A stale observation is additionally rejected without changing current data. This
establishes existing source behavior and is compatible with26's retained values;
it does not prove the native execution cause, transfer lineage, app restoration or
native UX. It also shows why26's ownValue field assertion fails on a valid clean11
source state; no guard is weakened, reclassified or silently replaced.

Verification: nine focused source/test file hashes equal tested a9649d3 and remain
unchanged. Reuse actual full3695PASS terminal13270 and its five relevant existing
ack/draft/external/ownership tests: same source bytes, no reason to rerun the suite.
Fresh five-phase source controls pass; current327product/15V03raw/12L02records
including13 preserved. Artifacts under `.artifacts/v03/clean-editor-contract/2026-10-25/`:
registration, `source-controls.json`, `verification.json`; no screenshot/State Card,
no native result or new product capability claimed. Source fixtures are not runtime
receipts. No code/CSS/token/parameter/Live timing/Undo authority change or new review
of fullV03. Historical source/native/visual gates retain their exact status.

ONE next dependency-ready source item: A02.10, inspect the remaining bounded field/
prop-transfer implementation against its existing tests and choose one concrete
missing source path. Reuse already implemented adapters; do not build another generic
launcher, revive old argv cases, or infer a current source producer from Chrome
process identity. Any source fix needs a bounded plan/real regression; no browser,
certificate or installation work in that initial source step. FullA02/V03/L02 and
20of29 remain open; precise general Live/production/handoff decisions remain in their
own tasks, never invented as approved here.
