# V02.35 — source-only publication follow-up coalescing

After269: sampled current worker publication/storage path, original87overhead still
MISS10%; no general CPU/critical-path/cause/speedup or performance acceptance. Exact
native269raw/case/reader and88/UI2/official36assets remain immutable historical inputs.

Bounded source task: existing packages/atom/src/observation-publisher.mjs delays the
first save by its nominal16ms interval, but dirty updates during a storage await can
force immediate repeated saves. Use the same existing interval for dirty follow-up
turns, keeping a single flight/dirty bit and at most one queued task. Read CURRENT
state at dispatch, never queue snapshots or discard synchronous collector records.
This is an executor engineering choice within performance work, not a maintainer-
approved Live-edit cadence, production permission duration/scope or handoff UX.

Preserve same promise identity until settlement, exact errors, later-request recovery,
reentrant notification and scheduling failures, separate owner/runtime/disposal
boundaries and direct Stop/Clear/revoke writes. Runtime.persist's epoch retry is
independent: test actual storage operations separately from publisher invocations;
no global write-count bound or native reduction may be inferred from one counter.
Collector data/limits/unknowns/timestamps/privacy/permissions and public API unchanged.

Only the publisher source, meaningful tests, changelog/docs. Before product edit:
freeze exact old source/artifacts and record short design/plan plus RED controls.
Run affected UI/runtime/publisher checks and full suite after source stabilizes;
one bounded final review/maxone tested Important/Critical correction, no rereview.
Preserve original failures and all native cases/budgets. No browser/model/native/
old gate replay, SDK, other-repo source edit, new UI design or publication in this
source slice. Current packed/official88 stays old bytes until separately built and
qualified exact changed artifact. Full21/29 stays72.41%.

## Implementation and source evidence

Design/plan: `docs/superpowers/specs/2026-10-28-publication-follow-up-coalescing-design.md`
and `docs/superpowers/plans/2026-10-28-publication-follow-up-coalescing.md`.
User delegated autonomous choices; existing16ms interval is reused, not a newly
approved Live/grant/handoff parameter. Product edit is the publisher only. A dirty
update during save or reentrant notification now schedules one next run, retaining
same flight Promise and current-state read. Exact save/scheduler failure semantics,
later recovery and once-per-flight rejection handling remain.

Six new source controls RED59PASS/6FAIL before product edit; lower storage-area API
counter placement clarified before edit and the same59/6RED retained. Fixed four-
request real-runtime/synthetic-native scenario originally submits3storage operations;
new source submits2, with all4complete records/zero gaps/one final notification.
This is an actual source-fixture storage-area boundary, not Chrome/native CPU evidence.
Separate terminal/clear/replacement scenario demonstrates runtime epoch repair:
5storage submissions before second publisher dispatch,6final. Publisher turns cannot
bound total storage writes. Current-state replacement/empty-new-window invariants pass.

First affected run71PASS/2FAIL: old burst/gap tests assumed follow-up after five
immediate turns. Preserve that original failure. Only replace those waits with the
existing2s bounded completion helper for the SAME exact2writes/one notice/1000gaps;
no record/gap/write/notice criterion lowered. Final affected publisher/runtime/history/
handoff UI command77PASS/0FAIL. `npm test`:6020PASS/0FAIL/0cancel/0SKIP165596.747193ms.
Syntax/diff PASS; no browser/model/native resource operation during this source slice.
Negative no-case CLI controls are not fresh native measurements.

Preservation checkpoint `.artifacts/v02/publication-follow-up-source/2026-10-28/checkpoint.json`:
2036bindings, exactly4declared source/test/changelog paths (5binding aliases) differ.
Exact original publisher SHA `cdf5cecabb5ee887d2fe1a1627cdc53b746410ef43ccad816fe083eb514ea763`
retained as before-copy and Git2b61fd5. Current SHA
`7a5d2399d22fd3b1bb796f973e73487b86169245330f57885927a5714c553044`.
Only1of270product source inputs differs; build2of327 includes the new changelog note.
269other product-source/325other build inputs, immutable88/UI2/44consumer payload and
full36official assets unchanged. Old269case/raw/reader hashes remain exact; their
old publisher input is historical, not silently relabelled current. No89build yet.

ONE final source review pending after source commit; no native/CPU/10%/fullV02 credit.
Original87gate remainsMISS. Full21/29 stays72.41%.
