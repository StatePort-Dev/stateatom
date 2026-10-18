# Acquisition probe: exact executed main-world script inventory

Status: planned bounded acquisition experiment. No product support or full-path
claim. This follows review of the owned-JSON proposal: a single readonly call
contract cannot exclude later cache/Fiber writers. Existing executed samples skip
dependencies and normalize imports, so they cannot certify an execution closure.

Observe CDP Runtime/Debugger before a fresh navigation. Retain every actual script
ID, context unique ID, frame, URL and exact compiled-source digest, including Vite,
node_modules and anonymous scripts. Compare against exact final HTTP response bytes
recorded by the trusted in-process dev server. Never normalize import URLs or use
source-map content as executable proof. An inline script requires the exact inline
text from that document response and its offsets; duplicate or ambiguous matches,
unmatched dynamic code, missing sources, contexts or budgets remain Unknown.

The gate only states that the captured main-world scripts up to a checkpoint match
trusted server receipts. It does not prove readonly effects, absence of future
scripts/writers, transitive source equivalence or runtime attestation. A later
script or context invalidates a prior checkpoint. Late attachment cannot acquire
an earlier closed history. Isolated worlds are explicitly outside this scope;
other frames/workers/realms prevent any stronger whole-page closure claim.

Record compiler/dependency versions and actual disk inputs separately. Receipt
identity alone does not prove that the compiler is correct or that executed code
has the same semantics as the original source. This experiment does not add a
resolver, alter P2/P1, wrap app objects or reevaluate app expressions/getters.

Controls: exact response match, dependency substitution with unchanged App source,
same URL with different executed bytes, anonymous/dynamic source, late attachment,
new context/script after checkpoint, source loss and overflow. Preserve every
negative result. Native checks remain separate from product UI acceptance.

## Acquisition result

The limited compiled-content experiment passed its positive baseline and native
refusal controls in compiled-inventory-drained-20261018. Its 14 main-world matches,
one isolated source and explicit limits are recorded in the 2026-10-18 execution
progress report. This result accepts acquisition only; no closure, ownership or
field-ancestry claim follows. The ownership counterexamples remain unresolved.
