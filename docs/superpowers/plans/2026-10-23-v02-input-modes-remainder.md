# V02.8 preparation correction and retained standalone phase

First b624192 native attempt `.artifacts/v02/input-modes/2026-10-23T12-43-03-089Z/`
is INCOMPLETE after46 valid standalone warm rows,66 ledger checkpoints
(opened0,1..64,refused64), one65th-proposal refusal;885 before/after hashes match,
0inspector errors/console. All actual tails remain, including Draft Apply3751.4ms.
No cancellation case or embedding row was completed.

The failure is harness setup, not a measured miss: inspect() called the generic
native select helper for already-selected disabled. Home changed it to text and
started async property RPC (the select is disabled while pending); ArrowDown was
then ignored. The source UI intentionally serializes property changes. Existing
P04 uses paced/no-op property selection for this reason.

**Correction:** if property is already disabled, preserve it rather than issuing
Home/ArrowDown. Initial default text->disabled selection remains actual UI. No
property policy/timing, native write, product source or immutable64 bytes change.

**Retained/remainder execution:** add the exact first results.json as second
argument to the original native command. Strictly verify original schema/status,
candidate/fixture/values/order/prereg hash/885 beforeafter inputs (historical
driver b624192), raw46 JSONL+attempts/distributions and66 ledger/1limit snapshots.
Copy those unchanged with explicit file/hash provenance; keep old attempts in a
separate retained file. Do not repeat standalone46 measured gestures,18 fillers
or the65th refusal. Standalone remainder operates only a fresh ordinary-document
Close-before-debounce case; its initial AB context is explicitly distinct from
the original64-edited document. The first run already checked close after limit
did not restore app state before its setup failure. Embedding runs the complete
unchanged46+64limit+fresh-investigation Close sequence. Final evidence joins
retained46+fresh46,retained66+fresh66 ledger snapshots,retained1+fresh1 refusal,
two fresh native Close cases; never claim92 freshly measured in the remainder.

All counts/order/values/250ms/64limit/500ms quiet period/endpoints and original
criteria stay unchanged. Different retained standalone phase environment/tab/run
comes from the original file; fresh standalone data is cancellation-only. No
cross-host pooling or target waiver. Freeze this addendum/driver before execution;
focused66/syntax/diff and local commit. Preserve the original INCOMPLETE/driver/
plans/raw. One whole review follows; no product build/full suite or other repo.
