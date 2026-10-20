# U03 — historical handoff implementation progress

Current branch `main`; no new branch/worktree. Binding new working journey:
[U06](../features/qa-pm-handoff-journey.md). The maintainer authorized bounded
implementation/verification/local-commit cycles until 2026-10-20T04:00:00Z,
then requested continuation for the next bounded cycle.
[Implementation plan](../superpowers/plans/2026-10-20-u03-handoff-implementation.md).
U03 remains **in progress**: a source model is not a reporter/recipient workflow.

## U03.1 — unimported internal draft and immutable baseline

`core/handoff-draft.mjs` adds `createHandoffDraft(raw, fields, {now})` with detached
read-only snapshots, optimistic revisions, synchronous updates, async freeze and
append-only Developer notes. Input is strict historical v1 JSON, not an application
object. The actor references exact source bytes by SHA-256/UUID and minimal target,
time/build/freshness metadata. It copies no old notes, body, source, URL, selector
or selected text; selected `disabled` boolean can remain, text is explicitly omitted.
Reporter actual/expected/question come only from explicit fields; absent data and
observation windows stay not-supplied/not-recorded. There is no P04 collector.

Freeze locks before host clock/hash work. Baseline remains immutable; notes retain
parent/baseline content digests and monotonic revisions. Same/different/missing
build is only a hash relation. Every finding is an **unverified Developer note**,
never Observed, execution, causality, authorship or a fix-verification claim. No
Chrome, storage, native action, source resolver, export or public-v2 API is added.
The internal `stateatom.handoff-draft` version1 is **not diagnostic version2**.

RED missing-module evidence is retained in `.artifacts/u03/draft/red.log`.
An initial full source pass1092/model45 is retained. Additional controls then
found four actual failures: noncanonical numeric array keys were ignored, explicit
null clock silently selected a different clock, a parseable date comment leaked
into minimal metadata, and host-clock reentry could alter a draft before freeze
locked. Their RED45/4 is retained in `boundary-red.log`. Own-data validation,
clock configuration, date normalization and pre-clock locks fix those cases.
Caller getters are never read; bounds reject instead of truncating the expectation.

Fresh final verification:

```sh
node --test --test-reporter=tap --test-isolation=none tests/handoff-draft.test.mjs
npm test
node .artifacts/u03/draft/verify.mjs
```

Results: model **49**, full **1096**, zero failures/cancelled/skipped. Receipt:
`.artifacts/u03/draft/verification.json`. Source/test hashes are frozen there.
The first isolated-file reporter showed a single file-level result; model counts
come from the explicit repository-style `--test-isolation=none` run, not that wrapper.

The existing issued `.20261020.9` source/build manifests, exact tarballs, installed
consumer and **entire file maps of both hosts** still match. The new actor is absent
from package source/build inputs and has no runtime importer. F05's native proof
keeps its own identity; no repack or old native rerun is justified by this model.

Task1 is complete within this unimported source boundary. U03.2 still needs an
explicit compatible public-v2 format, granular privacy, storage behavior and real
snapshot binding; then U03.3 actual reporter/reader UI, H01–H06 two-role acceptance
and the one whole-U03 review/fix pass. P04 H07–H09 and A05 execution are separate.
C07, real handoff, human visual, official-host, release and SDK claims are not added.

## Rulings

The new U06 journey and actor parameters are current working decisions, never
retrospective interview approval. Existing v1 schema/results and F05 `.9` are
unchanged. Initial construction necessarily hashes the raw source asynchronously;
subsequent read/update are synchronous, freeze/append await hashes. Text bounds
use JavaScript UTF-16 units. Cost if wrong: later UI/schema integration may need
adjustment and extra review, but no source/runtime behavior has been enabled by
this actor. Source hash/content identity is not trust or action authority.

## U03.2a — unimported minimal historical codec

Task2 is split into this independent source codec and later rich category review/
compatible storage. The parent Task2 remains **open**. The exact new working
[format profile](../features/handoff-minimal-format.md) was written before RED.
`core/handoff-report.mjs` now validates and emits candidate diagnostic-v2
`minimal-snapshot/1`, explicitly dispatches old v1 unchanged, binds creation to
exact source bytes/frozen baseline, and appends unverified Developer notes as new
files. Checksums validate content, not sender trust, causal proof or bug fixes.
Without supplied parent bytes, lineage is visibly not checked; matching parent
bytes establish only content continuity. Same/different/missing build remains a
hash relation. Cross-device wall-clock order is not assumed.

The minimal profile includes reporter discrepancy and selected disabled boolean
(or omitted text), source identity and `not-recorded` window. All other technical
fragments are omitted with category counts/reasons, not silently recategorized or
claimed absent in the original. It copies no legacy notes/paths/source/body/raw
selector. Reporter-entered words can still be private. Whole-field omissions make
a new privacy derivative/report identity, preserve the original and explicitly
drop/count old Developer notes so their text does not survive nested. Granular
per-category/per-note review, selected-text opt-in and storage remain later work.

Original missing-module RED is retained in `.artifacts/u03/format/red.log`.
`node --test --test-reporter=tap --test-isolation=none tests/handoff-report.test.mjs`
passes **35** source checks: strict v1 control, no private-copy/default-text leak,
source/target mismatch, missing window, checksum tamper versus rehashed untrusted
claim, exact whitespace-sensitive parent, immutable append/forks/stale parent,
wrong build, explicit derivative, bounded hostile input and no fetch/actions.
`npm test` passes **1131** including prior draft49 and original diagnostic cases.
`node .artifacts/u03/format/verify.mjs` verifies frozen source/logs and unchanged
issued `.9` manifests, tarballs, installed consumer and entire both-host bytes;
receipt `verification.json` in that directory, PASS.

This adds no runtime importer, v1 parser change, packed types, storage migration,
reader/UI, P04 collector or real two-role handoff. No repack/native rerun is
justified by this unimported codec. U03.2b and H01–H06/whole-U03 review remain open;
C07 is not complete. The next bounded product increment can mount the minimal
profile using the existing saved v1 original, without pretending v2 persistence
or rich technical review already exists; that direction must be ledgered before
implementation and retain the original Task2 gaps.


## U03.3a — actual minimal reporter / recipient UI

Current immutable `.20261020.12`:
`.artifacts/atom/2026-10-20T03-40-16-658Z/atom-handoff.json`. The minimal codec/draft are now bundled for this slice;
previous “unimported” entries above remain their historical checkpoints.

After explicitly saving a v1 snapshot, select it and choose **Prepare issue**.
The dialog takes reporter actual/expected/title/steps/question, shows a readable
snapshot-only preview, supports whole-field omissions and downloads only on a
separate click. It does not silently save/capture another observation or alter
the original stored v1. Source, responses, selected text and recorded actions are
excluded in this profile, with counts/limits; no fake window or execution is added.
The passive reader opens the actual file in a clean session without app/IDE/model,
and previews/downloads an unverified Developer note as a new file. Original
baseline and parent bytes remain intact. A different hash is not matched evidence.
Raw JSON remains optional detail; there is no auto-send, account or Capture action.

The adopted Settings dialog/shared typography supplies the visual foundation;
no shared token, primitive, reference artifact or contract version changed. A
report form is a necessary U06 journey adaptation: the supplied screen index has
no dedicated handoff screen. Agent inspection compared current 440/390px first
viewports, body13/control12, alignment, inputs/buttons, keyboard and reduced motion
against the existing foundation. The current screenshots are candidates, not
human approval. An independent human is not a prerequisite.

### Current checks

- Full source **1148**, focused UI/reader/original-v1 **41** (reporter12, reader5,
  existing diagnostic24), zero failures/skips/cancellations.
- Actual both-host minimal workflow **13**: real native picker/no app action;
  Save/preparation/Cancel; 440/390 and native keyboard; actual downloaded bytes,
  Russian descriptions, omitted private question; reporter browser closed,
  separate clean recipient; actual revision download and reopening with original
  reporter baseline unchanged. This is the minimal flow, not all H01–H06.
- Current packed F05 Settings lifecycle **15**, default local Live/Draft fields
  **40** without preview, original real browser/IDE legacy criteria **6**, strict
  packed consumers **2**, original package admission **7**, all PASS.
- Both authority workers are byte-identical to actual-expiry `.9`; production
  actor/runtime/platform/Settings source is unchanged and the old Atom CSS is an
  exact prefix of the new scoped CSS. `.9` ten-minute measurements retain their
  own identity; they are not called a new `.12` expiry run. Current `.12` Settings
  lifecycle checks independently cover the changed inspector composition.

`node .artifacts/u03/ui/verify12.mjs` binds current producer/source/tests, immutable
archives, installed consumer, entire host maps, result/file hashes and preserved
failures. Receipt: `.artifacts/u03/ui/verification12.json`. Native result:
`.artifacts/u03/minimal-native/2026-10-20T03-41-19-496Z/results.json`.

### Preserved failures and corrections

Initial `.10` native FAIL4 looked in the configured test folder, while the exact
1935-byte synthetic file had completed in default Downloads. The isolated browser's
History confirmed the path/state; only that UUID-named generated file was verified
and moved to its failure evidence directory with a recovery hash. The original
FAIL4 stays unchanged. Keeping the browser-level download CDP connection alive
fixed the test configuration; assertions/timeouts were retained.

A second `.10` FAIL4 exposed a genuine late-close event race after Cancel/reopen.
Controlled RED→GREEN now ignores the already-handled close event and preserves
the new source; `.11` was issued instead of overwriting `.10`. A `.11` FAIL6 then
had a wrong fixture expectation: the actual snapshot contains a recorded build
hash, so an intentionally different supplied hash must be `different-hash`.
The corrected driver adds strict SHA/non-equality assertions and keeps the note
unverified; it does not fabricate missing build identity. All old files/results
remain. A final plain-wording RED→GREEN produced `.12`, replacing the internal
trust enum in the normal reader status.

