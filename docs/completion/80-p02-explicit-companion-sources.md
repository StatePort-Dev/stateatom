# P02.4 — explicit local companion sources

Started2026-10-22 (Mauritius), base1b315eb/main. Installed parser `.43` and P02.1–3
are credited. This bounded producer/import workflow does not complete registered
real-app/indexed-map qualification or ONE eventual whole-P02 review.

## Design and acceptance before implementation

Use the existing local ZIP/manifest-v1 importer without a new source wire or UI.
Add an opt-in closed recipe schema `stateatom.release-bundle-recipe/2`, with the
same releaseId/assets and required nonempty `companions` array. Each entry names
`{sourceMap,sourceMapSha256,sourceIndex,source,file}`. The SHA-256 binds the exact
original raw map; index AND exact source string bind one occurrence, including
duplicate logical source names. `file` alone is an explicit safe relative input
under the selected canonical root. Never derive it from sources/sourceRoot,
resolve imports, scan folders, execute files, fetch or load app config.

This is an implementation choice for this bounded task, not an already-approved
external format/CI authenticity decision. Schema1 and its original byte-preserving
behavior remain unchanged. Schema2 creates an explicit enriched COPY in the ZIP:
only absent/null sourcesContent slots may be filled. Existing string content,
including an empty string, cannot be replaced. Original JS/maps/files on disk
stay byte-identical. The output map has a NEW raw digest in manifest-v1; it is
never represented as the original map's bytes. A small bounded stdout receipt
records original/enriched map hashes and source-index/raw-companion hashes, without
source bodies or filesystem/source names. All are owner-supplied provenance, not
independent source authenticity or an execution/renderer certificate.

Keep mappings/names/source order/root/extensions unchanged as JSON data, no offset
rewrites. Refuse duplicate JSON members in maps being transformed rather than
silently erase shadow declarations. UTF-8 companion decoding is fatal and retains
a source BOM; source text/line separators/Unicode stay inert. Recipe2 allows at
most512 explicit companions overall; duplicate map/index and role conflicts refuse.
Same per-file4MiB/source-content3MiB/map4MiB/ZIP8MiB/expanded16MiB/count128/assets64
limits, recipe128KiB and existing strict flat-v3 parser. Validate enriched size,
parser and aggregate ZIP budget before the existing private0600 complete-stage /
non-overwrite hard-link output. No cap increase, persistence or runtime fallback.

Acceptance:

1. Schema1 exact bytes/receipts and prior IO/ownership/limits controls remain.
   Explicit schema2 fills only chosen missing slots, preserves all other map data,
   leaves unlisted content missing and sourceRoot/sources inert; file effects never
   run. Distinct same-name indices, Unicode/BOM/CRLF/CR/LS/PS and empty text retain
   exact content. Shared maps enrich once for every declared asset.
2. Wrong raw-map hash, wrong source/index, duplicate bindings/JSON members, existing
   content, undeclared map, unsafe/role-colliding paths, symlink/nonregular/changed
   inputs, invalid UTF-8 and closed recipe/member/count limits refuse without output.
3. Existing source-content/map/expanded/ZIP limits, cancellation and output ownership
   remain; original source/map/JS bytes unchanged, generated map digest explicit.
   Current parser validates transformed maps; no interpretation of source text.
4. Actual CLI/npm entry creates0600 ZIP; independent unzip validates it. Exact `.43`
   Atom/UI/installed pair/both host payloads stay immutable. Actual native two-host
   one-import minified source/analysis workflow consumes the enriched map, with
   ordinary positions-only control retained, missing helper not fabricated, default
   source privacy and current lifecycle/identity controls. No manual coordinates,
   IDE/app CDP sidecar or app handler/source effect execution.
5. Current focused/full source checks and registered before/after hashes. Record
   recipe/original/enriched map/source digest domains and all failed attempts.
   No real-app/indexed/HTTPS/SDK/publication/other-repository claim.16/29 full items
   stays until whole-P02 acceptance. Human review remains optional evidence.

## Execution

Completed bounded explicit producer/import workflow. No runtime/UI source or issued
artifact changed. Aggregate/current input/host checker:
`.artifacts/p02/companions/verification.json` and `verify.mjs`.
The original design used by actual execution remains in
`.artifacts/p02/companions/preregistered80.md`.

- Initial2 positive cases failed on unsupported recipe2, then passed with the
  implementation. Focused current producer/companion set:**26 PASS** (11new +15
  original), `node --test --test-isolation=none tests/release-bundle-companions.test.mjs tests/release-bundle.test.mjs`.
  Full `npm test`:**2104 PASS**,0fail/skip/cancel. No parser/runtime thresholds or
  prior producer ownership controls were lowered.
