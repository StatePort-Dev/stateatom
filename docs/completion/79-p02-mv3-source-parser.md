# P02.3b — owned offscreen parser transport and current source session

Started2026-10-22 (Mauritius), base253abee/main. P02.2 and the separate P02.3a HTTP
Worker foundation are credited; the fixed parser is not installed at this start.

## Design and acceptance before implementation

Use the existing host-owned offscreen document (WORKERS reason) to start each
fixed one-shot source parser Worker. Add a SEPARATE private source port:do not
send source payloads through the debugger guardian/resource registry. The host
verifies exact offscreen URL/document/context identity, then issues a fresh nonce;
all jobs/cancel/replies bind to that channel and unique request. The document
accepts only the host challenge/jobs; no page/content-script/foreign port can
provide parsed-map results or gain source/debugger authority.

Keep at most2 concurrent source Workers per document, no silent unbounded queue.
Use existing map1500ms/archive2000ms parent/Worker budgets, input/expanded/cache
limits. Startup has a separate bounded handshake; no synchronous product fallback
when offscreen parsing is unavailable. Binary data uses a bounded private codec
that pools shared Uint8Array objects; repeated asset/map references cannot multiply
one shared map into64 serialized copies. Max private transport message32MiB,
unique binary input/output still governed by existing4/8/16MiB caps. This is a
transport bound, not a cache cap increase or total heap/zero serialization claim.

Worker operations reuse existing parser functions. Besides map/archive, a ZIP
bundle job runs current archive/manifest decoding in the Worker; a manifest
classification job handles URL acquisition without parsing source JSON on the
service-worker event loop. Only declared manifest fields survive normalization;
raw-byte manifest digest remains authoritative. No artifact execution/config/
source-root traversal/discovery or new download/auth direction.

Existing source-map session receives injectable internal parse/bundle/classify
functions. Public Atom wire still accepts raw user-selected artifacts and private
runtime bindings ONLY, never a supplied decoded map/index certificate. Direct core
parser APIs keep their established semantics. Product runtime always uses the
platform parser service, with explicit unavailable errors when absent. All active
import/acquire/lazy jobs own AbortControllers;clear/replacement/expiry/navigation/
detach/shutdown cancel actual Worker work, and generation/script/anchor checks
still gate every commit. Index/cache/provider semantics and historical evidence
remain unchanged.

Install exact owned parser asset/dependency receipt in the next immutable Atom
candidate, with additive feature/asset contract and actual packed type/admission
checks. Shared UI .2/tokens/primitives/layout unchanged. UI source/status behavior
stays within its existing workflow; new internal unavailability is a safe gap.
No SDK, publication or external repository changes.

Acceptance:

1. Closed request/result codec preserves raw bytes, shared references, map/source
indices/names, Unicode and missing content. Wrong/duplicate refs, invalid base64,
size/count limits, unsupported kinds and extra keys refuse without unsafe paths or
source text in errors. Original source/bundle/hash association controls remain.
2. Exact owned offscreen identity/nonce/challenge/lifecycle; foreign/page/tab/
wrong-document/stale/replayed/oversized/malformed ports/messages fail. Two-worker
cap, cancel before/after start, replacement, disconnect, startup timeout, error and
late result cannot revive another job. Source channel never calls debugger,
storage or the live resource registry. Guardian lease/cleanup behavior preserved.
3. Product source path has no synchronous parse fallback. Import/acquire/ensure
use owned Worker operations, keep exact current checks and existing8MiB accounting,
and abort on clear/replacement/nav/TTL/detach/dispose. Missing service stays a gap.
4. Full/focused source checks plus new exact packed candidate/types/admission,
parser input ledger with ordinary browser dependency gate and no Babel/Node.
5. Actual packed two-host one-import/cold/later/mixed-release source workflow and
affected native/own-host controls, plus actual Worker parse-start cancel/clear/
nav/document/worker-restart and owned/fallback/foreign-resource controls. Source
bodies/AST/parser inputs absent from default snapshots/reports/model/persistence.
Keep original controls and every failed run; no arbitrary coordinate/source/anchor.
6. Current provenance, stable registered before/after inputs and full host hashes.
Actual source parsing/termination remains distinct from real-app/indexed-map limits,
companion sources, human review and ONE eventual whole-P02 review.16/29 full items
unchanged until whole P02 acceptance.

