# F05 host/runtime interface — Task 2 working decision

This refines the new [F05 contract](production-changes.md) before host code changes.
Task2 BASE `aa4c7b3`; implementation is split into a tested platform slice and a
runtime/wire/packed-native slice. Neither slice substitutes for real Settings.

The Chrome platform owns exactly one `createProductionChangePolicy` actor.
`describeTarget` adds its freshly checked `productionChange` status; ordinary
`readOnly` remains true for HTTPS. When active, only override/replay are added to
read/inject, never cache/reload. The lease records the grant ID and native document
scope that admitted it. An existing read-only lease cannot silently gain rights.

Host API (trusted in-process calls, never directly deserialized page input):

- `productionChanges.transition(stage, tabId, {ticket?, owner, viewId, assertCurrent})`
  for begin/advance/confirm. The owner is the real runtime inspector token, not a
  wire claim; `assertCurrent` checks that live token/cancellation after awaits.
- `cancel(ticket, owner, viewId)`, `close(owner, viewId?)`, `revoke(tabId, reason)`
  reduce authority. A view closes only its own tickets/grant; explicit Revoke may
  reduce any current grant for that tab. Missing/foreign browser ownership cannot
  obstruct logical revocation or cause cleanup of another consumer.
- Real document facts come from one main-frame isolated `() => null` script and
  Chrome's returned documentId, with origin/permission/authority epoch rechecked.
  This reads no app expression, getter, form or state. It is not an app effect.

Confirm retires the old read-only lease and returns explicit cleanup. The runtime
marks the old selection stale/unattached; explicit Attach/Inspect establishes a
new session with current grant capabilities. It never disables cache or resets
storage in HTTPS. Native response collection is limited to the active input scope;
it does not enable legacy code instrumentation or causal inference.

Logical revoke/expiry deletes authority synchronously. The platform independently
starts terminal owned cleanup and emits `production-revoked`; runtime closes its
editor and records stale/cleanup status. No runtime subscriber is required for
host cleanup. Pending/native-unknown cleanup stays explicit. Owner loss during
an awaited confirmation cannot create a later orphan grant/ticket.

Every owned production override/replay command validates the same live grant and
native document. The broker's additive trusted `beforeNative` callback runs after
guardian RPC admission and immediately before the native API. It never crosses
the guardian JSON channel. Cleanup-only Fetch.disable/continue can release owned
pauses after revocation; they grant no new writer. Native control execute also
rechecks the grant before the actual scripting call. In-flight effects admitted
before revocation can be unconfirmed or survive, as U02 already states.

The wire adds begin/advance/confirm/cancel/revoke/close, requiring bounded ownerId
and stage ticket where applicable. It accepts no client target/duration/capability
grant. Only the authenticated live inspector client may advance/create authority.
State exposes status/limits/cleanup, never private tickets or owner objects.
Runtime and host opt-in are both required; a source connection/map/diagnostic/model
cannot supply the missing grant. Production feature readiness remains unavailable
until the Settings acceptance slice.

Browser host permission is independent. The official
[Chrome permission API](https://developer.chrome.com/docs/extensions/reference/api/permissions?hl=en)
requires optional host declarations and a user gesture for permission requests;
permission contains/checks remain real. Native evidence will record the actual
isolated-browser permission route rather than simulate `permissions.contains`.
No customer data, published extension or user's installed profile is involved.
