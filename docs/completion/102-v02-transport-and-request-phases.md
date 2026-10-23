# V02.2 — controlled transport floor and Basic request phases

2026-10-23. Finite diagnostic work completed on unchanged Atom60/UI2; ONE whole
V02.2 review pending. **V02.1's performance misses remain open and unwaived.
V02 remains in progress;19/29 whole tasks (~66% equal count), not release readiness.**
No product/UI/build/package change, app instrumentation, cloud/model/API call,
publication, new dependency, SDK or other-repository edit.

## Preregistered transport controls

[Plan](../superpowers/plans/2026-10-23-v02-transport-diagnosis.md), committed
`76c3319` before native measurements. Exact .60 handoff:
`.artifacts/atom/2026-10-23T07-59-52-553Z/atom-handoff.json`.
New command (no existing package script claimed):

```sh
node tests/integration/observer-transport-floor-native.mjs \
  .artifacts/atom/2026-10-23T07-59-52-553Z/atom-handoff.json
```

Same original20 sequential GETs/1024 bytes/counter updates/final two app frames,
trusted X11 actor and100ms ISOLATED DOM JSON readback as101. Both native Chrome153
hosts, private disposable root import and site Allow, read-only/no editing grant,
no TLS bypass/preapproval or parallel app CDP. Four controls, each explicitly
released before the next:

- Off: no attached debugger.
- Network: harness alone directly attaches/enables Network with Basic buffers.
- Full: harness alone attaches/enables Network/Page/Runtime/Debugger/Performance,
  same parameters as Basic. Atom stays detached; the broker intentionally does
  not own this diagnostic connection, so its runtime guard returns before capture.
- Atom Basic: actual native Attach + manual #run text lookup.

Raw controls are **not product modes**. They include browser/extension event
routing and guards, not pure browser-engine cost. Native target attached state,
Atom state, declared enabled domains/actual issued commands and no edit grant are
recorded outside workload timing. Exactly24 mode permutations once:24 measured
paired blocks/96 workloads per host, plus first four fixed warmup permutations/
16 workloads.224 total raw,192 measured,32 warmup. No retry, trimming, changed
workload or reordered sample;0 inspector errors/warnings.

| Workload median ms | Standalone | Embedding |
| --- | ---: | ---: |
| Off |59.15|58.15|
| Network control |62.20|60.35|
| Full-domain control |62.80|61.80|
| Actual Atom Basic |61.25|65.75|
| Network / Off degradation |5.1564%|3.7833%|
| Full / Off degradation |6.1708%|6.2769%|
| Atom Basic / Off degradation |3.5503%|13.0696%|

All ordered samples, p95/max/tails and paired ratios remain raw and summarized.
These results narrow the transport contribution; they do not explain every101
miss, isolate a specific domain or establish a browser-intrinsic lower bound.
The difference from101's Basic/off22.42/18.66% is observed run-to-run variation,
not proof of a product improvement, CPU cause or a replacement baseline. No active
P04 collector was running in these controls and no active/off target is passed.

Receipt:
`.artifacts/v02/transport-floor/2026-10-23T09-15-10-578Z/`:
preregistration,224 raw rows, native log/results, source/archive/host verification.

## Smaller own-inspector request phase probe

Transport controls did not explain UI delay. Exact existing source transport.mjs
shows the owned client dynamically uses chrome.runtime.sendMessage. Executor
ruling: narrow the planned worker command/storage instrumentation to timing this
existing own-inspector API; it separates request phases with less instrumentation.
No worker/app injection, extra request, private message/response inspection or
product edit. This is a choice made here, not a newly approved product design.

[Separate preregistration](../superpowers/plans/2026-10-23-v02-basic-phase-probe.md),
committed `46397c8` before launch; same immutable candidate/HTTPS/native hosts.

```sh
node tests/integration/basic-request-phases-native.mjs \
  .artifacts/atom/2026-10-23T07-59-52-553Z/atom-handoff.json
```

Per host3 fixed warmup then12 measured manual lookups, native Detach/Attach before
each, setup/fill excluded. The app action never runs: fixture output stays null,
counter0. Own-inspector wrapper returns the exact original Promise/result/error,
forwards argument and receiver identities and sends no additional message. It
logs only existing owned inspect-selector/state operation name, refreshDeep flag,
same-realm timing/success/ordinal. Fixed32-row cap; pending/overflow/error/missing
phase invalidates the probe. No arguments, selector/token or response values in
the RPC log. UI itself shows the known synthetic selected #run text.

All30 raw lookups completed,24 measured/six warmup, two owned requests each:
inspect-selector followed by state with **refreshDeep=true**, no overlapping or
foreign response credited.0 inspector errors/warnings. Diagnostic timings:

| Measured p50 / p95 / max ms | Standalone | Embedding |
| --- | ---: | ---: |
| UI gesture → useful snapshot + two frames |568.60 /814.80 /814.80|567.85 /599.60 /599.60|
| inspect-selector RPC |320.30 /537.90 /537.90|317.60 /343.90 /343.90|
| immediate deep state RPC |239.45 /266.20 /266.20|242.00 /260.60 /260.60|

This is instrumented diagnostic evidence, not a fresh uninstrumented101 target
measurement. Costs include transport/runtime awaits, not isolated worker CPU.
Existing UI sends the deep state after its successful explicit inspection;
runtime's deep state path refreshes native action metadata/selected observation
again. The record establishes a separate ~240ms immediate phase on this app,
not the cause of every tail or active/off degradation.

Receipt:
`.artifacts/v02/basic-request-phases/2026-10-23T09-23-16-711Z/`:
preregistration, probe/driver copies,30 ordered traces, native results/log,
verification and protocol RED/GREEN logs. Both diagnostics match exact original
before/after/current inputs, all268 product + build inputs, archives/installed
pair/both host manifests. Source checks13/13 PASS,0skip, syntax/diff PASS. The
floor analyzer rejects missing/changed/order/payload/untrusted/foreign/single-owner
mismatch; probe controls pin Promise/receiver/argument/response/error identity,
no private reads, cap/pending/reset/restore. These source controls are not native
performance acceptance. No full suite repeated for unchanged product.

## Dependencies and next ONE step

Full V02 modes/corpus/lifecycle and101 target misses remain open. Mandatory L02
still needs useful real inference; A05 stays mandatory/scoped complete, A02 open.
No independent-human blocker; no release/integration/SDK boundary is waived.

Next bounded **V02.3**: eliminate the immediate duplicate deep refresh only after
a successful explicit same-context inspection, retaining actual snapshot identity,
error recovery, property/tab/invalidation behavior and ordinary deep-refresh paths.
Prove those boundaries before product changes, qualify a new exact candidate,
and rerun101's unchanged protocol. The current measurements do not pre-approve
relaxing freshness or removing checks, or promise either target will then pass.
