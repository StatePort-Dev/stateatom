# U03 — historical handoff implementation progress

Current branch `main`; no new branch/worktree. Binding new working journey:
[U06](../features/qa-pm-handoff-journey.md). The maintainer authorized bounded
implementation/verification/local-commit cycles until 2026-10-20T04:00:00Z.
[Implementation plan](../superpowers/plans/2026-10-20-u03-handoff-implementation.md).
U03 remains **in progress**: a source model is not a reporter/recipient workflow.

## U03.1 — unimported internal draft and immutable baseline

`core/handoff-draft.mjs` adds `createHandoffDraft(raw, fields, {now})` with detached
read-only snapshots, optimistic revisions, synchronous updates, async freeze and
append-only Developer notes. Input is strict historical v1 JSON, not an application
object. The actor references exact source bytes by SHA-256/UUID and minimal target,
time/build/freshness metadata. It copies no old notes, body, source, URL, selector
or selected text; selected `disabled` boolean can remain, text is explicitly omitted.
Reporter actual/expected/question come only from explicit fields; absent data and
observation windows stay not-supplied/not-recorded. There is no P04 collector.

Freeze locks before host clock/hash work. Baseline remains immutable; notes retain
parent/baseline content digests and monotonic revisions. Same/different/missing
build is only a hash relation. Every finding is an **unverified Developer note**,
never Observed, execution, causality, authorship or a fix-verification claim. No
Chrome, storage, native action, source resolver, export or public-v2 API is added.
The internal `stateatom.handoff-draft` version1 is **not diagnostic version2**.

RED missing-module evidence is retained in `.artifacts/u03/draft/red.log`.
An initial full source pass1092/model45 is retained. Additional controls then
found four actual failures: noncanonical numeric array keys were ignored, explicit
null clock silently selected a different clock, a parseable date comment leaked
into minimal metadata, and host-clock reentry could alter a draft before freeze
locked. Their RED45/4 is retained in `boundary-red.log`. Own-data validation,
clock configuration, date normalization and pre-clock locks fix those cases.
Caller getters are never read; bounds reject instead of truncating the expectation.

Fresh final verification:

```sh
node --test --test-reporter=tap --test-isolation=none tests/handoff-draft.test.mjs
npm test
node .artifacts/u03/draft/verify.mjs
```

Results: model **49**, full **1096**, zero failures/cancelled/skipped. Receipt:
`.artifacts/u03/draft/verification.json`. Source/test hashes are frozen there.
The first isolated-file reporter showed a single file-level result; model counts
come from the explicit repository-style `--test-isolation=none` run, not that wrapper.

The existing issued `.20261020.9` source/build manifests, exact tarballs, installed
consumer and **entire file maps of both hosts** still match. The new actor is absent
from package source/build inputs and has no runtime importer. F05's native proof
keeps its own identity; no repack or old native rerun is justified by this model.

Task1 is complete within this unimported source boundary. U03.2 still needs an
explicit compatible public-v2 format, granular privacy, storage behavior and real
snapshot binding; then U03.3 actual reporter/reader UI, H01–H06 two-role acceptance
and the one whole-U03 review/fix pass. P04 H07–H09 and A05 execution are separate.
C07, real handoff, human visual, official-host, release and SDK claims are not added.

## Rulings

The new U06 journey and actor parameters are current working decisions, never
retrospective interview approval. Existing v1 schema/results and F05 `.9` are
unchanged. Initial construction necessarily hashes the raw source asynchronously;
subsequent read/update are synchronous, freeze/append await hashes. Text bounds
use JavaScript UTF-16 units. Cost if wrong: later UI/schema integration may need
adjustment and extra review, but no source/runtime behavior has been enabled by
this actor. Source hash/content identity is not trust or action authority.