Other original source RED controls retain focus-stealing, eight-note-bound
re-enabling and missing-module evidence. Automatic approval review rejected a
proposed deletion of an unused driver read as possible criteria weakening. That
deletion was not performed. The safe alternative kept the original driver data/
assertions and added foreground input setup; later corrections retained explicit
checks and strengthened the wrong-build control. No approval remains blocked.

### Remaining scope and one next step

This completes **only U03.3a's minimal UI increment**. Parent Tasks2/3 and U03 stay
in progress. Rich per-category/per-note review, source/response/action inclusion,
compatible v2 local persistence/conflict handling, zoom and full H01–H06 plus the
one whole-U03 review/fix pass remain open. P04 observation collection is separate;
no C07/baseline acceptance is claimed. F05 M1 exact tab/page display is still a
known Minor; A05/L02 remain mandatory and SDK remains outside Atom.

One next bounded item: **U03.2b — compatible local v2 save/reopen**, preserving v1
and exact file bytes with explicit duplicate-ID conflict and existing retention
limits. Richer review then consumes that model. No new implementation begins in
the final deadline verification window.

## U03.2b.1 — compatible storage controller, not yet installed

Continuation from clean `043fe41` on the existing `main` branch. The next bounded
storage increment is specified in [the local store contract](../features/handoff-local-store.md).
`core/handoff-store.mjs` supplies a single-writer queued controller with save,
list, exact reopen, digest-checked removal and explicit legacy intake. Both v1
and minimal v2 retain their supplied raw strings, including whitespace/Unicode.
Same ID/same bytes is idempotent; same ID/different bytes rejects without writing.
The older v1 object array is accepted only through explicit intake, marked
`legacy-reserialized`; it does not recover original file bytes or delete the old
key. Available exact parents validate content only. Missing/evicted/deleted parents
remain not-checked, and developer statements remain unverified historical notes.

Retention keeps eight entries, 2 MiB of encoded storage and seven days from the
original artifact timestamp. Duplicate saves do not extend expiry or reorder.
Evicted/expired IDs are returned. An incoming batch that would immediately lose
its own new records rejects atomically; the caller can choose a smaller batch.
Corrupt storage, malformed files, stale removal and conflicts cause no write.
Read failure never becomes an empty-store overwrite; write failure never publishes
success or triggers a blind rollback. A lost acknowledgement after commit requires
reopening actual storage, and is not a guarantee that old bytes survived. The adapter must atomically replace a string and use
one controller/writer per key; cross-process CAS is not claimed. No default Chrome
adapter, runtime importer, startup migration, wire/type operation or UI is added.

Fresh commands and results from this source revision (dirty atop `043fe41`):

```sh
node --test --test-reporter=tap --test-isolation=none tests/handoff-store.test.mjs
npm test
node .artifacts/u03/ui/verify12.mjs
node .artifacts/u03/storage/verify2.mjs
```

Storage **35**, full **1183** pass with zero failures/cancelled/skipped. Tests use
real temporary filesystem read/write and a restarted controller for reopening;
controlled read/write failures check acknowledgement boundaries, including a
lost acknowledgement after a real disk commit. Initial34/full1182 results remain
historical; the final extra check characterizes the existing controller behavior
and corrects the adapter guarantee without changing product code. Concurrent
operations retain both acknowledged writes. Source/digest/log receipt:
`.artifacts/u03/storage/verification2.json`. Original missing-controller RED1 and
contract RED34, then first implementation32/34 and second33/34 remain in that
artifact directory. Two test mistakes were corrected: checksum tampering uses
existing `HANDOFF_INTEGRITY`, and a claimed single-file encoded-size overflow
actually fit. The replacement batch control changes decoded backslash strings
before serialization, so the legacy array fits 2 MiB but its nested store does
not. No production guard, old test or evidence threshold was weakened.

Fresh identity verification confirms `.20261020.12` producer/build inputs,
archives, installed consumer and **entire both-host file maps** are unchanged;
this controller is absent from executable manifests. The old native/UI/type
results retain their original execution identity. No repack or repeated native
experiment is justified by this unimported controller, and its filesystem checks
do not prove Chrome storage or a usable Save/reopen interface.

Only this controller boundary is complete. Next: **U03.2b.2 — browser-owned local
storage and UI save/reopen**, consuming exact raw strings and preserving old v1
records. Rich per-category/per-note review, full H01–H06, P04, one whole-U03 review
and C07 remain open. Tasks2/3 retain their original BASEs and are not task-done.

## U03.2b.2a — installed compatible storage backend

The resumed autonomous timebox ends at 2026-10-20T14:00:00Z (18:00 Mauritius).
This increment consumes `528ca48`'s controller and leaves actual v2 save/reopen
controls for the next bounded UI increment. Current immutable candidate `.14`:
`.artifacts/atom/2026-10-20T04-58-15-793Z/atom-handoff.json`.

All reports now share the existing namespaced `diagnostics` key. Old v1 object
arrays remain readable as marked legacy representation; unchanged reads keep
that array. New files cause a private version2 container at the same key, with
compact legacy objects and exact raw strings for supplied v1/v2 files. Prior
private version1 envelopes remain explicitly readable. No public report schema
is silently upgraded, no neighboring host key is touched, and a large valid v1
archive is not inflated into unreadability by wrapping every old object in JSON.
The Chrome adapter writes the container as a structured object, avoiding another
layer of escaping. Combined limits stay eight reports, 2 MiB encoded value and
seven days; Chrome additionally counts the fixed 29-byte namespaced key.

Trusted local operations `save-handoff`, `list-handoffs`, `open-handoff` and
`delete-handoff` require no app, source, model, browser origin grant or debugger.
Wire fields/UTF-8 budgets are checked; only file save has a larger escaped envelope.
Old list-diagnostics still returns v1, and old deletion cannot delete v2. Exact
digest deletion and duplicate-ID conflicts preserve originals. Queued/cancelled/
shutdown work checks its live context before writes. Already committed writes are
not promised to roll back after a lost reply. Public declarations describe these
historical data results, not a mutation or execution capability.

Fresh verification on dirty source atop `528ca48`:

```sh
npm test
node --test --test-reporter=tap --test-isolation=none tests/handoff-store.test.mjs tests/atom/handoff-runtime.test.mjs tests/atom/contract.test.mjs tests/atom/capabilities.test.mjs tests/browser/worker.test.mjs
npm run pack:atom
npm run verify:atom-types -- .artifacts/atom/2026-10-20T04-58-15-793Z/atom-handoff.json
npm run verify:atom-package -- .artifacts/atom/2026-10-20T04-58-15-793Z/atom-handoff.json
node tests/integration/handoff-storage.mjs .artifacts/atom/2026-10-20T04-58-15-793Z/atom-handoff.json
node tests/integration/handoff-minimal.mjs .artifacts/atom/2026-10-20T04-58-15-793Z/atom-handoff.json
node tests/integration/production-settings-lifetime.mjs .artifacts/atom/2026-10-20T04-58-15-793Z/atom-handoff.json
node .artifacts/u03/storage-runtime/verify14.mjs
```

Full **1199**, focused **95** (store38/runtime13/old worker17 plus existing contract/
capability checks), strict packed consumers **2**, admission **7** pass. Actual
packed Chrome storage passes **15** in both standalone/embedding, including a
near-budget legacy array, exact Unicode/whitespace raw file, conflict/invalid
input, same-profile whole browser restart, combined retention and digest-checked
removal. Heavy escaped files measure **1544456 encoded value bytes / 1544485 Chrome
bytes**, exactly the extra 29 key bytes in both hosts. No app/IDE/model is involved;
these are backend controls through the real trusted host dispatcher, not UI saves.
Record: `.artifacts/u03/storage-native/2026-10-20T05-01-26-556Z/results.json`.

The unchanged minimal reporter/download/clean-recipient driver passes **13** on
current `.14`: `.artifacts/u03/minimal-native/2026-10-20T05-02-39-480Z/results.json`.
Current F05 Settings lifecycle passes **15**:
`.artifacts/f05/settings-lifetime/2026-10-20T05-03-18-471Z/results.json`.
Old elapsed ten-minute expiry, majority and legacy experiments retain their own
versions and criteria; they are not relabelled as these new runs. Agent-operated
screenshots remain candidates. There is no fresh official host or human acceptance.
Final frozen source/archive/entire-host/log receipt:
`.artifacts/u03/storage-runtime/verification14.json`.

Retained failures and corrections:

- Legacy source RED2, then compact-storage RED3 show the old controller rejecting
  valid old arrays/escaped legacy capacity. Private2 fits the prior escaped batch
  without raising the 2 MiB limit; raw new-file bounds remain asserted.
- First full run had **17 failures**, all `createHandoffStore is not defined` in
  the old VM harness that manually strips runtime imports. Wiring the real store
  through an ordinary cross-realm adapter fixes those tests; their old assertions
  are unchanged. Subsequent full1198 pass is preserved as an intermediate result.
- Chrome byte-budget RED2 reproduces a real adapter bug: storing the whole container
  as a string double-encodes its contents. The structured-object write fixes it.
  Superseded `.13` archive is retained, unclaimed as native acceptance.
- First native `.14` **FAIL1** assumed Chrome preserves old object key order; its
  semantic v1 equality passed. The driver now compares actual seeded Chrome data,
  array type and meaning, while new file bytes still require exact equality.
- Second native `.14` **FAIL3** expected the wrong existing code for `{}`; the codec
  reports `UNSUPPORTED_HANDOFF_FORMAT`. Corrected that exact expectation and added
  a separate malformed `{bad` control requiring `INVALID_HANDOFF_REPORT`.
  Both failed result directories remain unchanged; no refusal/assertion was removed.

