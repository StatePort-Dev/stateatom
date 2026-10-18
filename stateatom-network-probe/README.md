# Exact initiator acquisition experiment

```sh
npm run verify:fetch-initiator
```

Use the root README's Linux/Chromium native prerequisites; no IDE is started. Run
native checks sequentially. `NET_TAG` selects an unused directory under
`.runtime/network-probes/`. Source identities, actual CDP script/request/context
records, acquisition off/on outcomes and unsupported consumers remain local there.

This acquisition-only harness uses a test hook around the existing observer's
source-consumption API. It observes five exact fetch Response consumptions and
three direct JSON fulfillments in the unchanged original app. Both sides retain
the same source-consumption instrumentation; the separate consumption harness
compares that instrumentation with the original uninstrumented app. Two race JSON
promises adopted through Promise.all remain unknown; no new Promise reaction is
added to obtain them. The test hook logs fulfillment/type before the core
eligibility check; that count is not proof of an accepted original JSON snapshot.
It is **not integrated into the product worker/panel**, and
neither the HTTP path nor current value ancestry becomes complete.

Each eligible call compiles one constant private passthrough, calls native fetch
with unchanged receiver/arguments and returns its original promise. A binding
requires exact compiled source/scriptId, topmost synchronous native-call site,
main execution context/frame, a unique browser request ID with no redirect hops
and an actual non-service-worker response. URL/time/ordinal/value equality never
fills a gap. Standard intrinsics at bootstrap are a precondition, not attestation.

Controls retain unhandled rejection identities, original app/request metadata,
getters/errors, repeated same-URL out-of-order responses, saved native fetch inside
an init getter, another frame, a duplicate source URL/different body, redirect
request-ID reuse, service-worker response, 32-script budget and CSP refusal. CSP
is triggered by a real page button and never bypassed. Failure to acquire remains
Unknown and the native fetch still runs. Retain the earlier failed runs; the
refreshed result does not establish framework state/async/cache/write lineage.

## Restricted product integration

The earlier `run.mjs` remains a separate historical test-hook probe. The opt-in
product implementation uses the existing observer and worker, with one matcher:

```sh
npm run dev:react-http
npm run verify:fetch-product
npm run verify:fetch-ui
```

Stop the separate dev server before running native verification commands. The
product mechanism writes new `.runtime/fetch-product-runs/<NET_TAG>/` records;
UI checks use `.runtime/react-host-ui-runs/<HOST_UI_TAG>/`. The latter operates the
real panel/IDE and reviewed exports, including explicit CSP Unknown and a fresh
offline reader. `fetchInitiators` stays off in ordinary dev and host-props modes.
Without the open extension's current-document preflight, acquisition stays Unknown.

The final gate supports **static document policy only**, with standard intrinsics.
Worker observations of enforced or report-only CSP deny generation; the SDK also
rejects current CSP meta and observed head/root changes before any Function attempt.
Permission is bound to a system-unique context and checked against the actual
loader/frame. No CSP capability probe or bypass is performed. Previously installed
then removed dynamic CSP before observer bootstrap is not excluded; do not claim
general CSP semantic equivalence. The earlier constructor-catch approach generated
an extra observable CSP event and is retained as a failed control.

Observed request identity is limited to the exact fetch/Response exchange. Parsed
field identity and actual read values are retained, with current value ancestry
Unknown. State/async/write history and the original complete deep criteria remain
unestablished. A negative-control pass is not support for that unsupported path.
