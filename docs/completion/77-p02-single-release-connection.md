# P02.2 — one explicit release connection and lazy chunk matching

Started2026-10-22 (Mauritius), base2448143/main. P01 and P02.1 are credited;
P02 remains in-progress. This item extends the existing source-map session/UI,
not download/auth, companion source discovery or a new inspector design.

## Bounded design and preregistered acceptance

After one explicit manifest ZIP import in a tab, retain a private session-only index
of verified artifact metadata and unique raw map bytes. Drop built JS bodies after
their raw SHA-256 and separately decoded UTF-8 digest are checked. Parse a map only
for an explicitly requested loaded script. Script IDs/frame/context/run/native
callback tuples remain runtime identities; filenames, releaseId, V8 hash or build
labels cannot choose a map. Several same-text assets with different maps remain
ambiguous. Missing/wrong artifacts do not borrow another handler's source.

Use the SAME artifact verification/association functions for legacy one-script
imports and the index. Opaque prepared records are local implementation data,
never accepted from wire/page. Share raw map bytes by exact digest; do not share
runtime script/DOM identity. A new release import replaces the active index and
retires prior current associations into bounded history; mixed old loaded scripts
must report their missing match, not inherit a newer deployment label. Plain .map
import retains its unverified one-script path and replaces the release connection.

Keep the existing **8MiB cache budget**:raw retained maps plus unique parsed-map
input sizes together. Admit an index only if it leaves room for its largest map;
maximum8 parsed unique maps, with cold index maps reparsed on explicit use. Evict
only recoverable parsed index data. No cap increase, silent truncation or choosing
the first artifact on memory pressure. Existing archive/map per-input limits stay.
This bounds accounted cache inputs, not total RSS or in-flight/AST allocations;
real-app memory/time qualification remains a separate P02 gate.

Normal flow:select actual element → existing callback/listener source action →
backend revalidates private current metadata → lazily match this actual script →
current mapped preview/common source analysis. UI may adopt only that request's
exact refreshed anchor after a metadata reload; selection/map/source/clear/dispose
changes still cancel. No client coordinates, source text, arbitrary anchor or new
mutation permission. Advanced lookup stays unlinked and uses the same lazy cache.

Clear/detach/navigation/context loss/TTL/restart release index and parsed bodies;
script replacement invalidates that script's association. No persistence or body
in snapshot/diagnostics/model. A small existing status paragraph explains the tab
connection; existing cards/actions/disclosures/tokens/layout remain. Compare actual
440/390/keyboard source workflow to supplied Actions/Settings-map references; any
new text is a bounded deviation, screenshots remain candidates.

Acceptance before implementation:

1. One import for two chunks with unrelated/same URL labels; second source appears
without a second file selection. A later-loaded eligible chunk uses the same index;
no eager target source reads or automatic acquisition.
2. Actual raw/text/V8 digest domains, BOM/UTF-8, shared identical maps, differing
runtime anchors; same text/different maps is ambiguous. Wrong/missing/stale-deploy
and invalid selected map never produce an exact source claim.
3. Native and own-host anchors use private tuples; lazy metadata adoption succeeds
only for the exact new anchor and cannot revive target/map/nav/clear/dispose replies.
Source/body/AST remain absent from default state/reports/models, application counters0.
4. Accounted combined8MiB budget, shared map accounting/LRU/cold re-read; oversize
index fails without partially installing it or discarding the previous valid map.
5. Cancelled/pending import/match cannot recreate a cleared/replaced/expired session;
script replacement, same-URL redeploy and mixed loaded releases are explicit.
6. Current full/focused checks, immutable next Atom candidate/UI .2, actual packed
two-host one-import/minified selection + stale/negative/lifecycle checks, packed
types/admission, no broad old-model/experiment reruns. Preserve all failing runs.

The new actual fixture is `ReleaseConnectionView.js`; original P01 files remain
unchanged. CLI prepares a/b/c up front; only a/b load initially. One import first
maps a, then a cold native-b source action, then own-host b. An explicit ordinary
app-user click on Load later chunk loads c; its own-host source uses that same
single import. Handler/effect counters remain0; the deliberate loader click is
test setup, not an inspector source operation. A newer-deployment bundle using the
same b.js URL/name must mismatch the unchanged old script. 440/390 first source
viewport, keyboard/details, current cache/privacy and prior negative controls follow.

Source archive/map parsing remains synchronously bounded here; preemptible parsing,
companions and real-app/indexed-map qualification are not claimed by P02.2.

## Execution

Completed bounded P02.2 on base2448143 plus the recorded dirty source; full P02
remains open. Original preregistration is retained byte-for-byte in
`.artifacts/p02/single-release/preregistered77.md` and checked against actual
registered input hashes. Evidence aggregate:
`.artifacts/p02/single-release/verification40.json`; reproducible identity checker:
`.artifacts/p02/single-release/verify40.mjs`.

