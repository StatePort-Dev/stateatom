# Minimal issue handoff — local demonstration

## Current .18 passive reviewed-profile increment

Exact package: `.artifacts/atom/2026-10-20T06-38-34-241Z/atom-handoff.json`.
Normal Prepare issue still creates the minimal profile described below. This
increment adds explicit rich-file import/read/persistence/note support. The real
passive UI demo uses a **synthetic codec fixture**, not new normal rich reporter
controls or actual source/build evidence. It does not complete U03 or C07.

```sh
node tests/integration/handoff-reviewed.mjs .artifacts/atom/2026-10-20T06-38-34-241Z/atom-handoff.json
```

This is a verified headless driver, not an interactive launcher. Actual native45
results/screens/files: `.artifacts/u03/reviewed-native/2026-10-20T06-46-03-682Z/`.
Import `standalone-synthetic-reviewed.stateatom.json` through the bundled reader's
file picker to show title/discrepancy/expected/included text, then open Reviewed
technical details for Code-linked source and scoped response fragments. Raw JSON
is not needed. The original app/source/IDE can stay closed. The same file imports
into Atom's local file selector and redownloads byte-exactly.

The separately generated `standalone-synthetic-redacted.stateatom.json` demonstrates
that omitted selected text/source/body/original notes are absent; this fixture is
not credited as a normal UI privacy action. The actual recipient-created revision
is in `downloads/standalone-recipient/`, with unverified note text and unchanged
reporter baseline. Screenshot examples: `standalone-reviewed-390-candidate.png`,
`embedding-reviewed-zoom200-candidate.png`, `standalone-reviewed-recipient-390-candidate.png`.
Agent visual comparison and native keyboard/reduced-motion/narrow/actual-zoom checks
are recorded; no human visual approval is claimed or required to continue.

Next3c.2 adds normal category/field/per-note privacy controls. Receipt and exact
raw/GUID/source bindings: `.artifacts/u03/reviewed-integration/verification18.json`.
The .17 and .12 walkthroughs below retain their historical identity.


## Earlier reviewed local-save increment (.20261020.17)

The current candidate adds separate **Save reviewed report locally**, readable
saved-file reopen, native local import, Refresh local files and exact deletion.
Choose the saved v1 snapshot, Prepare issue, enter the discrepancy, Review report,
then explicitly Save. Selecting the issue title and Review/export reopens its
original bytes. The app and source provider can be closed. Source/response/action
content remains excluded by this minimal profile; this is not full U03 or C07.

Exact package: `.artifacts/atom/2026-10-20T05-36-31-213Z/atom-handoff.json`.
The actual agent-operated native demo is reproducible with:

```sh
node tests/integration/handoff-library.mjs .artifacts/atom/2026-10-20T05-36-31-213Z/atom-handoff.json
```

That driver uses isolated Chrome profiles; it is a headless verification command,
not a new interactive demo launcher. Current results25 and candidate screenshots:
`.artifacts/u03/library-native/2026-10-20T05-38-02-809Z/`.
Useful views: `standalone-saved-390-candidate.png`,
`embedding-prepare-390-candidate.png`, `standalone-saved-zoom200-candidate.png`.
These were inspected against the supplied narrow Settings reference by the agent;
human visual approval is not claimed or required to continue.

The actual downloaded standalone report and recipient revision are:

- `.artifacts/u03/library-native/2026-10-20T05-38-02-809Z/downloads/standalone-reporter/stateatom-issue-a30579e5-9f9b-45f0-b5f7-d1b545b0495d.stateatom.json`
- `.artifacts/u03/library-native/2026-10-20T05-38-02-809Z/downloads/standalone-recipient/stateatom-revision-7e906bd3-5c02-4dbc-9a0d-93b3d00134a7.stateatom.json`

Open the report in the bundled passive reader via its native file picker to show
the discrepancy without the app, IDE or model. The revision adds an unverified
Developer note with a different recorded build hash; the baseline stays identical.
The normal inspector also reopens the locally saved report after a full browser
restart. Reimporting identical bytes is idempotent; adding whitespace at the same
ID conflicts rather than replacing the original. Detailed receipt and limitations:
`.artifacts/u03/storage-ui/verification17.json` and the U03 completion record.

The previous .12 walkthrough below remains a historical minimal-download
checkpoint; its files and checks are not silently relabelled as the current run.


Current local candidate: `.artifacts/atom/2026-10-20T03-40-16-658Z/atom-handoff.json`.
No public release or registry upload is implied. Both-host actual UI evidence is
`.artifacts/u03/minimal-native/2026-10-20T03-41-19-496Z/results.json`.

