# Inline dependency values and editing

The Dependencies screen has one value location per recorded read. When a current
finite first-read profile joins that exact read to an original native GET response,
clicking its value opens the existing response editor in that row. The code link
stays on the name. Other page and response fields live under Source, with their
unknown relation to the selected element stated there.

The association checks the selected execution, frame, run, native request ID,
ordinal, URL, method, JSON pointer and owned editor target. It uses the runtime's
`requests[].id` and `inputResponse` metadata, not a guessed name or value match.
A duplicate, missing or later response occurrence cannot reuse this association.
This is presentation over the existing editor; authority, permissions, revision
checks, drafts, live debounce and restoration still belong to that editor.

A stale explanation removes its old computation. An already owned field remains
available once, using the editor's independently checked resource. Its old source
link is disabled. Refresh still requires applying or discarding a pending draft.
Apply/Discard/Undo are a single DOM toolbar placed in the active editing screen.

## Reference reconciliation

Basis: `packages/extension-ui/design/docs/ATOM_EDITORS_UX_RU.md`, the supplied
`design/design/SCREEN_INDEX.md`, and `design/screens/atom/01-inputs.png`.
The reference places typed input controls below the selected expression; this
change restores that relationship without a second list of the same values.
Shared tokens, typography, shell, contextual header and four existing screens
are retained. No reference artifacts or generated token files are changed.

Necessary differences: the prototype's writable local-state adapters are
simulated. Actual arbitrary React state/props remain read-only here. Supported
response edits replace the **next matching response**, not the currently consumed
application value. Waiting/delivered status does not claim the app recomputed.
Unlinked native page controls remain usable in Source, without being presented as
writers for similarly named recorded variables.

## Verification (2026-10-29)

- `npm run verify:atom-contract`: Atom contract suite, 1576 passed / 0 failed, including exact occurrence
  refusal and one-node editor/draft tests.
- `npm run check:ui`: shared CSS sources and generated artifacts agree.
- `node tests/integration/input-fields-ui.mjs --source --accepted --owner-state-policy`:
  8 controlled browser groups passed, including text/caret, invalid input,
  grouped draft apply, 390px layout, permission changes, changed widget type,
  and disconnect. Output: `.artifacts/u02/input-fields-ui/2026-10-29T06-53-27-677Z`.
- `/tmp/stateatom-inline/check.mjs`: controlled browser and actual response ledger,
  seven checks passed: one inline field, Apply/Undo, navigation, stale explanation,
  narrow layout, and text focus/caret through acknowledgement and stale transitions.
  This copies finite-profile records; it is not a new native provenance proof.
- `/tmp/stateatom-inline/native.mjs`: actual source-built MV3 extension, React page
  and VS Code helper. Six groups passed: selected dependencies, original code
  range opening, keyboard/narrow navigation, all four screens, real page-control
  mutation/Undo, and retained draft with guarded Refresh. Final run evidence:
  `/tmp/stateatom-inline/native-1793257736382/result.json`.

The native run verifies existing native page-field editing and source navigation;
it does not establish new arbitrary variable writes or native first-read coverage.
Screenshots are agent-reviewed candidates, not human usability acceptance. No
package publication, StatePort host mutation or release is part of this change.
