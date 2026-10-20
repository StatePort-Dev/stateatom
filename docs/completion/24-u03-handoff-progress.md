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
