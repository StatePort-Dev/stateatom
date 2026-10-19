# Native-control mechanism probe — U02.3b.0

Source parent `f069521`; local, synthetic, agent-operated Chrome MV3 diagnostics.
The installed baseline remains the immutable .20 pair at
`.artifacts/atom/2026-10-19T19-57-08-977Z/atom-handoff.json`.
There is no product native-control adapter, field UI or accepted catalogue row.
These probes answer specific mechanism questions before that implementation.

## Built-in read/set/event path

Plain React/Vue fixtures are `tests/fixtures/inspection/react/App.tsx` and
`tests/fixtures/inspection/vue/App.vue`, served by `startServer('A')` without the
optional instrumenter. `#form` uses ordinary React onChange / Vue v-model;
`#p5.disabled` reflects the actual framework form state.

A raw diagnostic native call resolves the real input into an isolated world.
The built-in HTMLInputElement value getter/setter avoids the page's own value
wrapper. An explicit read produces zero events and leaves the empty field and
button unchanged. Setting `Roman ✓`, then dispatching ordinary tagged input/change
events, changes the actual button to enabled. Returning the field to empty
returns it to disabled. Private WeakSet event tagging distinguishes those four
own events. Both frameworks pass this finite question.

Record: `.artifacts/u02/native-control-probe/2026-10-19T20-20-47-878Z/`.
The copied driver and before/after fixture/helper input hashes are retained.
This does not prove generic React/Vue state mutation, every control type,
causality, production grants, U02 plans or user-facing modes.

Two initial failed runs are retained at `20-19-15-301Z` and `20-20-02-115Z`.
The probe's nullable read sentinel arrived as undefined and its diagnostic code
wrote the string `undefined`, causing two earlier events. This was a probe bug;
there is no product implementation to fix and no universal API claim follows.
The explicit read/write payload removes that sentinel and adds the stronger
non-mutating-read control before checking the two writes.

## Realm lifetime and cleanup

A separate native detach/diagnostic reattach retained the custom isolated world
with the same native context ID and its observer still present. Record:
`2026-10-19T20-23-24-417Z/`. Detach therefore cannot be treated as observer cleanup.
Only the probe's own observer is explicitly removed at teardown. This negative
result is preserved; the successful setter path does not upgrade it.

A second mechanism uses the genuine extension isolated world through
`chrome.scripting.executeScript`, with a private runtime Port. A disposable copy
of the .20 standalone host adds a diagnostic receiver that retains only its probe
ports; the issued host is not edited. Four native checks pass:

1. Runtime identity and sender tab/frame/document match the native injection
   receipt; the initial read has no write/event.
2. The extension-world built-in setter/events update real React validation and
   return to its baseline.
3. Root Port disconnect removes the observer, later external events do not
   increase its count, and a later write is refused.
4. Actual service-worker stop disconnects the content owner without a timer;
   the observer stays removed and later writes are refused.

Record: `.artifacts/u02/native-control-probe/2026-10-19T20-27-20-802Z/`.
It retains the exact diagnostic driver and parent/copy host manifests. The source
checkout was clean before and after the run; this four-check driver did not
capture a separate pre/post fixture manifest. The earlier two-framework driver
has those fixture bindings. No new product-source or package bytes were executed
as a delivered native adapter. The diagnostic wrapper is compiled in Node and
Chrome receives a function literal; the extension does not enable eval/CSP relaxations.

## New working implementation choice

Use the extension isolated world and a private cleanup Port for U02.3b, rather
than assuming a custom Page-created world dies at detach. Native object references
in that world can supply exact control identities, with a private bounded map and
native injection document identity. Every write still needs fresh selected-target,
origin and read/inject/replay admission from the host. The Port supplies cleanup,
not a generic command channel or permission. Closed private state cannot be
adopted from storage or reopened by a saved plan.

The actual implementation must authenticate its peers and use unpredictable
session identity; the fixed diagnostic port name is not its security design.
Normal close removes owned subscriptions, and lost worker ownership closes them
independently. No polling/keepalive or expiry timer is selected by this probe.
Native controls/types/constraints, external revisions, model-ledger integration,
both field modes, inspector ownership and catalogue majority remain required.

The subsequent installed-backend check is a separate declared command:
`npm run verify:input-controls -- <immutable-atom-handoff.json>`.
It uses the actual installed runtime through the existing inspector transport,
without modifying either host or injecting the source primitive. It records exact
package/host hashes, native application outputs, both backend plan modes,
framework validation/undo, partial-group refusal, stale selection, readonly site
and worker interruption. It does not exercise the Live/Draft field widgets or
credit catalogue rows; those remain Task 4/5 acceptance. Earlier diagnostic source
checks and failures above retain their original scope.
