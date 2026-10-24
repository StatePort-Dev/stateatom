# V03.23 — native-control restoration availability

Executor-selected bounded correction under autonomous work through Oct25 evening;
not a new user-approved restore policy. Main/local only. Full V03/A02/L02/V02 and
whole20/29 stay open. No publication/SDK/other repository/profile/trust mutation.

The retained77 run contains successful Live acknowledgements followed by newer
same-value native revisions. A preliminary source-only copy of those resources
and acknowledgements confirms that the ledger correctly refuses Undo with
EXTERNAL_REVISION, but snapshot canUndo/canRestoreBaseline still report true.
Synthetic plan/receipt IDs are used; this is not a native replay or new write.
Probe: `.artifacts/v03/undo-eligibility/2026-10-24T19-47-00Z/preliminary.mjs`.

Correct these two availability flags in core/control-ledger.mjs. Eligibility must
use the same present resource/epoch/exact owned resource predicate as restoration
preparation. Retain all existing authority/target/global revision/ownership/ABA,
history limit, uncertain acknowledgement, pending and closed checks. A displayed
enabled action remains subject to a fresh backend preflight; it is not a promise
of future admission or application restoration.

Approaches considered: waive metadata revisions (would discard existing guards,
rejected); UI-only heuristic over externalRevision (cumulative flag cannot tell
whether a newer owned edit is undoable, rejected); derive snapshot availability
from exact ledger ownership (chosen by executor, reuses actual guard semantics).
No automatic rebase, epoch reset, compensating write, new baseline or retry.

canUndo: open, untainted, no pending batch, history below64, nonempty last undo
entries, every entry currently present and exactly owned at its recorded epoch.
canRestoreBaseline: same common availability, nonempty baseline entries, every
entry exactly owned at its recorded epoch, at least one current value differs
from its baseline. Unrelated unwritten sibling changes do not block a valid undo;
a new owned edit after an external revision may be undone while the old baseline
remains blocked. Historical tx outcomes/evidence and original guide FAIL remain.

The existing input UI consumes these flags for native disabled buttons. Preserve
all labels/styles/layout/shared tokens/primitives and response-ledger behavior.
Reference README_RU/HANDOFF_RU/SCREEN_INDEX and docs/design/extension-ui.md read;
native disabled is already the contract. Record consumer behavior in Atom's
Unreleased changelog, not a new shared visual version or shipped candidate.

Source ledger/editor/mounted controlled-DOM tests and the retained-data probe
must demonstrate the change. No new browser/native/candidate is required for this
source-only item; rendered visual fidelity, keyboard/narrow/native host acceptance
remain unclaimed. No blanket new UX approval, timing/production/handoff decision.
