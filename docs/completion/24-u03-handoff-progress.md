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