Only this installed backend boundary is complete. Next **U03.2b.2b** connects the
separate reviewed Save action, exact-source preparation, readable saved-v2 reopening
and explicit import/removal to the existing inspector UI. Current UI still exposes
its existing saved-v1/minimal download workflow. Rich per-category/per-note privacy,
full H01–H06, whole-U03 review, P04 and C07 remain open; Tasks2/3 are not task-done.

## U03.2b.2b — reviewed Save, local reopen and explicit import UI

Current immutable `.20261020.17`:
`.artifacts/atom/2026-10-20T05-36-31-213Z/atom-handoff.json`.
This completes the bounded local persistence UI after backend `92f0e6c`, not
rich privacy, whole U03 or C07. New UI details are implementation choices within
the U03 working brief, not retrospective approval from the scope interview.

After selecting a saved v1 snapshot, Prepare issue reopens its **exact stored raw
string**. Preview and download do not save automatically. **Save reviewed report
locally** is separate and requires acknowledgement of the exact artifact ID and
raw digest; failed/lost replies preserve the reviewed bytes for retry/reopen.
Edits/Cancel invalidate old replies, and queued writes are aborted where possible;
a committed save is not promised to roll back. Inputs wait for the saved source
before the default title is initialized. Original snapshots remain v1; retention
may remove oldest reports with a visible notice under the unchanged common budget.

The same selector displays readable issue titles/snapshot properties. Review/export
opens saved v2 read-only, shows discrepancy/condition/time/omissions/unverified
notes and downloads the original string. A local exact parent permits content
matching only; absent parents remain unchecked. Close returns focus to review.
Explicit file import checks 1 MiB/strict UTF-8/format before storage. Identical
files are idempotent; a different raw string at the same ID conflicts visibly.
Malformed UTF-8/BOM/JSON are not silently normalized into stored files. Delete uses
the selected raw digest; Refresh local files provides recovery after uncertain I/O.
These operations require no live app, source, model or account.

Fresh commands (exact handoff argument shown once as `$HANDOFF` for readability):

```sh
# HANDOFF=.artifacts/atom/2026-10-20T05-36-31-213Z/atom-handoff.json
npm test
node --test --test-reporter=tap --test-isolation=none tests/atom/handoff-ui.test.mjs tests/atom/handoff-library.test.mjs tests/atom/inspector-ui.test.mjs
npm run pack:atom
npm run verify:atom-types -- "$HANDOFF"
npm run verify:atom-package -- "$HANDOFF"
node tests/integration/handoff-library.mjs "$HANDOFF"
node tests/integration/handoff-storage.mjs "$HANDOFF"
node tests/integration/production-settings-lifetime.mjs "$HANDOFF"
npm run verify:input-fields -- "$HANDOFF" --accepted
node tests/integration/input-legacy.mjs "$HANDOFF"
node .artifacts/u03/storage-ui/verify17.mjs
```

Full **1227**, controllers **59** (UI23/library15/mounted21), packed types **2** and
admission **7** pass. Actual native UI **25** includes the original minimal two-role
controls plus separate keyboard-reachable Save, exact read-only redownload, whole
reporter browser restart with the app closed, actual native file input, duplicate/
conflict/invalid UTF-8 paths, 440/390 layouts and actual 200% browser zoom. It then
opens the downloaded report in a clean recipient profile and appends/reopens a
new unverified note without changing the baseline. Record:
`.artifacts/u03/library-native/2026-10-20T05-38-02-809Z/results.json`.
Repeated download is proven by a **fresh native Chrome download GUID, completion
and byte count**, even when Chrome overwrites an identical destination filename.

Current storage/restart/quota **15**:
`.artifacts/u03/storage-native/2026-10-20T05-38-18-361Z/results.json`.
Current F05 lifecycle **15**:
`.artifacts/f05/settings-lifetime/2026-10-20T05-38-35-039Z/results.json`.
Actual **default** input fields **40**, `configuration.preview:false`:
`.artifacts/u02/input-fields/native/2026-10-20T05-43-49-779Z/results.json`.
Original legacy experiments/real IDE/Restore **6**:
`.artifacts/u02/input-legacy/2026-10-20T05-41-31-526Z/results.json`.
The earlier bare verify:input-fields run passed preview40 separately at
`2026-10-20T05-38-50-083Z`; it is retained as preview, never relabelled default.
Old majority/ten-minute expiry results retain their own original versions.
Frozen current source/archive/entire-host/log receipt:
`.artifacts/u03/storage-ui/verification17.json`.

Visual comparison used the supplied Settings narrow reference and current native
prepare/saved views in both hosts. Shared type/surfaces/borders/control alignment
remain the foundation; the longer description form scrolls and 200% zoom wraps
its header. No dedicated handoff reference screen is claimed. Plain textareas
now use the shared body font instead of the existing broad JSON-monospace rule;
computed body/control sizes stay 13/12 px. New CSS is scoped to Atom handoff/import
controls; shared tokens/primitives/reference artifacts are unchanged. Changelog
records every visual change. Screenshots are agent-reviewed candidates, not human
visual approval, and an independent human remains **not a blocker**.

Retained RED/control history in `.artifacts/u03/storage-ui`:

- Library missing-factory14 and later title metadata1; Save7/identity8 after the
  old12 pass; mounted coupling2; real-parser missing-parent2; focus1; source-ready1.
  Fixes preserve strict parser semantics, precise acknowledgements and stale UI
  refusal. No getter, skipped branch or app expression is re-evaluated.
- `.15` native **FAIL6** at `2026-10-20T05-26-52-398Z`: Save/reopen succeeded;
  the helper incorrectly required a new second filename. Read-only Chrome History
  confirms two completed 1962-byte downloads to the same destination. Native GUID
  completion now proves the second download without a false positive from old data.
  The same screenshot exposed a default-title/native typing race, fixed by the
  source-ready input gate. Native input now waits for enabled controls, activates
  the page before focus/select, and asserts the exact entered title.
- `.16` functional native25 remains at `2026-10-20T05-32-09-313Z`. A new visual
  control then correctly failed3 at `2026-10-20T05-35-45-386Z`: ordinary textareas
  inherited SFMono instead of shared Inter. Scoped CSS fixes it; `.17` reruns the
  whole current native flow. Superseded archives/results are not overwritten.

The stale package contract's textual F05-not-implemented note now describes the
actual default-read-only/separate two-stage condition; policy and authority were
not broadened. Next **U03.2b.3 — rich privacy/technical evidence profile** must add
explicit category/field/per-note review without silently gaining data or trust.
Tasks2/3, full H01–H06, one whole-U03 review, P04 and C07 remain open. SDK,
publication and other-repository changes remain outside this run.

## U03.2b.3a — unimported granular saved-source projection

The [working contract](../features/handoff-content-review.md) and
`core/handoff-content.mjs` add a bounded pure model, not a public rich profile or
installed feature. `createHandoffContentReview(rawV1)` binds the exact saved bytes
and returns a private filtered catalogue and detached frozen projection. Thirteen
explicit categories and individual field omission/reviewer replacement exclude
private content by default. Only allowlisted v1 fields are eligible; no raw source
clone is hidden in the result. Origin/path consent is separate, query/credentials/
fragment are always removed, sensitive keys/patterns remain filtered after opt-in,
and source-map consent is independent. Filtering is not complete PII removal.

Original evidence kinds/freshness and actual false booleans remain; a replacement
is reviewer redaction, never a new observation. Missing/filtered/omitted context
makes its join unverifiable. Compilation journal exclusion is explicit; map/source
bodies, U02 history, Action executions and observation windows absent from v1 are
not reconstructed. Strict choices reject accessors, sparse arrays, conflicts and
unknown IDs; input/row/output limits reject instead of silently discarding evidence.

Fresh commands:

```sh
node --test --test-isolation=none tests/handoff-content.test.mjs
npm test
node .artifacts/u03/content-model/verify.mjs
```

Source projection **29** and full **1256** pass. Exact `.17` producer, archive,
installed consumer and entire two hosts remain unchanged; their old native results
retain their own execution identity. No repack/native rerun is justified for an
unimported model. Receipt `.artifacts/u03/content-model/verification.json` records
source/log hashes and retained controls. Missing-factory1/contract24 RED, first23/25
and semantics26/29 results are preserved. Two first-run expectations were corrected
to actual source `ide:false` and category-specific map exclusion (the same script
ID can independently appear in Action registration). Real per-relation/effect kind
and journal-disclosure failures required product fixes. The initial output-budget
fixture fit; a larger source is explicitly below1MiB/default output below1MiB, while
opted-in output now exercises the rejection. No acceptance limit was increased.

Next **U03.2b.3b** defines the explicit rich public codec and per-note privacy
derivatives before installed/UI integration. Original minimal/v1 profiles, Task2/3
BASEs, full H01–H06, whole-U03 review, P04/C07 and mandatory A05/L02 stay open.

## U03.2b.3b — unimported explicit reviewed profile and per-note derivatives

The [new working format](../features/handoff-reviewed-format.md),
`core/handoff-reviewed.mjs`, implements a separate `reviewed-snapshot/1` codec. It
reuses the existing minimal factory only for exact v1/frozen baseline binding,
then validates its explicit own profile. Strict v1/minimal importers are unchanged
and still reject the new profile. No installed/UI rich capability is claimed.

Creation includes only the reviewed allowlisted projection, source identity and
reporter baseline. Per-note/category/field/issue privacy creates a new artifact
and baseline identity/digest. Retained Developer notes form an identical ordered
subsequence, omitted notes leave only a cumulative count, and no removed original
bytes/catalogue/raw v1 clone survive in the result. Omitted/unavailable content
cannot be restored. Replacement stays filtered reviewer redaction. Parent checks
bind exact raw bytes, revision and permitted changes; hashes never attest claims.

Choices and findings are copied before asynchronous hashing. Strict public types,
known-secret/URL checks and static metadata scopes keep source Code-linked, exchanges
Observed-only and maps unjoined. Broken-context/omission indices are recomputed,
false values remain false and absent windows remain not-recorded. Public1MiB/
depth16/tree10000 limits still apply, even if the internal model's row budget fits.
Matching-build Developer notes remain unverified; **actual H05 evidence enrichment
is unfinished**, not satisfied by hash-only fixtures.