Use the current installed/unpacked Atom candidate and its **Open diagnostic reader**
link. A report needs no original app, IDE, Desktop or model to be read.

1. Reporter: select a supported property, **Save locally**, choose that saved
   snapshot, then **Prepare issue**. Enter actual/expected behavior, review,
   optionally omit whole text fields, then **Download reviewed file**.
2. Pass that file manually through an existing channel; Atom sends nothing.
3. Recipient: open the file in the passive reader. Read discrepancy, selected
   condition and unknown/omitted scope first; raw JSON is optional detail.
4. Add a Developer note and optional recorded build hash, **Review new revision**,
   then **Download new file**. The original baseline/file remains unchanged and
   the note is unverified. Opening a file grants no live action authority.

Actual synthetic files from the verified .12 run:

- standalone reporter: `/home/roman/projects/stateatom/.artifacts/u03/minimal-native/2026-10-20T03-41-19-496Z/downloads/standalone-reporter/stateatom-issue-0e81285e-4d88-4593-ad03-8059492b5d46.stateatom.json`
- standalone recipient revision: `/home/roman/projects/stateatom/.artifacts/u03/minimal-native/2026-10-20T03-41-19-496Z/downloads/standalone-recipient/stateatom-revision-fcdd5dea-108f-4212-87fa-bc41cf3948ae.stateatom.json`
- embedding reporter: `/home/roman/projects/stateatom/.artifacts/u03/minimal-native/2026-10-20T03-41-19-496Z/downloads/embedding-reporter/stateatom-issue-6073e61f-a25c-46b1-924e-9932dd0213f6.stateatom.json`
- embedding recipient revision: `/home/roman/projects/stateatom/.artifacts/u03/minimal-native/2026-10-20T03-41-19-496Z/downloads/embedding-recipient/stateatom-revision-4a1ffca4-cc01-445a-a29d-5ba9ed3a258d.stateatom.json`

The corresponding `*-prepare-390-candidate.png` and `*-recipient-390-candidate.png`
are in the native result directory. These are agent-operated candidates, not a
human visual acceptance claim. The minimal profile excludes source/responses/
recorded actions/selected text and has no observation window; rich review and
v2 local persistence remain U03 work. This demo does not complete C07/P04.

The checked driver is `tests/integration/handoff-minimal.mjs`, invoked with Node24
and the exact handoff path above. There is no new public demo/npm command promised
by this increment. Do not substitute a harness-generated file for its recorded
actual downloads or call older picker launchers newly verified by this run.


## Current ordinary review/privacy demo (.19)

Use the immutable candidate described by
`.artifacts/atom/2026-10-20T07-15-17-102Z/atom-handoff.json`.
Prepare issue now defaults to the reviewed profile; the older .12 minimal demo
above retains its historical boundary. Save/reopen/import are available locally.

1. Save an actual target snapshot, choose it and Prepare issue. Enter actual/expected.
2. Optional Technical details: choose a category/field, omit or redact a fragment,
   Review, then Save reviewed report or Download reviewed file explicitly.
3. Open the actual downloaded file in the diagnostic reader with app/IDE closed.
4. Append an unverified note, Review new revision and Download new file.
5. Create a privacy copy: omit that note/issue/text/body, Review privacy copy,
   then Download privacy copy. Reopen it; the original remains unchanged.

Actual native synthetic files (not generated reporter replacements):

- standalone text: `/home/roman/projects/stateatom/.artifacts/u03/review-controls-native/2026-10-20T07-59-03-213Z/downloads/standalone-reporter/stateatom-issue-f30a6ff3-e29a-45af-b577-826877d703ee.stateatom.json`
- standalone note: `/home/roman/projects/stateatom/.artifacts/u03/review-controls-native/2026-10-20T07-59-03-213Z/downloads/standalone-recipient/stateatom-revision-ea3a8c66-587f-43b8-a709-66edae0ff8cf.stateatom.json`
- standalone privacy: `/home/roman/projects/stateatom/.artifacts/u03/review-controls-native/2026-10-20T07-59-03-213Z/downloads/standalone-recipient/stateatom-privacy-4c5e8efd-57ac-4b65-8a21-57d804b5231a.stateatom.json`
- embedding text: `/home/roman/projects/stateatom/.artifacts/u03/review-controls-native/2026-10-20T07-59-03-213Z/downloads/embedding-reporter/stateatom-issue-63f45bda-3cef-4c65-a855-b907b75cac82.stateatom.json`
- embedding note: `/home/roman/projects/stateatom/.artifacts/u03/review-controls-native/2026-10-20T07-59-03-213Z/downloads/embedding-recipient/stateatom-revision-4895ffaf-c62e-4ce4-8495-a34962906e50.stateatom.json`
- embedding privacy: `/home/roman/projects/stateatom/.artifacts/u03/review-controls-native/2026-10-20T07-59-03-213Z/downloads/embedding-recipient/stateatom-privacy-7830ec94-7ee7-44f4-977c-a098b331afcc.stateatom.json`