The actual driver extends the current67-check release-source campaign. A test-only
metadata observer forwards native Worker postMessage/terminate unchanged in the
exact offscreen document; it records operation/start/reply/termination counts and
input lengths only. It never attaches an application target, stores byte/source
payloads or changes installed files. A35000-name/250000-segment map within4MiB
first succeeds separately, then fresh jobs test Clear/nav/worker/document loss after
an actual started message. Native Input activates Clear. Local manifest/plain-map
URL acquisition distinguishes Exact/Candidate; this is not corporate HTTPS/SSO proof.
Service-worker stop uses the actual manifest path (host-worker.js in embedding).
Offscreen loss is limited to the verified owned document and checks native parser
target removal/context replacement rather than inventing a terminate acknowledgement
from a destroyed document. Raw observer/helper/driver/fixtures are registered.

## Execution

Completed within this bounded integration, on exact Atom
`0.1.0-candidate.20261021.43` / extension-ui `.20261018.2`.
Handoff:`.artifacts/atom/2026-10-22T00-50-05-030Z/atom-handoff.json`;
source base253abee plus the registered dirty implementation. Aggregate/source/
artifact checker:`.artifacts/p02/parser-mv3/verification43.json` and `verify43.mjs`.
The preregistration used by the actual campaign remains byte-for-byte in
`.artifacts/p02/parser-mv3/preregistered79.md`.

### Implementation and reproduced corrections

The existing owned offscreen document now hosts a separate source port and fixed
one-shot parser asset. Exact native context/document identity, private nonce,
closed bounded messages and max2 admitted jobs gate the service. Map and manifest
jobs retain1500ms; archive/bundle jobs retain2000ms. The private binary pool avoids
multiplying a shared map per asset;32MiB wire,4/8/16MiB input/expansion and8MiB cache
bounds are unchanged. There is no synchronous product fallback. Core standalone
parser APIs retain their old behavior; the product runtime always requires the
platform service. Source payloads do not enter debugger resource messages.

Imports/acquisition/lazy matching own abort signals. Clear/replacement/navigation/
expiry/detach/shutdown invalidate jobs and source commits. Parsing, manifest JSON
classification and ZIP decoding use the existing strict implementations in the
Worker. Hydration/copies/JSON message serialization still require bounded parent
work; this does not establish total RSS, zero parent CPU or physical erasure.

RED/GREEN receipts are preserved under `.artifacts/p02/parser-mv3/`. New cases
cover codec/schema/ref pooling, channel identity/lifecycle/capacity, source-session
cancellation, unavailable product service, package assets and UI/lease recovery.
Two concrete failures found by actual installed execution required corrections:

- `.41` Clear cancelled the backend, but its obsolete import rejection changed the
  global status to Error. Separate connection-generation invalidation now prevents
  obsolete imports/file reads/permission replies/advanced lookups from restoring a
  cleared connection or replacing current status. Current failures still surface.
  Five UI RED cases and the separate stale-permission RED are retained.
- `.42` offscreen replacement exposed a cached expired platform lease:explicit
  Attach reused it and returned LEASE_EXPIRED. Two deterministic RED controls
  reproduced this. Retire only a confirmed expired local reference, without calling
  its stale native release; an unknown failure remains unavailable and a foreign
  owner remains BUSY. The affected focused set passes64, including these2 controls.

An initial `.41` metadata observer incorrectly called getContexts inside offscreen.
Actual Chrome153 offscreen has getContexts/getManifest undefined. The harness now
probes only its exact own service worker for native identity and detaches before
lifecycle tests. Product `.42+` learns the exact background URL from the private
host challenge; it does not guess worker.js or require those offscreen APIs.
After service-worker stop, an old inspector correctly returns
INSPECTOR_DISCONNECTED. The driver now asserts this and explicitly reloads/reopens
that inspector before fresh Attach/import; authority is never silently restored.

### Current checks

- `npm test`:**2093 PASS**,0fail/skip/cancel;40 new cases over P02.3a. The earlier
  full2083pass/1fail production mock declared no parser availability; the mock now
  explicitly supplies it while preserving its original read-only/mutation refusal.
  Original failure and intermediate2085/2091 runs remain historical.