Fresh commands:

```sh
node --test --test-isolation=none tests/handoff-reviewed.test.mjs tests/handoff-content.test.mjs tests/handoff-report.test.mjs
npm test
node .artifacts/u03/reviewed-codec/verify.mjs
```

Reviewed codec **30**, combined focused **94** and full **1286** pass. Receipt
`.artifacts/u03/reviewed-codec/verification.json` binds source/log bytes and exact
unchanged `.17` producer/archive/installed consumer/entire hosts. No native rerun
or new package for this unimported codec; old native results retain their identity.

Retained controls: missing-factory1/contract23 RED; initial24 PASS; boundaries5/29
RED caught late consent/finding reads, null-array fallback, missing static metadata
labels and unfiltered public patterns/origins. Fixes snapshot inputs synchronously,
validate present arrays and public filtering, and accept the two actually emitted
static labels. A synthetic debug copy identifies the expression-label omission,
without product debug hooks. Types1/30 RED requires strict typed paths, truncation
unknown and source/network/map context kinds/reasons. All acceptance assertions and
old minimal tests remain, with no limit or evidence threshold relaxed.

Next **U03.2b.3c** integrates an explicit dispatcher, both passive readable views,
normal category/field/per-note review and compatible persistence, then creates a
fresh immutable package and verifies actual downloaded bytes in both hosts.
Task2/3, full H01–H06/whole-U03 review, actual source/build enrichment, P04 and C07
remain open; no SDK/publication/other-repository work follows from this increment.

## U03.2b.3c.1 — installed passive reviewed-profile integration

Candidate `.20261020.18` is immutable at
`.artifacts/atom/2026-10-20T06-38-34-241Z/atom-handoff.json`, built from working
source above `76657b7`. The [integration contract](../features/handoff-reviewed-integration.md)
splits passive integration from new reporter/recipient privacy controls. Strict
minimal/v1 codecs retain their semantics; `core/handoff-files.mjs` explicitly
dispatches the reviewed profile. Common private storage, local import, Atom saved
review and passive reader now accept it without adopting application authority.
Source/window/values remain historical and untrusted. No source or URL is fetched.

Shared presentation distinguishes included false/text, filtered, omitted, unavailable
and reviewer replacement. First view stays discrepancy/expected/condition/time;
readable technical fragments live in a native disclosure, with original scoped
evidence kinds and broken-context wording. Data uses textContent, never active
links/HTML. Exact original JSON remains advanced. The passive file input now uses
strict bounded UTF-8, preserves BOM for rejection and never silently substitutes
bytes. Normal **Prepare issue still creates minimal-snapshot/1**. Rich files in
this native check are declared synthetic codec fixtures, not normal reporter rich
creation, actual H05 evidence enrichment or full U03 acceptance.

Fresh commands (`$HANDOFF` denotes the exact .18 path above):

```sh
node --test --test-isolation=none tests/atom/handoff-ui.test.mjs tests/browser/handoff-reader.test.mjs tests/atom/handoff-library.test.mjs tests/atom/inspector-ui.test.mjs tests/handoff-files.test.mjs tests/handoff-presentation.test.mjs
npm test
npm run pack:atom
npm run verify:atom-types -- "$HANDOFF"
node tests/integration/handoff-reviewed.mjs "$HANDOFF"
node tests/integration/handoff-storage.mjs "$HANDOFF"
node tests/integration/production-settings-lifetime.mjs "$HANDOFF"
npm run verify:input-fields -- "$HANDOFF" --accepted
node tests/integration/input-legacy.mjs "$HANDOFF"
npm run verify:atom-package -- "$HANDOFF"
node .artifacts/u03/reviewed-integration/verify18.mjs
```

Full **1300**, targeted UI/readers/dispatch **78**, packed types **2**, admission
**7** pass. Actual native **45** retains all original25 minimal two-role/local-save
controls and adds rich fixture import, readable included text/scoped details, exact
raw-byte reopen/download with fresh completed Chrome GUID, separately redacted
fixture import, tampered-checksum refusal, clean recipient note download/reopen,
UTF-8/BOM refusal, native Space/Tab/focus trap and reduced motion. Result:
`.artifacts/u03/reviewed-native/2026-10-20T06-46-03-682Z/results.json`.
Both hosts have no app/source/IDE during passive rich reading; observed external
reader requests remain empty. Rich note preserves the whole report and stays
unverified with a different recorded build hash.

Current native storage/restart/quota **15**:
`.artifacts/u03/storage-native/2026-10-20T06-43-51-421Z/results.json`.
F05 Settings lifecycle **15**:
`.artifacts/f05/settings-lifetime/2026-10-20T06-47-29-052Z/results.json`.
Default fields **40**, actual `configuration.preview:false`:
`.artifacts/u02/input-fields/native/2026-10-20T06-48-05-207Z/results.json`.
Original legacy/real IDE/Restore **6**:
`.artifacts/u02/input-legacy/2026-10-20T06-49-08-093Z/results.json`.
Default and legacy suites briefly overlapped; focused source checks establish
independent ephemeral origins/profiles versus legacy4173/its own IDE, and both
terminal results retain unchanged before/after inputs. No shared-port result or
old majority/expiry evidence is silently rerun or regraded.

The source/entire-host/archive/native raw-file receipts are frozen in
`.artifacts/u03/reviewed-integration/verification18.json`. Agent compared the
supplied Settings narrow reference with current390/200%-zoom/recipient captures.
Shared13px body/12px controls/type/borders remain; longer readonly scrolling,
wrapped200% heading and optional technical disclosure are necessary local composition
differences, with no dedicated handoff reference claimed. Shared tokens/primitives/
reference files are unchanged. Changelog18 records the visual change; screenshots
remain candidates, no independent-human gate or human approval claim.

Retained controls: missing dispatcher/presentation2, contract9 (including real
old-store unsupported-rich refusal), and UI-rich2 RED. First full run had **1/1300
failure**: old v1 reader test supplied `.text()` only with fake size100. The harness
now reselects a real Node File for each changed synthetic payload; all original
provenance assertions remain, focused v1 reader24/full1300 pass. Product .18 did
not change for this repair. First native43 PASS remains at06:42:51. Added keyboard/
reduced-motion control then failed14 at06:44:47 because the raw native page wrapper
has no Playwright `emulateMedia`. Driver-only CDP Emulation correction gives the
final45 PASS; failed/intermediate results and original driver copies remain intact.

Next **U03.2b.3c.2** adds normal reporter category/field review and recipient
per-note privacy controls. Tasks2/3 remain open, with actual source/build evidence
enrichment, any separately bound saved input outcomes, full H01–H06/whole-U03
review, P04 and C07 still unfinished. No SDK/publication/other-repository work.


## U03.2b.3c.2 — ordinary reporter and recipient privacy controls

Immutable candidate `.20261020.19` at
`.artifacts/atom/2026-10-20T07-15-17-102Z/atom-handoff.json` was built from
working source above `1f7df4a`. The [working UI contract](../features/handoff-review-controls.md)
adds native category/field review to ordinary Prepare issue, now creating the
explicit reviewed profile by default. Private categories start excluded; map
metadata requires its own choice. Safe metadata and individual filtered fields
can be omitted or replaced by labelled reviewer redaction. Cancel/new source reset
technical consent; existing typing, source-ready, stale-preview and exact Save
acknowledgement guards remain. No absent data is collected from the application.

The recipient can create a separately previewed/downloaded privacy copy, omit
individual Developer notes/issue fields/categories/fields, and redact retained
fragments. Exact parent bytes bind the child; originals and retained notes remain
unchanged. Omitted/unavailable data cannot be restored. Edits, Cancel and file
replacement invalidate both prepared downloads, while Cancel preserves typed note.
Old minimal/v1 reading remains supported. A valid old snapshot beyond detailed
review budgets offers an explicit **Use a simple report** action, preserving typed
issue words through the unchanged minimal codec. No automatic fallback/limit raise.

Fresh commands (`$HANDOFF` denotes the exact .19 path above):

```sh
node --test --test-isolation=none tests/atom/handoff-ui.test.mjs tests/atom/handoff-review.test.mjs tests/browser/handoff-reader.test.mjs tests/atom/inspector-ui.test.mjs tests/handoff-presentation.test.mjs tests/browser/diagnostic.test.mjs
npm test
npm run pack:atom
npm run verify:atom-types -- "$HANDOFF"
node tests/integration/handoff-review-controls.mjs "$HANDOFF"
node tests/integration/handoff-storage.mjs "$HANDOFF"
node tests/integration/production-settings-lifetime.mjs "$HANDOFF"
npm run verify:input-fields -- "$HANDOFF" --accepted
node tests/integration/input-legacy.mjs "$HANDOFF"
npm run verify:atom-package -- "$HANDOFF"
node .artifacts/u03/review-controls/verify19.mjs
```

Full **1323**, focused **103**, packed types **2**, package admission **7** pass.
Ordinary native both-host flow **33**:
`.artifacts/u03/review-controls-native/2026-10-20T07-59-03-213Z/results.json`.
This uses actual picker, explicit synthetic GET context, real saved v1 and normal
Prepare controls. Actual reviewed default/opt-in files, exact re-download after a
full browser restart with app closed, clean-recipient note and privacy-copy
files are parsed and bound by exact hashes/completed Chrome download GUIDs.
Private text/body omission, reviewer replacement, per-note removal, map consent,
Cancel/stale guards, UTF-8 refusal, old minimal compatibility and explicit budget
fallback are exercised. Map/budget compatibility files are separately labelled
synthetic legacy fixtures, not runtime map provenance or H05 enrichment.

