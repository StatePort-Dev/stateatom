# Minimal issue handoff — local demonstration

## Current reviewed local-save increment (.20261020.17)

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
