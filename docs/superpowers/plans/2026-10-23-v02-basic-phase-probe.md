# V02.2 Basic request phase probe preregistration

Extension to the frozen V02.2 plan, written before the phase probe. Executor ruling:
the transport controls did not explain UI latency. Exact source transport.mjs shows
all existing owned UI requests dynamically call chrome.runtime.sendMessage; measuring
that own-inspector boundary is sufficient to split inspect-selector/state cost.
Use this smaller surface instead of worker command/storage monkeypatching. No new
app or worker instrumentation, no response/payload-body recording.

Exact unchanged Atom60/UI pair and existing synthetic V02 fixture. Both hosts,
isolated native trusted HTTPS/Allow. Per host3 fixed warmup then12 measured lookups,
30 total across both hosts. Explicit native Detach/Attach before every lookup;
fill #run outside timing; actual inspector pointerdown -> useful text/OK -> two
frames. Do not run the original app action: output remains null/counter0 throughout.
No adaptive counts/trimming/retries; incomplete attempts retained.

Install only a timing wrapper around chrome.runtime.sendMessage in the inspector
document. Return the exact original Promise/result and propagate original synchronous
throw; never send an extra message. Log only owned `inspect-selector`/`state` operation
name, state refreshDeep boolean, timing/success/ordinal (never selector/id/token,
message arguments or response values). Fixed32-row cap per lookup; overflow,
pending RPC, absent/failed expected operation or wrong selection invalidates probe.
Unit controls verify exact original Promise/argument/receiver/error identity,
no private-field/result reads, bounded logging/reset/restore.

Capture same-realm UI/RPC intervals and sequential trace, p50/p95/max per host and
operation. Instrumented request durations include transport/runtime work; they do
not isolate worker CPU or prove which native call dominates. The existing UI source
and scoped runtime control may establish whether an immediate state refresh repeats
observation, before any product change. Preserve101 target misses and existing224
transport controls; no performance acceptance or waiver. A new candidate/same full
measurement protocol is needed for any product fix.

Files: tests/helpers/inspector-rpc-phase-probe.mjs,
tests/atom/inspector-rpc-phase-probe.test.mjs,
tests/integration/basic-request-phases-native.mjs. Newly declared command:
`node tests/integration/basic-request-phases-native.mjs <exact-handoff>`.
This remains Task2 of V02.2, not a separate broad framework. ONE whole V02.2 review
covers both transport controls and this probe after actual results.
