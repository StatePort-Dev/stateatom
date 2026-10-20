# QA/PM → developer handoff journey — U06

This is the selected **new working UX decision** for `scope-review-1`, made under
the maintainer's autonomous execution instruction on 2026-10-20. C07 approved
the outcome, not this detailed flow. This document completes a journey/design
boundary; it does **not** implement U03, P04, a new export format or a collector.
The current diagnostic reader/export remains version 1.

## Purpose and boundaries

A reporter should be able to point to a problem, say what they expected, preserve
what Atom actually knows, review a small local file and attach it through an
existing team channel. A developer should read it without the original page,
IDE, Desktop, account or model, and add findings without rewriting the report.
Neither person needs to interpret an AST, compiler journal or raw JSON.

Normal reporting is read-only. Starting observations, importing sources, opening
a report and adding notes never grant F05/U02 editing, invoke a handler, reload,
clear data, enable Capture or replay an action. The reporter may interact with
the application themselves. Separate admitted interventions appear only with
their actual scope, acknowledgment and undo limitations. A local undo is not
server rollback. No root cause or effort estimate is generated from proximity.

Three approaches were considered: keep the current notes/raw-JSON export (too
much technical interpretation and no expected/window/revision fields); compose
a guided issue using current snapshots, a readable preview and the passive reader
(selected); or add a hosted sharing/ticketing service (outside Atom scope).
The selected approach reuses the adopted inspector and free local file workflow.

## Existing facts and reference fit

Source checkpoint: `8e28b74` on `main`. Relevant inspected implementations:

- `packages/atom/src/ui.mjs` has `diagnostic-toggle`, `diagnostic-notes`,
  `diagnostic-content`, `save-report`, `report-select`, `export-report`,
  `delete-report` and `reader-link`. Export already previews editable JSON,
  supports omitting excerpts, then downloads `.stateatom.json` by explicit click.
- `core/diagnostic.mjs` has strict version-1 `makeDiagnostic`, `parseDiagnostic`,
  `serializeDiagnostic`, `omitDiagnosticContent` and `retainDiagnostics`.
  Limits: 1 MiB/file; 8 local reports, 2 MiB total, 7 days. Omission clones the
  saved report. Notes, selected target values and retained URL paths still need
  review; the existing exclusion switch is not complete PII removal.
- `browser-extension/reader.mjs` / `reader.html` open local version-1 JSON and
  render historical untrusted claims with `textContent`. The reader has no
  network authority, live attach, reproduction or developer-revision workflow.
- There is no structured expected-result field, reporter observation window,
  P04 production collector, per-category review or appended developer revision
  in that current path. V1's `capturedAt` is a selected observation timestamp,
  not the start of a recording. Network presence alone is not dependency proof.

Visual references are the preserved supplied set at
`packages/extension-ui/design/`: `README_RU.md`, `docs/HANDOFF_RU.md`,
`design/SCREEN_INDEX.md`, `design/figma-current.json`, and the Input/Actions/Settings
source screens. There is no approved standalone handoff screen in that index.
The prototype's brief report export is a reference for reuse, not a shipped
handoff feature. Its Capture/Desktop receipt screens must not be reused as Atom
report success or State Card claims.

Use the existing 440px inspector, readable shared typography, buttons, disclosures
and dialog pattern; preserve 390px, zoom, keyboard and reduced-motion behavior.
Extend the existing diagnostic area and reader rather than adding another main
workspace or changing shared tokens/primitives. Exact JSON stays advanced.
Any later rendered changes need the shared-UI changelog/reference comparison;
this document changes no visual runtime or reference artifact.

## Reporter: one end-to-end flow

1. **Select the problem.** Use U05's actual picker/refinement and select a
   supported property in U01. The first summary says what was observed, when,
   which tab/page/property it belongs to and whether it is stale. “Prepare issue”
   opens the existing diagnostic area with this target; it does not repeat an
   expression/getter or execute the selected action. No current or retained
   target: ask the reporter to select one, preserving any typed issue draft.
2. **Describe the discrepancy.** Fill “Issue title”, “What happened”, “Expected
   behavior” and optionally “Steps I performed” / “Question for the developer”.
   These are reporter statements, clearly separate from Atom observations.
   Existing notes can seed the question only, never an inferred expected result.
   Missing expected behavior is allowed with the visible value “Not supplied”.
3. **Choose the observation boundary.** Default is **Selected snapshot only**:
   show its timestamp, “No observation window recorded” and missing earlier
   history. When P04 is implemented, an explicit “Start observation” begins a
   visible bounded window for this tab/page. It records only admitted post-start
   metadata/checkpoints; the reporter reproduces the issue manually. “Stop and
   review” freezes the window. No automatic click, submit, reload or mutation.
   P04-unavailable is a useful snapshot path, not a disabled reporting workflow.
