# Design probe: source-verified owned JSON path

Status: DESIGN ONLY, NOT IMPLEMENTED / NOT ACCEPTED. The existing product keeps
current value ancestry Unknown and fullPath:false. Autonomous roadmap scope permits
investigating the exact remaining capability; it does not authorize a false proof.

## Question

Can the unchanged original React P2 and P1 close the current-field version gap in
an explicitly closed development-project scope, using a small ownership/effect
check on the existing Babel source analysis plus exact runtime identities?
Observing selected writes, comparing descriptors or values, and declaring absence
of external writers is insufficient. An ownership assertion must be derived and
fail closed whenever its premises cannot be verified.

## Candidate proof and scope

Start at the actual directly consumed native JSON object, with consumption ID and
exact browser exchange. Identify its lexical receiving binding in the source
revision. Inspect ALL references and object aliases (not only the selected source
slice): reject reassignment, property mutation, export/global escape, eval/dynamic
code, unsupported computed/rest patterns, unknown callback/parameter escape and
opaque calls without an applicable verified contract. Across suspension, the
object must remain private to that continuation until a supported handoff.

Accept read-only scalar transforms/destructuring only through resolved lexical
functions whose relevant argument/return effects can be bounded and checked.
Do not assume a function is read-only because its name matches or its returned
value agrees. Keep the existing analyzer/module resolver and depth/file budgets;
this is not a parallel universal resolver or framework expansion.

Connect the actual original native state action, processed update, bound result
and exact committed hook/Fiber already observed. Check the state object's ALL
uses as well: readonly field reads/transforms and source-resolved readonly props
consumers, no unknown data escape. A static proof is Code-linked; it is not a
replacement for those exact observed identities.

P2/P1 also pass account to the existing QueryClient and structuredClone. A library
call cannot be waved through. A candidate first-write QueryClient contract would
need pinned input/output identity, actual branded method/instance, initial empty
entry, ordinary known input data, default pure structural sharing, absence of
user callbacks/listeners and exact return/storage identity. Inspect actual pinned
code before accepting any such summary. Later writes, custom options, callbacks,
foreign methods/instances and unseen earlier history must be Unknown. Existing
React's object replacement contract likewise cannot cover a functional updater.

The executed build/module set and revisions must be compatible with the checked
source and pinned opaque contracts. Unknown executable modules, late capture,
additional writer/escape or invalidation must deny the proof. Merely trusting a
page registration or original-source hash while different code executes is not
sufficient. Inspect whether actual browser/debugger compiled-source facts and the
existing executed-build records can establish this premise without adding unsafe
privileged operations. Do not claim runtime attestation or hostile-page safety.

## Preselected acceptance / negative controls

Primary/control remain unchanged original P2/P1 and original exchange/field path
criteria. No fixture-name/hash special case may return fullPath:true. Additional
controls: an alias equal-value raw/native write, escape to unknown callback, later
script/getter/prototype manipulation, custom QueryClient structuralSharing/listener,
second equal response/out-of-order replacement, cached JSX/uncommitted update,
late capture, module/revision change, budget loss and ordinary unsupported syntax.
Each must either produce a separately supported local lineage or remain Unknown.
Never rerun an expression/getter, freeze/Proxy a user's object or alter app behavior
to obtain the proof. Measure source semantics off/on separately from UI delivery.

## Decision gate

First review whether the candidate premises are actually sufficient and testable
with the present code. Identify concrete counterexamples or the smallest missing
runtime fact before implementation. If compiled-code closure / readonly opaque
contracts cannot be established within this bounded probe, retain the exact gap;
do not rename conditional assumptions as a complete path. Publication/private
reporting and independent acceptance remain separate roadmap gates.

## Review outcome and concrete counterexamples

The one-time first-write summary above is insufficient. Query retains a reachable
alias after the invocation; a nested Query.setData wrapper and later cache alias
can write the same value while preserving its listed public-method/object facts.
A declared native React devtools control likewise wrote quota during the loading
commit while later P1/P2 retained exact host/state identity. Records and commands
are in docs/roadmap/2026-10-18-execution-progress.md. No owned-field proof is accepted.
A possible replacement must cover full alias lifetime and all actual nested effects,
with strict source-use analysis and product-owned compiled-history acquisition.
