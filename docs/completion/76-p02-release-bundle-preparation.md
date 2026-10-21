# P02.1 — explicit release-bundle preparation

Started2026-10-22 (Mauritius), basefb73192/main. P01 is accepted (75); P02 remains
open. This is a bounded producer for the existing release ZIP/manifest-v1 format,
not a new runtime interface or the complete one-import/multi-chunk workflow.

## Registered design and acceptance, before implementation

Add `npm run prepare:source-bundle -- --root <already-built-directory>
--recipe <explicit-JSON-file> --output <new-local.zip>`.
The recipe is closed JSON:
`{schema:"stateatom.release-bundle-recipe/1",releaseId,assets:[{asset,sourceMap}]}`.
Both paths are existing relative artifact names under the explicitly selected root.
No app build, source execution, glob, sourceRoot traversal, config/plugin loading,
network, SDK or publication. Only listed JS/map bytes enter the output.

Implementation choices for this bounded item, not scope-interview approvals:

- Existing manifest-v1 raw artifact SHA-256 fields, sorted assets/entries, fixed ZIP
 metadata and deflate. Do not confuse raw bytes with decoded UTF-8 script or V8 hash.
 A generated manifest is owner-supplied provenance, not authenticated CI evidence.
- Existing archive/map budgets are unchanged:8MiB ZIP,16MiB expanded,4MiB/entry,
128 entries including manifest,64 manifest assets; flat-v3 map grammar/bounds.
 A shared named map may be included once for several assets; duplicate assets,
 conflicting roles and reserved manifest path refuse.64 distinct pairs exceed the
128-entry limit and must refuse; do not raise caps.
- Recipe byte limit128KiB. Closed schema/unique JSON members, inert logical paths,
bounded regular-file reads, no symlinks below the chosen canonical root. Check
input change during a read. No persistent cache or companion-file search.
- Original output design, superseded before acceptance:validate everything before
 creating output. Create a new owner-private local
file (`wx`,0600), never replace an existing path. On an owned partial-write failure
clean up only the same file; do not delete a replacement. This is a local ordinary
filesystem workflow, not an atomic snapshot or hostile/network-filesystem promise.

Acceptance cases registered here before product code:

1. Two explicit chunks, Unicode path/text and BOM: original bytes/digests retained;
 existing ZIP reader/manifest/association accepts each matching decoded script.
2. Deterministic output under reordered recipe entries and changed input mtimes;
 exact included set only. A literal source effect is not executed.
3. Missing/invalid UTF-8 files, malformed/indexed maps and invalid/duplicate/unknown
 recipe fields refuse without output. Positions-only maps remain positions only.
4. Traversal/absolute/backslash/percent paths, symlink file/directory, nonregular
 input, duplicate assets, JS/map role collisions and manifest collision refuse.
5. Per-file/aggregate/compressed/entry-count bounds remain enforced; valid shared-map
 dedup does not silently discard assets. Original archive import negatives retained.
6. Existing output stays byte-identical, missing output directory is not created,
 signal cancellation leaves no new result; output mode excludes group/other access.
7. Actual CLI success/usage/refusal uses the real producer and emits a bounded
 receipt. Validate generated ZIP with existing parser and independent unzip checker.
8. Actual two-host UI import consumes the CLI-created minified bundle with selected
 handler source, without manual generated coordinates or app source execution.
 This proves preparation compatibility, not P02 bulk import or real-app qualification.

Use TDD/source/CLI checks, full npm test, unchanged exact runtime package identity
and one actual generated-artifact consumption. No historical model or unrelated
native campaigns. Node24.19.0/npm11.17.0 are the repository's recorded environment.
Context7 primary Node24 fs documentation was consulted for bounded FileHandle reads,
numeric flags, exclusive create and its local/network-filesystem limitations.

## Execution

Initial positive2 → GREEN, then boundary8 RED →10 GREEN. Unicode filename and CLI
RED →13 GREEN. Source tests2017 and actual initial two-host CLI bundle57 passed.
Those results did not exercise an output-cleanup interleaving.

A subsequent isolated real-filesystem control reproduced a concrete defect in the
initial output design:after a real ownership lstat result was obtained, another
writer replaced that path before cleanup. Conditional unlink deleted the foreign
replacement. The stale metadata came from actual lstat; the I/O return interleaving
was deliberately controlled in an isolated Node builtin binding. No production hook
or fabricated file/stat value was used. `cleanup-race-before.json` records
interleaved=true/foreignRetained=false/ENOENT and the exact producer source hash;
the original source/test versions and reproduction are retained in the same directory.

