# V02.26 — exact ledger byte sizing without repeated frozen-row serialization

Bounded source correction, base6ed93d1. Full21/29 unchanged. V02.25 is already
closed in215: webRequest has no established drop-in parity under current host
permissions. The next pointer in234 briefly reused that completed identifier;
this item is distinct and does not reopen215 or any native/model/CA campaign.

Current core/production-observations.mjs serializes and UTF8-encodes the complete
candidate on every request start/response/end/checkpoint to enforce its exact byte
limit. Snapshots already reuse frozen state; no snapshot-cloning defect is claimed.
A20request/60transition source witness can count repeated serialization of unchanged
records. This is a finite source cost, not proof of the measured Chrome root cause.

Keep JSON bytes, limits/reserve, all counts/gaps/timing/order/identity/pending and
terminal semantics exact. Size candidate metadata with records:[]; add each exact
record's UTF8 JSON byte length and array comma bytes. Cache only frozen internal
records in an owner-local WeakMap; mutable newly-built candidates are not cached.
Inherited Object/Array custom JSON or a nonstandard Array prototype chain returns
to the original full serializer, without reading/invoking formatting accessors in
the new guard.
No all-history strong map, public fields, batching/omission or permission changes.
No input expression/getter/callback is reevaluated. Projection data are the same
normalized inert internal records; full serialized-size boundary remains authority.

New focused source controls must first show RED for repeated record serialization.
Then verify every normalized record/byte boundary via independent complete JSON
size/oracle; pending completion, status digit changes, gaps, stopped/deleted states,
old snapshot immutability and cross-window isolation. Existing ledger/native DTO/
runtime publication/observation/export tests stay unchanged and run as affected.
Full source check after a concrete correction, syntax/diff/self-review before commit.

The only runtime product file is core/production-observations.mjs; Atom changelog
adds an unversioned factual source note. New test file:
tests/production-observation-size.test.mjs. Before source and exact hash retained in
.artifacts/v02/ledger-size-source/2026-10-27/. No measurement, build, pack, browser,
model, new TLS or host change in this item. Official83 and all frozen evidence retain
their exact old bytes; a changed producer does not silently update that host.

## Result

Source TDD: original20request/60transition witness RED630 record serializations;
new source79. First4tests PASS. Additional inherited Object/Array key-sensitive
formatting RED2→GREEN6 protects complete JSON byte authority. One fresh scoped
read-only reviewer found0Critical/1Important: an indirect Array.prototype ancestor
could still hide bytes (4686actual versus4096budget). New seventh test reproduces
RED and one correction detects nonstandard ancestry before using the cache.
No rereview or further agent chain. Final affected169PASS/5548.305729ms; source
300trials/30000operation+snapshot differential against exact saved old source PASS.

Full suite first sandbox run5808PASS/53FAIL with child CLI/mkfifoEPERM (5861executed);
all raw failures retained. Escalated pre-review source5867PASS/164213.217607ms;
this does not cover the later seventh test/ancestry correction. Final post-correction
full npm test **5868PASS/0FAIL/0SKIP**,161403.299921ms. Syntax2/diff PASS.
Closed source item; actual native overhead remains unmeasured for these changed bytes. No new native/model/measurement/CA work. Original active overhead28.1136/21.0570% still
MISS10%; useful Basic p95402.7/399.2ms remains historical. No performance acceptance.


Final source SHA256 `03cf20afe66bf7970048e2d1d8de282415ceef09075c6e633f40b56e441ca6fd`;
before6ffc835861ee612f97778ba111e8bbdb8cef6d371552ad5c645167a172f133f0.
Against83receipt,269/270source and325/327build inputs remain exact; intentional
changes are core ledger and Atom changelog. Existing83tarball/official host bytes
are untouched and historical for the new producer source. Own checkpoint/source/
tests/differential/review/raw logs retained under the stated artifact directory.
One next bounded item [V02.27](236-v02-current84-local-package.md): new immutable84,
exact package/type admission and existing input-lifetime backend13 (not ledger/
performance qualification). No whole-task/count/threshold/dependency waiver.
