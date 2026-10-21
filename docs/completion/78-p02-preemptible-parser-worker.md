# P02.3a — fixed one-shot source parser Worker

Started2026-10-22 (Mauritius), based969d42/main. P02.2 is credited. This bounded
item creates/tests the parser execution boundary; subsequent P02.3b connects it
to the existing MV3 source session. No shipped parser-preemption claim from a
standalone Worker or this document.

## Design and acceptance before implementation

Reuse the CURRENT strict readZip/parseSourceMap implementations and their limits,
not another decoder. A fixed owned module Worker accepts one closed map/archive
byte request and returns only parsed source data or archive entries. Source files,
sourceRoot/URLs and source text remain inert data; no execution, imports from the
artifact, filesystem, remote URL or source discovery. Returned data is private
implementation data, never a client-submittable validated-map certificate.

Keep map1500ms/archive2000ms and current4MiB map/8MiB archive/16MiB expanded limits.
A parent timer or AbortSignal terminates its dedicated Worker; it can interrupt
synchronous JSON/VLQ/CRC work. No synchronous fallback. Each job uses a copied
input buffer and a fresh Worker. Replacement/cancel/dispose/error/budget terminate
that worker once and reject; late messages cannot settle another job. URL is fixed
same-origin/owned filename, with no credentials/query/fragment/blob/remote escape.
The boundary does not claim zero serialization/hydration CPU, total RSS or physical
erasure. Preserve the existing parser's post-hoc guards too.

Use maintained trace-mapping decodedMap/TraceMap for local decoded lookup
restoration; preserve source index, UTF-16/line bases, names, sourcesContent missing,
duplicate names and inert roots. Restoring data is internal to the trusted owned
Worker path; do not accept this representation on Atom's public wire.

Acceptance:

1. Job results agree with existing parser/ZIP controls, including duplicate mapped
source indices, Unicode, missing source content, inert remote-looking names/root,
malformed/sectioned maps and corrupt/traversal/expansion ZIP refusal.
2. Parent factory rejects oversized/invalid input and unowned URLs without work;
uses the exact existing budgets and copies input without detaching caller bytes.
3. Success/error/messageerror/cancel/replacement/dispose/budget and wrong/late/invalid
reply controls terminate exact ownership, remove timers/listeners and keep promises
settled once. Already-aborted work does not start a Worker. No synchronous fallback.
4. Actual dedicated browser Worker reads valid stored/deflated ZIP and restores
mapped source/name/content; source bytes are not executed and create no requests.
Actual abort after parse-start is acknowledged by the parent while it stays
responsive. An independently identified blocked-worker control establishes hard
budget termination without relying on a naturally slow fixture. Preserve the valid
real parser case separately; no blocked code ships as a product test mode.
5. Full source/current dependency gate, exact new Worker bundle input hashes and
before/after registered inputs. Existing Atom/UI .40 are immutable and unchanged;
this item alone does not install the Worker or complete P02 preemption/companions/
real-app qualification. P02.3b needs actual two-host packed integration/lifecycle.

Chrome offscreen WORKERS/runtime-only constraints checked via Context7 primary
Chrome documentation. Context7 did not resolve trace-mapping in two searches;
its exact installed primary source/types and official repository source establish
its decodedMap/TraceMap APIs. No dependency update.

## Execution

Completed bounded Worker foundation; actual MV3 integration remains P02.3b.
Aggregate `.artifacts/p02/parser-worker/verification.json`; identity/source checker
`.artifacts/p02/parser-worker/verify.mjs`.

- `npm test`:**2053 PASS**,0fail/skip/cancel.17 new cases; focused command
  `node --test --test-isolation=none tests/source-parse-job.test.mjs tests/atom/source-parse-client.test.mjs tests/atom/source-parse-worker.test.mjs`:
  **17 PASS**. Earlier isolated-runner receipts counted only2/3 test files, not
  assertions; retained as such. Initial missing-module RED receipts are preserved.
- `node tests/integration/source-parse-worker.mjs`:**10 actual dedicated HTTP Worker
  checks PASS**, Chrome153.0.8010.12; registered input hashes stable, errors0.
  `.artifacts/p02/parser-worker-browser/2026-10-21T23-28-17-469Z/results.json`.
  Initial9-check run23-24-50-637Z retained. Final10-check driver adds a positive
  independent Worker fetch to calibrate the BrowserContext request observer; it
  records both context request events and local HTTP traffic, not global network.
- Exact parser bundle:8 existing/owned inputs, client7, test restoration adapter8;
  current ordinary browser npm dependency gate passes, no Babel/Node dependencies
  or updated packages. Worker/client bundle hashes and all exact inputs recorded.
- Valid250000-segment/35000-name map completes in594ms under unchanged1500ms.
  Actual map and16MiB-expanding archive abort after Worker-start, before reply,
  at285.3/17.4ms with4 parent ticks each. Separate test-only blocked Worker stops
  at1503.8/2003.3ms, with301/397 parent ticks; this is not a parser test mode or
  a claim that ordinary maps naturally exceed a budget. Replacement/disposal
  terminate exact jobs; a fresh real parser succeeds afterward.
- Duplicate mapped source index1, source name, Unicode, original line separators,
  positions-only, stored/deflated exact ZIP bytes, invalid/sectioned/corrupt/traversal
  and static non-source errors retain original semantics. Remote-looking roots
  and source text are inert; no source-controlled requests in the calibrated
  BrowserContext observation. The probe's deliberate Worker fetch is test setup.

These files are **unbundled/uninstalled in Atom**. Read-only exact identity receipt
`.artifacts/p02/parser-worker/runtime40-identity.json` verifies all accepted .40/UI .2
archive, source/build inputs, installed package and both complete host hashes.
The earlier .40 packed67/49/65/types2/admission8 remain their original checkpoint;
no fresh MV3 parser run, new Atom version, UI capability or public contract is
claimed. No prior raw campaign/log/criteria is replaced. Full2053 is current source
coverage; documents/HTTP results alone do not establish installed preemption.

`runSourceParseJob` calls the existing strict parser/ZIP functions. Maintained
`decodedMap` transfers only data; `TraceMap` restores the local lookup object.
That decoded representation is internal trusted Worker output, never accepted on
Atom public wire. Parent one-shot client uses copied bytes, a fixed owned URL,
existing1500/2000ms timers and terminate/remove-listener cleanup. Worker errors use
static codes without echoing private parser input. Serialization, buffer copies,
message cloning and local hydration still have bounded work on the parent; no
zero-CPU/total-RSS/erasure claim.

Next **P02.3b trusted offscreen parser transport and existing session integration**:
use the existing host-owned offscreen document with a separate private source
channel, preserve debugger guardian ownership/cleanup, require no synchronous
product fallback, and test exact packed two-host source/lifecycle/clear/navigation/
worker-restart behavior. Companions, registered real-app/indexed-map limits and
ONE whole-P02 review remain open;16/29 full tasks (~55% equal item count).

