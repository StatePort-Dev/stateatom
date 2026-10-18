# Entry-bound captured-helper frontier

Bounded continuation of the [entry/reference checkpoint](2026-10-18-entry-references-progress.md)
on dirty main above `bcde3d0f1572878df662db6bab79e65bc66dd6d0`.
The question is whether one acquired original P2 `record.rules.quota` member entry
can expose its actual captured helper references and exact checkpoint JS bodies.
This is acquisition-only; the product observer, analyzer and panel are unchanged.

## Acquired facts and limits

The existing instrumented returned node ID → entry → actual member reference join
is retained. Native own-data/scope reads acquire a declared finite frontier:
member → object/mapRead/ownDescriptor/potentialObject/add/pointer and the captured
telemetry slots, then add → dependencies/now/mapSet/retention/primitive/feed,
now → clock, dependencies → S/describe/append, mapSet → set/invoke, and
potentialObject → captured WeakSet operation. These are **candidate reference
edges**, not witnesses that every edge executed at the selected site. The add
branch reads add's own enclosing scope rather than borrowing member's telemetryOps.
Native enclosing-scope slots do not prove lexical body-operand identity: local or
parameter shadowing is not acquired. No body-call or operand identity is inferred.

The ordinary P2 quota entry has 25 acquired function references, including 18
exact JS function-body digests and seven opaque leaves. Each inventory carries
the original node/page/entry sequence, frame, context unique ID and checkpoint.
A JS location must belong to that bound default context and identify exactly one
function header in its native script source. There is no nearest-function fallback.
Source digest covers all native bytes; function digest covers the exact original
function syntax. Syntax counts describe member expressions, calls, assignments,
updates, constructors, spreads and nested functions. They do not classify writes
as application/private, certify readonly, or establish actual branch execution.

A final inert inline sourcemap comment is excluded only from AST indexing. The
exact JS prefix offsets and full native-source digest remain intact. The map is
not decoded, followed, used for remapping, or promoted to source equivalence.
Missing/ambiguous headers, oversized code, unavailable slots and foreign contexts
remain Unknown. Ordinary opaque clock/set/descriptor/string/Reflect/WeakSet leaves
are not attested builtins merely because they lack a direct JS location.

Three actual native counterexamples distinguish reference/body premises:

- A declared writer inserted into `add` changes quota 12 → 99 during three
  synthetic calls while the member function's bytes and original P1/P2 outputs
  stay unchanged. The helper digest changes; root-body equality is insufficient.
- A pre-bootstrap JS Map.set replacement is captured by telemetry and the public
  Map.set is restored before the controlled run. Both member and mapSet helper
  bodies remain identical, yet four captured setter calls write quota 99. The
  inventory exposes the captured JS callback; current public slots cannot certify
  it as a pristine builtin.
- A bound JS clock still has no direct JS location. Pinned V8 native metadata
  exposes one bound target (26th reference), whose JS writer-body digest matches
  the unbound control. This is checkpoint target metadata, not a portable browser
  contract, generic bound/proxy unwrapping or event-time closure history.

Original expressions/getters are not replayed for extraction. Existing genuine
factory, getter/error identity, proxy/accessor, foreign-marker, retention,
navigation and repaint controls remain. Debugger pauses and getter/proxy trap
counts are zero. P1 still has no member observation and gets no invented link.
The marker-selected graph remains mutable page telemetry, not native causal or
last-DOM-writer attestation. All inventories explicitly retain complete:false,
readonlyEffects:Unknown/Unsupported and fullPath:false. Each candidate edge has
executionAtThisSite:Unknown/Unsupported.

## Budgets, privacy and retained failures

The frontier admits at most 26 references and eight source-script attempts.
Requests, including failures, are cached; after source-byte/file overflow no new
source is fetched. The 1 MiB UTF-8 threshold is a **post-response stop**: a single
offending CDP reply can exceed it, rather than being bounded before transport.
Each source envelope is capped at 1 MiB; indexed JS remains limited to 256,000
UTF-8 bytes, 50,000 AST nodes and 1,000 functions. Existing own-property/scope
budgets remain in force. Temporary source indices/handles are cleared and each
native mode releases its remote object group and disposable browser context.

