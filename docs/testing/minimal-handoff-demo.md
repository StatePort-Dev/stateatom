# Minimal issue handoff — local demonstration

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
