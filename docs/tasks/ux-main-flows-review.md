# Ten UX/design passes — 2026-10-30

Maintainer direction: understandable to a novice, useful to an experienced
engineer. Review actual steps and intermediate states, fix friction, then repeat.
Base: `cc9e472`. Preserve observation limits, exact ownership, drafts and grants.

Browser access to installed extension pages is denied and native IDE control is
unavailable. Available lane: real mounted Atom UI + inert/synthetic adapter in
Chrome, screenshots, keyboard, scoped source/controller tests. Never credit this
lane as installed picker, native write, actual IDE approval or end-to-end release
acceptance. No alternate automation of forbidden surfaces. No publication.

| Pass | Scenario | State |
| --- | --- | --- |
| 1 | Selected result → page fields, including loading and direct disclosure entry | Done |
| 2 | Read element properties; keep technical records available without clutter | Done |
| 3 | First open → picker; repeat selection and cancellation feedback | Done |
| 4 | Live edit → pending → acknowledged result without layout jumps | Done |
| 5 | Draft → Apply; discover mode and distinguish unapplied changes | Done |
| 6 | Invalid value and stale/conflicting field recovery | Done |
| 7 | Undo, original value restoration, stop/reopen editing | Done |
| 8 | Optional source connection: waiting, cancellation and unavailable helper | Done |
| 9 | Actions: understandable missing binding and source/execution distinction | Done |
| 10 | Settings/report access; final narrow/keyboard regression walkthrough | Done |

Current-run screenshots, fixture and logs: `/tmp/stateatom-ux-walkthrough-20261030/`.
The synthetic adapter introduces a one-second input delay to expose intermediate
states. Server interruptions are environment failures, not product results.

## Pass 1 — enter fields

Opened Basic result → View page fields and, separately, the Page fields disclosure.
Found a second Show editable fields button and a jump into Source. Both entries
now open one editor in Dependencies immediately, await current capability checks
and cancel opening if the selected target changes. Opening alone never writes.
Retry appears only on error. The duplicate Basic entry card hides while fields
are open. Verified delayed loading and populated fields in Chrome at 440 px;
`pass01-fields.png`, capability/identity regression and affected suite 159/0.

## Pass 2 — read Details

Before: per-property technical records plus five competing diagnostic disclosures.
After: property readings and freshness remain directly visible; raw records,
trace, scope and runtime records share one closed Technical details disclosure.
Reports remains a separate entry. Expanded Technical details to verify reachability.
`pass02-details.png` shows 440 px first viewport. Existing observation/stale/source
limits preserved; added a placement regression. No shared token changes.

## Pass 3 — selection entry and cancellation

Used empty fixture → large selection button → picking → Cancel → idle, at 360 px.
Fixed duplicated status text, unchanged idle heading during picking, and primary
blue Cancel. Now Choose an element + page-specific instruction + subtle Cancel;
idle primary selection action returns after cancellation. `pass03-picking.png`.
This checks UI state transitions, not native page hover, tab switch or Escape delivery.

## Pass 4 — Live editing

Changed name AB → ABC, waited for delayed acknowledgement; reviewed 360 px screen.
Removed the inherited dashed busy border and transient per-row Discard on valid
Live input, which shifted lower fields. Pending remains distinct from Changes
applied and Undo. `03-before-saving.png`, `11-final-saving-360.png`,
`pass04-live.png`. Adapter ledger acknowledgements are synthetic, not page effects.

## Pass 5 — Draft and Apply

Changed Live to On Apply, edited name, inspected before applying, then applied
and waited for acknowledgement. Found mode selection buried under Editing options;
moved it before fields. Draft now says “not applied yet.” At 360×780 the action
bar was clipped below the viewport because its wrapper constrained sticky layout.
Made that wrapper transparent to layout; Apply and Discard stay visible above the
footer. Repeated the sequence after the fix; `pass05-draft.png`.

## Pass 6 — invalid and conflicting edits

