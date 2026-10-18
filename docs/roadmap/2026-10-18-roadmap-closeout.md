# Consolidated roadmap attempt and original read operands

Continuation on dirty main above `bcde3d0f1572878df662db6bab79e65bc66dd6d0`.
The request is to complete the remaining roadmap in one approach, retaining its
original criteria. This record consolidates the real remaining capability rather
than treating more helper-body inventory as complete HTTP provenance.

## Original receiver/key experiment

`INVOCATION_TAG=<unused> npm run verify:observer-operands` extends the separate
entry-reference probe. It records receiver and original key references on entry,
then a bounded scalar immediately after the application's original property read.
It never rereads the receiver/key or coerces an object key for inspection. A throwing
read retains no fabricated result. Objects and strings over 256 characters are
not retained as read results. Nonfinite/unserializable scalars are unsupported by
the native checkpoint. The original receiver/key themselves can retain an unbounded
graph or string; this is not a product retention contract or a graph byte bound.

Native own-property inspection joins the existing original P2 quota node/entry to
these references. For its string key quota, original scalar 12 and later own-data
descriptor 12 are acquired separately. Getter/proxy receivers and object/symbol
keys remain unsupported without inspection traps or another key coercion.
No receiver objects, keys requiring coercion, remote handles or scope dumps enter
results. Metadata describes the original read and the later checkpoint, not the
original event-time property descriptor.

The journal's total admission cap remains 256 and overflow is explicit. Stop drops
only entries owned by that observer; another genuine observer remains intact.
Inactive reads admit no further entries. The native collector has an external
20-second context deadline and destroys its disposable context after each mode,
including refusal modes. Its remote object group is released. This supplies an
experimental disposal boundary, not a product memory-byte or zero-overhead claim.

The actual getter and object-key coercion each run once; proxy inspection adds no
trap. A later descriptor value 99 does not overwrite the captured original read 12.
A declared literal 12 write before the read still yields original read/checkpoint
12: matching values alone cannot establish the earlier field revision. Both cases
keep valueOrigin:Unknown/Unsupported and fullPath:false.

Four initial operand-retention REDs and two native-checkpoint REDs are preserved.
Independent review then reproduced an added Object.prototype.readValue setter
call that changed a successful application read into an exception. The retained
regression is fixed by creating an own readValue data slot in the record literal
before assignment. Focused tests preserve getter/key counts and exact thrown
values. Review confirms the correction without source edits or native execution.

## Reproduction and acquired result

```sh
node --test --test-isolation=none tests/observer-operands.test.mjs tests/operand-checkpoint.test.mjs tests/observer-entries.test.mjs
npm test
npm run build
INVOCATION_TAG=<unused> npm run verify:observer-operands
HOST_UI_TAG=<different-unused> npm run verify:code-journal-ui
```

Run native/UI harnesses sequentially without a separately started dev server.
Root validation: 408 unit tests, 15 focused operand/entry tests and root build pass.
Native `roadmap-operands-final-20261018` passes 23 checks with stable source inputs,
no page/harness errors and zero debugger pauses. The five new receiver controls
include original getter/proxy/key counts, post-read replacement, same-value
pre-read write and per-owner stop cleanup. The original selected P1/P2 outputs
agree with the off control. P1's destructuring still has no member entry; no P2
binding is borrowed for it. Product/UI behavior is unchanged by this probe.

## Exact remaining technical gate

Independent review distinguishes the original criterion from stronger, unnecessary
requirements. The selected trace needs a sound field revision/dataflow join from
JSON creation **until the particular original read**, then the acquired scalar's
transform/commit/exchange links. It does not require eternal immutability, absence
of every later write, or recursive native attestation of every telemetry function.
A write after a scalar read need not invalidate that earlier scalar's ancestry;
a self-assignment can preserve ancestry if its dataflow is established.

The real counterexample is an unrelated literal write before that read through a
reachable Query/Fiber alias, including an equal-value write. Current descriptors,
object identity, compiler-content hashes, callee references and later checkpoints
cannot distinguish it. Existing guards observe/refuse concrete accesses but do not
establish complete relevant write coverage. Original P2 and P1 therefore remain
NOT MET under the unchanged criteria. The historical six-family 0/6 denominator
and Vue PARTIAL negative controls are unchanged.

The missing capability is one bounded parse-to-read revision verifier: track
relevant writes/dataflow, or establish a sound source/effect proof for all aliases
reachable in that interval, refusing unknown effects/history. It must cover both
member and destructuring reads and be verified through the product entry point
against pre-read competing producers. Receiver/key capture is an input to that
verifier; it is not that verifier. No new resolver or weakening of the strict
existing grammar is introduced in this attempt.

## Roadmap accounting

| Item | Result / boundary |
| --- | --- |
| React inspection loop | Working actual panel/IDE, marker/short-loop evidence, reinspection and stale behavior |
| Local experiment and passive evidence | Working browser-only/connected flows, rollback/Restore, reviewed export and fresh passive reader |
| Independent applications | Three preregistered supported fragments on two applications; automatic acceptance, not full store/HTTP lineage |
| Authorized acceptance operator | Agent-operated fallback as explicitly requested; independent human usability remains unobserved |
| Original complete P2 and P1 | NOT MET: parse-to-read field revision/dataflow verifier absent |
| Clean developer-preview candidate | Preparation/acceptance is recorded separately with exact manifest and outcomes |
| Private security reporting | Previously enabled and verified with explicit authorization; not changed by this attempt |
| Publication | No alpha/release/Store publication established; a local candidate is not a release |

This is not a claim that all roadmap milestones are complete. The unresolved
verifier is a concrete implementation capability, not a request to reinterpret
Unknown as success. Release preparation may produce a local developer-preview
candidate with these limits; it cannot turn that candidate into a passed original
full trace. Independent human evidence cannot be supplied by an automated agent.