4. **Review the issue.** Show a deterministic plain summary: reporter discrepancy;
   selected observation; window status/start/stop and interruptions; observed
   technical facts; what is unknown; included/omitted content and suggested next
   inspection. A request following a click is “observed during this window”,
   never “this button called the API” without separate scoped causal evidence.
   Source links, supported historical experiment proof, Actions metadata and
   U02 outcomes keep their distinct labels and identities.
5. **Review privacy.** Per-category controls choose selected text/values, source
   excerpts, response excerpts and route/location detail. Start excluded for
   private content; cookies/auth headers/tokens and pairing credentials are never
   eligible. Show the exact included values in readable rows, with Replace/Omit
   controls, and an advanced JSON view. User-entered text and origins also need
   review. Changing an export copy leaves the saved original untouched and marks
   omissions. Never describe secret-pattern filtering as complete sanitisation.
6. **Save / download.** “Save locally” freezes a new historical report, subject to
   visible existing retention limits. “Download reviewed file” exports only the
   reviewed derivative; changing draft/inclusion invalidates its old preview.
   Cancel downloads nothing. Confirmation says “File downloaded; not sent”.
   The reporter manually attaches it to an existing issue, chat or email.
   Atom supplies no share URL, account, cloud upload or external-send action.

A live window is tab/document-scoped. Navigation, permission loss, tab switch,
inspector loss and a runtime-declared bound stop it with the actual reason and
last admitted time. Never continue silently on the next page or call lost history
“no errors”. A new window needs an explicit Start. P04 owns exact collector
budgets/sampling limits; show the real bound and dropped/missing counts, not a
limit invented by this UX specification. Stop/delete must remain usable.

## Recipient: read, investigate, append

1. In Atom's existing **Open diagnostic reader**, choose the local file. The
   reader validates size/schema first and opens a **Historical, untrusted report**.
   It makes no fetch, opens no embedded URL, resolves no source map and grants
   no action authority. Unsupported version or invalid file gives a readable
   rejection and keeps the previous report clearly separate.
2. The first viewport answers: what the reporter saw, what they expected, which
   target/build/window was recorded, what Atom observed and what is uncertain.
   Sections “Observed”, “Code links”, “Interventions”, “Unknown / omitted” retain
   their scoped evidence meaning. Raw records are optional detail. There is no
   claim that importing a valid file reverified it.
3. “Add developer finding” starts a local revision. A typed finding is labeled
   **Developer note**, not Observed/Verified. Connecting a project or obtaining
   fresh evidence is an explicit separate inspector operation. Match the report's
   exact build/source identity before joining new evidence to that occurrence.
   A missing hash or mismatched build leaves the join Unknown/Stale; same names,
   nearby execution and matching commit labels alone do not establish identity.
4. Preview and download a **new file/revision** through the same manual channel.
   Preserve the imported reporter baseline and previous revisions. The addition
   records author role, time, parent identity and whether new evidence is linked,
   unverified or for a different build. Opening it never replaces the reporter's
   account of events or claims the fix worked. Fix verification needs its own
   actual symptom/checkpoint/assertions, outside this journey-design deliverable.

Reader use requires the free Atom reader assets, not the original app session or
an IDE. No standalone public reader deployment is assumed or published here.
A developer may read without source forever; missing source is not an error that
blocks understanding or exporting a revision.

## Data and compatibility decisions for U03

U03 should introduce an explicit version 2 of `stateatom.diagnostic` with the same
historical/data-only boundary, rather than inserting new fields into strict v1.
Keep v1 readable and unchanged. “Prepare handoff from this older report” creates
an explicit new derivative with unknown/unprovided fields; it never fills in a
window, expected result or execution from absent old data. Older v1 readers may
reject v2 visibly; do not disguise new data as version 1.

The following are **proposed v2 fields**, not existing serialized capabilities:

| Field | Source and meaning | Bound / missing state |
|---|---|---|
| `issue.title` | Reporter text | 160 chars; default selected property label, not a diagnosis |
| `issue.actual`, `issue.expected` | Reporter statements | 1024 chars each; omitted means “Not supplied” |
| `issue.steps` | Reporter's own steps, not recorded replay | Up to 8 plain strings, 512 chars each |
| `issue.question` | Reporter question; optional old notes | 1024 chars; no generated root cause |
| `target` | Frozen U01 selected observation with exact retained identity | Value explicitly included or marked omitted; never a fabricated boolean/string |
| `environment` / `identity` | Actual configuration/build/source hashes | Unknown stays unknown; manual release label cannot replace a hash |
| `observationWindow` | P04 start/stop/reason/counts, or explicit `not-recorded` | One window for this issue revision; no inferred prehistory |
| `evidence` | Existing diagnostic fragments and P04/U02/A05 fragments when collected | Stable evidence IDs, exact occurrence/revision and original evidence kind |
| `omissions` | Category/field/reason and any evidence joins broken by removal | Data, not a claim that hidden facts are verified |
| `lineage` / `additions` | Immutable report baseline + appended developer findings | At most 8 additions; 4096 chars per finding; same 1 MiB whole-file budget |