- `npm run verify:source-release-native -- --companion-sources
  .artifacts/atom/2026-10-22T00-50-05-030Z/atom-handoff.json`:**70 PASS**,
  `.artifacts/p02/companions-native/2026-10-22T01-08-31-807Z/results.json`.
  Chrome153.0.8010.12,33 standalone +34 embedding +3 package/producer checks;
  stable registered before/after inputs, errors0 and complete host hashes unchanged.
- The actual CLI receives three minified JS artifacts and original maps whose
  application/helper source slots7/8 are null. Six explicit companion bindings
  fill those exact slots in new map copies. Original map/source/JS input hashes
  remain unchanged; generated raw map SHA-256 differs and matches manifest-v1.
  Duplicate logical source-index, missing/unlisted, content/escaped-map/expanded
  budgets, source BOM/line breaks/Unicode, unsafe/symlink/role collisions, wrong
  digest/name/index and existing string/empty-string refusal are separate source
  controls. Only selected files are read; no roots/names become paths.
- Each host imports the one CLI-generated ZIP once. First own-host handler source,
  cold native second-chunk handler and later user-loaded third-chunk callback use
  the enriched map's digest and exact existing loaded-script anchor. Original
  source digest equals the independently retained fixture source text; lexical
  analysis resolves only the included helper. Shared-map cache is349824 retained
  +349824 parsed input bytes,1parsed map inside8MiB. No total-heap claim.
- Existing wrong-map/new-deploy/positions-only/missing-helper/duplicate/bare-import/
  line-break/inert-source/analysis-cancel/budget/stale/clear/navigation/dispose and
  default-source privacy controls remain. Passive handler/source-effect counts0;
  no source execution, manual coordinates, IDE or app CDP sidecar/session.
  These are synthetic pinnedReact18.3.1 minified chunks, not real-app qualification.
- The documented actual npm producer entry also passes, in a SEPARATE new directory:
  `.artifacts/p02/companions/npm-entry-result.json`, output under
  `.artifacts/p02/companions/npm-staging-9wLU19/`. Result ZIP is byte-identical to
  the actual native artifact,0600 and independently accepted by `unzip -t` without
  extraction. No historical campaign input/output was modified.

Both CLI/native ZIPs include only manifest and the three JS/map pairs; companion
files are incorporated as text in map copies, not extra inferred ZIP paths.
`companionSources` stdout receipt records original/enriched raw map digests and
source index/raw-byte hashes/counts only. Original-map identity is not silently
reused. The enriched map remains owner-supplied mapping/source data, not independent
source authenticity or evidence of invocation, values, renderer identity, property
producer or HTTP ancestry. Existing runtime evidence labels are preserved.

Schema1 original raw-byte/no-rewrite behavior and private complete-stage/atomic
non-overwrite hard-link cleanup remain. Schema2 additionally refuses duplicate JSON
members in transformed maps with the existing bounded lexical guard (depth16,
10000members), preserving extension values as data instead of evaluating them.
No limits increased; max512 companions globally, recipe128KiB, source3MiB/map4MiB,
ZIP8MiB/expanded16MiB/count128/assets64 and connection cache8MiB remain.

Actual archived Atom `.43` / UI `.2`, current packed source/build inputs, installed
consumer and both complete hosts are unchanged, verified read only in
`.artifacts/p02/companions/runtime43-identity.json`. Thus accepted `.43`
86parser/49native/65host/types2/admission9 are retained by exact byte identity,
not called new executions. No new Atom candidate, visual change or dependency.
Current70-check run also retains440/390/keyboard samples; no human approval claim.

Preserved failures:initial focused sandbox execution had15pass/2fail because
child processes returned EPERM/empty stdout (a separate spawn control confirmed
this); authorized local-process execution passed17. Boundary attempt1 had9pass/
1fail because a new test helper reused its first output path; only the second
explicit output argument was corrected. Current26/full2104 pass. None is silently
removed or credited as an earlier product success.

**P02.4 complete bounded; P02 remains in progress,16/29 full tasks (~55% equal
count).** Next **P02.5 registered real-app size/time/indexed-map qualification and
actual nontrivial minified UI workflow**, then ONE whole-P02 review/fix pass.
L02/A05 remain mandatory, L02 quality/A02/release-wide gaps unchanged. No source
folder discovery, SDK, publication, other repository, new redesign or independent-
human blocker.
