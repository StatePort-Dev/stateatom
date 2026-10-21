# A05.3d — finite installed resource and timing controls

2026-10-21, BASEa1cf3d6, unchanged exact Atom .20261021.20/UI .20261018.2 pair
and Vite plugin .20261021.1. Only native test driver, synthetic workload and an
additional action-disabled test-server mode change. This is not a new package,
source/compiler mechanism, UI redesign or whole-A05 acceptance.

## Preregistered question and method

.artifacts/a05/resource-controls/preregistration.json predates both native runs.
Seven fresh documents per mode/host, two real native warmup clicks then one measured
click. Every click executes50 original synchronous leaf calls. All three modes
retain the same existing property instrumentation: Action Trace OFF; ON/unarmed;
ON/armed. Actual served compiled modules verify presence/absence of action body
instrumentation. Original app outputs are semantic controls, never analyzer input.

Fixed finite guards: default64record limit, serialized trace at most65536bytes,
handler median≤50ms/p95≤100ms, app native-task p95≤250ms, listener-count delta≤4.
These are local regression guards registered before measurement, not new approved
product SLOs or general performance/memory acceptance. Handler self-time excludes
root entry/leave; native TaskDuration includes collector and metadata probes.
Heap/node/document totals are descriptive. No forced GC, heap/object/argument or
function-body capture. Native protocol metadata uses Atom's existing app debugger;
no parallel app CDP attachment or app facade.

## Actual results

`node tests/integration/action-trace-native.mjs <exact .20 handoff> --resource-controls`
→ .artifacts/a05/resource-native/2026-10-21T11-47-27-369Z/results.json:
11 PASS, errors/console empty,42measured interactions,14armed traces, before/after
source/consumer/workspace inputs identical. Normal isolated browser/server/IDE
cleanup completes. No threshold or original semantic predicate changed.
All four isolated Chrome profiles record153.0.8010.12 in their Last Version files;
the verifier seals these actual profile records alongside the numerical results.

| Host / Action Trace mode | Handler median ms | Handler sample p95 ms | Native app-task sample p95 ms |
|---|---:|---:|---:|
| Standalone / OFF | 0.60 | 0.70 | 4.73 |
| Standalone / ON, unarmed | 0.70 | 0.80 | 5.80 |
| Standalone / ON, armed | 1.10 | 1.10 | 28.95 |
| Embedding / OFF | 0.60 | 0.70 | 4.83 |
| Embedding / ON, unarmed | 0.70 | 0.90 | 8.15 |
| Embedding / ON, armed | 1.10 | 1.20 | 25.67 |

Every mode retains the same150 original calls after warmups+measurement. Armed
collection stops at exactly64records: one dispatch,32body entries,31leaves. Original
50-call action completes; omitted later calls and root exit are not invented.
Status is partial, stored reason says record budget ended, asyncEffects stays
Unlinked and runtimeFunctionObjectIdentity Unavailable. Largest serialized trace
is24905bytes. The UI says evidence incomplete and root exit unavailable; it does
not present this as a complete call graph.

Cancel/Clear in the same document preserve later original effects and leave zero
recorded rows for later unarmed clicks. Native listener-counter delta peaks at+2,
within the registered≤4 guard; negative deltas also occur as garbage is collected.
This counter is not proof of zero live listeners or universal leak freedom. Fresh
documents deliberately isolate measurement from prior property-retention budgets;
long-session/full-resource acceptance remains V02's distinct task.

Actual390/1100 screenshots show32bounded rows, existing13px root typography and
secondary row styling, no horizontal overflow, and vertical scrolling. Candidate
standalone390 was visually inspected against the retained Actions layout. No CSS,
shared tokens/primitives or font size changed; screenshots are not human approval.

## Failed first run and verification

11-45-00 first run passes standalone unarmed/armed/cleanup, then Page.captureScreenshot
times out: the actual app tab remained active after native click and the inspector
target was backgrounded. The driver now explicitly brings the inspector forward
and waits for native frame/fonts before capture. Same timeout/viewport/criteria;
no product or performance fix. Original FAIL4 and its actual measurements remain.
The new row-count probe also uses the existing p elements, not li elements.

`node .artifacts/a05/resource-controls/verify.mjs` verifies exact preregistration,
all42samples/14traces, unchanged product sources and immutable pair, compiled mode
proof, cleanup outputs and candidate images in verification.json. Source1782/
focused584/types2/admission7 remain the previously verified .20 results; no new
source test run is claimed for this test-only increment. No reason to rebuild the
same archive or rerun historical compiler/observer/native campaigns.

The existing default native trace help assertion is updated from the historical
temporary report exclusion to the implemented historical-save wording; the old
archived driver/result remains unchanged. This does not alter invocation criteria.

Next bounded item: original A05 concurrent unrelated request / replaced-handler
controls and retained-matrix reconciliation. Production is still explicitly
unsupported for Action Trace; read-only policy and lack of F05 authority transfer
must remain explicit. Async/state/network effects remain unlinked. ONE whole-A05
review follows its remaining registered acceptance, not this local timing result.
No SDK, publication, other repository or independent-human blocker.