Native storage **15**, Settings lifetime **15**, ordinary accepted fields **40**
(`configuration.preview:false`) and legacy/real-IDE/Restore **6** remain current
on the same immutable pair. Exact result paths, all producer/consumer/entire-host
hashes, retained failed runs and source logs are bound by
`.artifacts/u03/review-controls/verification19.json`.

**Network evidence correction:** the raw browser wrapper never forwarded the
`.on('request')` callbacks used by .18 and .19a–d. Their empty arrays are **not**
HTTP-observation proof; raw results/logs remain unchanged, and the old .18 claim
above is qualified accordingly. Final .19 uses an inspector-only CDP Network
observer with a positive reload control: actual reader.js/self requests are
observed before importing a file, then no HTTP requests occur through reading,
note and privacy-copy workflows. This is inspector-scoped observation, not an
all-browser/app collector or P04 window. No prior acceptance threshold is lowered.

Agent compared actual390 and200%-zoom screenshots with the supplied Settings
foundation. Shared13px body/12px controls, borders and native controls remain;
optional technical review adds vertical scrolling. No dedicated handoff design
reference, shared-token edit or human approval is claimed. Screenshots remain
candidates; an independent human is not a blocker.

Retained controls in `.artifacts/u03/review-controls/`: missing/editor14 RED,
coupling6/36 RED, limits/category-conflict2/45 RED, then focused103 PASS. First full
1323 failed one old inspection-view fake DOM lacking ownerDocument; repairing the
test double preserves all finite-trace assertions (focused13/full1323 PASS).
Mounted fake DOM required the same property; no original assertion was removed.
Seven unique native failures remain: catalogue/source-save timing, map checkbox
presence assumption, missing async imported readiness, CSS zoom reflow, async tab
options and mouse acknowledgement. Drivers now wait actual enabled/new-ID/native
state and hit-test the real target before native Input; product .19 was unchanged,
no blind retry, threshold relaxation or synthetic interaction substituted.

Next bounded work is **U03.2b.3d source-evidence fidelity**, checking the specific
legacy source-status projection before actual H05 source/build enrichment. Task2/3
BASEs and whole H01–H06/U03 review remain open, as do separately bound U02 saved
outcomes, P04/C07, mandatory A05/L02. No SDK/publication/other repository work.


## U03.2b.3d — non-Code-linked legacy source fidelity

A focused reproduction above `67f8c1e` showed accepted v1 sources labelled Candidate,
Unknown/Unsupported, Stale or with absent status becoming Code-linked in detailed
projection and actual public reviewed creation. Root cause was the fixed source
join definition; `reviewed-snapshot/1` only represents Code-linked sources.
The [working failure contract](../features/handoff-review-controls.md) rejects new
detailed creation with `UNSUPPORTED_HANDOFF_EVIDENCE` unless each source explicitly
records Code-linked. It never infers a status from a filename or an absent field.
The strict v1 parser, existing rich imports and original files remain unchanged.

Prepare explains the unrepresentable evidence kind and offers the existing
explicit **Use a simple report** action. Actual/expected and exact source identity
are preserved; technical fragments stay omitted with existing counts. Typing keeps
the explanation visible until Simple is chosen. Nothing falls back automatically.
Already-exported rich files remain untrusted historical claims; without original
v1 bytes this change cannot retrospectively detect/rewrite an old creator's upgrade.
A future profile for other source kinds needs its own contract, not a silent /1 edit.

Final immutable `.20261020.21`:
`.artifacts/atom/2026-10-20T08-20-12-486Z/atom-handoff.json`, source above `67f8c1e`.
Intermediate `.20` stays at08:15:42 with its own native41/types2 evidence. It does
not include the subsequent visible-reason correction. Final source **1335** and
focused **100** pass; packed types **2**, admission **7**. Actual both-host native
**41** keeps all prior normal reporter/privacy controls and adds four separately
labelled historical-status controls per host. Each actual native downloaded simple
file retains issue words, exact original source digest and sourceLocations1, with
no source fragment bytes. Original v1 files are byte-equal after review. Budget
fixtures explicitly retain Code-linked so original row/output limit controls are
still exercised rather than accidentally testing only the new source-status guard.
Native storage **15** is fresh on .21. Exact paths/bytes/hashes and retained results
are in `.artifacts/u03/source-fidelity/verification21.json`.

Fresh commands (`$HANDOFF` denotes the exact final .21 path):

```sh
node --test --test-isolation=none tests/handoff-content.test.mjs tests/handoff-reviewed.test.mjs tests/atom/handoff-ui.test.mjs
npm test
npm run pack:atom
npm run verify:atom-types -- "$HANDOFF"
node tests/integration/handoff-review-controls.mjs "$HANDOFF"
node tests/integration/handoff-storage.mjs "$HANDOFF"
npm run verify:atom-package -- "$HANDOFF"
node .artifacts/u03/source-fidelity/verify21.mjs
```

Current authority, input-editor, storage/parser and CSS source identity is compared
with .19. Settings15/default40/legacy6 remain their exact historical .19 executions,
not relabelled as fresh .21 runs. No old majority/ten-minute/legacy/default/Settings
experiment is repeated without a changed criterion. Inspector network observation
continues to require an actual positive CDP reader.js control; old unwired arrays
remain qualified. Shared typography/primitives/CSS/reference files are unchanged;
agent compares the wrapped source-limit explanation/native Simple control at390.
Screenshots stay candidates; no independent human blocker or approval claim.

Retained controls in `.artifacts/u03/source-fidelity/`: original reproduction;
RED12/100, then first green7/100 due an invalid new test assumption that old
parseDiagnostic byte-roundtrips unrelated normalized map/action metadata. The
correct assertion retains exact source fields; the parser was not changed.
Green100 passes. First full1335 failed only a newly added message assertion read
after typing had changed that message. Moving that assertion before typing kept
its exact budget reason; full20b1335 passed. Actual .20 render then exposed the
useful-reason loss as a UI issue; new persistent-reason RED2/30 precedes the real
UI fix, final focused100/full1335 pass. Native20a failed after17 checks because a
new driver used nonexistent minimal counts.sources instead of sourceLocations;
actual downloaded file already had sourceLocations1. Corrected driver only gives
20b41 PASS; all failed files/driver copies remain. Storage20 wrote rawPASS15 with
unchanged before/after inputs but its exec session ended143; it is retained with
that process limitation, not a clean-exit claim. Final .21 uses its own fresh run.

Next bounded **U03.2b.4a** defines actual source/build evidence attachment for H05
before installed integration. Matching hashes remain content comparisons, not
new execution/fix verification. Whole Task2/3/U03 H01–H06 review, separately bound
U02 saved outcomes, P04/C07 and mandatory A05/L02 remain open.


## U03.2b.4a — unimported actual local source-byte comparison model

The [working contract](../features/handoff-source-evidence.md) adds
`core/handoff-source-evidence.mjs`, not imported by runtime/UI. It compares a v2
report, separately acquired v1 Developer diagnostic and explicit local file
ArrayBuffers. Hashes are computed from actual copied bytes. Exact retained
Code-linked path/digest, recorded-build equality and Recorded freshness are all
required; absent, omitted, reviewer-replaced, stale, ambiguous, same-name/different-
path/different-byte/different-build cases remain unjoined with ordered reasons.
No file borrows a sibling's match, and no omitted source anchor is restored.

The result is frozen, internal and `exportable:false`, bound to exact raw parent/
Developer hashes and baseline identity. Source text/raw v1/buffers are absent.
Private relative paths need later explicit public review. One to8 files,256KiB
per file/512KiB total; own descriptors and copied buffers are snapshotted before
any asynchronous hash. Input size is checked through intrinsic ArrayBuffer brand/
length before copying, and detached/forged/decorated buffers reject. There is no
source execution, fetch, filesystem resolution/write, app action or authority.

Source investigation confirms current `identity.build` hashes sorted concatenated
collected source samples (`runtime.mjs` and `bridge.mjs`), not an attested full app
build. The result states that recorded domain explicitly. A content match adds no
exact event/frame/instance, selected-occurrence, current-value ancestry, execution
or fix-verification claim. This is a source model, **not actual completed H05**.

Fresh commands:

```sh
node --test --test-isolation=none tests/handoff-source-evidence.test.mjs
npm test
node .artifacts/u03/source-evidence/verify.mjs
```

Focused **26** and full **1361** pass. The positive control reads an actual synthetic
temp file and verifies byte hash/size/unchanged file. Additional controls retain
exact Unicode/BOM/CRLF bytes, whitespace-sensitive parent/Developer raw identity,
matching-filename failure, source privacy, minimal unjoined result and hostile
inert content. Receipt `.artifacts/u03/source-evidence/verification.json` binds
source/logs and unchanged exact `.21` producer/archive/installed pair/entire hosts.
No repack or native repeat is justified for this unimported module; prior native
.21 keeps its original identity and does not demonstrate source attachments.

Retained failures: missing-factory1, contract17/21 RED; first implementation17/21
because the existing handoffArtifactDigest deliberately accepts JSON strings only,
not binary buffers. A local binary SHA256 helper fixes it without changing the old
helper. Source21 passes. Added bound tests fail1/25 because oversized input was
copied before rejection; intrinsic size/brand checking now precedes the copy.
Green25 plus exact Unicode characterization gives final26; all original criteria
remain. No model source hooks or simulated evidence become native proof.

Next **U03.2b.4b** defines an explicit public source-evidence attachment codec,
immutable parent/note lineage and consent/redaction semantics, still before
installed recipient controls/native H05. Task2/3, whole H01–H06/U03 review,
separately saved U02 outcomes, P04/C07 and mandatory A05/L02 remain open.


## U03.2b.4b.1 — unimported public source attachment append/parse

The [working candidate format](../features/handoff-source-attachment.md) adds
`core/handoff-source-attachment.mjs`, still unimported. Explicit profile
`source-evidence/1` retains a flat immutable reporter report/notes plus supported
baseProfile. Strict original base codecs validate the base view and still refuse
new-profile imports. The only4a change exports a shared validated-anchor reader;
model behavior remains covered by its original26 checks.

