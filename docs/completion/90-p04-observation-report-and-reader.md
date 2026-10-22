# P04.4b composed observation report and passive reader

Continues b1908a1/P04.4a under scope-review-1. P04/C07 remains in progress:
**18/29 whole tasks (~62% equal count), not release readiness**. L02 mandatory/open,
A05 mandatory/scoped complete and A02 open are unchanged. Independent human review
is optional, not a blocker. No SDK, publication, redesign or other repository.

## Delivered boundary

`observation-evidence/1` is a separate diagnostic-v2 public report/store profile.
Its new reportDigest covers a recorded window summary or explicit privacy omission.
Original minimal/reviewed/source/input/action components are reconstructed and
validated with their unchanged strict codecs; their window stays not-recorded.
Whole-file parents bind exact bytes; component digests use canonical JSON and are
a separate domain. Finite action/input/source headers cannot recursively nest an
observation report or exhaust the stack through cyclic declarations.

The reviewed window retains bounded historical metadata, independent HTTP and
transport outcomes, sampled read intervals, unknown mutation times/causality,
missing prehistory and unobserved pending outcomes. The exact original paired
input capture/diagnostic clocks are preserved. Optional window identities/origins/
positions/booleans default off; text/form values and body/header/path/query/message/
stack/source data are ineligible. Saved diagnostic references and acquisition
digests remain provenance, not attestation. Notes/source comparisons delegate to
the strict component and never rewrite the window or verify a fix.

Explicit rich-base privacy propagates to overlapping window fields. Window field
redaction conservatively reduces known overlapping rich-base/input categories.
New `requiredOmissions` retains explicit restrictions even when an old component's
fields were already excluded by default; later derivatives cannot drop that policy
or restore omitted evidence. Reviewer replacement remains visibly non-observed.
Minimal original conditions cannot be granularly redacted: unsupported technical
reduction refuses explicitly. Whole-window omission keeps the independently reviewed
snapshot condition. This is known-category privacy, not complete PII anonymisation;
reporter/developer words still require review.

The existing Atom saved-file preview and passive reader show a recorded window,
its scoped limits and a collapsed identities/clocks disclosure. Recipient native
controls create reviewed privacy copies and unverified notes, with original bytes
unchanged. Files can be imported/stored/downloaded after a real browser restart.
No collector/owner/permission/action/Fetch/replay is reconstructed by reading a file.
Source comparison remains an explicitly selected local-byte comparison, not source
navigation or execution. Product **Start/Stop reporter controls are not yet added**.

## Exact current verification

Aggregate `.artifacts/p04/public-report/verification56.json`:
`PASS_CURRENT_PACKED_OBSERVATION_REPORT_READER_NOT_REPORTER_P04`.

Exact candidate **0.1.0-candidate.20261021.56** / UI **0.2.0-candidate.20261018.2**:
`.artifacts/atom/2026-10-22T12-45-42-263Z/atom-handoff.json`.
API/wire1, shared UI contract2.1 unchanged. Root lock candidate metadata now matches56
(previously38); no dependency/peer/token change.

- `npm test`: **2304/2304 PASS**,0fail/skip/cancel,94930.657057ms (`full56.log`).
 502 source/test input fingerprints match before/after and current files.
- Focused packet/report/presentation/reader and related handoff controls:
 **195/195 PASS** (`focused-current.log`). The new source controls cover old-profile
 strictness, finite full composition, parent lineage, getter refusal, exact input
 clocks, historical/unjoined claims, privacy overlap/irreversibility, UI reset,
 text exclusion, pending terminal outcome and unknown interrupted clock wording.
- `npm run pack:atom`: current source/build inputs, archives, installed exact pair
 and both full host manifests verified. Two strict installed type consumers and
 nine admission controls PASS (`types56.log`, `admission56.log`).
- `node tests/integration/handoff-observation-passive.mjs <exact56 handoff>`:
 **19 native PASS**, both hosts, no page errors and **0 console warning/error**.
 Receipt `.artifacts/p04/public-report-native/2026-10-22T12-52-50-903Z/results.json`.
 Actual local file input/import, report store, browser restart, exact downloads,
 whole-window omission, native Space category reduction and developer-note files
 validate their exact parents. Literal imported markup remains inert. Reader HTTP
 requests are empty with actual reader.js reload as a positive Network control.
- The ten public input files are **current source projections of unchanged
 historical55 native captures** (read-only/text/actual F05 edited data). Their
 source receipt and file digests are verified. Native56 verifies passive product
 handling; it is **not fresh56 collection/edit/consumption or H07-H09 evidence**.

## Rendered comparison and preserved failures

Browser plugin unavailable: existing isolated native Chrome harness, no app tab,
source server, IDE, model or app-target CDP. Inspector-only native file/keyboard/
download controls operate the actual installed UI. Actual440/390 widths,200% zoom,
reduced motion and no horizontal overflow pass; body13px/control12px remain exact.
Agent inspected standalone first390 and embedding privacy200 screenshots. Existing
Git UI primitives/type/layout were retained; no generated CSS/token edit. The
reference set in packages/extension-ui/design has no production observation reader
screen: the new section deliberately follows existing historical input/interaction
disclosures rather than introducing a replacement design. Screens remain human
review candidates. No visual-fidelity or independent-human approval is inferred.

Preserve source attempts and native receipts unchanged:

- `core-attempt1.log`: explicit category omission from already-default-private base
 did not remove window copies. Persistent privacy policy fixes the preserved RED.
- `core31.log`: test fixture omitted the existing separateActionEvidence flag;
 fixture corrected without relaxing that original source/action boundary.
- `new42-attempt1.log`: two presentation-test setup assertions (ordinary word
 “fields” and wrong report nesting), corrected; not two production semantic fixes.
- Native `12-47-04-015Z` and `12-49-46-958Z`:4 checks then driver same-file review
 remained on the previous whole omission, leaving category checkbox disabled.
 Screenshot preserves that state. An actual different-file selection followed by
 returning to full, plus enabled/focus controls before native Space, fixes harness
 setup. Runtime56/archive unchanged.
- Native `12-48-07-311Z`:1 check then Chrome launch produced no DevToolsActivePort
 before timeout. Cause unknown; owned process closed, no user process changed.
- Native `12-50-59-653Z`:19 PASS before explicit console collection; final19 above
 additionally verifies warning/error console and browser Log. Both PASS receipts kept.

Historical55 native acquisition, earlier parser/F05/P03/native failures and their
original criteria remain historical. None are upgraded to fresh56 broad coverage.

## One next item

**P04.4c**: explicit bounded Start/checkpoint/Stop/review controls in the existing
Diagnostic flow, with current input acquisition and cancellation/selection fencing.
Passive interrupted-window handling, actual H07-H09 and ONE whole-P04 reviewer/
correction remain after that. A document/packet/reader alone does not establish the
new reporter capability or complete P04/C07.