The original journal still strongly retains function references and potentially
closure graphs. Its 256-entry cap is not a graph byte bound. This increment adds
no receiver/key/metadata retention and no product journal adoption. A separate
lifetime/privacy/cleanup contract remains necessary before such adoption. Persisted
results contain digests, source ranges, counters and location/context metadata,
not function bodies, scope dumps, arbitrary application objects or remote handles.

Retained REDs cover the initially absent inventory and writer control. The first
native implementation then encountered Vite's large inline map; the bounded inert
comment treatment above fixes that without expanding the indexed-code budget.
Independent review reproduced a false B → C body match after CR/U+2028/U+2029:
line indexing originally recognized LF only. The retained unit RED now requires
all five JS line-ending forms to select B and refuse out-of-line columns. Review
also reproduced six repeated downloads of one rejected script (6,300,164 bytes).
Two RED controls now require one failed/oversized attempt, caching and sticky stop.
A separate foreign-context control verifies no source request borrows that context.
A final distinct-scope regression preserves different member/add telemetryOps;
borrowing member's table for add edges is rejected by that retained RED.
The final read-only review found no remaining concrete blocker within this scope;
the reviewer did not edit source or run native/UI acceptance.

## Reproduction and verification

```sh
node --test --test-isolation=none tests/effect-frontier.test.mjs
npm test
npm run build
INVOCATION_TAG=<unused> npm run verify:observer-effects
```

Run native harnesses sequentially, without another dev server. The new command
includes the 13 entry-reference controls plus the finite frontier and its three
transitive/bound-target controls. Existing verify:observer-entries and
verify:observer-closure remain separate commands; no dependency/lockfile change.

Final native run:
`.runtime/invocation-probes/effect-frontier-final-20261018/` —
**17 checks**, PASS_BOUNDED_TRANSITIVE_EFFECT_FRONTIER, stable source inputs,
no harness/page errors and zero debugger pauses. **14 focused tests** and all
**398 unit tests** pass; root build passes. Node 24.19.0, npm 11.17.0,
Vite 7.1.9, React/ReactDOM 18.3.1 dev, Playwright 1.63.0 and sandboxed Chromium
153.0.8010.12 are recorded in evidence-reuse.json. Browser plugin unavailable;
this native probe uses pinned repository Playwright/CDP without extension or IDE.

**UI evidence is reused, not newly run:** all 82 compared product source files and
36 build outputs (34 dist/fixture files plus the generated IDE bundle/notices)
match the frozen 259-file observer-intrinsics candidate. Its 26 actual panel/IDE/
export/reader checks and ten reviewed exports remain applicable. The existing
short loop remains 20 PASS / 10 expected PARTIAL + 106 checks; the isolated probe
is not imported by that product. Earlier resource-404/Vite warning limits remain.
No new UI support or Vue support is claimed.

All 1,527 historical experiment and 241 original short-loop hashes match again.
Old experiments and frozen candidates are unchanged. A local hashed metadata-only
review allowlist accompanies this acquisition result; no raw profiles/source/scope
payloads enter it. No commit, push, publication or release occurred. Unrelated
`docs/features/` work is preserved. Original complete P2/P1 HTTP remains NOT MET;
historical deep 0/6 and the independent human/publication gates are unchanged.

## Next bounded decision

Acquire the original receiver/key references for one P2 entry without additional
application property reads, replay or getter/proxy invocation, first defining an
explicit disposable retention/cleanup contract and denial controls. Separate an
entry reference from a later native own-data descriptor snapshot: neither supplies
event-time descriptor history or readonly alias lifetime. Keep metadata/coercion,
opaque builtin identity, transitive execution and complete current-field history
Unknown until separately acquired. No resolver/framework expansion or product
adoption is authorized by this checkpoint.