A source packet is tied to one unverified Developer note and exact parent raw/
report digest. The note build comes from the supplied Developer diagnostic.
Actual copied file bytes are hashed by4a; only explicitly included file checks
enter the public packet. Default excludes all files with a count and no hidden
path/digest. Developer reference is bounded historical metadata, not original v1
or source text. Known-secret paths cannot be opted in: refuse rather than leak
or silently change a matching path. All status/reason/build/retained-anchor checks
are deterministic and scoped to local content, never execution or fix evidence.

Source-evidence checksum covers packets/omission count; base reportDigest remains
unchanged. Both checksums provide self-integrity, not trust. A consistent rehashed
comparison claim remains historical/untrusted. Append preserves previous report,
notes and packets; note-only child preserves packets. Parent verification checks
actual original bytes rather than a synthetic base-view digest. Missing parent is
not-checked, supplied undefined/changed parent fails. Finding/review/file buffers
are snapshotted before first await; old minimal/v1 semantics are not weakened.

Fresh commands:

```sh
node --test --test-isolation=none tests/handoff-source-attachment.test.mjs tests/handoff-source-evidence.test.mjs
npm test
node .artifacts/u03/source-attachment/verify.mjs
```

Public codec **26**, model+codec focused **52**, full **1387** pass. Exact `.21`
producer/archive/installed pair/entire hosts remain unchanged, bound by
`.artifacts/u03/source-attachment/verification.json`. No repack/native rerun for
unimported code. Prior native .21 retains its identity and proves no installed
source attachment. This does not complete actual H05/U03.

Retained controls: missing-factory1, contract21/24 RED, first24 PASS. Added privacy/
empty-profile RED2/26 exposed unfiltered known-secret local filepath opt-in and
empty attachment without omission history. Both now reject; focused52/full1387
pass. Tests keep actual byte comparison, minimal/rich base distinction, name-only/
missing/different/omitted controls, exact parent/whitespace, prior-note/packet
immutability, checksum versus rehashed-untrusted distinction,8-note bound,
getter/sparse/decorated/late-input refusal and inert hostile text.

Next **U03.2b.4b.2** must implement monotone privacy before any dispatcher/reader
integration: omitted note removes its packet, omitted files leave counts only,
source category/anchor removal removes affected packet metadata too, no hidden
retention/restoration. Installed4c and native actual H05 follow separately; Task2/3,
whole H01–H06/U03, U02 saved outcomes, P04/C07 and mandatory A05/L02 remain open.


## U03.2b.4b.2 — unimported monotone source-packet privacy

The [privacy contract](../features/handoff-source-attachment.md) now implements
`redactHandoffSourceEvidence`. Retained notes/packets/files stay identical ordered
subsequences. Note removal removes its packet; explicit packet removal can retain
the unverified note. File/category/anchor omissions remove actual serialized path/
digest/indices/status metadata, with cumulative counts only. SourceLocations drops
all packet paths, including unjoined paths; path/digest redaction prunes affected
comparisons, including the missing-digest/same-visible-path case. Originals remain
unchanged and omitted content cannot be restored through a derivative.

New privacy identity/parent digest comes from the strict base semantics; packets
retain their historical creation parentReportDigest rather than falsely rewriting
it to the later redacted baseline. Append-after-privacy keeps prior packets and
binds any new comparison separately to the current baseline. Exact supplied parent
checks reporter/source identity, note/packet/file continuity and safe monotone counts.
No linked resource, permission or application operation is performed.

Minimal base preserves its original all-notes-removed privacy rule: require an
explicit list of every current note, reject partial/empty selection and nonempty
rich-only requests. Nothing silently removes unchosen notes. Normal reviewed base
supports per-note/per-file choices. This compatibility limit does not weaken the
normal rich privacy requirement or reinterpret minimal-snapshot/1.

Fresh commands:

```sh
node --test --test-isolation=none tests/handoff-source-privacy.test.mjs tests/handoff-source-attachment.test.mjs tests/handoff-source-evidence.test.mjs
npm test
node .artifacts/u03/source-privacy/verify.mjs
```

Privacy **23**, combined focused **75**, full **1410** pass. Exact `.21` producer/
archive/installed pair/entire hosts remain unchanged, bound in
`.artifacts/u03/source-privacy/verification.json`. No new package/native repeat for
unimported code. This is no installed source attachment, actual H05 or whole U03.

Retained controls: missing-factory1, contract19/21 RED, first72/73 passed with one
real safe-integer omission overflow. Added forged note-count underflow gives
counter RED2/22; removed count is computed before addition and checked as safe.
A valid file-only copy at MAX_SAFE_INTEGER then exposed a false rejection in the
old base-checker add-before-subtract arithmetic (boundary RED1/23). The new adapter
independently verifies actual counters first, then uses zero prior counter/bounded
removed delta only in temporary semantic-check views. Actual records/counters/raw
parent bindings are never rewritten. Green75/full1410 pass. The existing old
reviewed-profile comparator itself is unchanged here; its focused arithmetic guard
is an explicit dependency before passive dispatcher integration, not a claim that
this source-only adapter fixed every old importer.

Next **U03.2b.4c.1** integrates explicit passive dispatch/import/read/storage of the
new profile, readable historical comparisons, note/privacy preservation and the
focused old reviewed-counter guard, then verifies a fresh immutable package.
Normal Developer diagnostic/source-file selection and actual native H05 follow
in4c.2; Task2/3, whole H01–H06/U03, U02 saved outcomes/P04/C07/A05/L02 remain open.


## U03.2b.4c.1 — installed passive source-profile integration

Immutable .20261020.22:
.artifacts/atom/2026-10-20T09-23-15-512Z/atom-handoff.json, source above6eef583.
The [working contract](../features/handoff-source-integration.md) separates passive
support from normal Developer source acquisition. Explicit common dispatch now
handles source-evidence/1 read/parse/note/privacy; storage keeps exact bytes and
original parent/conflict/retention rules. Strict base codecs keep their profiles.
The focused old reviewed counter uses safe old+(removed) plus safe-integer check,
preserving valid MAX_SAFE_INTEGER/no-note-loss copies and refusing forged overflow.

Discrepancy/expected/selected condition/time/question stay first. Validated baseProfile
keeps its technical/value meaning. Source comparisons are a separate collapsed
inert disclosure: historical/not reverified, local content match or unjoined
reasons, collected-sample equality rather than full-build attestation. Note
associations use ordinals; exact JSON is advanced. No source/URL is opened/fetched.

Saved readonly/download and recipient note/privacy support the profile. Native
checkboxes omit whole comparison/files; note/comparison/source-category omission
locks and skips subordinate choices while preserving local choices on uncheck.
Cancel/new file invalidates prepared outputs, keeping original plus typed words.
Minimal attachment requires explicit all-note omission; plain minimal UI stays
unchanged. Shared13px body/12px controls remain, with scoped long-label wrapping.

Fresh commands ($HANDOFF denotes the exact .22 path):

    node --test --test-isolation=none tests/handoff-source-passive.test.mjs tests/handoff-reviewed.test.mjs tests/handoff-source-evidence.test.mjs tests/handoff-source-attachment.test.mjs tests/handoff-source-privacy.test.mjs tests/atom/handoff-ui.test.mjs tests/atom/handoff-review.test.mjs tests/browser/handoff-reader.test.mjs tests/atom/inspector-ui.test.mjs
    npm test
    npm run pack:atom
    npm run verify:atom-types -- "$HANDOFF"
    node tests/integration/handoff-source-passive.mjs "$HANDOFF"
    node tests/integration/handoff-review-controls.mjs "$HANDOFF"
    node tests/integration/handoff-storage.mjs "$HANDOFF"
    npm run verify:atom-package -- "$HANDOFF"
    node .artifacts/u03/source-passive/verify22.mjs

Final full1432/focused206/types2/admission7 pass. Native passive27:
.artifacts/u03/source-passive-native/2026-10-20T09-33-22-757Z/results.json.
Source files are declared SYNTHETIC codec fixtures, not live H05 acquisition.
Actual import/read/download, full same-profile restart/exact re-download with
fresh completed GUID, conflicts, clean recipient note/file/note-packet privacy
downloads/reopen are checked by exact hashes/parents. Installed old-reviewed
counter admits the valid boundary and atomically refuses forged overflow through
normal file import/storage. Actual inspector CDP Network has positive reader.js
reload control, then HTTP stays empty; permissions unchanged, no HTTP app tab.
This is inspector-scoped, not all-browser/P04 evidence.

Ordinary actual reporter/review/source-status41:
.artifacts/u03/review-controls-native/2026-10-20T09-28-35-668Z/results.json.
Storage/legacy/exact-byte/restart/quota15:
.artifacts/u03/storage-native/2026-10-20T09-35-43-484Z/results.json.
All terminate exit0 on the same immutable pair. Exact producer/archive/entire
hosts/receipts are in .artifacts/u03/source-passive/verification22.json.
Unchanged authority/input source and old CSS prefix retain historical19/21
Settings/default/legacy/expiry identities, never relabelled fresh22 or rerun.

Agent compared first reader viewport (question visible at390), readonly modal,
long-path controls and actual200%-zoom captures to supplied Settings foundation.
Final path exceeds200 characters, wraps without page overflow; type stays13/12.
Optional disclosures/vertical scroll are necessary local composition, not a new
design reference. Tokens/primitives/reference assets unchanged. Changelog22;
screenshots candidates, no independent human gate/approval claim.

