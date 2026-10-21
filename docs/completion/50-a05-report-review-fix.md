# A05.3c — historical-report plan complete within its boundary

2026-10-21. ONE fresh read-only review of2fe77fe..d7c4f6c found no Critical,
one Important and no required Minor findings. One TDD fix pass is verified on exact
Atom .20261021.20/UI .20261018.2/contract2.1.0. This completes the historical-report
plan, **not whole A05** or production/async/performance acceptance.

## Finding and fix

Reporter can independently include technical action declarations, then replace an
observed function name with REMOVED. A recipient subsequently omitting Function
names removed the replacement field but left the original name in the technical
component. Matching only retained values cannot recover intentionally lost originals.

Explicit privacy now conservatively removes corresponding base/source/input
metadata categories when selected original values were excluded, filtered or
replaced. It stores no hidden original or dictionary hash. Initial default action
exclusions still preserve independent base consent. An armed-empty packet has no
body/source fields and does not erase unrelated source-byte evidence. Reporter
words and mandatory diagnostic references are still separately retained/reviewable;
this is not general PII anonymisation.

The reviewer also considered input-only privacy removing independently consented
action identities. Root ruling: existing Input identities choices are scoped to
input history; Interaction identities/whole interaction privacy supplies the new
action-to-input/base reduction. Do not claim global deletion from input-only
controls. The other explicit rulings preserve untrusted rehash/authorship limits,
open production/async/listener/function-object gates, and candidate-only human
visual status. All four rulings and review result are archived in
.artifacts/a05/report-review-fixes/review-final.md. No second reviewer or review loop.

## Actual verification

- controller-red.log: actual reporter→replacement→recipient controllers reproduce
  both granular and whole omission leaks. overlap-red.log: omitted/replaced/filtered
  original-value cases fail. These REDs are retained unchanged.
- New six regression/control checks pass: controller granular/whole paths, all
  three unknown-original states across base/input/source, and armed-empty source
  preservation. Combined new/old report controls29 PASS, overlap-green1.log.
- `npm test`:1782 PASS,0fail/skip, full20.log. All codec/store/runtime/reporter/
  reader suites together584 PASS, focused20.log. No compiler/observer mechanism
  changed, no old finite experiment rerun or criterion adjustment.
- `npm run pack:atom`:
  .artifacts/atom/2026-10-21T11-25-04-022Z/atom-handoff.json. Exact archives and whole
  hosts match;2strict declaration consumers and7admission controls pass.
- Fresh `node tests/integration/action-trace-native.mjs <handoff> --reviewed-reports`:
  .artifacts/a05/reviewed-native/2026-10-21T11-33-33-581Z/results.json,
  13 PASS, errors/console empty, all before/after inputs/workspace bytes identical.
  Two actual native hosts each exercise current/default report; saved explicit
  declaration consent plus actual name replacement; exact Save/completed download;
  full restart; clean recipient without app/IDE/HTTP/permission changes; unchanged
  note/local-byte-comparison packet; recipient granular/whole privacy and later note.
  Sixteen completed browser downloads have GUID/byte-count/SHA receipts. Initial
  reviewed bytes contain the independently included original name; downloaded
  granular/whole/later-note copies no longer contain it. Parent continuity passes.
- Actual390/440/1100/zoom200/reduced-motion/Space/Tab checks retain13px/no horizontal
  overflow. No CSS/tokens/primitives changed. New replacement wording stays a
  reviewer redaction, not an observed source/name. Images remain candidates.
- `node .artifacts/a05/report-review-fixes/verify20.mjs` seals sources, archived
  review/rulings, exact new pair/logs/native files and privacy reductions in
  verification20.json. It additionally parses16 unchanged actual .19 downloaded
  files for backwards compatibility. Original input-reporter33 stays the recorded
  .19 result: its relevant codecs/controllers/dispatch bytes are unchanged and
  hash-compared, not claimed as a fresh .20 33-case run.

## Infrastructure failures retained

11-27-08 native run: standalone six cases and embedding creation/download pass,
then the isolated IDE host writes passed:true but its runner does not exit within
the unchanged15-second limit. Entire run remains FAIL9 with cleanup error.
11-29-41 refuses occupied49331 before scenarios; no foreign process is changed.
Inspection identifies the previous run's exact Code PID3430269/profile. Its CDP
endpoint is unresponsive; SIGTERM fails, so only that confirmed disposable profile
is terminated with SIGKILL. Cleanup receipts are archived. A protective initial
cmdline check made no changes: Electron had flattened argv into one process-title
string. The later exact executable/profile/port check established ownership.

No exit-code threshold or helper assertion is waived. Clean11-33-33 repeats the
original complete two-host cases and exits normally. No changes to shared IDE
harness/product lifecycle were made; the local driver only adds failure-state
metadata. This failed disposable IDE shutdown is not a product PASS.

## Next bounded item

Historical report storage, reviewed composition, privacy, passive import and one
review/fix pass are complete within this plan. Next: A05.3d preregistered installed
record-budget/resource controls and measured overhead, reconciling original matrix
from retained exact mechanisms. Production observation stays unsupported and
async/state/network consequences unlinked. Original whole A05 review remains after
those boundaries; mandatory O02/L02 and A02 lineage are not completed here. SDK,
publication, other repositories and a new handoff redesign remain excluded.
