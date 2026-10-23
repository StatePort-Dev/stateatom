# V02.2 transport and Basic phase diagnosis

> **For agentic workers:** Use superpowers:executing-plans inline, ONE final fresh-context review of the bounded diagnostic parent.

**Goal:** explain the measured V02.1 misses with controlled diagnostics before choosing any product fix.

**Architecture:** reuse the exact .60 pair and fixed original20-GET/1024-byte workload. First compare an unattached app, a harness-only Network connection, a harness-only connection with all Basic domains, and actual Basic. Separately observe worker command/storage timings during actual manual lookup; instrumented results are diagnostic, never a replacement target measurement.

**Tech Stack:** existing native Chrome153/Node24/HTTPS/X11 helpers; official Context7 CDP/Chrome debugger docs consulted. No new package dependency or modification of existing frozen measurement helpers/product/build inputs.

**Authority:** V02 targets/unchanged baseline101, approved scope-review-1, autonomous main/task-commit user instruction. Choices below are executor decisions. No target waiver, workload scaling, SDK, release, other repository or redesign.

## Task1: preregistered transport floor

**Files:** create `tests/helpers/observer-transport-floor.mjs`, `tests/atom/observer-transport-floor.test.mjs`, `tests/integration/observer-transport-floor-native.mjs`.

**Interfaces:** fixed four-mode `transportOrder()` and strict `summarizeTransport(rows,host)`; native driver writes preregistration/ordered raw rows/source hashes/results before reporting.

- [ ] RED/GREEN strict counts/order/identity/finite/trusted/payload checks and outlier preservation. No diagnostic summary can claim approved target PASS.
- [ ] Fixed modes: `off` (no debugger); `network` (harness alone attaches and enables Network with Basic buffer sizes); `full` (harness alone enables Network/Page/Runtime/Debugger/Performance, exact Basic parameters); `atom-basic` (actual native Attach + manual #run text lookup). Single app connection at a time; Atom must remain detached for raw modes. Native target attached state and enabled-domain list checked outside timing. Explicit detach between every trial. Raw controls bypass the Atom broker intentionally, receive no edit grant and are labelled nonproduct diagnostic controls.
- [ ] Exact V02.1 fixture/actor/timing/readback and archive bytes. All24 mode permutations once =24 measured paired blocks/96 workloads per host. First four permutations are fixed warmup blocks/16 workloads. Both hosts sequentially:224 raw/192 measured/32 warmup. No adaptive retries/trimming/count or workload changes. Capture every trial before cleanup and preserve incomplete attempts.
- [ ] Syntax/protocol tests/diff check, commit before native measurement. Run `node tests/integration/observer-transport-floor-native.mjs <exact-handoff>`.
- [ ] Compare raw ratios/median/p95/tails to off and each other. This includes Chrome extension event-delivery/guard overhead, not pure browser-engine cost. Domain controls can narrow contribution, not identify every subdomain or waive101 misses.

## Task2: bounded Basic command phase probe

**Files:** create a small isolated worker-probe helper/native diagnostic driver only if Task1 does not by itself explain the UI latency miss. Reuse actual lookup UI, no target app debugger client or app function invocation.

- [ ] Before running, append a separate probe preregistration with fixed sample counts and exact instrumentation surface. Limit logs to command/storage names, start/end timings and success (no arguments, app values, credentials or bodies). Preserve original API Promise identity/return/error behavior; instrumented timings are separate diagnostic evidence.
- [ ] Use actual native inspector lookup on same .60; record UI timer and all wrapper intervals to distinguish command/await vs unaccounted/render delay. Keep any probe/setup failure and do not adjust performance target/workload.
- [ ] If phase observation cannot be made without changing product/app semantics, stop this probe explicitly unsupported rather than guess. Do not add a general instrumentation framework.

## Task3: report, ONE review and local commit

- [ ] Keep original101 metrics/hashes/failed targets. Record exact control/probe results and limitations, target outcomes unchanged, source revision/configuration/environment. Choose ONE next bounded cause/fix from actual evidence.
- [ ] ONE read-only fresh-context whole V02.2 review, then at most one material correction pass (RED/GREEN and relevant suite). No broad audit/native repetition without a specific reason.
- [ ] Commit diagnosis/status/dependencies. V02 stays open,19/29 whole tasks; no release-ready claim.

Review Focus: no concurrent app debugger clients; raw controls cannot be counted as product modes; identical workload/foreground geometry across modes; fixed warmup/order/payload validity; bounded timing-only worker instrumentation must preserve API Promise identity and avoid content leakage. Mode/order/analyzer failures are unit-tested; native ownership/timing is actual integration evidence.
