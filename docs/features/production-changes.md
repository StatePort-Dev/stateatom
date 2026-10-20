# Two-confirmation production changes — F05 working contract

This is a new implementation decision under `scope-review-1`, not a previously
approved lifetime or target policy. F02/U02 are complete; their historical evidence
and all experiment criteria remain unchanged. F05 does not enable SDK, Capture,
Action Trace, source access, arbitrary backend commands or public release.

## Authority and lifetime

Production means HTTPS here. Initial inspection remains read-only. A grant covers
one exact scheme/host/port, Chrome tab ID and **native main-frame document ID**,
for **10 minutes** from the second confirmation. It permits only supported U02
JSON-response scalars and native controls. It does not permit legacy reload/cache/
storage-reset trials, arbitrary scripts, additional API origins or other tabs.
Browser origin permission, an owned live debugger lease, current selection and
resource revisions, and each adapter's existing constraints are still required.

No grant or confirmation ticket is persisted, imported or restored. Reload,
navigation (including same-origin document replacement and URL changes), browser
permission loss, issuing inspector-client/view closure, worker/runtime restart,
update and explicit revocation invalidate it. Closing Settings after enabling
keeps the inspector's bounded grant; closing its owning mounted view or switching
that view to another selected tab revokes it.
Expiry uses the host clock and rejects rollback/invalid clock readings rather
than extending existing authority. Already admitted application/server effects
may survive revocation; cleanup removes owned writers, never promises server undo.

The host samples Chrome's main-frame document ID with a fixed isolated constant
function, never an application expression/getter. It revalidates permission,
origin/document and grant at admission and immediately before native changes.
The same live policy instance supplies runtime discovery and the host lease
guard. Guardian authority remains live/worker-independent; storage cannot revive it.

## Settings sequence

Settings names the exact current origin/tab and uses the supplied Domains
reference (`05.1`, `source/extension.js`, `08-settings-domains.png`). It adapts that
wide prototype to the existing 440px Atom host as a single-origin Settings view,
with existing shared typography/tokens/buttons and a Back to tab control. This
is a necessary layout adaptation, not a new shared-UI design or simulated feature.

1. Start a private, view-bound risk ticket. Warning: live handlers and resulting
   network operations can affect a real application/server. Cancel changes no
   app state and grants nothing. Explicit Continue acknowledges only this warning.
2. A new one-use ticket presents the exact tab/origin, current-document-only scope,
   10-minute limit, supported inputs and limits of local undo. Explicit Enable
   creates the grant. A first-step ticket cannot perform this operation.

Tickets expire after two minutes total and are bound to the exact live inspector
client/view and target. Competing Settings views cannot combine steps; successful
confirmation/revocation invalidates other tickets for that tab. Enabling performs
no app request/reload/cache/storage reset, handler invocation or input edit. The
old read-only debugger lease is retired; explicit attach/inspect acquires the
new bounded capabilities without cache disabling or automatic app work.

An always-visible production state names Read-only or Changes enabled and offers
immediate Return to read-only. Every supported Live/Draft action still checks
the current grant. Revocation is logical immediately, then completes or explicitly
reports owned cleanup; foreign leases remain untouched. Unsent drafts stay local
and read-only according to U02, with no reconnect/authority adoption.

## Verification boundary

First deliverable is an inert policy model: two distinct tickets, exact scope,
expiry/revoke, replay/forgery, two views, cancellation, owner loss and inert-data
checks. It is not browser/native authority and leaves production unavailable.
Then integrate host/runtime guards, Settings and packed declarations. Prove default
denial separately from enabled Live/Draft on synthetic production-like HTTPS in
both local hosts. Browser host permission and Settings consent are distinct gates;
record exactly how real browser access was granted. No customer production data.
Include no-grant/first-only/cancel, changed tab/origin/document, expiry, revoke,
forged direct operation, restart/navigation, two Settings views and foreign lease.
Preserve old failures and native evidence under their original identities.
