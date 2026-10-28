# A02 — selected text mutation interval

28 October2026, Task3 afterb3b2392. A complete script journal alone cannot exclude
a direct native/isolated-world DOM edit after the React commit. Such an edit need
not introduce another MAIN script. The new finite profile therefore also requires
an unchanged selected text subtree since its acquired native commit.

`list-dom-history.mjs` starts a native MutationObserver before application startup
for childList/characterData in the top-level document. At an acquired root-current
commit it drains pending records and records that commit's mutation sequence.
Later snapshot drains again and checks the exact selected node's subtree mark.
Every mutation marks its target and native ancestors using captured native
MutationRecord and Node accessors. It does not read text values, invoke overridden
application getters, attribute a writer or compare final text to infer no change.
An unrelated overlay sibling does not mark the selected label. Detached/foreign
nodes, missing interfaces, record/ancestry overflow and Stop refuse.

The runtime forwards only the actual collector's current commit to this guard.
A regression showed that repeating the same commit id could initially restamp
and hide a later mutation. Repeated ids now leave the original stamp unchanged;
an ignored root-current event cannot clear the refusal. A newly acquired commit
is a different interval, whose selected write/read identity must still be verified.

This is enabled only in the new explicit list profile, not the default observer.
The effect account and snapshot now require this separate DOM premise. A real
React/Chromium run must still establish actual commit/takeRecords ordering and
post-commit controls; authored native-shaped classes do not establish that result.
The final matrix adds changed/equal-value post-commit DOM edits and an unrelated
picker-overlay sibling control without weakening any original282 criterion.

API semantics were checked with Context7 against MDN's
[takeRecords documentation](https://github.com/mdn/content/blob/main/files/en-us/web/api/mutationobserver/takerecords/index.md):
it drains pending notifications before callback delivery. This documentation is
not an executed browser observation.

Logs in `.artifacts/a02/selected-list-integration/2026-10-28/`:
- `dom-history-red.log`: absent module; initial8 controls then pass.
- `dom-duplicate-red.log`: actual repeated-id restamping failure, preserved.
- `dom-final-source.log`:39PASS, including callback/pending records, exact-commit
  boundaries, no own getter invocation, Stop/budgets and actual runtime forwarding
  with authored native metadata/classes.
- `dom-code-final-affected.log`:**76PASS,0fail/cancel/skip,22528.144263ms**;
  compiler/effect revocation, code predicates and selected-field controls included.

Current retained compilation:
`.artifacts/a02/selected-list-compilation/2026-10-28T17-23-30-556Z/`,39inputs,
JS1254980bytes,SHA256`6cf20c6dd809541cd0060c9c996bd701227cc0b85998bbb8a2eafb84c3e2a746`,
manifest digest`274de936882615da0d159ed2e7b271fdcbbd8ec885e79a653905d21977a1259c`.
The earlier17:21 pre-correction compilation remains historical, not current proof.
No new browser/package/host/model run, no performance remeasurement or claim.

Next: helper-owned occurrence/site mapping and trusted bridge/journal route;
then actual changed-mechanism qualification, held-out effects and final review.
WholeA02/21-of29 remain unchanged; all snapshots still fullPath=false.