- `npm run build`:PASS browser/IDE. `pack:atom` issued the exact `.43` above;
  `verify:atom-types -- <handoff>`:**2 PASS** strict installed NodeNext/Bundler;
  `verify:atom-package -- <handoff>`:**9 PASS**, including missing-parser refusal.
- `npm run verify:source-parser-native -- <handoff>`:**86 PASS**;
  `.artifacts/p02/parser-mv3-native/2026-10-22T00-53-23-338Z/results.json`.
  Chrome153.0.8010.12,41 standalone +43 embedding +2 package/producer checks.
  The original67 one-release controls remain, plus19 installed parser/recovery
  checks. Exact source/build/registered inputs stable; errors0; both complete
  issued host manifests unchanged. The metadata observer is test instrumentation,
  not an uninstrumented-runtime claim; no application CDP sidecar/session is used.
- `npm run verify:source-anchor-native -- <handoff>`:**49 PASS**;
  `.artifacts/p01/native-source/2026-10-22T00-56-16-624Z/results.json`.
- `npm run verify:react-source-native -- <handoff>`:**65 PASS**;
  `.artifacts/p01/react-source-native/2026-10-22T00-57-01-718Z/results.json`.
  These actual regressions ran sequentially. Types2 and admission9 receipts/logs
  are tied to the `.43` tarball hash, not an older candidate.

The actual3479008-byte,250000-segment/35000-name valid map succeeds in both hosts
(673.3/669.1ms from Worker-start to observed reply). Fresh jobs then receive native
Clear, navigation and native service-worker stop after actual parse-start, before
reply. Each live parent calls terminate exactly once; no late source commit.
Observed start-to-termination:Clear17.7/16.6ms, navigation26.5/30.0ms,
worker-stop14.5/10.2ms. These samples are lifecycle evidence, not latency guarantees.
Actual owned-document loss removes parser targets/cache; a distinct document ID
requires explicit Attach/import and produces fresh Exact source. Embedding's
foreign-consumer control stays BUSY and starts no parser job; releasing that owned
control permits another explicit fresh connection. No Capture implementation claim.

Actual local manifest URL classification gives Exact only with existing artifact/
loaded-text checks; plain-map URL remains Candidate. No HTTPS/SSO acceptance is
inferred. Source bodies/AST/private expressions remain absent from default state
and diagnostics; passive fixture handler/effect counters stay0. Wrong/positions-
only/duplicate/mixed-release/line-break/analysis-cancel cases retain old semantics.
The fixtures are synthetic pinnedReact18.3.1, not independent real-app qualification.

Exact parser ledger8 inputs and AST ledger172 inputs pass their separate gates;
ordinary browser dependency gate stays unchanged, no Node/Babel widening. AST
Worker and UI `.2` are byte-identical to accepted `.40`. Historical HTTP Worker10
and Node/IDE105 remain their original checks; no fresh `.43` HTTP/IDE claim.

### Preserved failures and visual boundary

- `.41` observer2-check failure:`00-09-10-570Z`; `.41` stale-Clear36-check failure:
  `00-12-21-409Z`, both under `.artifacts/p02/parser-mv3-native/2026-10-22T…`.
- `.42` old-inspector38-check failure:`00-32-05-078Z`; `.42` stale-lease41-check
  failure:`00-37-09-370Z`. Stable input/console records and original errors remain;
  no failed candidate is relabelled accepted. Source/helper/driver snapshots before
  each relevant correction are retained beside the logs.

Rendered `.43` standalone connection440 and embedding analysis390 candidates were
compared with supplied settings-maps HTML and existing Actions references. Existing
scoped typography, header/footer, aligned controls and narrow scroll layout remain;
no token/CSS/primitive/layout edits. Atom deliberately retains its bounded inline
source disclosure instead of adopting the prototype's full settings-page layout.
Existing exact source/privacy labels remain; this is a recorded functional layout
deviation, not a fidelity or human-usability approval. Eight440/390 screenshots
in the actual parser result directory remain human-review candidates.

**P02.3b complete bounded. P02 remains in progress;16/29 full items (~55% equal
item count).** Next **P02.4 explicit bounded local companion sources for maps
without sourcesContent**. Registered real-app/indexed-map limits and ONE whole-P02
review follow. L02/A05 stay mandatory; L02 quality/A02/release-wide gaps are not
changed. No SDK/publication/other repository/redesign or independent-human blocker.
