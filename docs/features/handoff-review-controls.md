# U03.2b.3c.2 — normal historical review controls

New working UI choices under U03/U06 and the existing integration plan. They are
not retrospective scope-interview approval. Reuse Settings/native disclosures and
shared13px body/12px controls. No shared token/primitive or supplied-reference edits;
no new design framework, raw DOM hierarchy or field-ID toolbar.

`packages/atom/src/handoff-review.mjs` is a native DOM choice editor, shared by
reporter and recipient. `createHandoffReview({document,root,onChange})` returns
`source(catalogue)`, `report(record)`, `read()`, `busy(bool)`, `clear()`. It owns only
native controls/review choices, never source resolution, storage, downloads,
permissions or application operations. All dynamic text is textContent. Parsed
catalogues/records are already inert, frozen internal data; the codec remains the
validation/budget/lineage boundary. `read()` returns fresh plain choice arrays,
not catalogue previews, raw records or hidden original values.

## Reporter

Keep title/actual/expected/steps/question first and existing whole-issue omissions.
Add a collapsed **Technical details · optional** disclosure within the form. Group
available saved fields by friendly category label and count; no blanket Include all
switch. Categories start excluded, including maps independently. Unavailable
categories get a concise not-retained notice, not a forest of disabled controls.
Each available category has an explicit checkbox and an optional per-field native
disclosure. Generic ordinal labels distinguish source/node/exchange/action items;
raw field IDs/JSON pointers stay internal. Local filtered previews show exactly
what is eligible for consent as inert text. Historical evidence kind/scope remains
visible, with no global confidence badge.

Per-field choice is Follow category / Include / Omit / Reviewer replacement. A
replacement textbox is labelled redaction, not a new observed value. Unavailable
source data is never replaceable. Category-less safe metadata lives in a separate
collapsed Recorded metadata disclosure; it defaults to keep and supports individual
omit/replacement. Actual false/empty text remain actual values, not missing values.
No field is recovered from the app when absent in the saved snapshot.

Open waits for exact saved source plus filtered catalogue before enabling the form.
New source or Cancel clears technical consent; typed issue words remain as before.
No consent carries to a different saved input. Controls stay editable during hashing
so edits invalidate prior preview/Save/download through the existing epoch guard.
Choices are snapshotted before awaits by the reviewed codec. Review creates
`reviewed-snapshot/1` by default, with all private categories excluded until chosen.
Old v1/minimal files keep their strict reading/meaning. Separate reviewed Save and
exact acknowledgement/retry behavior remain; neither preview nor Cancel saves or
sends data. Read-only saved originals still download unchanged.

## Recipient

Add a separate **Create a privacy copy** area for reviewed files only. It starts
collapsed and offers whole-issue omission, category/per-field omission or reviewer
redaction, plus individual **Omit developer note N** controls. Retained notes stay
unchanged and ordered. Existing omitted/unavailable fields cannot be included or
restored; already-omitted issue fields are labelled accordingly. No active source
connection, new collection, original report edit or authority adoption occurs.

Review privacy copy creates a new artifact through `redactReviewedHandoff`, bound
to exact parent raw digest. Display an honest preview and enable a separate explicit
Download privacy copy. Editing either note or privacy choices invalidates prepared
files; stale replies never re-enable downloads. Cancel privacy review discards that
prepared copy/choices and preserves original report plus typed note. No auto-save,
file send or download. Normal note append remains separate, unverified and immutable.
Old minimal report UI keeps its existing behavior; granular copy controls are not
silently applied through a different profile. Technical/private choice controls are
not inserted ahead of the first meaningful discrepancy/condition view.

## Verification

RED/GREEN actual choices/defaults/category/field overrides/metadata/false/unavailable,
filtered hostile previews, fresh detached reads, reset/busy and no hidden originals.
Coupled reporter tests use the real reviewed codec and actual Save acknowledgement;
recipient tests assert new-parent binding/removed-note bytes/immutable originals,
stale input/Cancel and no permission/app/network calls. Preserve old v1/minimal and
all existing Cancel/typing/source-ready/title/close-event/Save-race controls.

Fresh immutable candidate after integration. Native both-host flow must perform
actual normal Prepare category/field/replacement/issue review, Save/download,
no-app clean reader, unverified note and actual privacy-copy controls/download,
then inspect exact resulting bytes and reopen parent/child. Map consent independent,
absent fragments/window explicit, malformed/conflict/UTF8/budget refusal, keyboard/
440/390/zoom200/reduced-motion and supplied-reference comparison. Preserve all old
results/thresholds; screenshots are candidates, no independent human blocker.
This does not itself implement actual H05 matched-source evidence, U02 outcome
supplement, P04 collector or whole U03/C07 acceptance.

## Explicit limits and category omission

A valid old v1 can exceed the new detailed catalogue/public tree budget. Preserve
its useful basic reporter path through an explicit **Use a simple report** action
when detailed review cannot fit. Show a plain explanation, keep typed issue words,
and require another Review. The user-chosen simple copy uses the unchanged minimal
profile, excludes technical content with its existing counts and never edits or
reinterprets the original. No automatic fallback or relaxed limit. Initial source
parse/identity and reporter text bounds still apply. This is a new bounded working
failure-state choice, not previous approval of a wire-format selector.

For recipient copies, whole-category omission takes precedence over per-field
replacement. Disable the category's field editors while omitted and exclude their
local choices from emitted replacements; unchecking permits explicit re-review.
Keep typed replacement locally while choices remain open, without copying it into
an omitted category. Do not relax the codec's conflict checks.

## U03.2b.3d — non-Code-linked legacy source guard

Focused reproduction showed that v1 parsing accepts source status Candidate,
Unknown/Unsupported, Stale or absent, while the fixed reviewed-snapshot/1 source
scope only represents Code-linked fragments. The old projection silently assigned
Code-linked to all of them. New working failure handling rejects detailed creation
with `UNSUPPORTED_HANDOFF_EVIDENCE` if any legacy source lacks explicit Code-linked
status. This does not change the strict v1 parser, saved original, existing public
reviewed-profile meaning or old file import/append/redaction.

Prepare explains that the recorded source evidence cannot be represented by this
review profile and offers the existing explicit Use a simple report action. Typed
issue words and exact source identity remain; no automatic fallback or new known
source status. Simple profile drops technical fragments with its existing counts.
Malformed source input is still refused, never offered as a compatible fallback.
This bounded refusal is preferable to a silent evidence upgrade; broader source
kinds require a separately versioned contract, not a quiet change to profile1.


The guard applies to new detailed creation only. Previously exported/imported
reviewed files remain untrusted historical claims under their original profile;
without their original v1 bytes the reader cannot infer that an old creator used
an incorrect source kind. This fix does not retrospectively certify or rewrite
those files. Recreate a derivative from the retained v1 when corrected creation
is needed.