Candidate screenshots and exact source/download/network-positive receipts are in
`.artifacts/u03/review-controls-native/2026-10-20T07-59-03-213Z/`. Driver:
`node tests/integration/handoff-review-controls.mjs <exact-handoff-path>`.
No source fetch or authority comes from opening a file. Actual H05 matched-source
evidence and whole U03/P04/C07 remain unfinished.


Source-fidelity correction (.21): exact candidate
`.artifacts/atom/2026-10-20T08-20-12-486Z/atom-handoff.json`. The .19 ordinary workflow
above still applies; when an imported v1 source has non-Code-linked or absent
status, Prepare explains the profile limitation and requires explicit Use a simple
report. Typed issue words and original identity remain; no source-kind upgrade.
Current native41 screenshots/download receipts:
`.artifacts/u03/review-controls-native/2026-10-20T08-20-42-371Z/`.
The status inputs are labelled synthetic historical compatibility controls;
actual H05 matched-source evidence is not demonstrated by them.


## Passive source-profile demo (.22)

Exact candidate .artifacts/atom/2026-10-20T09-23-15-512Z/atom-handoff.json.
These source files are explicitly synthetic passive fixtures, not normal actual
H05 source acquisition. Use Open diagnostic reader with app/IDE/source closed.
Read discrepancy/condition/question first; Local source comparisons is optional,
historical and not reverified. Add an unverified note or create a separate privacy
copy by omitting a file/comparison/note; originals remain unchanged. Minimal base
requires explicit omission of every note for its compatible privacy copy.
Normal Developer diagnostic/source-file creation is still pending4c.2.

Actual native downloaded files from the passive journey:
\n- standalone libraryDownload: /home/roman/projects/stateatom/.artifacts/u03/source-passive-native/2026-10-20T09-33-22-757Z/downloads/standalone-library/stateatom-issue-c35f915d-1725-42c5-9b5b-06cfab1e2c09.stateatom.json\n- standalone note: /home/roman/projects/stateatom/.artifacts/u03/source-passive-native/2026-10-20T09-33-22-757Z/downloads/standalone-recipient/stateatom-revision-107cc6ad-8e34-463e-b415-936104444002.stateatom.json\n- standalone filePrivacy: /home/roman/projects/stateatom/.artifacts/u03/source-passive-native/2026-10-20T09-33-22-757Z/downloads/standalone-recipient/stateatom-privacy-1e78a31f-34b0-4e3a-ab33-ef9f32f61ddc.stateatom.json\n- standalone notePrivacy: /home/roman/projects/stateatom/.artifacts/u03/source-passive-native/2026-10-20T09-33-22-757Z/downloads/standalone-recipient/stateatom-privacy-05cfe3db-6dfb-4274-9ec7-07862fbfc530.stateatom.json\n- embedding libraryDownload: /home/roman/projects/stateatom/.artifacts/u03/source-passive-native/2026-10-20T09-33-22-757Z/downloads/embedding-library/stateatom-issue-afdafdee-d1c9-4ff9-b9a4-72648dd370a9.stateatom.json\n- embedding note: /home/roman/projects/stateatom/.artifacts/u03/source-passive-native/2026-10-20T09-33-22-757Z/downloads/embedding-recipient/stateatom-revision-82cdadac-0434-42bf-b2d9-62ba84a62ef1.stateatom.json\n- embedding filePrivacy: /home/roman/projects/stateatom/.artifacts/u03/source-passive-native/2026-10-20T09-33-22-757Z/downloads/embedding-recipient/stateatom-privacy-69541319-f8f3-4574-9a21-43e2d3821c2d.stateatom.json\n- embedding notePrivacy: /home/roman/projects/stateatom/.artifacts/u03/source-passive-native/2026-10-20T09-33-22-757Z/downloads/embedding-recipient/stateatom-privacy-443aad32-a4e8-43f7-bffa-aa5a02ce0f28.stateatom.json\n\nFirst viewport/control screenshots and exact receipts:\n.artifacts/u03/source-passive-native/2026-10-20T09-33-22-757Z/.\nAgent candidates only, no public reader deployment or H05 completion claim.\n