Retained controls: dispatch RED8/8, UI RED10/64 then dispatch64/UI64 PASS;
first full1431/focused205 pass. Native22a FAIL3 at09:24:59: restart used stale
DevToolsActivePort from closed own Chrome. Driver now archives only that endpoint
before restart, preserving profile/storage and logs; package22 unchanged.
Native22b PASS27 at09:27:23 used a short NaN path from JS string multiplication:
its named long-path check does NOT establish long-path coverage. Raw result stays.
Executed helper was archived after SHA matched its frozen before/after input.
Added length RED1/9, corrected repeat(), final full1432/focused206 and native22c27
exercise intended >200-char input. Final driver records first viewport and scrolls
controls for narrow/zoom screenshots. No product rebuild/threshold relaxation;
ordinary41 and unrelated old experiments were not repeated for this fixture fix.

Next U03.2b.4c.2 adds normal explicit Developer diagnostic/source-file selection,
review/download and actual independent matching-source H05. No whole Task2/3/U03
H01–H06 review, U02 saved outcomes/P04/C07/A05/L02 completion follows from passive
fixtures. No SDK/publication/other repository work.

## U03.2b.4c.2 — installed explicit local source comparison (.23)

Completed only this bounded increment on base64d3580 with working changes;
contract [source creation](../features/handoff-source-creation.md), exact receipt
`.artifacts/u03/source-creation/verification23.json`. Normal reader now accepts a
saved Developer v1 diagnostic plus1..8 explicitly chosen local files. Paths must
be selected from recorded diagnostic paths; filenames infer nothing and metadata
consent defaults off. Budgets precede reads. Source bytes are compared on Review,
not embedded; note build comes from diagnostic. Shared note/privacy/source epochs
cancel obsolete prepared output. Cancel preserves original and typed note.

Actual commands: focused Node handoff tests397, `npm test`1446; normal form26.
`node tests/integration/handoff-source-creation.mjs <executed-handoff>` passes25:
real existing instrumented React app/open VS Code helper, actual U05 selection,
normal Reporter Save/review/source-location consent/download, separate Developer
capture, actual unchanged filesystem bytes. Both hosts record matching sample-set
hashes; an actual existing reactCommit configuration changes the recorded sample
hash while original source stays identical. App/server/IDE close before clean
recipient reads files. Actual revision/download/reopen and a second source-profile
append preserve baseline/prior notes/packets and exact parent. Wrong bytes with
the same filename remain unjoined. Missing-build negative is explicitly derived
historical compatibility data, never a fresh native capture. No occurrence
execution, ancestry, fix verification or full application build attestation.

Current native ordinary41/passive27/storage15 pass on the same archive; passive
source fixtures remain synthetic. `handoff-source-visual.mjs` reuses only exact
actual H05 inputs, adds7 native checks without source/IDE reacquisition. Supplied
Settings19 foundation/13px body/12px controls, first390 discrepancy/expected/
condition/time/question, >200-char local label wrapping and visible controls at
actual195CSS/zoom200 were compared by the agent. Optional disclosures/vertical
scroll are necessary local composition deviations, not a replacement design.
All screenshots remain candidates, not human approval. Initial H05 named zoom
images show historical details rather than source controls; visual7 supersedes
only that view. Inspector CDP Network has positive reader.js reload controls;
reader HTTP arrays are empty. This is not all-browser/P04 network evidence.

Packed strict consumers2 and admission7 pass. Executed receipt:
`.artifacts/atom/2026-10-20T10-12-46-696Z/atom-handoff.json`.
Current producer receipt after syncing root lockfile's linked package22→23:
`.artifacts/atom/2026-10-20T10-42-56-664Z/atom-handoff.json`.
The reproduced Atom/UI archives, entire installed pair and both entire host maps
are byte-identical. Only root lock metadata changed, not product inputs/payload;
old lock bytes and receipts remain. Current admission7 passes again. Type/native/
full executions retain their original receipt and exact payload equivalence;
no fresh rerun is claimed for metadata alone. Verification is idempotent.

Failures/control runs preserved in source-creation-native:10:13:12 and10:15:46
FAIL3 on differential setup/UI;10:21:25 FAIL1 IDE trust;10:25:03/10:28:15 FAIL1
because the failed isolated IDE held49331;10:30:42 FAIL1 Enter pairing. No feature
PASS was inferred. Exact own PID/profile was rechecked, SIGTERM then bounded
SIGKILL cleanup recorded; no user/other windows touched. Targeted coordinate
probe proves only its simple reader case. Diagnostic-only10:32:58 PASS2 is not
H05. Final actual25 is10:33:40, visual7 is10:38:36. Native driver now checks exact
field input and trusted Pair gesture and scopes failed-IDE cleanup to its own
profile. Failed/probe results, initial test syntax failure and sandbox port
refusal remain. Final1446/397 run on settled product/test sources; intermediate
1445 runs are not substituted. Earlier .22/.19 authority evidence stays historical
under unchanged source hashes; no old majority/Settings/default/legacy rerun.

Next **U03.2c.1 — bound saved U02 outcome model**. Task2/3 BASE markers remain
OPEN. Full H01–H06 reconciliation/one whole-U03 review, actual saved U02 outcomes,
P04/C07 and mandatory A05/L02 remain unfinished. No SDK, publication, account or
other repository work; no independent-human blocker is introduced.

## U03.2c.1 — unimported U02 outcome model

Base e043500; working [contract](../features/handoff-input-outcomes.md) and new
core/handoff-input-outcomes.mjs. Exact source-only receipt:
`.artifacts/u03/input-outcomes/verification.json`. Model31/focused114/full1477
pass; .23 producer/archive/installed pair/both hosts remain exact. No repack or
native/majority/expiry/legacy experiment repeat is justified for an unimported file.

Focused source reads found that U02 target build is deliberately null, diagnostic
build is a collected-sample digest, v1 lacks document/node/input history, and the
editor can have a later value/time than the selected snapshot. A separately
supplied capture context includes original selection event, actual native frame,
source/lease/inspection generations and exact investigation/revision. Missing or
changed keys/time leave it unjoined. This is only supplied-data consistency;
current runtime does not yet supply that new atomic ownership guard.

Detached bounded projection preserves actual native acknowledgement/response
receipt phases, pending/partial/unconfirmed/failed/after-close and undo/baseline,
unknown consumption/effect and missing transaction times. Native after descriptors
remain their actual recorded revision; current resources never fill missing
historical locators or before values. Last8 retained runtime summary cannot restore
full history or unknown totals. Default identities/values/locations/errors stay
omitted; explicit reviews filter known patterns and URLs, preserve filtered/missing
join states, and never adopt plan/rule/writer/undo authority. Original and later
observations stay separate; null capture is not zero edits.

Actual model controls use both existing ledger APIs,64 native transactions,128
response sites/grouped baseline members, all scalar families and a real >budget
projection while its supplied capture remains under1MiB. These acknowledgements
are synthetic fixtures, not native U02 acceptance. RED23/23 then first23 pass;
additional30 controls exposed2 real model defects (invented false restoration and
future-clock association), fixed. Later notice-list RED1/31 preserved absence as
null rather than empty. Final31/114/1477 pass. Intermediate1476 and raw REDs stay.
Verifier's sandbox spawn EPERM was corrected to same-process module import;
no acceptance threshold or privilege increase. Verification is idempotent.

Next **U03.2c.2 — actual atomic runtime capture/ownership**. Actual saved input
outcomes still need public versioned format, persistence and normal review/reader
integration. Task2/3 BASE markers, whole U03/P04/C07 and mandatory A05/L02 stay
OPEN. No SDK/publication/other repository or independent-human blocker.

## U03.2c.2 — atomic private runtime acquisition, 2026-10-20

Bounded continuation on BASE2b1cfaf after explicit stop/resume; new user timebox
ends21 October09:00 Mauritius (05:00UTC). Working contract
[handoff-input-capture](../features/handoff-input-capture.md), not an additional
scope-interview approval. Approved02/12 remain byte-identical to44a1df1.

Final immutable **.20261020.25**:
`.artifacts/atom/2026-10-20T16-48-44-708Z/atom-handoff.json`.
Aggregate `.artifacts/u03/input-capture/verification.json`, verifier `verify.mjs`
and frozen inputs in that directory. Fresh commands/results:

- `npm test`: **1502 PASS**; focused Node source/runtime/contract checks **108**,
  new runtime/wire controls25, model controls31 included. Source CDP/ACK fixtures
  are synthetic; they do not become browser proof because runtime imports them.
- `node scripts/verify-atom-types.mjs <exact handoff>`:2 strict packed consumers;
  `node scripts/verify-atom-package.mjs <exact handoff>`:7 admission controls.
- `node tests/integration/handoff-input-capture.mjs <exact handoff>`:23 actual
  both-host backend checks at
  `.artifacts/u03/input-capture-native/2026-10-20T16-49-39-114Z/results.json`.
- Existing ordinary handoff UI41 at
  `.artifacts/u03/review-controls-native/2026-10-20T16-50-36-411Z/results.json`;
  actual storage/restart15 at
  `.artifacts/u03/storage-native/2026-10-20T16-51-09-389Z/results.json`.
  These verify existing reporter/recipient/storage paths, not new saved U02 UI.
- `git diff --check` and idempotent exact source/archive/installed pair/host checks
  pass. Reader HTML/JS/CSS and UI package bytes match issued23; old H05/passive
  results retain their own receipt, not fresh25 acquisition labels.

`inputs-capture` requires a live authenticated inspector plus exact editor owner,
including closed editors; optional investigation/revision must match together.
It freezes a fresh strict v1 diagnostic and existing snapshot before hashing,
retains actual editor-open native frame/document/node plus run/source/lease/
inspection context, then rejects changed context, owner, selection or whole editor
snapshot. Pending/cleanup changes matter even without revision change. No browser
permission refresh, DOM/getter/expression read, attach, source/IDE/network fetch,
grant, active rule adoption or storage occurs from capture. Local historical
admission is deliberate: this is stored-snapshot consistency, not fresh DOM or
permission attestation. Old browser lifecycle events can invalidate that context.

