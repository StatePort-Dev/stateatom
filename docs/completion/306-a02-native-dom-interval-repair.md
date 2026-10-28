# A02 — native DOM interval qualification and retained-mutation repair

28 October 2026, afterdcf3942, case305. Whole A02 remains open, whole plan21/29.
This is a new changed-mechanism qualification, not a repeat of old experiments.

## Reproduced defect

`.artifacts/a02/selected-list-route/2026-10-28T18-55-57-761Z/` is retained INCOMPLETE.
An external DOM.setNodeValue correctly denied the current profile. But a later
original same-value React edit/commit could reset the mutation sequence while
React left the externally changed text in place. The helper then reported a
supported chain for that unrepaired selected DOM. `dom-new-commit-state.json`
retains the false positive, actual external text, commit9 and applied revision45.
This is a real bounded correctness defect;304's clean presentation run never
exercised it. No historical positive is expanded to cover this case.

Source RED: `dom-retained-taint-red.log` reproduces the commit-only reset and
missing original-host interval mechanism. Existing test expectations that treated
any new root commit as recovery were corrected, with old failure retained.

## Correction

The finite DOM guard retains external subtree mutation marks across root commits.
Only an actual mutation acquired during the original pinned React19
setInitialProperties/commitUpdate call for that exact host can repair its subtree.
Empty host calls, unrelated sibling writes and subsequent root commits do not
repair it. Pending external records drain before entering the original native
function. A finally boundary preserves early return and original thrown identity;
failed, nested or mismatched intervals refuse. Stop releases weak metadata.

This instrumentation exists only in the optional field-native derivative, not the
ordinary native ancestor recipe. It does not call application getters, callbacks
or reducers again, read their objects or compare text to select a producer. Native
mutation targets/ancestry are acquired through captured accessors; metadata stays
weak and bounded. The admitted source graph and pinned scalar-host behavior remain
necessary. This is not general DOM writer ownership. Compiler recipe/self pins,
two runtime input digests and the finite effect description were updated together.

## Actual verification

`node tests/integration/selected-list-route.mjs --dom-controls`:
`.artifacts/a02/selected-list-route/2026-10-28T19-02-48-364Z/` — **10PASS**, errors[],
owned browser/helper/source closed. results.json SHA256
`71738de1ebcf3817ad35aa840531333d3583a49a07076353eaeca68bdef470ca`.

Original create/changed/same-value positives, untouched-row refusal and unknown
MAIN code invalidation still pass. New actual controls establish:

- Direct sibling text change leaves the first label's exact supported revision.
- Direct selected changed text refuses for the DOM interval while code history
  remains Recorded; repeated inspection cannot clear it.
- A new same-value React commit with no selected host write remains refused.
- A real changed React host write repairs that selected interval.
- Direct equal-value selected mutation still refuses, including reinspection.
- A later original changed React host write establishes a new valid interval.

The recovery control explicitly uses a real changed value after discovering that
an original same-value render need not write DOM. Case305's added no-op negative
was fixed before the successful run; the original failure is not relabeled PASS.
CDP command contracts were checked using Context7 against official
[DOM documentation](https://chromedevtools.github.io/devtools-protocol/tot/DOM).
Those docs do not establish run evidence.

Actual retained39-input compilation: JS1258081bytes, SHA256
`43e02fd7f51d42c25fe7b56f86ab7260a568e00eb4622ec5774314a854ca51f1`;
manifest`062fbc82583eec5216cc5740e1a589275c366ed21dcbfc768dfbecffad29b173`.

Affected source logs under
`.artifacts/a02/selected-list-integration/2026-10-28/`:

- dom-repair-affected.log:77PASS (compiler, effects, code, joins, host mutation
  semantics, DOM history/runtime, selected field and original transfer controls).
- dom-repair-vendor-affected.log:84PASS/1fail of85; sole failure sandbox EPERM on
  loopback listen. Other controls cover field/default vendor, acquisition, original
  reads/receipts, server and presentation. No product failure masked.
- dom-repair-server-authorized.log:both server checks PASS with authorized loopback.
  Across these final groups162 distinct checks are covered, not one full-suite run.
- build:extensions PASS; existing CJS/import.meta warnings retained.
- git diff --check PASS. No new all-project audit or performance benchmark.

## Next dependency

Continue normal installed open-plugin startup/context issuance and IDE source
navigation. Actual picker overlay, held-out reviewed source/effect graph and full
282/official package matrix remain pending. Sibling text isolation is not a claim
of native picker-overlay qualification.304's UI/save/reader evidence remains
scoped to its recorded build; no new package or installed distribution is claimed.
One final whole-integration review remains required. Active281 and macOS287 policy
are unchanged; no push/publication/account/SDK work.
