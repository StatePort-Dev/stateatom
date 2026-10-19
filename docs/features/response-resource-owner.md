# U02 response resource owner — working decision

This is a new architecture decision during the autonomous 2026-10-19 run, not
an answer previously approved in scope-review-1. The U02 field editor remains
in progress. SDK, other repositories, publication and a replacement UI are out.

## Evidence that requires this dependency

- .16 native response effects/undo/baseline/external-revision controls passed in
  standalone, but stopping its service worker left native Fetch active. The next
  actual app request hung. The restarted runtime correctly refused old metadata
  as authority. `.artifacts/u02/response-native/2026-10-19T18-37-10-451Z/results.json`.
- .17 closes the worker-only mutation route. Full755/focused92, packed types2,
  admission7 and both-host native refusal3 pass. This is gate readiness only.
- `npm run verify:input-owner-lifetime -- <exact .17 handoff>` then used a fresh
  synthetic profile and an extension-document native client. Actual response
  modification survived worker stop, but closing that document left debugger
  attached and the next request pending. No errors occurred in the two response
  controls; driver/fixture hashes stayed unchanged. Result:
  `.artifacts/u02/owner-lifetime/2026-10-19T18-49-33-244Z/results.json`, status
  `OBSERVED_OWNER_CLOSE_UNSAFE`. This is a negative owner-lifetime result, not
  production recovery or field-mode acceptance. Both temporary browsers closed.

[Chrome's lifecycle documentation](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)
describes active debugger keepalive. It does not establish forced-stop cleanup.
[Offscreen API documentation](https://developer.chrome.com/docs/extensions/reference/api/offscreen)
limits extension APIs there to runtime, permits one open document per profile,
and provides WORKERS for an offscreen document that actually spawns workers.
Non-audio reasons do not impose the audio inactivity lifetime. No restricted
API access, iframe workaround, artificial audio or arbitrary keepalive is added.

## Chosen next implementation

Keep the actual lease registry alive in a dedicated Worker spawned by a bundled
offscreen document. The document uses only runtime messaging and native Worker
APIs. Native debugger calls stay in the service worker. It is a host-owned shared
broker for every debugger consumer; Atom shutdown releases Atom's leases only.
A lost host-worker connection closes leases belonging to that connection, while
leases on other live connections remain foreign and untouched.

The guardian never serializes authority to storage. It retains opaque lease and
client identities in live memory. On worker disconnect it marks that client's
leases closing, refuses new acquisition of their tabs and queues cleanup-only
work. A freshly started worker may receive that work only from the exact bundled
guardian peer, authenticated by Chrome sender identity plus a fresh channel
handshake. It may disable owned Fetch, undo an owned cache-disable setting where
that grant existed, and detach the exact old lease. It cannot replay a saved
plan, read application bodies, restore app state or acquire the lease as live.
The closing lock persists until actual cleanup acknowledgement; failure does not
become a successful release. There is no implicit adoption by owner label.

Normal commands still require a current local lease object, current guardian
client/token, every actual grant and the platform's fresh exact origin/permission
checks. Cleanup comes from the live registry's lease, never restored tab metadata.
Native detach is the final barrier before another consumer can attach. Late
commands/replies from a lost incarnation cannot act on a later lease.

If the guardian disappears while the worker remains, that worker retires only
its current in-memory leases before new acquisition. No stored receipt grants
foreign cleanup. The implementation must distinguish a known closed native
session from an unconfirmed detach failure. Multiple simultaneous context failure
is not presumed safe; retain unsupported/unknown states rather than a blanket
crash-recovery claim.

Existing unrelated offscreen documents must not be closed/replaced. An unsupported
host, unavailable permission/API, slot conflict, failed handshake or unresolved
cleanup leaves `workerIndependent=false` and response editing gated. Official
StatePort intake stays a separate repository/task; these changes cover the Atom
package and its standalone/embedding examples only. No host contract is declared
implemented by this design document.

## Bounded implementation cycles and checks

1. U02.2c.1: record the native owner-lifetime experiment and this decision; commit.
2. U02.2c.2: pure live registry/protocol with client identity, grant enforcement,
   closing locks, foreign leases, loss/cleanup ack, late replies, hard budgets;
   real RED/GREEN unit cases and local commit. No runtime safety advertisement.
3. U02.2c.3: exact trusted Chrome peers, offscreen Worker assets, optional shared
   broker adapter, typed host wiring, permission/slot refusal and cleanup executor;
   native single-context fault controls and a new immutable candidate. Commit
   only measured bounded results. The .17 gate stays until safety is proven.
4. Then run the response matrix in both packed hosts, active-Fetch worker stop,
   inspector closure/reopen, guardian loss, capture-like foreign lease, denied
   origin/grant and cancellation. Keep legacy criteria and field UI acceptance
   separate. U02 still needs native controls, both field modes and >9/18 actual
   preregistered rows in both modes; current verified field-mode count is 0/18.

### U02.2c.2 inert registry interface

`createDebuggerGuardian({commandCapability,now})` constructs fresh live authority;
there is no restore/import operation. The trusted constructor supplies the existing
command-to-grant policy. `connect()` creates an opaque current host-client token.
`acquire(client,{tabId,origin,owner,capabilities})` exclusively allocates a tab and
returns an opaque lease; a matching owner label is never adoption. `verify` checks
the current exact client/lease/grant. `begin(client,lease,{kind,method?})` creates
an attach/command ticket; `finish(client,ticket,{ok})` acknowledges that one call.
Commands require acknowledged attachment and the actual method grant. Attach
failure acknowledgement means not attached; loss during pending attach is unknown.

`release` or `disconnect` revokes tickets. Unused allocation can be freed directly;
known/potential native attachment stays locked in closing. `claimCleanup(client)`
issues fixed cleanup-only grants for closing leases. `finishCleanup` accepts only
current executor/token and detached/already-detached/failed outcomes. Failure
blocks further automatic retry; `retryCleanup` is explicit. Lost executor claims
rotate, so late replies cannot release a later incarnation. Active foreign leases
never enter cleanup. `status` and `snapshot` expose scoped metadata without tokens.
Bounds: 8 active clients, 16 leases, 128 in-flight tickets / 32 per lease, 128
redacted event records with an explicit dropped count. Protocol records are inert
flat data; accessors and conversion hooks are refused without invocation.

This library cannot attest a Chrome call. Node results model trusted native
acknowledgements; only the later exact-peer/native bridge can establish that they
came from actual commands. No worker-independent capability follows from pure
registry tests. Production grants and Settings lifetime remain F05 work.


Before an actual native attach, the Chrome adapter must inspect current native
attachment and refuse an unknown existing session before marking any attach
attempt in the registry. A pre-existing debugger client is not adopted or given
cleanup authority because a new registry is empty. Pending attachment cleanup
assumes the shared host broker's exclusive allocation and the extension's native
client; unrelated same-extension consumers must use that same broker. Native
Chrome authentication continues to protect other extensions / DevTools clients.
The pure registry alone cannot prove this browser precondition.
