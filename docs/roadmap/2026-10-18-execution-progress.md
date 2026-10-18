# Compiled inventory and ownership boundary experiments

Revision `bcde3d0f1572878df662db6bab79e65bc66dd6d0`, dirty input manifests retained
with each run. No original experiment or full-path threshold changed. This follows
the [state/write checkpoint](2026-10-18-state-write-progress.md).

## Native acquisition, separate from UI

`EXECUTION_TAG=compiled-inventory-drained-20261018 npm run verify:compiled-inventory`
passed **7 native acquisition/control checks**, with stable experiment/product
inputs and listed dependency disk snapshot. Result:
`.runtime/execution-probes/compiled-inventory-drained-20261018/results.json`.
The unchanged original app still rendered P1=13 and P2 disabled=false.

At the positive checkpoint there were **15 captured compiled sources**, **14 exact
main-default matches**, **one explicitly isolated world**, **zero unknown**, and
**zero pending source lookups**. Included sources cover App, runtime, shared modules,
React/DOM, QueryClient, Vite and actual dependency chunks. Comparison uses final
trusted server response bytes and full import URLs, not source maps or normalized
imports. The actual browser context unique IDs and script IDs remain in the record.

Real anonymous code, forged server sourceURL, same-URL reload after invalidation,
dependency substitution with unchanged App source, and late attachment all produce
Unknown. Unit controls additionally cover wrong inline offsets, budget/source loss,
missing world metadata, context clear/loss and source-lookup races. Review caught
missing baseline enforcement, unknown contexts mislabeled isolated, missing context
clear handling, dropped unknown records, and an async getScriptSource race. Each was
fixed with a retained regression. Source notification now invalidates immediately;
checkpoint requires completed source requests and stable generation between bounded
CDP barriers. Previous failed runs remain retained.

**These are compiled sources, not proof of execution.** A content match does not
prove that a specific response created the script. Dependency disk hashes are only
the listed byte snapshot, not evidence of all loaded compiler inputs. This is not
whole-page/worker/realm coverage, runtime attestation, ownership, readonly effects
or current HTTP field ancestry. `fullPath:false` remains invariant. Nothing from
this experiment has been integrated into the product as a provenance certificate.

Read-only source review found no remaining concrete blocker in this restricted
inventory claim. It ran the 12 model checks, not another native or UI run.

## Concrete ownership counterexamples

`OWNERSHIP_TAG=owned-field-counterexample-20261018 npm run verify:ownership-controls`
passed **4 native negative-control checks**, stable inputs, no run errors. Record:
`.runtime/ownership-probes/owned-field-counterexample-20261018/results.json`.
A declared synthetic devtools hook made **one equal-value quota write through the
actual Fiber/hook before final P1 appeared**. Original P1=13/P2 disabled=false and
exact host/state correspondence remained observed. Both selected traces correctly
kept current-field HTTP ancestry Unknown. App source bytes were unchanged.

The unit suite also demonstrates a nested Query.setData wrapper that writes the
same value while preserving the public setQueryData method, empty initial entry,
default structural sharing, no observers and exact returned/stored data identity.
A later cache alias can likewise write without changing any object identity.
These counterexamples reject the proposed one-time readonly-call premise; they
are not support successes for those extra writers or a claim about original app
behavior. The hook/wrapper are declared test-only code.

## Product/UI evidence and remaining work

Product code did not change in these acquisition experiments. The 19-check clean
panel/IDE/export/offline acceptance, short loop 20 PASS/10 expected PARTIAL +106 UI,
browser-only 26 checks, IDE interventions and three independent fragments from the
state/write checkpoint remain their own evidence. No new UI claim is inferred from
these native probes. Current root `npm test` passed **188 tests** and full
`npm run build` passed; logs are `.runtime/execution-probe-final-{unit,build}.log`.
License notices include the new original Apache-2.0 experiments. No new dependency
or lockfile change was needed. Historical deep results remain **0/6**.

A bounded ownership certificate would need a strict complete source-use/effect
check plus lifetime contracts over the actual Query and React aliases, and a
product-owned compiled-history gate. A handoff-only or first-write summary cannot
supply this. Unknown external code, callbacks, method/prototype replacements,
realms, truncated history and opaque aliases must deny it. This architectural
experiment is the next technical decision; it has not been implemented or accepted.

Private vulnerability reporting remains an explicit pending administrative
authorization, not an enabled channel. Publication and independent human usability
are also uncompleted gates. Agent acceptance does not silently satisfy the latter.

## Source-use prerequisite

`SOURCE_TAG=owned-source-uses-20261018 npm run verify:source-uses` passed its
source-only check with stable inputs. It uses exact Babel binding identities,
follows ordinary/destructured aliases and a candidate React setter/value pairing,
and reuses the existing sourceSlice for possible code links. No new module resolver
or runtime capability was added. The original account/data candidate yields four
bindings (account, data, allowance, creditHold), 13 use records and five boundaries:
Query cache handoff, native state handoff premise, calculateEligibility call,
structuredClone call and Row props escape. Its `complete:false` and Unknown ownership
are expected. Calls/props are not waved through as readonly. Generic controls cover
alias writes, lexical shadowing, opaque/computed/return/props uses, wrong setter,
ambiguous entries, reassignment, parse errors and budgets. This evidence is separate
from native acquisition and UI checks; it does not complete the ownership certificate.

The later `owned-source-reviewed-20261018` run closes logical/conditional forwarding
and project-byte-budget gaps found in review: 13 records, **six** explicit boundaries,
complete false. Member-chain and reassignment traversal are also bounded. Read-only
review confirmed the prior counterexamples now fail closed. The subsequent
`owned-function-fragments-20261018` source-only run additionally checks the full
straight-line bodies of calculateEligibility/selectAllowance. Both yield conditional
syntax facts with own-data/primitive/actual-invocation premises unverified; Row is
unsupported. Hidden calls without a parameter reference and global/closure effects
are denied by the strict whole-body grammar. No runtime readonly effect, ownership
or full path is inferred. These new files are not imported by the product path.

## Instrumentation pauses are not invocation witnesses

`ENTRY_TAG=script-entry-counters-20261018 npm run verify:script-entry` retained a
PARTIAL result. Persisted script compilation and its later run had distinct pause
observations. For Function, the actual body counter stayed **0 after construction**
while one pause was already present; the later actual call changed the counter to
**1**, with no new pause for that body. Thus this API supplies both a precall false
positive and a missed invocation. It is unsuitable as an invocation witness, not
merely incomplete coverage. The final reviewed harness uses captured-pauses labels,
explicit refusal fields and independent resource teardown. Its result is separate
from the 19-check clean product acceptance; it enables no provenance claim.
