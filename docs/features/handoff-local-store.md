# U03.2b.1 — compatible local storage model

New working decision, 2026-10-20, within the existing U03 plan. This bounded
increment supplies an unimported storage controller; it does not yet add a
browser operation, migration on startup, Save button or rich privacy profile.
The current `.20261020.12` runtime and its evidence remain unchanged.

`createHandoffStore({read, write, now})` serializes operations through one queue.
The host adapter reads null or a JSON string and atomically replaces that string.
The host must own a single controller/writer for the key; cross-process compare
and swap is not claimed. Reject failed/corrupt reads without overwriting them;
an acknowledged write is the boundary of success, not an in-memory update.

The private envelope is `stateatom.handoff-store`, version1, with ordered entries
containing only `raw` and `representation` (`input-bytes` or
`legacy-reserialized`). It is not a public diagnostic format or trust statement.
Validate every raw v1/v2 with the existing dispatcher. Store exact supplied UTF-8
text, including whitespace, and derive IDs/digests/metadata when reading. Never
parse/reserialize a supplied report for persistence. A matching ID with different
bytes is an explicit conflict, including whitespace changes; identical bytes are
idempotent and do not refresh expiry or insertion order. No overwrite operation.

Operations: `save(raw)`, `list()`, `open(id)`, `remove(id, expectedDigest)` and
`importLegacy(legacyArrayJSON)`. Returned snapshots are deeply frozen. List/save/
import results expose expired/evicted IDs. Reopen returns the original raw string
and historical/untrusted parsed view. Exact available parent bytes validate only
content continuity; an absent parent stays not-checked. Check links when either
parent or child arrives; no fetch, source connection, permission or live action.

Keep eight entries, 2 MiB for the encoded private envelope, and seven days from
each artifact's original createdAt (inclusive cutoff, no expiry extension on
import). Evict insertion-oldest entries to fit, as the v1 store does. A single
entry that cannot fit, or an incoming expired report, rejects visibly. Removal
requires the expected raw digest. Invalid JSON, unsupported versions, corrupt
entries or duplicate IDs already in the envelope fail closed rather than being
silently repaired. Validation/read failures do not write. A write rejection is
reported without publishing success or attempting rollback: if its acknowledgement
was lost after commit, reopen must read actual storage. Only the adapter can
guarantee that a rejected write left previous bytes unchanged.

Legacy intake accepts an explicit JSON array of existing v1 objects, validates
the entire batch before one write, and does not change/delete the old key. Its
per-object JSON serialization is marked `legacy-reserialized`: exact pre-storage
file bytes cannot be recovered from an object. On collision, preserve both the
existing store and legacy input; never pretend serialization recovered an old
digest. This is an adapter contract, not an automatic browser migration.
If a whole incoming batch cannot fit, reject it atomically rather than claim
success for new entries immediately removed by retention. Existing entries may
be evicted on successful intake, and those IDs are returned explicitly.

Verification covers v1/v2 restart/reopen with real filesystem adapters, whitespace
and Unicode identity, conflicts, legacy provenance, immutable parent/child forks,
missing parents, expiry/count/encoded-byte retention, failed I/O and queued
concurrent writes. Full source suite and unchanged issued package identity are
required. Rich per-category/per-note review, runtime/types/UI integration,
H01–H06 and the whole-U03 review remain open.
