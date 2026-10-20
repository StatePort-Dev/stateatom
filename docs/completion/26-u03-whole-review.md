# U03 Task5 — one whole review and bounded fix pass

Reviewed range: 1e969a5e897d002afb89757ea92b6b241646d05d through
0f53ee352bc736175f8131caa70f6bad1fedbd96. ONE fresh read-only reviewer,
/root/u03_whole_review, reviewed the complete U03 requirement/code/evidence range.
No per-slice agents, delegated reviews or re-review loop. The reviewer inspected
source, receipts, drivers/results and ran nonmutating Node/controlled-DOM probes;
it did not rerun the recorded full/native suites or aggregate verifier.

The verdict was With fixes: no Critical findings, one Important, one Minor.
This record is a decision/evidence index, not independent runtime proof.
Final current receipts/results are bound below; U03 is complete within H01–H06.

## Findings and executor rulings

| Finding | Reviewed locations | Ruling |
|---|---|---|
| I1 Important — invisible duplicate JSON members | core/handoff-report.mjs:15; handoff-reviewed.mjs:34; handoff-source-attachment.mjs:22; handoff-input-report.mjs:29; handoff-input-evidence.mjs:28 at reviewed HEAD | Accept Important. JSON.parse hides earlier duplicate members from parsed review but exact raw downloads retain their bytes. Reject duplicate decoded member names at every public v2 decoder, including escaped-equivalent and nested names. Never silently canonicalize or rewrite originals. |
| M1 Minor — minimal-codec mutable argument race | core/handoff-report.mjs:47 and:51 at reviewed HEAD | Accept Minor; defer in this ledger per the one-pass plan. Direct codec callers can mutate a finding, omission array or options before post-await reads. The reviewer did not establish a normal-user UI leak; mounted paths generally supply detached choices. Do not claim a universal pre-await snapshot guarantee for the minimal codec API. A later focused fix must snapshot inputs without changing output semantics. |

I1's bounded fix adds an internal lexical member check after syntax/size checks,
before any decoded v2 record is accepted. Member names are decoded as JSON strings;
sets are per object, so equivalent escapes conflict while equal names in distinct
objects remain valid. Quoted strings/escapes are skipped correctly, without
executing values, evaluating getters or fetching resources. Existing structure/
member limits bound scanning. Existing size/text/tree/schema/hash/privacy/parent
checks remain. Unique noncanonical whitespace/order and exact parent identity
stay supported. No new public profile or SDK API, shared token or primitive.
Original v1 interpretation is unchanged; historical evidence is not rewritten.

Source controls cover all five actual codecs, root/escaped/nested shadow members,
exact unique text, local-store refusal without writes/original replacement,
read-only preview clearing/disabled old download, object scopes/escaped strings,
Unicode-equivalent names and the existing structure bounds. The initial RED had
five genuine codec failures and one store-fixture retention-clock setup failure;
the v1 positive passed. A first import-insertion script produced a syntax setup
failure, retained separately. After correction, six codec/v1 controls passed and
the store clock was aligned with its synthetic timestamp. Final ten controls pass.
No setup failure is counted as the product RED or a successful verification.

Actual paired native boundary tests additionally import shadow root, escaped and
nested files derived from the real reviewed download. Library refusal preserves
exact original bytes/count; Reader refusal clears prior prepared outputs, disables
downloads, and has HTTP0/unchanged permissions with a reader.js positive control.

## Declined judgments — every line ruled

- P04 recording windows/lifecycle/H07–H09: agree separate work. Snapshot-only and
  explicit not-recorded window remain current requirements; P04 stays open.
- A05 observed action execution and L02: agree separate mandatory tasks; neither
  becomes optional or complete through this serialization work.
- SDK, Capture/Replay, orchestration, accounts/cloud, publication/release: agree
  outside this authorized U03 item; no external authority is inferred.
- Broad U02/F05 engine correctness, long expiry/majority/legacy campaigns: agree
  separate evidence boundaries. Current U03 capture/authority/representation checks
  apply; old executions retain their exact configuration and historical status.
- Human visual/usability approval: agree no independent-human blocker. Agent
  screenshots remain candidates, not human approval.
- Platforms beyond recorded Linux isolated native Chrome: agree no expansion of
  installed-platform claims. Current results retain that configuration.

## Verification and remaining scope

Candidate .33 receipt:
.artifacts/atom/2026-10-20T20-41-35-056Z/atom-handoff.json.
Full1613/focused581, duplicate controls10, native current reporter33/boundaries11/
ordinary41/storage15/first-viewport7/actual source25/keyboard5/types2/admission7 PASS.
The existing npm test and targeted Node commands use test-isolation=none; actual
native drivers run serially with the exact handoff path. Source/native inputs were
frozen at dirty BASE0f53ee3; the later local commit does not turn this into a clean
post-commit build. No installed-platform or human approval is inferred.

Aggregate .artifacts/u03/final-review/verification33.json passed twice, checking
current source/build inputs, exact archives/installed pair/entire hosts, archived
drivers, download GUID/byte/hash receipts, actual files and both parent domains.
It also binds the one review/regrading record and the retained .32 checkpoint;
old frozen verifiers were not rerun against changed current source.

| Actual current run | Result file |
|---|---|
| Normal current reporter33 | .artifacts/u03/input-reporter-native/2026-10-20T20-42-38-966Z/results.json |
| Pending Draft/v1/malformed/shadow JSON11 | .artifacts/u03/final-boundaries-native/2026-10-20T20-42-23-726Z/results.json |
| Ordinary privacy/recipient41 | .artifacts/u03/review-controls-native/2026-10-20T20-43-45-367Z/results.json |
| Exact local storage15 | .artifacts/u03/storage-native/2026-10-20T20-44-14-317Z/results.json |
| First viewport7 | .artifacts/u03/input-reporter-visual-native/2026-10-20T20-44-27-302Z/results.json |
| Actual source/build comparison25 | .artifacts/u03/source-creation-native/2026-10-20T20-44-38-852Z/results.json |
| Native forward/reverse keyboard5 | .artifacts/u03/keyboard-native/2026-10-20T20-45-21-277Z/results.json |

Agent viewed actual .33 first390 and duplicate-member refusal390 against supplied
Settings/narrow19 foundations: unchanged shared13/12px Inter, borders/alignment/
controls and wrapped status text. Current visual7 additionally binds440/200%/top
geometry; screenshots remain candidates. No tokens/primitives changed.

U03 H01–H06 and Task5 are complete within this configuration and the recorded
minor limitation. I1 is fixed; there are no outstanding Critical/Important
findings from the one review. Original criteria/BASEs/history are preserved.
M1 remains an explicit open Minor, not an undisclosed acceptance waiver. P04,
C07's real observation windows, mandatory A05/L02, broader framework/platform and
release gates remain separate. No SDK, push/publication, other repository or
memory update. One next dependency-ready item is
A01 — ordinary React selected-property/source/read and occurrence coverage.