Retain existing local storage budgets unless a separately verified task changes
them. If a file exceeds 1 MiB, offer removing optional excerpts/additions; do not
silently remove the question, unknown boundaries, identity or original baseline.
The exporter must validate the exact download bytes. Canonical serialization and
content hashes should bind a child to the exact parent artifact and immutable
baseline; a hash detects differing data, not authorship, trust or a fix. If the
parent file is unavailable, show “Parent not checked”. A duplicate ID with different
content must not overwrite a saved report; offer a separate reviewed import or
reject the conflict. U03 must pin byte/hash behavior with explicit fixtures.

Default exported selected text, form/component values, source text and response
bodies are excluded. A selected `disabled` boolean may be retained as the chosen
observation, with its target identity; arbitrary form values still require opt-in.
URLs exclude credentials/query/fragment; raw route paths and identifying titles
are excluded unless individually reviewed. A reporter can provide a harmless
route label. Source-map import is not export consent. Structured redaction may
break a link: show that link as omitted/unverifiable, preserving surviving evidence
kinds without upgrading the removed chain. Do not restore removed data from a
live page, source connection or earlier local report when reopening the file.

## Control-to-runtime ownership

All “new” rows below are implementation gaps. Labels name the chosen interaction,
not controls already shipped. Existing entry points can be reused without adding
a second main UI or inventing an Atom service.

| Control / state | Existing anchor | Implementation owner and acceptance |
|---|---|---|
| Prepare issue for selected property | U01 selection, `diagnostic-toggle` | U03: freeze exact target/run/time; preserve stale and no-source state |
| Title / actual / expected / steps / question | `diagnostic-notes`, v1 `notes` | U03: structured v2 input, plain text, missing fields explicit |
| Snapshot-only / no window | Current selected snapshot; no P04 collector | U03: useful base path, explicit `not-recorded`, no invented timestamps |
| Start / Stop / live window | No current collector control | P04: explicit admission, bounds, stop reason, no mutation or prehistory |
| Observation summary / unknowns | Current evidence model and v1 fragments | U03 base; P04 observations later; deterministic presentation, no causal promotion |
| Review each content category | `diagnostic-content`, `export-omit-content` | U03: per-category decisions, selected text/URL/notes review, original immutable |
| Save / saved list / Delete | `save-report`, `report-select`, `delete-report`, `retainDiagnostics` | U03: compatible v1/v2 storage; same limits, duplicate-content conflict |
| Download reviewed file / Cancel | `export-review`, `export-confirm`, `export-cancel` | U03: readable preview first, exact bytes validated, explicit gesture, no send |
| Open diagnostic file | `reader-link`, `diagnostic-file`, passive reader | U03: inert v1/v2 reader, plain first viewport, no live privileges/fetches |
| Add developer finding / Download revision | No current revision UI | U03: appended immutable lineage, build-match state, no false verification |
| Include admitted changes / action observations | U02 history; current Actions source/registration only | U03 serializes only actual integrated evidence; A05 adds execution later; no imitation |
| Permission loss / expired session / navigation | Existing capability and freshness lifecycle | U03 snapshot stays historical; P04 window ends with reason, never auto-reattaches |

## Failure variants and required behavior

| Variant | Reporter / recipient result | Must not happen |
|---|---|---|
| No source or IDE | DOM property + reporter discrepancy + unknowns remain useful; share/read normally | Mandatory IDE/model/account or invented function name |
| Source map unavailable/unmatched | “No matched source location”; keep snapshot/window | Treat map import or guessed file as execution |
| Expired live session | Export retained historical snapshot with stale/stop reason; new inspection optional | Reattach/resume, rewrite earlier observation or fabricate current evidence |
| Sensitive content omitted | Preview category/field omission and broken joins; exported copy omits bytes | Hide only visually, leak in raw JSON, or claim complete provenance |
| Wrong build at recipient | Read original; additions can be notes or separately scoped evidence; no automatic join | Upgrade old proof because component/commit labels match |
| Permission denied/offline | Snapshot-only/report notes where retained; window start unavailable with reason | Expand permission, fetch linked resources or require cloud access |
| Interrupted/overflowed window | Show stop/drop reason, actual admitted range and missing observations | Call absent events “no failures” or continue on another tab |
| Hostile/oversized/unsupported/duplicate file | Inert text or explicit rejection; no overwrite or network activity | Execute HTML/URLs/instructions or silently reinterpret schema |