The fix writes the complete archive0600 inside a unique private directory beside
the destination, closes it, then uses hard link to create the new final name. An
existing destination refuses atomically. The final path is NEVER unlinked or
renamed by this producer. Cleanup touches only its private staging directory. No
cross-filesystem/overwrite fallback. Cancellation before the link leaves no final
file; after the commit point, the complete artifact is retained. Cleanup failure
is an explicit receipt gap with the private staging basename/code, not false erasure.
This is a new implementation choice for this item, not maintainer policy approval.

Three intended publication/ownership/cancel REDs →15 GREEN. The isolated controlled
competing-destination case now retains the foreign file; an actual consumer sees
only a complete public ZIP, even if cancellation arrives after its creation. The
old direct-output cancellation control is preserved in tests-before-staging.mjs;
its partial public-file phase no longer exists. The new before-commit cancellation
case observes private staging creation and requires both final/staging absence.
No archive/map/evidence threshold was lowered.

## Final verification

Current implementation:15 new source tests; full `npm test` **2019 PASS**,0fail/skip/
cancel. Full source includes actual CLI success/usage/refusal, real private staging
cancel, isolated real filesystem interleaving and complete-file consumer controls.
Tests preserve the original limits and raw artifact/digest domains. The initial
2017/13 results and first native57 are earlier checkpoints, not current IO proof.

Actual current command and two-host source consumption:
`npm run verify:source-bundle-native --
.artifacts/atom/2026-10-21T21-58-37-567Z/atom-handoff.json` →
**57 PASS** (pair + CLI producer +27 standalone +28 embedding).
Result:`.artifacts/p02/prepared-bundle-native/2026-10-21T22-10-26-357Z/results.json`.
The primary release.zip comes from the real producer CLI, contains exactly five
listed entries, retains exact JS/map bytes, is0600 and passes independent `unzip -t`
without extraction. Both current minified chunks map from actual selection through
the installed native/own-host/Worker workflow; no sidecar, IDE or manual coordinates.
Passive app/effect counters stay0. All registered inputs are stable before/after;
no recorded inspector errors. Current keyboard/narrow samples remain candidates.
This is a synthetic two-chunk compatibility check, not independent-app qualification.

The separately executed documented **npm** entry point also passes:
`.artifacts/p02/prepare/npm-entry-result.json`, unique output directory
`.artifacts/p02/prepare/npm-staging-skOn4u`.
It uses the final staging producer, exact previously built inputs and a new output;
the resulting ZIP is byte-identical to the initial native artifact,0600, and leaves
no staging. Historical native directories were read, not modified.

The new local receipt's Atom/UI tarballs, runtime sourceManifest, installed package
files and BOTH complete host payloads are byte-identical to the accepted .39 P01
pair. The root Node CLI/commands are registered separately; no Node filesystem or
compression producer enters browser exports. Historical .39 types2/admission8 are
credited only by this exact byte identity, not called fresh runs. No shared UI,
tokens, wire/API, permissions or runtime behavior changed in P02.1.

Environment:repository Node24.19.0/npm11.17.0, actual Chrome153.0.8010.12; zlib/unzip
versions recorded in current receipts. The owned Worker/input gate remains unchanged.
All REDs, old direct-output source/tests and the reproduced negative ownership
result are retained under `.artifacts/p02/prepare/`. Current source/receipt/host and
preregistered-design hashes are checked by:
`node .artifacts/p02/prepare/verify.mjs` →
`PASS_BOUNDED_P02_1_PREPARATION_NOT_WHOLE_P02 2019 15 57`.

**P02.1 complete within this explicit preparation/compatibility boundary. P02 stays
in-progress;16/29 original full items remain complete (~55% equal item count).**
One next item:**P02.2 — retain one explicit release import and lazily match eligible
loaded chunks**. Companions, inspector archive/map parser preemption, real-app size/
time qualification, P03 HTTPS and whole-P02 acceptance remain open. A05/L02 remain
mandatory; L02 quality/A02 gaps are unchanged. No SDK, publication, redesign or
other-repository mutation. No independent-human blocker or human approval claim.
