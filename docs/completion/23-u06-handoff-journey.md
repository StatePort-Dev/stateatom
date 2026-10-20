# U06 — selected reporter/recipient journey

Date: 2026-10-20. Source checkpoint: `8e28b74`, current `main`. U01 and U05 are
complete under their recorded identities. The maintainer authorized autonomous
bounded work/local commits; this is a newly selected working design, not a claim
that the scope interview approved these detailed controls or data fields.

Deliverable: [QA/PM handoff journey](../features/qa-pm-handoff-journey.md).
The bounded item is **complete as a journey specification**. C07 runtime handoff,
U03 implementation and P04 observations remain open. No product code, package,
reference design, browser permission or external channel was changed by U06.

## Existing work credited, not restarted

Current U01 selected workspace and U05 picker/refinement supply reporter context.
Existing `core/diagnostic.mjs` v1 supplies strict historical validation, local
retention and immutable export omission; `packages/atom/src/ui.mjs` already has
Save/export/review/download and reader entry points. `browser-extension/reader.mjs`
is a passive local reader. These facts were checked by focused current source
reads, not promoted to proof of new expected-result/window/revision capabilities.
The supplied design reference keeps data/editors on the first level and detail
on demand. No dedicated approved handoff screen was found in its screen index;
Capture/Desktop fixture states are not an Atom report implementation.

## Design decisions and coverage

| Required part | Selected outcome / validation |
|---|---|
| Reporter end-to-end | Select real supported property, own discrepancy, snapshot-only or explicit P04 window, readable summary, per-category review, save/download, manual existing-channel attachment |
| Recipient end-to-end | Free passive reader in another session, discrepancy/target/window/unknowns first, explicit source matching, appended developer finding, new local file |
| Existing/new mapping | Control/runtime table distinguishes current notes/save/reader from U03 structured fields/privacy/lineage and P04 collector gaps |
| Failure variants | No source/IDE, unavailable map, expired session, omitted content and wrong build, plus permission/offline/window loss/hostile file |
| Immutability and authority | Saved/imported reporter baseline remains unchanged; export derivative and developer additions have explicit lineage; reading/reporting grants no mutation or Capture |
| Testable acceptance | H01–H06 for actual U03 base/reader/privacy/revisions/visuals, H07–H09 for actual P04 window/lifecycle/authority; no documentation row is a runtime PASS |

The agent walked both roles with synthetic “Confirm disabled” data and separately
walked no-map, expired-session, omission and wrong-build variants, inline in the
specification. This is a **document interaction walkthrough**. No mock screenshot,
State Card, captured app session, browser interaction or human study is fabricated.
An independent human is not a blocker; actual UI acceptance remains U03/P04 work.

Working choices: reuse existing inspector/reader instead of a new workspace or
cloud service; default snapshot-only allows U03 before P04; explicit v2 keeps v1
readable and unmodified; expected/window never inferred from old notes/timestamps;
private content excluded by default with per-field review; hashes bind content,
not trust/authorship; missing/wrong-build joins stay Unknown/Stale. Cost if wrong:
more review steps and new parser/UI work in U03, while customers with older readers
must receive a clear version error. None of those proposed capabilities is shipped
by writing the specification. P04 owns exact collector budgets and sampling limits.

## Verification and next dependency

Focused source/design reads checked the above anchors and current strict v1
limits. `git diff --check` and task-index JSON parsing pass for this document-only
change. No source or browser tests were rerun: U06 changes no executable inputs,
and the ongoing exact `.20261020.9` F05 native expiry run remains unchanged.

Next dependency-ready implementation is **U03**, after U01/U06. P04 depends on
F02/U03/U06, so its collector does not block U03's useful snapshot-only reader/export
base. Detailed U03 implementation still needs its own bounded plan and actual
acceptance. F05 final elapsed-expiry acceptance continues separately; U06 never
claimed that waiting run had already passed. Mandatory A05/L02, other repository
intake, SDK exclusion, independent-app and release gates remain unchanged.