- Full source `npm test`:**2036 PASS**,0fail/skip/cancel;17 new tests over P02.1.
  Tests cover copied/raw/text/V8 identity, lazy ambiguity/refusal, shared accounting,
  LRU/cold re-read, oversize preservation, script replacement/orphan release,
  canceled/replaced/cleared sessions, mixed releases, exact UI adoption and private
  native/own-host runtime matching. Chrome-boundary unit models are not browser proof.
- `npm run build`:PASS. Exact immutable Atom
  `0.1.0-candidate.20261021.40`, UI `.20261018.2`, handoff
  `.artifacts/atom/2026-10-21T23-00-08-431Z/atom-handoff.json`.
  `verify:atom-types`:2PASS; installed admission:8PASS;172 exact Worker inputs
  and ordinary browser dependency gate preserved. API/wire1/UI2.1 unchanged.
- `npm run verify:source-release-native -- <handoff>`:**67 PASS**,
  `.artifacts/p02/single-release-native/2026-10-21T23-12-19-669Z/results.json`:
  pair/CLI2 + standalone32 + embedding33. Both complete installed host hashes and
  every registered input stay unchanged; console/errors0. One primary import is
  `['release.zip']` in EACH host, for initially loaded a/b and later user-loaded c.
  Cold native-b and own-host b/c source operations derive actual private runtime
  tuples. Same original/identical maps never merge script or DOM identities.
  Wrong/new-deploy/positions-only/ambiguous source-resolution and lifecycle controls
  retain their gaps; handler/effect counters0. Later chunk's explicit loader click
  is ordinary application setup, not a source operation.
- Sequential current packed regressions:**49 native-source**,**65 own-host-source**
  PASS, directories `.artifacts/p01/native-source/2026-10-21T23-13-44-890Z/` and
  `.artifacts/p01/react-source-native/2026-10-21T23-14-22-867Z/`.
  Exact unchanged Node resolver retains accepted .39 Action/IDE105 as historical,
  not fresh .40 evidence. UI tarball and source-analysis Worker bytes equal accepted
  .39; earlier HTTP Worker6 is credited only by exact Worker identity, not a rerun.

The primary three-asset fixture shares one350642-byte raw map and one350642-byte
parsed input; cache accounts701284/8388608 bytes. This is a synthetic minified
React18.3.1 fixture, not independent real-app qualification or a total heap measure.
Other source tests exercise distinct large maps and reparse after eviction. An
archive within8MiB/expanded16MiB can still refuse if unique retained raw maps plus
its largest parse exceed the existing8MiB connection-cache budget; no cap is raised.

Preserved failed native runs and bounded driver corrections:

1. `23-01-25-267Z` and `23-04-55-996Z`:8checks before failure selecting native-b.
   Diagnostic geometry established its center below the780×437 viewport, hitnull.
   Driver now scrolls the actual DOM target into view, waits two frames, and
   requires an actual visible hit before native Input selection. No forced/fallback
   target or product change; selection still must match the requested DOM ID.
2. `23-07-07-949Z` and `23-11-08-425Z`:29checks before blanket privacy-regex refusal.
   Precise path was `state.projectSetup.reason`:the existing constant explanation
   mentions the word sourcesContent. Final check permits ONLY that exact static
   reason at that path. Private source/expression/file tokens and sourcesContent/
   analysis-input object keys remain refused everywhere; no actual source payload
   was found. Raw failing reports/logs are retained, not relabelled PASS.

Implementation preserves source-source association criteria. Index construction
copies artifact buffers before async hashing, drops built JS bodies and completed
construction request references, and holds unique raw map bytes in memory only.
No raw map/body/AST is included in default state/diagnostics/model input. Index
close clears records/maps and parsed bodies; this is lifecycle behavior, not a
physical erasure or exact-GC/RSS claim. A replaced script drops any orphan private
parse; same-URL deployment changes do not overwrite old loaded-script digest/run.

Rendered agent comparison used the supplied Settings/maps HTML screen and
`design/screens/extension/13-actions-handlers.png`, plus actual440/390 connection
and details screenshots in the67-check directory. Existing scoped typography,
white/graphite/blue controls, disclosure layout, alignment and keyboard behavior
remain; new connection/status/clear wording is the bounded deviation. The fixture
embedding adds its own host header and shorter viewport. No shared tokens,
primitives or new design; screenshots remain candidates without human approval.

Next **P02.3 preemptible archive/map parsing**; then explicit bounded companions,
registered real-app limits/indexed-map qualification and ONE whole-P02 review with
one tested correction pass if needed. P02/C06 overall remain incomplete;16/29 full
items (~55% equal item count). No SDK, publication, other repository or model run.