## Testable U03 / P04 acceptance

These are future acceptance gates; their presence in a document is not a PASS.

- **H01 U03 real two-role base:** pick/inspect a real target without IDE, enter
  actual/expected, save, readable review, explicit download, close app/inspector,
  open file in a separate clean reader session. Recipient can name discrepancy,
  target/time, unknown source and next question from the first view, without JSON.
- **H02 U03 missing/old data:** snapshot-only remains usable before P04; v1 opens
  unchanged, explicit v2 derivative marks expected/window missing. No mutation of
  saved/imported baseline, including edited export and later developer additions.
- **H03 U03 privacy:** use synthetic secrets/PII in selected text, notes, path/query,
  title, body, source and form values. Default exclusions and explicit per-category
  preview/remove persist into exact downloaded bytes; removed joins stay missing.
  Importing a map never opts its content in. Cancel produces no download/send.
- **H04 U03 reader safety:** HTML/script/URL and embedded instructions stay inert;
  malformed/oversized/version mismatch and conflicting duplicate IDs give readable
  failure with no overwrite. Instrument network/action/permission calls to assert
  none arise from opening, reading, redacting or appending a note.
- **H05 U03 revision/build:** separate developer session appends note + actual
  matched-build evidence, downloads child, reopens it alongside original. Original
  bytes/identity remain intact; changed baseline/parent fails lineage checks.
  Missing/different build is visibly unjoined; a matching name alone fails control.
- **H06 U03 rendered flow:** both packed hosts at 440/390px, keyboard-only focus,
  cancel/back, long labels, zoom and reduced motion. Compare supplied foundations;
  no raw JSON/AST requirement in the normal reporter/recipient task. Agent-operated
  screenshots remain candidates; a second human is not required for this gate.
- **H07 P04 real window:** Start then manually perform an ordinary synthetic
  interaction; capture successful/failed/repeated/unrelated requests, a post-start
  error and selected DOM checkpoints; Stop then review/export/read. Events before
  Start or after Stop are absent with explicit missing history. Counts/drops and
  start/stop timestamps are actual. Mere temporal association stays temporal.
- **H08 P04 lifecycle:** navigation, tab switch, denial/revoke, runtime loss, cancel,
  stop/delete and budget exhaustion close only the owned collector with truthful
  reason. No automatic restart, new page adoption, secret bodies or extra origins.
- **H09 P04 authority isolation:** collector's native allowlist and actual app
  counters show no clear/cache/reload/submit/handler/override. Repeat while F05/U02
  editing is separately enabled: reporting gains no mutation capability; actual
  admitted edits/outcomes are attributed separately, unknown acknowledgment and
  server-undo limits survive export. Actions execution is absent until A05 exists.

Use existing repository source/contract/browser/package commands where relevant;
add a real two-role workflow driver in U03/P04 before claiming those gates run.
Do not invent a nonexistent verification command or pass a generated ZIP as UI
acceptance. Design walkthroughs below are not substitutes for H01–H09.

## Agent design walkthrough — 2026-10-20

This is an inline walkthrough of the written interaction with **synthetic data**,
not a click test, screenshot, captured app run or human usability study.

| Role / variant | Synthetic input → expected readable outcome | Design check |
|---|---|---|
| Reporter, Basic | Selected `Confirm.disabled=true`; actual “Cannot confirm”; expected “Enabled when required fields are valid”; no IDE | Steps 1–6 produce a reviewable discrepancy; source Unknown and no recorded window remain explicit; no root cause |
| Recipient, separate session | Reviewed file from prior row; original app closed; parent build unknown | Read discrepancy/boolean/time and unknowns; add “Please check required-field validation” as Developer note; new revision, no original rewrite or verification |
| No maps | Same snapshot, failed source import | Report remains useful; no guessed handler or forced source connection |
| Expired session | Snapshot retained; permission revoked before window Start | Historical report can proceed, new collection unavailable; no reattach |
| Omitted content | Synthetic target text/route/private note omitted in review | Export derivative marks omissions; no raw hidden content; original local report separate |
| Wrong build | Developer has build B, reporter had A | Original retained, fresh B note/evidence separate; occurrence join stays Stale/Unknown |

Self-review checked reporter/recipient continuity, every required failure variant,
existing versus new control mapping, U03→P04 dependency direction, privacy/authority,
version compatibility and actual-versus-simulated evidence. These rows validate
that the proposed design specifies an outcome; **no runtime handoff gate is passed**.

U06 is complete only as this explicit journey and acceptance specification.
Next dependency-ready implementation is **U03**, after U01/U06; P04 consumes that
base later and has its own real production-observation gate. Mandatory L02/A05 and
all release/official-host/SDK boundaries remain unchanged.
