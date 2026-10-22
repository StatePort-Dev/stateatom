# P04.1 bounded production-observation ledger

Architectural foundation within the existing approved P04 subsystem. Executor
working design under autonomous inline task/check/local-commit execution; these
parameters are not scope-interview approvals. Normative outcome: completion06 P04,
approved02/12 and the U06 qa-pm-handoff-journey H07-H09. No new design/SDK/service.

Current baseline3681f5d: read-only runtime returns before ordinary network collection;
legacy collection can read JSON bodies for admitted editing and must remain distinct.
Existing unsaved cache is3 tabs/5,000,000 JSON characters; per-tab legacy requests32,
256,000 characters and pending64. Current handoff profiles strictly retain
observationWindow:not-recorded; they must not be silently widened.

## Chosen bounded deliverable

Add only `core/production-observations.mjs` and meaningful source tests. It is an
inert browser-safe private controller, no Chrome/fetch/DOM/timers/storage and no
public packaged API. Runtime admission/owner/clock mapping, global cache integration,
UI/reader/export and native H07-H09 remain later P04 work.18/29 count unchanged.

Constructor `createProductionObservation({identity,target,now,id,limits})` copies
plain own data without evaluating getters. Identity is exact tabId/run/document/
frame/origin; opaque identities bounded160 ASCII characters, canonical HTTP(S)
origin512. Target is native node/property/observedAt and selected boolean only;
text or other form content is always omitted. Its snapshot time is not a window
event. Default clock Date.now and ID crypto.randomUUID; test injection is explicit.

The controller is idle until explicit start(). It starts only once; stopped/deleted
snapshots are data, never constructors or resumable state. Immutable snapshots share
no mutable caller input. New windows require a new controller and explicit Start.

Default hard ceilings:64 records,32 pending requests,65,536 UTF-8 snapshot bytes,
120,000ms. Callers may lower ceilings (bytes minimum8192);4096 bytes of headroom
reserve final stop/drop metadata. Counts and all collections are bounded. Stop on
record/pending/byte/time exhaustion; keep original facts and visible reason/drop.
Before-window and foreign/unmatched/invalid data are refused with bounded gap counts.
Gap counts saturate at1,000,000 and are lower bounds at that ceiling.
After Stop, late input cannot alter records, counts or timestamps. Bad/backward clock
ends the window with unknown end time rather than fabricating a timestamp.

Interfaces:

- start() -> frozen snapshot; snapshot() -> latest frozen data, with deadline check.
- requestStart({requestId,at,url,method},context) -> private occurrence token|null.
- requestResponse(token,{at,status},context) -> boolean.
- requestEnd(token,{at,outcome},context) -> boolean; outcome finished/failed/cancelled/
  redirect. Token, not URL or same-valued payload, identifies one request occurrence.
- error({at,category,url?,line?,column?},context) -> boolean.
- checkpoint({at,node,changeKind,value?},context) -> boolean; snapshot/attribute/text/
  children metadata on the exact selected node; text excluded, boolean only if read.
- stop(reason) -> frozen snapshot with closed reason; clear() -> deleted snapshot,
  identity/target/records removed. Neither aborts an app request nor undoes an action.

`at` is an occurrence timestamp normalized by the trusted host into the same clock
as startedAt, not invented here. Refuse pre-start/future/out-of-order inputs. P04.2
must validate native clock mappings, request-ID/token ownership and DOM checkpoint
acquisition; these source tests establish no native event timing. A post-start read
checkpoint must not be called proof of when a preceding untimestamped DOM change ran.

Requests retain only opaque occurrence/native ID, standard method (unknown -> OTHER),
origin and explicit omitted route detail, HTTP status and observed timing/completion.
Raw path/query/credentials/fragment, headers, arbitrary bodies, source, exception
message/stack and form/text values never enter this ledger. Route equality below
origin remains unknown; repeated URLs are distinct occurrences, not a causal join.
Optional route-detail inclusion needs later explicit review integration, not a new
retention loophole. Error categories are closed standard classes/Unknown; locations
keep origin and numeric zero-based positions only, not file/source text.

All results are temporally observed during the window; causal dependency remains
unknown. Pending-at-stop means completion unobserved, not failed. Before Start/after
Stop history is not recorded; zero observed errors does not certify absence.

## Integration boundaries / alternatives

Selected: one bounded immutable ledger per caller-owned tab/window; its current
snapshot can be retained by reference in existing tab state. P04.2 must include that
same data in the existing3-tab/5MB cap and close owners on eviction/lifecycle loss;
no independent unbounded recorder/map or stored active-window resurrection.
Rejected: extend legacy body collection (privacy/authority mismatch); always-on
independent recorder/store (missing prehistory/retention violation).

P04.3 must add an explicitly dispatched historical profile or compatible envelope,
without modifying strict old minimal/reviewed profiles. Reuse U03/U06 reporting,
privacy, lineage and passive reader. F05/U02/A05 outcomes stay separately attributed;
this ledger does not claim they happened. No automatic actor execution/export join.

## Verification boundary

Source RED/GREEN: inertness/start/stop/delete, prehistory, exact context/target,
repeated/unrelated requests, HTTP/transport failure, missing start, timing order,
closed errors, text/body/query/source/privacy, getters, immutable snapshots, all
ceilings/clock gaps and cross-window tokens. Full source suite and unchanged current
47 package/source/install/host hashes. No new pack/native/human/release claim.
ONE whole-P04 review belongs at actual H07-H09 acceptance, not per foundation slice.