Actual .25 native proof uses real MV3 dispatchers/editors and a separate live
extension port, with backend messages for Live/Draft/apply/undo/baseline. Native
ACKs and real response delivery remain distinct; effect/consumption unknown,
application restoration unproven. Original selected disabled:true and later
editor false are both retained. Actual fixture getter counter, app requests,
permissions and diagnostic storage stay unchanged across capture. Closed/wrong
owner, stale revision, changed context, port loss/active-writer cleanup and public
store refusal pass. It does not demonstrate typing debounce/scheduler, ordinary
reporter outcome review, a saved public outcome file or full U03 acceptance.

History retained: RED6/6 ->6 PASS; source boundaries found and fixed an accidental
host-disposed overwrite in newly combined context. A test ownerId on unrelated
property operation caused strict refusal plus held-hash cleanup deadlock; test
finally/envelope corrected. Exact original test PID4070897 argv/cwd verified and
SIGTERM only, evidence preserved. Boundary24/focused107/full1501 and native23/
ordinary41/storage15/types2/admission7 passed on intermediate24. Native24a stopped
at8 checks on unsupported driver `app.close`; corrected to Chrome removal of its
own tab. Concurrent ordinary24a covered-checkbox FAIL2/screenshot remains; same
driver isolated24b passed41, with no product UI change. Sandbox full/pack failures
were permission/child-process constraints, retained and rerun with authorized local
execution. No auto-review rejection. Final wire-array RED1/1 showed sparse category
arrays reached the model; strict transport refusal fixed in new25 without changing
issued24. All raw failures and intermediate receipts remain immutable.

Next **U03.2c.3a — explicit unimported public outcome format/privacy**. Public
format, persistence and normal reporter/recipient saved-outcome review remain
unfinished. Parent Task2/3 BASE markers and full U03/H01-H06 review stay OPEN;
P04/C07 and mandatory A05/L02 remain pending. No SDK, publication, other repository
or independent-human blocker. No shared visual/token/primitives change this step.

## U03.2c.3a — unimported public input-evidence packet, 2026-10-20

BASE9e01785; contract [handoff-input-evidence](../features/handoff-input-evidence.md).
This working design separates typed packet/privacy validation from the later
full diagnostic-profile composition. It avoids changing the meaning of existing
v1/minimal/reviewed/source files or hiding a raw private capture inside a file.
It is not retrospective scope-interview approval or installed saved U02 support.

New `core/handoff-input-evidence.mjs` creates/validates
`stateatom.input-evidence/1`, with exact diagnostic/private-reply content references,
curated typed metadata and unknowns. It exports neither raw diagnostic/snapshot
nor rule/plan/grant/writer/undo data. All claims remain historical-untrusted,
including a deliberately rehashed plausible alternative. Default four-category
exclusion applies even when private capture contains every value; explicit field
omissions and immutable exact-byte privacy derivatives never restore omitted data
or change phase/count/consumption/effect. Original selected/later editor time and
value stay separate. Null history/notices and incomplete summary stay explicit.

Fresh commands: targeted Node packet/model/base codec checks **161 PASS**, including
packet32; `npm test` **1534 PASS**; `git diff --check`; idempotent
`.artifacts/u03/input-evidence/verify.mjs` checks frozen inputs and invokes the
unchanged25 verifier. Aggregate `.artifacts/u03/input-evidence/verification.json`.
No imported/runtime/UI/type/package inputs changed; .25 producer/archive/installed
pair/whole hosts stay exact. No repack or repeated old browser/majority experiment.

Source processing of **16 existing actual native25 artifacts** passes creation,
explicit inclusion, default exclusions and privacy-parent validation, at
`.artifacts/u03/input-evidence/processed-native25-2026-10-20T17-14-09-886Z/results.json`.
These are new codec checks of exact historical bytes, not a new browser capture,
normal review/download, installed file/storage or original-occurrence execution
proof. All underlying native input files remain unchanged. Outputs use unique
run directories; previous partial/successful processing files remain historical.

Retained controls: module-missing RED1; contract12 had8 failures and4 already
passing refusal controls, then12 passed. Boundary21/4 exposed future-clock join,
ACK resource-ID mismatch, contradictory cleanup and pending-response upper bound;
fixed. Budget24/1 caught an oversized private projection hidden by default
omission; its1MiB bound now applies before public projection. Existing native
artifacts exposed an incorrect URL assumption: known filtering returns origin
without `/`, and a secret redaction can leave a quoted marker/query suffix.
Real-ledger RED25/1 fixed by conservatively retaining only filtered canonical
origin or explicit `[REDACTED_URL]`, never restoring a removed route. Underlying25
model and old evidence were not edited. First partial processing output plus
as-executed driver/codec and a clearly labelled manual failure note are preserved.

Later source-binding RED31/1 rejected filtered labels that contradict the exact
v1 selected value/run; compare retained envelopes to the actual known-filter
projection of those exact bytes. Filtered-ID RED1 fixed a false collision between
an unknown filtered marker and a known literal marker ID; true included duplicates
still reject. Packet32/focused161/full1534 are final; intermediate full1532/1533
and all raw failures remain under their own source stage. No threshold weakened.

Next **U03.2c.3b — compatible complete public handoff composition/lineage**.
The packet is deliberately unimported and not accepted by existing file dispatch
or storage. Full report source/input coexistence, persistence and normal saved-U02
reporter/recipient review remain unfinished. Task2/3/U03/P04/C07/A05/L02 stay OPEN;
no SDK, publication, other repository or independent-human blocker is introduced.

## U03.2c.3b — unimported complete input-report profile, 2026-10-20

BASE4de04e3; working contract
[handoff-input-report](../features/handoff-input-report.md). Full v2
`input-evidence/1` preserves ordinary public report/notes/privacy/source fields,
adds a validated packet and an explicit original public-component header. It does
not nest raw JSON or a private capture. Whole-file lineage binds exact parent
bytes; canonical component digests/parents are a separate labelled domain. Old
notes and source packets keep their recorded references and unverified roles.
All old v1/minimal/reviewed/source interpretations remain intact.

Fresh source commands: targeted report/packet/model/base codec checks **190 PASS**
(report29, current packet32); `npm test` **1563 PASS**; `git diff --check`;
idempotent `.artifacts/u03/input-report/verify.mjs` and
`.artifacts/u03/input-report/verification.json`. Both actual package source/build
manifests, archives, installed consumer and entire two hosts remain exact .25.
New report/packet modules are unimported; changed test driver is not a package
input. No fresh package, native UI acceptance or old majority/expiry rerun.

Source-only processing yields **32 complete compositions from16 exact historical
native25 inputs**, at
`.artifacts/u03/input-report/processed-native25-2026-10-20T18-09-30-530Z/results.json`.
Two base profiles, note append, privacy and whole-input omission validate; no
network call occurs. Reporter statements are explicitly synthetic formatter text,
not a new QA/user statement or new browser assertion. Actual old capture bytes
remain unchanged. Source-profile coexistence is separately exercised by synthetic
local-byte fixtures, not relabelled actual H05 acquisition.

Controls preserve exact source correspondence, original/later observations,
closed/unjoined/unknown phases and explicit omission. No fresh capture can borrow
another saved snapshot by selector/property. Notes/source additions change only
legitimate canonical public components; packet/history stay immutable. Explicit
base privacy automatically narrows overlapping packet fields/categories, including
privacy markers already present in an old base. Whole omission cannot restore
input data. Minimal coarse privacy still needs explicit all-note omission.

History: module RED1; contract13 had11 failures plus2 already passing refusal
controls, then13 passed. Boundary20/2 exposed old explicit privacy ignored at
composition and an overbroad editor-observation scalar; choices21/3 also exposed
silent duplicate-list deduplication. Fixed before publication/import. The packet
consumer now requires boolean disabled/string text observation, distinct from
arbitrary scalar resource values. Its old32/full1534 evidence stays historical;
new32/190/1563 covers the corrected dependency. Rehashed note/privacy attacks,
clock/getter snapshots, network denial, safe revision/forks and retained-source
packet omission pass. A large fixture initially attempted no-change writes and
omitted content; those invalid setup failures remain recorded. Explicit before
observations/content opt-in produce two individually valid components exceeding
the unchanged whole-file budget. Composition rejects; explicit minimal fallback
retains all64 transactions and the exact source/expected statement. No truncation
or acceptance threshold was introduced to make it pass.

**Native evidence qualification:** the own native25 driver's `appCDP:false` flag
was inaccurate. `scripts/native-browser.mjs`24–27 attaches an app-target session
for fixture evaluate/locator actions, output and counter reads. Native23 checks
remain actual packed backend observations **under that harness observer**, not
proof of absent app protocol traffic. Operation-specific no-new-app-read tests
are separate. Raw result, as-executed driver and helper SHA are preserved;
`.artifacts/u03/input-report/native25-app-probe-qualification.json` is explicitly a
manual source-inspection qualification, not a fabricated execution log. Current
driver metadata now says true plus scope. The historical frozen verifiers are not
rerun against altered driver/packet source; the new verifier independently checks
unchanged .25 package inputs/artifacts and the historical as-executed identities.

One combined command's automatic permission review timed out **before execution**.
The local metadata edit ran in the workspace sandbox; one permitted retry of the
plain full-test command succeeded. No permission blocker remains. An initial
aggregate expected the wrong RED count; corrected to actual11 failures/2 refusals,
with the first verifier version retained. Original logs/criteria are unchanged.

Next **U03.2c.3c.1 — installed passive file/store/read/privacy integration**.
Before further runtime work, compare private capture's local cache expiry with the
existing save-diagnostic policy; skipping browser refresh must not accidentally
skip established memory retention. This is a focused preflight, not a project-wide
re-audit or repeated old expiry campaign. Normal active reporter capture/consent/
review/save and full H01-H06/Task5 whole review remain later. Task2/3/U03/P04/C07/
A05/L02 stay OPEN. No SDK, publication, other repository or independent-human gate.