Entered incomplete number “-”: retained text, precise error, disabled Apply,
solid field outline. Discard restored 2. Found the old “Changes applied” status
resurfacing after discard; added explicit local-draft cancellation feedback.
Injected a separate newer amount=7 through the fixture read reply while draft=8:
conflict stayed visible, Apply disabled; Discard showed 7 and sent no write.
`pass06-invalid.png`, `pass06-recovered.png`; controller regression retains no-write
and conflicting-type checks. Injected read proves UI recovery, not native detection.

## Pass 7 — recovery and reopening

Applied AB→ABC, Undo returned AB with “Last field change undone.” Applied another
value and Restore original values returned AB with its distinct confirmation.
Stop editing previously hid its focused button; now collapses the disclosure and
returns focus to its summary. Pressed Enter there: fields reloaded without a
second open button. Existing closed-draft retention is unchanged. These are UI
and ledger checks; app/server side effects are not claimed reversible.

## Pass 8 — optional source connection

Source → Connect IDE → pending → Cancel preserved the selected element. Injected
fetch rejection displayed the existing helper recovery guidance, with a usable
Connect IDE button. Added visible optionality and the one-confirmation explanation
before the button; it was previously only in a tooltip/collapsed options.
`pass08-helper-unavailable.png`. No real helper request, IDE approval or native
source opening was attempted in this lane. Authentication rules unchanged.

## Pass 9 — Actions

Reviewed no binding → source options, then a synthetic source-linked handler with
no IDE admission. Replaced “exact handler binding” jargon and hid Explain recorded
actions when there are no action records. Kept explicit uncertainty: the element
may still respond. Found faded unreadable source labels and no recovery entry when
source existed but opening was unavailable: keep recorded labels readable and
source options reachable. Source declaration remains explicitly distinct from
execution. `pass09-before-actions.png`, `pass09-source-action.png`; no callback ran.

## Pass 10 — settings, reports and final regression

Opened Settings at 360×780; Escape and the close button restored focus to Settings.
Renamed misleading Back to tab to Back to inspector. Checked ArrowRight/End tab
navigation and Save report → Reports. Replaced the blank enabled report selector
with disabled “No saved reports yet”; codec/store tests verify it enables on save.
No report export or real profile write is claimed from the browser fixture.

Reviewed populated recorded dependencies at 440×820: expression and observed
operand stay visible, skipped operand remains Not recorded, Page fields separate.
Made disabled source labels readable (source-opening unavailable does not erase
the recorded name), and hid repeated Button/Button heading text. Screenshots:
`pass10-settings.png`, `pass10-reports.png`, `pass10-recorded-dependencies.png`.
Browser console had no warning/error entries; Reports document width matched
360 px viewport. The UI uses the retained shared typography, tabs, native controls,
spacing and neutral surfaces. Compared against supplied Atom inputs reference;
intentional differences are the empty-state CTA, separate untraced page fields,
visible editing modes and consolidated technical disclosure. No shared token or
primitive contract change. Screenshots remain candidates for human visual review.

## Verification record

Initial affected suite: 159 passed. After error and Details regressions: 161 passed.
First expanded Atom run: 1631 passed, 11 failed, 5 skipped. One failure was a stale
Actions placement expectation; updated it for the explicit recovery entry while
retaining Code-linked/execution-not-observed assertions. Ten CLI refusal checks
could not launch children in the sandbox: isolated spawn reported EPERM, empty
stdout/stderr, status 1. No browser was launched. Re-run with child-process access:
1643 passed, 0 failed, 5 expected skips (1648 total). Logs retained separately;
no original experiment threshold or historical result changed.

Final presentation follow-up after the repeated heading/readability fix: 129
passed, 0 failed. `npm run update:extension` succeeded at the existing
`/home/roman/projects/stateatom/dist/browser`. `git diff --check` passed.
No push/publication, SDK or other repository change. Browser viewport override reset.

Remaining boundary: installed native selection/hover/tab return, real page writes,
actual IDE confirmation and user visual acceptance need their own allowed lane;
these ten UI passes do not replace or re-certify those historical results.
